import React, { useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Button, Text, FormControl, Input, VStack, useToast, Box } from "native-base";
import { useNavigation } from '@react-navigation/native'; // React Navigation
import { appRequest } from "../../routes";
import { UnAuthScreens, UnAuthStackNavigationProp } from "../../navigations/UnAuthStack";
import CustomInput from "../common/CustomInput/CustomInput";
import NotifyModal from "../common/NotifyModal/NotifyModal";

type SignUpFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  moNumber: string;
  companyName: string;
};

type SignUpFormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
};

export default function SignUpForm() {
  const toast = useToast();
  const navigation = useNavigation();
  const [modalData, setModalData] = useState({ isVisible: false, status: '', text: '' });

  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<SignUpFormValues>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    moNumber: "",
    companyName: "",
  });
  const [errors, setErrors] = useState<SignUpFormErrors>({});
  const { navigate } = useNavigation<UnAuthStackNavigationProp>()

  const closeModal = () => {
    setModalData({ isVisible: false, status: '', text: '' });
  };

  // Validation functions
  const validateEmail = () => {
    if (!values.email || values.email.trim() === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Email is required",
      }));
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Invalid email format",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: undefined,
      }));
    }
  };


  const validatePassword = () => {
    if (!values.password) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "Password is required" }));
    } else if (values.password.length < 6) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "Password must be at least 6 characters long" }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, password: undefined }));
    }
  };

  const validateConfirmPassword = () => {
    if (values.confirmPassword !== values.password) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: undefined }));
    }
  };

  const handleSubmit = async () => {
    validateEmail();
    validatePassword();
    validateConfirmPassword();

    if (!errors.email && !errors.password && !errors.confirmPassword) {
      let input: any = {
        username: values.email,
        fullName: values.fullName,
        moNumber: values.moNumber,
        companyName: values.companyName,
        password: values.password,
        confirmPassword: values.confirmPassword,
      };

      try {
        setLoading(true);
        const response: any = await appRequest("auth", "signup", input);
        if (response && response.status === "error") {
          setModalData({
            isVisible: true,
            status: 'Error',
            text: response.message,
          });
        } else {

          setModalData({
            isVisible: true,
            status: 'Success',
            text: 'Success", "Thanks for registering, SequelString Team will get back to you soon.',
          });
          navigate(UnAuthScreens.LogIn)
        }
      } catch (error: any) {
        setModalData({
          isVisible: true,
          status: 'Error',
          text: error.message,
        });
      } finally {
        setLoading(false);
        setValues({
          email: "",
          password: "",
          confirmPassword: "",
          fullName: "",
          moNumber: "",
          companyName: "",
        })
      }
    }
  };

  const handleChange = (name: string, value: string) => {
    console.log("name, values", name, value)
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  return (
    <Box flex={1} bg={'white'}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <VStack space={2} w="100%" px={4} py={5}>
            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/img/sqLogo.png')}
                style={styles.noDataImage}
                resizeMode="contain"
              />
            </View>

            <Text fontSize="2xl" bold textAlign="center" color="teal.500">
              Welcome!
            </Text>
            <Text color={'gray.400'} textAlign="center" fontSize="lg" bold>
              Fill in the required information.
            </Text>

            <FormControl isInvalid={!!errors.email}>
              <FormControl.Label>Email</FormControl.Label>
              <Input
                type="text"
                placeholder="Enter your email"
                value={values.email}
                fontSize="md"
                onBlur={validateEmail}
                onChangeText={(text) => handleChange('email', text)}
              />
              <FormControl.ErrorMessage>{errors.email}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormControl.Label>Password</FormControl.Label>
              <Input
                type="password"
                fontSize="md"
                placeholder="Enter your password"
                value={values.password}
                onBlur={validatePassword}
                onChangeText={(text) => handleChange('password', text)}
              />
              <FormControl.ErrorMessage>{errors.password}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.confirmPassword}>
              <FormControl.Label>Confirm Password</FormControl.Label>
              <Input
                type="password"
                placeholder="Confirm your password"
                fontSize="md"
                value={values.confirmPassword}
                onBlur={validateConfirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
              />
              <FormControl.ErrorMessage>{errors.confirmPassword}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl>
              <FormControl.Label>Full Name</FormControl.Label>
              <Input
                type="text"
                fontSize="md"
                placeholder="Enter your name"
                value={values.fullName}
                onChangeText={(text) => handleChange('fullName', text)}
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Mobile No.</FormControl.Label>
              <Input
                type="text"
                fontSize="md"
                placeholder="Enter your number"
                value={values.moNumber}
                onChangeText={(text) => handleChange('moNumber', text)}
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Company</FormControl.Label>
              <Input
                type="text"
                fontSize="md"
                placeholder="Enter your Company Name"
                value={values.companyName}
                onChangeText={(text) => handleChange('companyName', text)}
              />
            </FormControl>

            <Button
              onPress={handleSubmit}
              isLoading={loading}
              isLoadingText="Submitting..."
              colorScheme="teal"
            >
              Submit
            </Button>

            <Text textAlign="center" onPress={() => navigate(UnAuthScreens.LogIn)}>
              Already have an account?{' '}
              <Text bold style={{ color: 'teal' }}>
                Log In
              </Text>
            </Text>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>

      <NotifyModal visible={modalData} onClose={closeModal} textColor="#38B2AC" />
    </Box>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
  },
  noDataImage: {
    width: 200,
    height: 200,
    marginBottom: -80,
    // marginTop: -100
  },
})