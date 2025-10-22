import Head from 'next/head';
import Link from 'next/link';
import presets from '../presets.json';
import { Container, Heading, Text, Box, Button } from '@chakra-ui/react';

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Sora 2 Improver",
    "description": "Upload and improve your Sora 2 videos with our easy presets."
  };
  return (
    <>
      <Head>
        <title>Sora 2 Improver – Enhance your videos</title>
        <meta name="description" content="Upload and improve your Sora 2 videos with our easy presets." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <Container maxW="container.lg" py={8}>
        <Heading as="h1" mb={4}>Sora 2 Improver</Heading>
        {presets.map((preset) => (
          <Box key={preset.slug} p={4} mb={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
            <Heading as="h2" size="md">{preset.title}</Heading>
            <Text mb={2}>{preset.description}</Text>
            <Link href={`/upload?p=${preset.slug}`}>
              <Button colorScheme="teal">Use {preset.title}</Button>
            </Link>
          </Box>
        ))}
      </Container>
    </>
  );
}
