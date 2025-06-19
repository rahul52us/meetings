// theme.ts
import { extendTheme } from 'native-base';

const customTheme = extendTheme({
  colors: {
    teal: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    coolGray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'md',
        _text: {
          color: 'white',
        },
      },
      sizes: {
        lg: {
          _text: {
            fontSize: 'lg',
          },
        },
        sm: {
          height: '40px',
          _text: {
            fontSize: 'lg',
          },
        },
      },
      variants: {
        solid: {
          bg: 'teal.500',
          _hover: {
            bg: 'teal.600',
          },
          _pressed: {
            bg: 'teal.600',
          },
        },
        outline: {
          borderColor: 'teal.500',
          _text: {
            color: 'teal.500',
          },
          _hover: {
            borderColor: 'teal.600',
            _text: {
              color: 'teal.600',
            },
          },
          _pressed: {
            borderColor: 'teal.600',
            _text: {
              color: 'teal.600',
            },
          },
        },
      },
    },
    Input: {
      baseStyle: {
        height: '50px',
      },
    },
  },
});

export default customTheme;
