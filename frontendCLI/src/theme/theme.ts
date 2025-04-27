// theme.ts
import {extendTheme, Input} from 'native-base';

const customTheme = extendTheme({
  components: {
    // Customize the components if needed
    Button: {
      baseStyle: {
        rounded: 'md',
        // height: '50px',
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
            bg: 'teal.700',
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
            borderColor: 'teal.700',
            _text: {
              color: 'teal.700',
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
    // Add custom styles for other components as needed
  },
});

export default customTheme;
