import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Button, VStack, Text, HStack,
  FormControl, Alert, View, Image, Pressable
} from 'native-base';
import { StyleSheet, Animated, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseScreens } from '../../navigations/BaseStack';
import { appRequest } from '../../routes';
import CustomInput from '../common/CustomInput/CustomInput';
import { UnAuthScreens } from '../../navigations/UnAuthStack';
import OTPInput from '../common/CustomInput/OTPInput';

type LoginFormValues = {
  moNumber: string;
  otp: string;
};

type LoginFormErrors = {
  moNumber?: string;
  otp?: string;
};

export default function LogInScreen() {
  const { navigate } = useNavigation<any>();
  const [values, setValues] = useState<LoginFormValues>({ moNumber: '', otp: '' });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loginSteps, setLoginSteps] = useState({
    index: 0,
    token: '',
    submitLoading: false,
  });
  const [timer, setTimer] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);
  const [alertData, setAlertData] = useState({ isVisible: false, status: '', message: '' });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Auto-dismiss alerts
  useEffect(() => {
    if (alertData.isVisible) {
      const timeout = setTimeout(() => {
        setAlertData({ isVisible: false, status: '', message: '' });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [alertData.isVisible]);

  // Animate screen transitions
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [loginSteps.index]);

  // Resend OTP timer
  useEffect(() => {
    if (timer > 0 && loginSteps.index === 1) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setResendLoading(false);
    }
  }, [timer, loginSteps.index]);

  const validateMobileNumber = (moNumber: string): boolean => {
    const mobilePattern = /^[0-9]{10}$/;
    if (!moNumber) {
      setErrors(prev => ({ ...prev, moNumber: 'Mobile number is required' }));
      return false;
    } else if (!mobilePattern.test(moNumber)) {
      setErrors(prev => ({ ...prev, moNumber: 'Please enter a valid 10-digit mobile number' }));
      return false;
    }
    setErrors(prev => ({ ...prev, moNumber: undefined }));
    return true;
  };

  const validateOtp = (otp: string): boolean => {
    if (!otp) {
      setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
      return false;
    } else if (otp.length < 6) {
      setErrors(prev => ({ ...prev, otp: 'OTP must be 6 digits' }));
      return false;
    }
    setErrors(prev => ({ ...prev, otp: undefined }));
    return true;
  };

  const handleChange = (name: keyof LoginFormValues, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (name === 'moNumber') validateMobileNumber(value);
    if (name === 'otp') validateOtp(value);
  };

  const handleMobileSubmit = async () => {
    if (!validateMobileNumber(values.moNumber)) return;

    try {
      setLoginSteps(prev => ({ ...prev, submitLoading: true }));
      setTimer(30);
      setResendLoading(true);
      Keyboard.dismiss();

      const response: any = await appRequest('auth', 'login', {
        username: values.moNumber,
        password: 'abc123',
      });

      if (response?.token) {
        setLoginSteps(prev => ({ ...prev, token: response.token, index: 1 }));
        setAlertData({
          isVisible: true,
          status: 'success',
          message: 'OTP sent to your number',
        });
        fadeAnim.setValue(0);
      } else {
        setAlertData({
          isVisible: true,
          status: 'error',
          message: response?.message || 'Failed to send OTP',
        });
      }
    } catch (error: any) {
      setAlertData({
        isVisible: true,
        status: 'error',
        message: error?.message || 'Failed to send OTP',
      });
    } finally {
      setLoginSteps(prev => ({ ...prev, submitLoading: false }));
    }
  };

  const handleOtpSubmit = async () => {
    if (!validateOtp(values.otp)) return;

    try {
      setLoginSteps(prev => ({ ...prev, submitLoading: true }));
      Keyboard.dismiss();

      const response: any = await appRequest('auth', 'verifyLoginToken', {
        id: loginSteps.token,
        otp: values.otp,
      });

      if (response?.token && response.status === 'success') {
        await AsyncStorage.setItem('auth-token', response.token);
        setAlertData({
          isVisible: true,
          status: 'success',
          message: 'Logged in successfully',
        });
        setTimeout(() => navigate(BaseScreens.AuthStack), 1000);
      } else {
        setAlertData({
          isVisible: true,
          status: 'error',
          message: response?.data || 'Invalid OTP',
        });
      }
    } catch (error: any) {
      setAlertData({
        isVisible: true,
        status: 'error',
        message: error?.message || 'Invalid OTP',
      });
    } finally {
      setLoginSteps(prev => ({ ...prev, submitLoading: false }));
    }
  };

  const handleResendOtp = async () => {
    if (resendLoading) return;
    await handleMobileSubmit();
  };

  const handleBack = () => {
    setLoginSteps({ index: 0, token: '', submitLoading: false });
    setValues(prev => ({ ...prev, otp: '' }));
    setErrors(prev => ({ ...prev, otp: undefined }));
    fadeAnim.setValue(0);
  };

  return (
    <Box flex={1} alignItems="center" justifyContent="center" p={5} bg="white" safeArea>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <VStack space={4} w="100%" px={4}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/img/sqLogo.png')}
              style={styles.noDataImage}
              resizeMode="contain"
              alt="Logo"
            />
          </View>
          <Text color="teal.600" textAlign="center" fontSize="2xl" fontWeight="bold">
            Welcome Back!
          </Text>
          <Text color="gray.500" textAlign="center" fontSize="md">
            {loginSteps.index === 0
              ? 'Enter your mobile number to sign in'
              : 'Enter the 6-digit OTP sent to your number'}
          </Text>

          {alertData.isVisible && (
            <Alert w="100%" status={alertData.status} mb={4} borderRadius="md">
              <HStack space={2} alignItems="center">
                <Alert.Icon />
                <Text fontSize="sm" color="coolGray.800" flexShrink={1}>
                  {alertData.message}
                </Text>
              </HStack>
            </Alert>
          )}

          {loginSteps.index === 0 ? (
            <FormControl isInvalid={!!errors.moNumber}>
              <CustomInput
                name="moNumber"
                placeholder="Mobile Number"
                value={values.moNumber}
                onChange={text => handleChange('moNumber', text)}
                required
                maxLength={10}
              />
              {errors.moNumber && (
                <FormControl.ErrorMessage>{errors.moNumber}</FormControl.ErrorMessage>
              )}
              <Button
                mt={4}
                onPress={handleMobileSubmit}
                isLoading={loginSteps.submitLoading}
                isDisabled={!!errors.moNumber || !values.moNumber}
                borderRadius="lg"
                bg="teal.600"
                _pressed={{ bg: 'teal.600' }}
              >
                Send OTP
              </Button>
            </FormControl>
          ) : (
            <VStack space={4}>
              <FormControl isInvalid={!!errors.otp}>
                <OTPInput
                  value={values.otp}
                  onChange={text => handleChange('otp', text)}
                  error={errors.otp}
                  numDigits={6}
                />
                {errors.otp && (
                  <FormControl.ErrorMessage>{errors.otp}</FormControl.ErrorMessage>
                )}
              </FormControl>
              <Button
                onPress={handleOtpSubmit}
                isLoading={loginSteps.submitLoading}
                isDisabled={!!errors.otp || values.otp.length < 6}
                borderRadius="lg"
                bg="teal.600"
                _pressed={{ bg: 'teal.600' }}
              >
                Verify OTP
              </Button>
              <HStack justifyContent="space-between" alignItems="center" mt={2}>
                <Pressable onPress={handleBack}>
                  <Text color="teal.600" fontSize="sm" textDecorationLine="underline">
                    Back
                  </Text>
                </Pressable>
                <HStack space={2} alignItems="center" display="none">
                  <Button
                    variant="link"
                    onPress={handleResendOtp}
                    isDisabled={resendLoading}
                    _text={{ color: 'teal.600', fontSize: 'sm' }}
                  >
                    Resend OTP
                  </Button>
                  {resendLoading && (
                    <Text color="gray.500" fontSize="sm">
                      in {timer}s
                    </Text>
                  )}
                </HStack>
              </HStack>
            </VStack>
          )}

          <HStack mt={4} justifyContent="center">
            <Text color="gray.600" fontSize="sm">
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => navigate(UnAuthScreens.SignUp)}>
              <Text color="teal.600" fontSize="sm" fontWeight="bold" textDecorationLine="underline">
                Sign Up
              </Text>
            </Pressable>
          </HStack>
        </VStack>
      </Animated.View>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageContainer: {
    alignItems: 'center',
  },
  noDataImage: {
    width: 200,
    height: 100,
    marginTop: -100,
  },
});
