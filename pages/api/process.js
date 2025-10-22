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
    return res.status(405).end('Method not allowed');
  }

  const form = formidable({ maxFileSize: 50 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const presetSlug = fields.preset;
    const preset = presets.find((p) => p.slug === presetSlug);
    if (!preset) {
      return res.status(400).json({ error: 'Preset not found' });
    }

    const file = files.file;
    const fileBuffer = await fs.readFile(file.filepath);
    try {
      const response = await fetch('https://ffmpeg-api.com/process', {
        method: 'POST',
        headers: {
          'Authorization': process.env.FFMPEG_API_AUTHORIZATION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { buffer: fileBuffer.toString('base64') },
          command: preset.ffmpegCommand,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(500).json({ error: data.error || 'API error' });
      }
      return res.status(200).json({ resultUrl: data.outputUrl });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
}
