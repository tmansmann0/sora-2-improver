import { useState } from 'react';
import { useRouter } from 'next/router';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const preset = router.query.p;

  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }
    if (file.size > maxFileSize) {
      setError('File exceeds 50MB.');
      return;
    }
    const form = new FormData();
    form.append('file', file);
    form.append('preset', preset);

    const response = await fetch('/api/process', {
      method: 'POST',
      body: form,
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Something went wrong.');
    } else {
      alert('Processing started! Check back for results.');
    }
  };

  return (
    <div>
      <h1>Upload</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Upload & Process</button>
      </form>
    </div>
  );
}
