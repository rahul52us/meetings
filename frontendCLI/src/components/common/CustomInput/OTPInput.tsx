import React, { useRef, useEffect, useState } from 'react';
import { Box, Input, Text, Pressable } from 'native-base';
import { TextInput } from 'react-native';

type OTPInputProps = {
  value: string;
  onChange: (text: string) => void;
  error?: string;
  numDigits?: number;
  borderColor?: string;
  bgColor?: string;
  autoSubmit?: boolean;
  onSubmit?: () => void;
};

const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  error,
  numDigits = 6,
  borderColor = 'gray.300',
  bgColor = 'white',
  autoSubmit = false,
  onSubmit,
}) => {
  const inputRef = useRef<TextInput | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (text: string) => {
    if (/^\d*$/.test(text) && text.length <= numDigits) {
      onChange(text);
      if (autoSubmit && text.length === numDigits && onSubmit) {
        onSubmit();
        inputRef.current?.blur();
      }
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
    setIsFocused(true);
  }, []);

  useEffect(() => {
    if (!value) {
      inputRef.current?.focus();
      setIsFocused(true);
    }
  }, [value]);

  return (
    <Box alignItems="center" w="full" px={4} py={6}>
      <Text fontSize="md" mb={2} color="gray.700">
      Enter the code we sent via SMS      </Text>

      <Input
        ref={(ref) => (inputRef.current = ref)}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="numeric"
        maxLength={numDigits}
        textAlign="center"
        w="80%"
        h={12}
        fontSize="xl"
        borderColor={error ? 'red.500' : isFocused ? 'teal.500' : borderColor}
        borderWidth={1.5}
        borderRadius="lg"
        bg={isFocused ? 'gray.50' : bgColor}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={`Enter ${numDigits}-digit OTP`}
        _focus={{
          borderColor: 'teal.500',
          bg: 'gray.50',
        }}
      />

      {error && (
        <Text fontSize="sm" color="red.500" mt={2} textAlign="center">
          {error}
        </Text>
      )}

      <Pressable
        mt={3}
        onPress={() => {
          onChange('');
          inputRef.current?.focus();
          setIsFocused(true);
        }}
        _pressed={{ opacity: 0.6 }}
      >
        <Text fontSize="sm" color="teal.600" underline>
          Clear OTP
        </Text>
      </Pressable>
    </Box>
  );
};

export default OTPInput;
