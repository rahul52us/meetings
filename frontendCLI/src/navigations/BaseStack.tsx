import React from 'react'
import { createNativeStackNavigator, NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import UnAuthStack from './UnAuthStack';
import AuthGuard from '../components/authGuard/AuthGuard';
import { UserProvider } from '../components/authGuard/UserContext';
import HomeLayout from '../HomeLayout';

const Stack = createNativeStackNavigator();

export enum BaseScreens {
    UnAuthStack = "UnAuthStack",
    AuthStack = "AuthStack",
}

export type BaseScreenParams = {
    [BaseScreens.UnAuthStack]: undefined;
    [BaseScreens.AuthStack]: undefined;
}

export type BaseScreenProps<RouteName extends keyof BaseScreenParams = BaseScreens> = NativeStackScreenProps<BaseScreenParams, RouteName>;
export type BaseStackNavigationProp<RouteName extends keyof BaseScreenParams = BaseScreens> = NativeStackNavigationProp<BaseScreenParams, RouteName>;
export type BaseStackRouteProp<RouteName extends keyof BaseScreenParams = BaseScreens> = RouteProp<BaseScreenParams, RouteName>;

const BaseStack = () => {
    return (
        <Stack.Navigator initialRouteName={BaseScreens.AuthStack}>
            <Stack.Screen name={BaseScreens.AuthStack} options={{ headerShown: false }}>
                {() =>
                <UserProvider>
                <AuthGuard>
                   <HomeLayout />
                </AuthGuard>
                </UserProvider>
                }
            </Stack.Screen>
            <Stack.Screen name={BaseScreens.UnAuthStack} options={{ headerShown: false }} component={UnAuthStack} />
        </Stack.Navigator>
    )
}

export default BaseStack