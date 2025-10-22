import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Heading, Text, Input, Button, FormControl, FormLabel, Alert, AlertIcon, Box } from '@chakra-ui/react';
import presets from '../presets.json';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const router = useRouter();
  const presetSlug = router.query.p;
  const preset = presets.find(p => p.slug === presetSlug);
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Upload - ${preset ? preset.title : 'Sora 2 Improver'}`,
    "description": `Upload a file to process with ${preset ? preset.title : 'our service'}`,
  };

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
      const res = await fetch('/api/process', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('processing');
        // Optionally handle data.resultUrl or other response
      } else {
        setStatus('error');
        setError(data.error || 'Failed to upload file.');
      }
    } catch (err) {
      setStatus('error');
      setError('Failed to upload file.');
    }
  };

  return (
    <>
      <Head>
        <title>Upload – Sora 2 Improver</title>
        <meta name="description" content="Upload your file to be processed by the Sora 2 Improver." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <Container maxW="container.md" py={10}>
        <Heading mb={4}>Upload {preset ? `for ${preset.title}` : ''}</Heading>
        <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
          <form onSubmit={handleSubmit}>
            <FormControl mb={4}>
              <FormLabel>Select file</FormLabel>
              <Input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </FormControl>
            {error && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {error}
              </Alert>
            )}
            {status === 'uploading' && (
              <Alert status="info" mb={4}>
                <AlertIcon />
                Uploading file...
              </Alert>
            )}
            {status === 'processing' && (
              <Alert status="success" mb={4}>
                <AlertIcon />
                Processing started! Check back later for results.
              </Alert>
            )}
            <Button colorScheme="teal" type="submit" isLoading={status === 'uploading'}>
              Upload & Process
            </Button>
          </form>
        </Box>
      </Container>
    </>
  );
}
