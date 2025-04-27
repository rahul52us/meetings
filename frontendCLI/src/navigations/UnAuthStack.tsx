import { StyleSheet } from 'react-native'
import React from 'react'
import { createNativeStackNavigator, NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import SignUpScreen from '../components/Login/SignUpScreen';
import LogInScreen from '../components/Login/LogInScreen';
import { View } from 'native-base';
import { Text } from 'react-native-svg';

const Stack = createNativeStackNavigator();

export enum UnAuthScreens {
    SignUp = "SignUp",
    LogIn = "LogIn",
    OTP = "OTP"
}

export type UnAuthScreenParams = {
    [UnAuthScreens.SignUp]: undefined;
    [UnAuthScreens.LogIn]: undefined;
    [UnAuthScreens.OTP]: { prevScreen: UnAuthScreens.LogIn | UnAuthScreens.SignUp, tokenId: string; moNumber: number; };
}

export type UnAuthScreenProps<RouteName extends keyof UnAuthScreenParams = UnAuthScreens> = NativeStackScreenProps<UnAuthScreenParams, RouteName>;
export type UnAuthStackNavigationProp<RouteName extends keyof UnAuthScreenParams = UnAuthScreens> = NativeStackNavigationProp<UnAuthScreenParams, RouteName>;
export type UnAuthStackRouteProp<RouteName extends keyof UnAuthScreenParams = UnAuthScreens> = RouteProp<UnAuthScreenParams, RouteName>;


const UnAuthStack = () => {
    return (
        <Stack.Navigator initialRouteName={UnAuthScreens.LogIn}>
            <Stack.Screen name={UnAuthScreens.SignUp} options={{ headerShown: false }} component={SignUpScreen} />
            {/* <Stack.Screen name={UnAuthScreens.LogIn} options={{ headerShown: false }} component={LogInScreen} /> */}
            <Stack.Screen name={UnAuthScreens.LogIn} options={{ headerShown: false }}>
                {
                    () => 
                        <LogInScreen />
                    // <View><Text>Hello</Text></View>
                }
            </Stack.Screen>
        </Stack.Navigator>
    )
}

export default UnAuthStack

const styles = StyleSheet.create({})