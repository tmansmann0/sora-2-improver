import formidable from 'formidable';
import fs from 'fs/promises';
import presets from '../../presets.json';

async function readJson(res) {
  const raw = await res.text();
  if (!raw) {
    return { data: null, raw };
  }
  try {
    return { data: JSON.parse(raw), raw };
  } catch (error) {
    return { data: null, raw };
  }
}

function buildErrorPayload(message, meta = {}) {
  return {
    error: message,
    details: meta,
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ maxFileSize: 50 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(500)
        .json(buildErrorPayload(err.message, { stack: err.stack }));
    }
    const fileField = Array.isArray(files.file) ? files.file[0] : files.file;
    const presetField = Array.isArray(fields.preset) ? fields.preset[0] : fields.preset;

    if (!fileField) {
      return res.status(400).json(buildErrorPayload('Uploaded file is required'));
    }

    if (!presetField) {
      return res.status(400).json(buildErrorPayload('Preset is required'));
    }

    const file = fileField;
    const presetSlug = presetField;
    const preset = presets.find(p => p.slug === presetSlug);
    if (!preset) {
      return res.status(400).json(buildErrorPayload('Preset not found'));
    }

    if (!process.env.FFMPEG_API_AUTHORIZATION) {
      return res.status(500).json(
        buildErrorPayload('FFmpeg API authorization token is missing', {
          step: 'configuration',
        }),
      );
    }
    try {
      const fileName = file.originalFilename || file.newFilename || 'input.mp4';

      // Step 1: register file with retry
      async function register() {
        const resReg = await fetch('https://api.ffmpeg-api.com/file', {
          method: 'POST',
          headers: {
            Authorization: process.env.FFMPEG_API_AUTHORIZATION,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file_name: fileName }),
        });
        const { data, raw } = await readJson(resReg);
        return {
          ok: Boolean(resReg.ok && data?.ok),
          data,
          raw,
          status: resReg.status,
        };
      }

      let registerRes = await register();
      if (!registerRes.ok) {
        registerRes = await register();
        if (!registerRes.ok) {
          return res.status(502).json(
            buildErrorPayload(registerRes.data?.error || 'Failed to register file', {
              step: 'register',
              status: registerRes.status,
              response: registerRes.data ?? null,
              raw: registerRes.raw,
            }),
          );
        }
      }
      const uploadUrl = registerRes.data.upload.url;
      const filePath = registerRes.data.file.file_path;

      // Step 2: upload file with retry
      const buffer = await fs.readFile(file.filepath);
      async function upload() {
        const resUpload = await fetch(uploadUrl, {
          method: 'PUT',
          body: buffer,
          headers: {
            'Content-Type': file.mimetype || 'application/octet-stream',
          },
        });
        const responseText = await resUpload.text().catch(() => null);
        return {
          ok: resUpload.ok,
          status: resUpload.status,
          statusText: resUpload.statusText,
          body: responseText,
        };
      }
      let uploadRes = await upload();
      if (!uploadRes.ok) {
        uploadRes = await upload();
        if (!uploadRes.ok) {
          return res.status(502).json(
            buildErrorPayload('Failed to upload file', {
              step: 'upload',
              status: uploadRes.status,
              statusText: uploadRes.statusText,
              body: uploadRes.body,
            }),
          );
        }
      }

      // Step 3: process file with retry
      const tokens = preset.ffmpegCommand
        .split(' ')
        .filter(t => t && t !== '-i' && t !== 'input.mp4' && t !== 'output.mp4');
      const outputFileName = 'output.mp4';

      async function processTask() {
        const resProc = await fetch('https://api.ffmpeg-api.com/ffmpeg/process', {
          method: 'POST',
          headers: {
            Authorization: process.env.FFMPEG_API_AUTHORIZATION,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task: {
              inputs: [{ file_path: filePath }],
              outputs: [{ file: outputFileName, options: tokens }],
            },
          }),
        });
        const { data, raw } = await readJson(resProc);
        return {
          ok: Boolean(resProc.ok && data?.ok),
          data,
          raw,
          status: resProc.status,
        };
      }

      let proc = await processTask();
      if (!proc.ok) {
        proc = await processTask();
        if (!proc.ok) {
          return res.status(502).json(
            buildErrorPayload(proc.data?.error || 'Processing failed', {
              step: 'process',
              status: proc.status,
              response: proc.data ?? null,
              raw: proc.raw,
            }),
          );
        }
      }

      const resultUrl =
        proc.data.result && proc.data.result[0] ? proc.data.result[0].download_url : null;
      return res.status(200).json({ resultUrl });
    } catch (error) {
      return res
        .status(500)
        .json(
          buildErrorPayload(error.message || 'Unknown error', {
            step: 'unexpected',
            stack: error.stack || error,
          }),
        );
    }
  });
}
