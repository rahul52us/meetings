import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ViewStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Box,
  VStack,
  Text,
  Pressable,
  Button,
  Avatar,
  Divider,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BackIcon from '../../assets/icons/BackIcon';
import { BaseScreens, BaseStackNavigationProp } from '../../navigations/BaseStack';
import { useUser } from '../authGuard/UserContext';

type MenuItem = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
  setCurrentScreen?: any;
};

const Sidebar = ({ visible, onClose, setCurrentScreen }: SidebarProps) => {
  const { accountDetails } = useUser();
  const { reset } = useNavigation<BaseStackNavigationProp>();
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const logout = () => {
    AsyncStorage.removeItem('auth-token')
      .then(() => {
        reset({
          index: 0,
          routes: [{ name: BaseScreens.UnAuthStack }],
        });
      })
      .catch(err => {
        console.error('Error clearing auth token:', err);
      });
  };

  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  useEffect(() => {
    visible ? slideIn() : slideOut();
  }, [visible]);

  const sidebarStyle: ViewStyle = {
    transform: [{ translateX: slideAnim }],
    position: 'absolute',
    width: 300,
    height: '100%',
    zIndex: 1000,
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      onPress: () => {
        setCurrentScreen?.('Dashboard');
        slideOut();
      },
    },
    {
      label: 'Job Seekers',
      onPress: () => {
        setCurrentScreen?.('JobSeekers');
        slideOut();
      },
    },
    {
      label: 'Mentors',
      onPress: () => {
        setCurrentScreen?.('Mentors');
        slideOut();
      },
    },
    {
      label: 'Employers',
      onPress: () => {
        setCurrentScreen?.('Employers');
        slideOut();
      },
    },
    {
      label: 'Job List',
      onPress: () => {
        setCurrentScreen?.('JobLists');
        slideOut();
      },
    },
    {
      label: 'Agents',
      onPress: () => {
        setCurrentScreen?.('Agents');
        slideOut();
      },
    },
    {
      label: 'Logout',
      onPress: () => {
        logout();
        slideOut();
      },
    },
  ];

  return (
    <>
      {visible && (
        <TouchableWithoutFeedback onPress={onClose}>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0,0,0,0.4)"
            zIndex={999}
          />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={sidebarStyle}>
        <Box flex={1} bg="gray.50" pt={10} px={4}>
          {/* Close Button */}
          <Button
            variant="ghost"
            onPress={slideOut}
            size="sm"
            position="absolute"
            top={4}
            left={4}
            _pressed={{ bg: 'gray.200' }}
          >
            <BackIcon size={20} />
          </Button>

          {/* Profile Info */}
          <VStack space={2} alignItems="center" mb={6}>
            <Avatar
              source={{
                uri:
                  accountDetails?.profileDetails?.profileDetails?.avatar ||
                  'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Photos.png',
              }}
              size="xl"
              borderColor="primary.500"
              borderWidth={1}
              mb={1}
            />
            <Text fontSize="lg" fontWeight="bold" color="coolGray.800">
              {accountDetails?.name || 'Unknown'}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {accountDetails?.username || 'N/A'}
            </Text>
            <Text fontSize="xs" color="primary.600">
              {accountDetails?.role?.toUpperCase() || 'USER'}
            </Text>
          </VStack>
          <Divider mb={4} />
          <VStack space={2}>
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={item.onPress}
                isDisabled={item.disabled}
                _pressed={{ bg: 'gray.200' }}
                bg="white"
                borderRadius="2xl"
                px={5}
                py={3}
                shadow={1}
              >
                <Text fontSize="md" fontWeight="medium" color="coolGray.800">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </VStack>
        </Box>
      </Animated.View>
    </>
  );
};

export default Sidebar;
