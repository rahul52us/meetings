import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { BaseScreens, BaseStackNavigationProp } from '../../navigations/BaseStack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { appRequest } from '../../routes';
import { useUser } from './UserContext';

type Props = {
    children: ReactNode;
};

const AuthGuard = ({ children }: Props) => {
    const navigation = useNavigation<BaseStackNavigationProp>();
    const [isLoading, setIsLoading] = useState(true);
    const { setAccountDetails, isLoggedIn, setIsLoggedIn } = useUser();

    useEffect(() => {
        checkUserLoginStatus();
    }, []);

    const checkUserLoginStatus = async () => {
        try {
            const loggedIn = await appRequest('user', 'isLoggedIn');
            if (loggedIn === true) {
                const response : any = await appRequest('user', 'getUserDetails');
                console.log('the get accoount details response are', response)
                if (response && response.status !== "error") {
                    setAccountDetails(response);
                    setIsLoggedIn(true)
                  }
                else {
                    setIsLoggedIn(false);
                    setAccountDetails(null);
                }
            } else {
                setIsLoggedIn(false);
                setAccountDetails(null);
            }
        } catch (err) {
            console.error('AuthGuard error:', err);
            setIsLoggedIn(false);
            setAccountDetails(null);
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
    }, [isLoggedIn, isLoading]);

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
