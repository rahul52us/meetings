import React from 'react';
import { HStack, Button, Text, Box } from 'native-base';
import BackIcon from '../../../assets/icons/BackIcon';
import { useNavigation } from '@react-navigation/native';
import Home from '../../../assets/icons/Home';
import { TouchableOpacity, View } from 'react-native';
import BaseStack, { BaseScreens } from '../../../navigations/BaseStack';

interface HeaderProps {
    title?: string;
    showBackButton?: boolean;
    showHomeButton?: boolean;
    showChooseCity?: boolean;
    onBackPress?: () => void;
    rightComponent?: React.ReactNode;
    leftComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = true, showHomeButton = true, showChooseCity = false, onBackPress, rightComponent, leftComponent }) => {
    const { navigate } = useNavigation<any>()

    const handleGoBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            navigate(BaseScreens.AuthStack)
        }
    };

    return (
        <HStack p={2} pb={2} bg={'white'} shadow={'2'} alignItems="center" justifyContent="space-between">
            {/* Left Component or Back Button */}
            {leftComponent ? (
                <Box>
                    {leftComponent}
                </Box>
            ) : (
                showBackButton ? (
                    <Button h={'10'} p="2" variant="ghost" onPress={handleGoBack}>
                        <BackIcon />
                    </Button>
                ) : (
                    <Box w={12} h={10} />
                )
            )}

            {/* Title (Centered) */}
            <Box flex={1} position="absolute" left={0} right={0} alignItems="center">
                {title ? (
                    <Text fontSize="lg" bold>
                        {title}
                    </Text>
                ) : null}
            </Box>
        </HStack>

    );
};

export default Header;
