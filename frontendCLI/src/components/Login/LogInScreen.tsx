import React, { useEffect, useState } from 'react';
import { Box, Button, VStack, Text, HStack, FormControl } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { BaseScreens } from '../../navigations/BaseStack';
import { appRequest } from '../../routes';
import CustomInput from '../common/CustomInput/CustomInput';
import { UnAuthScreens } from '../../navigations/UnAuthStack';

// Type Definitions
type LoginFormValues = {
  email: string;
  password: string;
};

type LoginFormErrors = {
  email?: string;
  password?: string;
};

export default function LogInScreen() {
  const { navigate } = useNavigation<any>();
  const [values, setValues] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalData, setModalData] = useState({ isVisible: false, status: '', text: '' });

  const closeModal = () => {
    setModalData({ isVisible: false, status: '', text: '' });
  };

  // Validate fields dynamically
  const validateField = (name: keyof LoginFormValues, value: string) => {
    let error: any = null;

    if (!value) {
      error = `${name === 'email' ? 'Email' : 'Password'} is required`;
    } else if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      error = 'Invalid email format';
    } else if (name === 'password' && value.length < 6) {
      error = 'Password must be at least 6 characters long';
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: keyof LoginFormValues, value: string) => {
    setValues(prevValues => ({ ...prevValues, [name]: value }));
    validateField(name, value);
  };

  // Handle the login form submission only on button press
  const handleSubmit = async () => {
    // Validate fields
    validateField('email', values.email);
    validateField('password', values.password);

    if (!errors.email && !errors.password && values.email && values.password) {
      try {
        setLoading(true);
        const response: any = await appRequest('auth', 'login', {
          username: values.email,
          password: values.password,
        });

        if (response?.token) {
          await AsyncStorage.setItem('auth-token', response.token);
          setIsLoggedIn(true);
        } else {
          setModalData({
            isVisible: true,
            status: 'Error',
            text: 'Invalid credentials. Please check your username and password.',
          });
        }
      } catch (error : any) {
        console.log(error?.message)
        setModalData({
          isVisible: true,
          status: 'Error',
          text: 'Login failed.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'Please fill in valid credentials',
      });
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate(BaseScreens.AuthStack);
    }
  }, [isLoggedIn, navigate]);

    return (
        <Box flex={1} alignItems="center" justifyContent="center" p={5} bg={'white'}>
            <VStack space={4} w="100%" px={4}>
            <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/img/sqLogo.png')} // Update with your image path
            style={styles.noDataImage}
            resizeMode="contain" // Adjust resizeMode as per your needs
          />

        </View>
                <Text color={'teal.500'} textAlign={"center"} fontSize="2xl" mt={-20} mb={8} bold>Welcome Back!</Text>
                <Text color={'gray.400'} textAlign={"center"} fontSize="lg" mt={-10} bold>Please enter your email and password</Text>

        {/* Input for email */}
        <FormControl isInvalid={!!errors.email}>
          <CustomInput
            name="email"
            type="text"
            floatingLabel={false}
            placeholder="Enter username"
            value={values.email}
            onChange={text => handleChange('email', text)}
            required
          />
          {errors.email && (
            <FormControl.ErrorMessage>{errors.email}</FormControl.ErrorMessage>
          )}
        </FormControl>

        {/* Input for password */}
        <FormControl isInvalid={!!errors.password}>
          <CustomInput
            name="password"
            type="password"
            floatingLabel={false}
            placeholder="Enter password"
            value={values.password}
            onChange={text => handleChange('password', text)}
            required
          />
          {errors.password && (
            <FormControl.ErrorMessage>{errors.password}</FormControl.ErrorMessage>
          )}
        </FormControl>

        {/* Button to trigger login */}
        <Button
          h="50px"
          bg="teal.500"
          _text={{ fontSize: 'md', fontWeight: 500 }}
          mt={2}
          onPress={handleSubmit}
          isLoading={loading}
          disabled={loading}>
          Log In
        </Button>

        {/* Sign up navigation */}
        <HStack mt={2} justifyContent="center">
          <Text>Don't have an account? </Text>
          <Text bold color="teal.500" onPress={() => navigate(UnAuthScreens.SignUp)}>
            Sign Up
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}
const styles = StyleSheet.create({
    imageContainer: {
        alignItems: 'center',
      },
      noDataImage: {
        width: 300,
        height: 300,
        marginTop: -180,
      },
})

