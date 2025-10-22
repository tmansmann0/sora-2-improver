import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import presets from '../presets.json';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const router = useRouter();
  const presetSlug = router.query.p;
  const preset = presets.find((p) => p.slug === presetSlug);

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Please select a file.');
      return;
    }
    if (file.size > maxFileSize) {
      setError('File exceeds 50MB.');
      return;
    }
    setStatus('uploading');
    const form = new FormData();
    form.append('file', file);
    form.append('preset', presetSlug);
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        body: form,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Something went wrong.');
        setStatus('error');
      } else {
        setStatus('processing');
      }
    } catch (err) {
      setError('Failed to upload file.');
      setStatus('error');
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: 'Upload ' + (preset ? preset.title : 'File'),
    description: 'Upload your video file for processing with Sora 2 Improver.',
  };

  return (
    <>
      <Head>
        <title>Upload – Sora 2 Improver</title>
        <meta name="description" content="Upload your video file for processing with our presets." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>
      <header>
        <h1>Upload</h1>
      </header>
      <main className="container">
        <div className="card">
          <form onSubmit={handleSubmit}>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {error && <p className="status" style={{ color: 'red' }}>{error}</p>}
            {status === 'uploading' && <p className="status">Uploading...</p>}
            {status === 'processing' && <p className="status">Processing started! Check back later for results.</p>}
            <button type="submit">Upload &amp; Process</button>
          </form>
        </div>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Sora 2 Improver</p>
      </footer>
    </>
  );
}
