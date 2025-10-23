import Head from 'next/head';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  VStack,
  VisuallyHiddenInput,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiUploadCloud } from 'react-icons/fi';
import presets from '../presets.json';

const MotionBox = motion(Box);

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();
  const presetSlug = router.query.p;
  const preset = presets.find((p) => p.slug === presetSlug);
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Upload - ${preset ? preset.title : 'Sora 2 Improver'}`,
    description: `Upload a file to process with ${preset ? preset.title : 'our service'}`,
  };

  const handleFileSelection = useCallback((selectedFile) => {
    if (!selectedFile) {
      return;
    }
    if (selectedFile.size > maxFileSize) {
      setError('File exceeds 50MB.');
      setFile(null);
      return;
    }
    setError(null);
    setFile(selectedFile);
  }, []);

  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0];
    handleFileSelection(selectedFile || null);
  };

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      const droppedFile = event.dataTransfer.files?.[0];
      handleFileSelection(droppedFile || null);
    },
    [handleFileSelection]
  );

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
    form.append('preset', presetSlug ?? '');
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('processing');
        if (!preset) {
          router.push('/');
        }
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
      <Box position="relative" overflow="hidden" py={{ base: 20, md: 28 }}>
        <Box
          position="absolute"
          top="-32"
          right="-24"
          w={{ base: '64', md: '96' }}
          h={{ base: '64', md: '96' }}
          bgGradient="radial(brand.500, transparent 70%)"
          filter="blur(80px)"
          opacity={0.35}
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-36"
          left="-28"
          w={{ base: '72', md: '110' }}
          h={{ base: '72', md: '110' }}
          bgGradient="radial(teal.300, transparent 70%)"
          filter="blur(90px)"
          opacity={0.45}
          pointerEvents="none"
        />

        <Container>
          <Stack spacing={14}>
            <Stack spacing={4} maxW="3xl">
              <Button
                as={NextLink}
                href="/"
                variant="ghost"
                leftIcon={<FiArrowLeft />}
                color="rgba(226, 232, 240, 0.7)"
                _hover={{ color: 'white', bg: 'rgba(148, 163, 184, 0.12)' }}
                w="fit-content"
              >
                Back to presets
              </Button>
              <Stack spacing={3}>
                <Badge
                  w="fit-content"
                  bg="rgba(99, 102, 241, 0.18)"
                  border="1px solid rgba(129, 140, 248, 0.3)"
                  color="brand.100"
                  px={3}
                  py={1}
                  borderRadius="full"
                  textTransform="none"
                >
                  {preset ? `Preset: ${preset.title}` : 'Choose any preset to get started'}
                </Badge>
                <Heading size="2xl" lineHeight="1.1" color="white">
                  Drop your file into the glow zone
                </Heading>
                <Text fontSize="lg" color="rgba(226, 232, 240, 0.75)" maxW="2xl">
                  Drag and drop your render—or tap to browse—and we will launch an accelerated finishing pass. We currently
                  accept MP4, MOV, or WEBM files up to 50MB.
                </Text>
              </Stack>
            </Stack>

            <MotionBox
              as="form"
              onSubmit={handleSubmit}
              borderRadius="3xl"
              bg="rgba(15, 23, 42, 0.72)"
              border="1px solid rgba(148, 163, 184, 0.25)"
              boxShadow="0 40px 120px rgba(15, 23, 42, 0.55)"
              p={{ base: 8, md: 12 }}
              backdropFilter="blur(28px)"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Stack spacing={8}>
                <MotionBox
                  borderRadius="2xl"
                  border="2px dashed"
                  borderColor={isDragging ? 'teal.300' : 'rgba(148, 163, 184, 0.35)'}
                  bg={isDragging ? 'rgba(45, 212, 191, 0.12)' : 'rgba(15, 23, 42, 0.65)'}
                  boxShadow={isDragging ? '0 0 0 1px rgba(45, 212, 191, 0.4)' : 'inset 0 1px 0 rgba(148, 163, 184, 0.15)'}
                  minH="320px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                  overflow="hidden"
                  transition="all 0.2s ease"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={openFileDialog}
                  cursor="pointer"
                  _hover={{ borderColor: 'teal.300' }}
                >
                  <VStack spacing={5} textAlign="center" px={{ base: 6, md: 12 }}>
                    <Flex
                      align="center"
                      justify="center"
                      borderRadius="full"
                      bg="rgba(56, 189, 248, 0.12)"
                      border="1px solid rgba(56, 189, 248, 0.35)"
                      boxSize="88px"
                    >
                      <Icon as={FiUploadCloud} boxSize={12} color="teal.200" />
                    </Flex>
                    <Heading size="lg" color="white">
                      Drop your file here
                    </Heading>
                    <Text fontSize="md" color="rgba(226, 232, 240, 0.7)">
                      Drag a video anywhere in this zone or click to browse your device. Supported formats: MP4, MOV, WEBM.
                    </Text>
                    <Button variant="gradient" size="lg" rightIcon={<FiArrowRight />}
                    >
                      Browse files
                    </Button>
                    <VisuallyHiddenInput ref={inputRef} type="file" onChange={handleInputChange} />
                  </VStack>
                </MotionBox>

                {file && (
                  <Box
                    borderRadius="2xl"
                    bg="rgba(15, 23, 42, 0.6)"
                    border="1px solid rgba(148, 163, 184, 0.25)"
                    p={6}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={4}
                  >
                    <Stack spacing={1}>
                      <Text fontWeight="semibold" color="white">{file.name}</Text>
                      <Text fontSize="sm" color="rgba(226, 232, 240, 0.6)">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to glow
                      </Text>
                    </Stack>
                    <Badge
                      display="flex"
                      alignItems="center"
                      gap={2}
                      bg="rgba(56, 189, 248, 0.18)"
                      border="1px solid rgba(56, 189, 248, 0.35)"
                      color="teal.100"
                      px={4}
                      py={2}
                      borderRadius="full"
                    >
                      <Icon as={FiCheckCircle} /> Prepared
                    </Badge>
                  </Box>
                )}

                {error && (
                  <Alert status="error" borderRadius="xl" bg="rgba(248, 113, 113, 0.1)" border="1px solid rgba(248, 113, 113, 0.25)">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                {status === 'uploading' && (
                  <Alert status="info" borderRadius="xl" bg="rgba(59, 130, 246, 0.1)" border="1px solid rgba(59, 130, 246, 0.25)">
                    <AlertIcon />
                    Uploading your masterpiece...
                  </Alert>
                )}

                {status === 'processing' && (
                  <Alert status="success" borderRadius="xl" bg="rgba(16, 185, 129, 0.12)" border="1px solid rgba(16, 185, 129, 0.25)">
                    <AlertIcon />
                    Processing started! We will ping you once the enhanced render is ready.
                  </Alert>
                )}

                <Flex justify="space-between" align={{ base: 'stretch', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={4}>
                  <Text fontSize="sm" color="rgba(148, 163, 184, 0.75)">
                    Need a different vibe?{' '}
                    <Button as={NextLink} href="/" variant="link" color="teal.200" fontWeight="semibold">
                      Explore other presets
                    </Button>
                  </Text>
                  <Button type="submit" variant="gradient" size="lg" isLoading={status === 'uploading'}>
                    Launch enhancement
                  </Button>
                </Flex>
              </Stack>
            </MotionBox>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
