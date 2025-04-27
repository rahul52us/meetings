import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { BaseScreens, BaseStackNavigationProp } from '../../navigations/BaseStack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { appRequest } from '../../routes';

type Props = {
    children: ReactNode;
};

const AuthGuard = ({ children }: Props) => {
    const navigation = useNavigation<BaseStackNavigationProp>();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkUserLoginStatus();
    }, [navigation, isLoading, isLoggedIn]);

    const checkUserLoginStatus = async () => {
        try {
            const response: any = await appRequest('user', 'isLoggedIn');
            if (response === true) {
                setIsLoggedIn(true); 

            } else {
            setIsLoggedIn(false); 

            }
        } catch (err) {
            console.error("Error checking login status:", err);
            setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (!isLoggedIn && !isLoading) {
            navigation.reset({
                index: 0,
                routes: [{ name: BaseScreens.UnAuthStack }],
            });
        }
    }, [isLoading, isLoggedIn, navigation]);

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#38B2AC" />
            </View>
        );
    }

    return isLoggedIn ? <>{children}</> : null;
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AuthGuard;
