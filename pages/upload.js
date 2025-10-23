import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Box,
  Progress,
  VStack,
} from '@chakra-ui/react';
import presets from '../presets.json';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [resultUrl, setResultUrl] = useState(null);
  const router = useRouter();
  const presetSlugRaw = router.query.p;
  const presetSlug = Array.isArray(presetSlugRaw) ? presetSlugRaw[0] : presetSlugRaw;
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
    setResultUrl(null);
    setStatusMessage('');
    if (!file) {
      setError('Please select a file.');
      setStatus('idle');
      return;
    }
    if (file.size > maxFileSize) {
      setError('File exceeds 50MB.');
      setStatus('idle');
      return;
    }
    if (!presetSlug) {
      setError('Missing preset information. Please return to the home page and choose a preset.');
      setStatus('error');
      return;
    }
    if (!preset) {
      setError('The selected preset could not be found. Please try again from the presets list.');
      setStatus('error');
      return;
    }
    setStatus('uploading');
    setStatusMessage('Uploading file...');
    const form = new FormData();
    form.append('file', file);
    form.append('preset', presetSlug);
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: form,
      });
      let data = null;
      try {
        data = await res.json();
      } catch (parseError) {
        // Ignore JSON parse errors so we can still surface a generic message below
      }
      if (res.ok) {
        if (data?.resultUrl) {
          setStatus('complete');
          setStatusMessage('Processing complete! Your enhanced file is ready to download.');
          setResultUrl(data.resultUrl);
        } else {
          setStatus('processing');
          setStatusMessage('Processing started! We will provide a download link once it is ready.');
        }
      } else {
        const message = data?.error || 'Failed to upload file.';
        setStatus('error');
        setError(message);
        setStatusMessage('');
      }
    } catch (err) {
      setStatus('error');
      setError('Failed to upload file.');
      setStatusMessage('');
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
        {preset ? (
          <Text mb={6} color="gray.600">
            {preset.description}
          </Text>
        ) : (
          <Alert status="warning" mb={6}>
            <AlertIcon />
            Choose a preset from the home page to enable uploads.
          </Alert>
        )}
        <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
          <form onSubmit={handleSubmit}>
            <FormControl mb={4}>
              <FormLabel>Select file</FormLabel>
              <Input
                type="file"
                onChange={e => {
                  setFile(e.target.files?.[0] ?? null);
                  setError(null);
                  setStatus('idle');
                  setStatusMessage('');
                  setResultUrl(null);
                }}
              />
            </FormControl>
            <VStack align="stretch" spacing={3} mb={4}>
              {error && (
                <Alert status="error" aria-live="assertive">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              {statusMessage && status !== 'error' && (
                <Alert
                  status={status === 'complete' ? 'success' : 'info'}
                  variant="left-accent"
                  aria-live="polite"
                >
                  <AlertIcon />
                  {statusMessage}
                </Alert>
              )}
              {(status === 'uploading' || status === 'processing') && (
                <Progress size="xs" isIndeterminate colorScheme="teal" borderRadius="md" />
              )}
              {resultUrl && (
                <Button
                  as="a"
                  href={resultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  colorScheme="teal"
                  variant="outline"
                >
                  Download processed file
                </Button>
              )}
            </VStack>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={status === 'uploading'}
              loadingText="Uploading"
              isDisabled={!preset || status === 'uploading' || status === 'processing'}
            >
              Upload & Process
            </Button>
          </form>
        </Box>
      </Container>
    </>
  );
}
