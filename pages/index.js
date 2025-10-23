import Head from 'next/head';
import NextLink from 'next/link';
import presets from '../presets.json';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCpu, FiFeather, FiZap } from 'react-icons/fi';

const MotionBox = motion(Box);

const features = [
  {
    title: 'Cinematic color science',
    description: 'Purpose-built presets sculpted to coax richer chroma, glassier contrast, and luminous detail out of every Sora 2 frame.',
    icon: FiFeather,
  },
  {
    title: 'GPU-accelerated finishing',
    description: 'Server-side turbo rendering ensures your uploads are enhanced with cutting-edge inference and lightning-fast throughput.',
    icon: FiCpu,
  },
  {
    title: 'Creator-first experience',
    description: 'Drag-and-drop simplicity, curated looks, and transparent progress to keep you in the zone and ahead of the curve.',
    icon: FiZap,
  },
];

export default function Home() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sora 2 Improver',
    description: 'Upload and improve your Sora 2 videos with our elevated preset-driven pipeline.',
  };

  return (
    <>
      <Head>
        <title>Sora 2 Improver – Bleeding-edge finishing for Sora 2</title>
        <meta
          name="description"
          content="Transform Sora 2 footage with curated, GPU-accelerated looks. Drag, drop, and glow." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <Box position="relative" overflow="hidden" pb={{ base: 16, lg: 24 }}>
        <Box
          position="absolute"
          top="-24"
          right="-24"
          w={{ base: '60', lg: '96' }}
          h={{ base: '60', lg: '96' }}
          bgGradient="radial(brand.500, transparent 70%)"
          opacity={0.35}
          filter="blur(60px)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-32"
          left="-24"
          w={{ base: '72', lg: '110' }}
          h={{ base: '72', lg: '110' }}
          bgGradient="radial(teal.300, transparent 70%)"
          opacity={0.4}
          filter="blur(80px)"
          pointerEvents="none"
        />

        <Container pt={{ base: 20, md: 28 }}>
          <Stack spacing={{ base: 12, md: 16 }}>
            <Flex
              direction={{ base: 'column', lg: 'row' }}
              align={{ base: 'flex-start', lg: 'center' }}
              gap={{ base: 10, lg: 20 }}
            >
              <Stack spacing={6} maxW={{ base: 'full', lg: 'xl' }}>
                <Badge
                  alignSelf="flex-start"
                  bg="rgba(99, 102, 241, 0.2)"
                  border="1px solid rgba(129, 140, 248, 0.35)"
                  color="white"
                  px={4}
                  py={1.5}
                  fontSize="sm"
                  textTransform="none"
                  borderRadius="full"
                  backdropFilter="blur(18px)"
                >
                  Precision looks for the next wave of creators
                </Badge>
                <Heading
                  as="h1"
                  size="3xl"
                  lineHeight="1.05"
                  bgGradient="linear(to-r, brand.200, teal.200)"
                  bgClip="text"
                >
                  Elevate every Sora 2 render with jaw-dropping finishing
                </Heading>
                <Text fontSize={{ base: 'lg', md: 'xl' }} color="rgba(226, 232, 240, 0.8)" maxW="2xl">
                  Sora 2 Improver brings editorial-grade polish to your generative videos. Pick a preset, drop a file, and let
                  our pipeline refraction-map your pixels into something impossibly vivid.
                </Text>
                <HStack spacing={4} flexWrap="wrap">
                  <Button
                    as={NextLink}
                    href={presets.length ? `/upload?p=${presets[0].slug}` : '/upload'}
                    variant="gradient"
                    size="lg"
                    rightIcon={<FiArrowRight />}
                  >
                    Start with a signature look
                  </Button>
                  <Button
                    as={NextLink}
                    href="#presets"
                    size="lg"
                    bg="rgba(15, 23, 42, 0.7)"
                    border="1px solid rgba(148, 163, 184, 0.25)"
                    _hover={{ bg: 'rgba(30, 41, 59, 0.85)', borderColor: 'rgba(148, 163, 184, 0.45)' }}
                  >
                    Browse all presets
                  </Button>
                </HStack>
              </Stack>
              <MotionBox
                flex="1"
                maxW="lg"
                borderRadius="3xl"
                p={{ base: 8, md: 12 }}
                bg="rgba(15, 23, 42, 0.7)"
                border="1px solid rgba(148, 163, 184, 0.25)"
                boxShadow="0 40px 120px rgba(15, 23, 42, 0.45)"
                backdropFilter="blur(24px)"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Stack spacing={6}>
                  <Heading size="md" color="white">What makes it pop?</Heading>
                  <Stack spacing={5}>
                    {features.map((feature) => (
                      <HStack key={feature.title} align="flex-start" spacing={4}>
                        <Box
                          display="grid"
                          placeItems="center"
                          borderRadius="full"
                          bg="rgba(99, 102, 241, 0.18)"
                          border="1px solid rgba(129, 140, 248, 0.35)"
                          boxSize={12}
                          flexShrink={0}
                        >
                          <Icon as={feature.icon} boxSize={5} color="brand.200" />
                        </Box>
                        <Stack spacing={1}>
                          <Text fontWeight="semibold" fontSize="lg" color="white">
                            {feature.title}
                          </Text>
                          <Text fontSize="sm" color="rgba(226, 232, 240, 0.7)">
                            {feature.description}
                          </Text>
                        </Stack>
                      </HStack>
                    ))}
                  </Stack>
                  <Text fontSize="sm" color="rgba(148, 163, 184, 0.7)">
                    Built with obsession for detail. No manual grading, no plugin juggling—just pixel-perfect mood in a click.
                  </Text>
                </Stack>
              </MotionBox>
            </Flex>

            <Stack id="presets" spacing={8}>
              <Heading size="lg">Pick your cinematic baseline</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={8}>
                {presets.map((preset) => (
                  <MotionBox
                    key={preset.slug}
                    borderRadius="2xl"
                    p={8}
                    bg="rgba(15, 23, 42, 0.65)"
                    border="1px solid rgba(148, 163, 184, 0.25)"
                    backdropFilter="blur(18px)"
                    boxShadow="0 35px 80px -40px rgba(15, 23, 42, 0.9)"
                    whileHover={{ translateY: -6, boxShadow: '0 45px 120px -35px rgba(99, 102, 241, 0.65)' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  >
                    <Stack spacing={4}>
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
                        {preset.category ?? 'Signature preset'}
                      </Badge>
                      <Heading size="md" color="white">
                        {preset.title}
                      </Heading>
                      <Text fontSize="sm" color="rgba(226, 232, 240, 0.7)">
                        {preset.description}
                      </Text>
                      <Button
                        as={NextLink}
                        href={`/upload?p=${preset.slug}`}
                        variant="gradient"
                        rightIcon={<FiArrowRight />}
                        alignSelf="flex-start"
                      >
                        Use {preset.title}
                      </Button>
                    </Stack>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
