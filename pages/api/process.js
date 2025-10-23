import formidable from 'formidable';
import fs from 'fs/promises';
import presets from '../../presets.json';

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
      return res.status(500).json({ error: err.message, details: err.stack });
    }
    const fileField = Array.isArray(files.file) ? files.file[0] : files.file;
    const presetField = Array.isArray(fields.preset) ? fields.preset[0] : fields.preset;

    if (!fileField) {
      return res.status(400).json({ error: 'Uploaded file is required' });
    }

    if (!presetField) {
      return res.status(400).json({ error: 'Preset is required' });
    }

    const file = fileField;
    const presetSlug = presetField;
    const preset = presets.find(p => p.slug === presetSlug);
    if (!preset) {
      return res.status(400).json({ error: 'Preset not found' });
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
        const data = await resReg.json();
        return { ok: resReg.ok && data.ok, data, status: resReg.status };
      }

      let registerRes = await register();
      if (!registerRes.ok) {
        registerRes = await register();
        if (!registerRes.ok) {
          return res.status(500).json({
            error: registerRes.data.error || 'Failed to register file',
            details: registerRes.data,
          });
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
          return res.status(500).json({
            error: 'Failed to upload file',
            details: {
              status: uploadRes.status,
              statusText: uploadRes.statusText,
              body: uploadRes.body,
            },
          });
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
        const data = await resProc.json();
        return { ok: resProc.ok && data.ok, data, status: resProc.status };
      }

      let proc = await processTask();
      if (!proc.ok) {
        proc = await processTask();
        if (!proc.ok) {
          return res.status(500).json({
            error: proc.data.error || 'Processing failed',
            details: proc.data,
          });
        }
      }

      const resultUrl =
        proc.data.result && proc.data.result[0] ? proc.data.result[0].download_url : null;
      return res.status(200).json({ resultUrl });
    } catch (error) {
      return res.status(500).json({
        error: error.message || 'Unknown error',
        details: error.stack || error,
      });
    }
  });
}
