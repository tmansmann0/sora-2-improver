import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts: {
    heading: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  colors: {
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#312e81',
      900: '#1e1b4b',
    },
  },
  styles: {
    global: {
      'html, body': {
        background: 'transparent',
        color: 'rgba(226, 232, 240, 0.96)',
        minHeight: '100%',
      },
      body: {
        lineHeight: '1.6',
        WebkitFontSmoothing: 'antialiased',
      },
      '#__next': {
        minHeight: '100%',
      },
      a: {
        color: 'inherit',
      },
    },
  },
  shadows: {
    outline: '0 0 0 3px rgba(99, 102, 241, 0.45)',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: '9999px',
      },
      variants: {
        gradient: {
          bgGradient: 'linear(to-r, brand.500, teal.400)',
          color: 'white',
          boxShadow: '0 25px 45px -20px rgba(56, 189, 248, 0.45)',
          _hover: {
            bgGradient: 'linear(to-r, brand.400, teal.300)',
            boxShadow: '0 30px 60px -20px rgba(99, 102, 241, 0.55)',
            transform: 'translateY(-2px)',
          },
          _active: {
            transform: 'translateY(0px) scale(0.98)',
          },
        },
      },
    },
    Container: {
      baseStyle: {
        maxW: 'container.xl',
        px: { base: 6, md: 10 },
      },
    },
  },
});

export default theme;
