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
      return res.status(500).json({ error: err.message });
    }
    const file = files.file;
    const presetSlug = fields.preset;
    const preset = presets.find(p => p.slug === presetSlug);
    if (!preset) {
      return res.status(400).json({ error: 'Preset not found' });
    }

    try {
      // Step 1: register file and get upload URL
      const fileName = file.originalFilename || file.newFilename || 'input.mp4';
      const registerRes = await fetch('https://api.ffmpeg-api.com/file', {
        method: 'POST',
        headers: {
          Authorization: process.env.FFMPEG_API_AUTHORIZATION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_name: fileName }),
      });
      const registerData = await registerRes.json();
      if (!registerData.ok) {
        return res.status(500).json({ error: registerData.error || 'Failed to register file' });
      }
      const uploadUrl = registerData.upload.url;
      const filePath = registerData.file.file_path;

      // Step 2: upload the file to upload URL
      const buffer = await fs.readFile(file.filepath);
      await fetch(uploadUrl, {
        method: 'PUT',
        body: buffer,
        headers: {
          'Content-Type': file.mimetype || 'application/octet-stream',
        },
      });

      // Step 3: process the file using preset command
      const tokens = preset.ffmpegCommand.split(' ').filter(t => t && t !== '-i' && t !== 'input.mp4' && t !== 'output.mp4');
      const outputFileName = 'output.mp4';
      const processRes = await fetch('https://api.ffmpeg-api.com/ffmpeg/process', {
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
      const processData = await processRes.json();
      if (!processData.ok) {
        return res.status(500).json({ error: processData.error || 'Processing failed' });
      }
      const resultUrl = processData.result && processData.result[0] ? processData.result[0].download_url : null;
      return res.status(200).json({ resultUrl });
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Unknown error' });
    }
  });
}
