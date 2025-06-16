import React, { useRef, useEffect, useState } from 'react';
import { HStack, Input } from 'native-base';
import { TextInput, Animated, Easing, Keyboard } from 'react-native';

type OTPInputProps = {
  value: string;
  onChange: (text: string) => void;
  error?: string;
  numDigits?: number;
  inputSize?: number;
  borderColor?: string;
  focusBorderColor?: string;
  bgColor?: string;
  autoSubmit?: boolean;
  onSubmit?: () => void;
};

const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  error,
  numDigits = 6,
  inputSize = 12,
  borderColor = 'gray.300',
  focusBorderColor = 'teal.600',
  bgColor = 'white',
  autoSubmit = false,
  onSubmit,
}) => {
  const inputs = useRef<Array<TextInput | null>>([]);
  const [shakeAnim] = useState(new Animated.Value(0));

  const normalizedValue = value.padEnd(numDigits, ' ').slice(0, numDigits);

  const handleChange = (text: string, index: number) => {
    if (/^\d?$/.test(text)) {
      const updated = normalizedValue.split('');
      updated[index] = text;
      const joinedValue = updated.join('').trim();
      onChange(joinedValue);

      if (text) {
        if (index < numDigits - 1) {
          inputs.current[index + 1]?.focus();
        } else {
          inputs.current[index]?.blur();
          Keyboard.dismiss();
          if (autoSubmit && joinedValue.length === numDigits && onSubmit) {
            onSubmit();
          }
        }
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !normalizedValue[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      <HStack space={2} justifyContent="center">
        {Array.from({ length: numDigits }).map((_, index) => (
          <Input
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            value={normalizedValue[index] === ' ' ? '' : normalizedValue[index]}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            w={`${inputSize}`}
            h={`${inputSize}`}
            fontSize="lg"
            borderColor={error ? 'red.500' : borderColor}
            borderWidth={2}
            borderRadius="md"
            bg={bgColor}
            _focus={{
              borderColor: error ? 'red.500' : focusBorderColor,
              bg: bgColor,
            }}
            accessibilityLabel={`OTP Digit ${index + 1}`}
          />
        ))}
      </HStack>
    </Animated.View>
  );
};

export default OTPInput;
