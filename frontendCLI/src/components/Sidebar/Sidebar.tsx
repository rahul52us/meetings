import React, { useEffect, useRef, useState } from 'react';
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
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const [selectedItem, setSelectedItem] = useState('Dashboard');

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
      toValue: -320,
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
    width: 320,
    height: '100%',
    zIndex: 1000,
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      onPress: () => {
        setCurrentScreen?.('Dashboard');
        setSelectedItem('Dashboard');
        slideOut();
      },
    },
    {
      label: 'Job Seekers',
      onPress: () => {
        setCurrentScreen?.('JobSeekers');
        setSelectedItem('Job Seekers');
        slideOut();
      },
    },
    {
      label: 'Mentors',
      onPress: () => {
        setCurrentScreen?.('Mentors');
        setSelectedItem('Mentors');
        slideOut();
      },
    },
    {
      label: 'Employers',
      onPress: () => {
        setCurrentScreen?.('Employers');
        setSelectedItem('Employers');
        slideOut();
      },
    },
    {
      label: 'Job List',
      onPress: () => {
        setCurrentScreen?.('JobLists');
        setSelectedItem('Job List');
        slideOut();
      },
    },
    {
      label: 'Agents',
      onPress: () => {
        setCurrentScreen?.('Agents');
        setSelectedItem('Agents');
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
            bg="rgba(0,0,0,0.5)"
            zIndex={999}
          />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={sidebarStyle}>
        <Box
          flex={1}
          bg="white"
          pt={12}
          px={5}
          borderRightRadius="3xl"
          shadow={9}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            onPress={slideOut}
            size="sm"
            position="absolute"
            top={3}
            left={3}
            _pressed={{ bg: 'gray.100' }}
            zIndex={1}
          >
            <BackIcon size={22} />
          </Button>

          {/* Profile Section */}
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
              shadow={2}
            />
            <Text fontSize="lg" fontWeight="bold" color="coolGray.800">
              {accountDetails?.name || 'Unknown'}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {accountDetails?.username || 'user'}
            </Text>
            <Box px={3} py={1} bg="primary.100" borderRadius="full" mt={1}>
              <Text fontSize="xs" color="teal.700" fontWeight="bold">
                {accountDetails?.role?.toUpperCase() || 'USER'}
              </Text>
            </Box>
          </VStack>

          <Divider mb={5} />

          {/* Menu Items (Improved) */}
          <VStack space={1}>
            {menuItems.map((item, index) => {
              const isSelected = selectedItem === item.label;
              return (
                <Pressable
                  key={index}
                  onPress={item.onPress}
                  isDisabled={item.disabled}
                  _pressed={{ bg: 'primary.100' }}
                >
                  {({ isPressed }) => (
                    <Box
                      flexDir="row"
                      alignItems="center"
                      px={4}
                      py={3}
                      borderRadius="2xl"
                      bg={
                        isSelected
                          ? 'teal.200'
                          : isPressed
                          ? 'gray.100'
                          : 'gray.50'
                      }
                      shadow={isSelected ? 2 : 0}
                    >
                      {/* Active dot or icon placeholder */}
                      <Box
                        bg={isSelected ? 'teal.500' : 'gray.300'}
                        borderRadius="full"
                        size={2}
                        mr={3}
                      />

                      <Text
                        fontSize="md"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        color={isSelected ? 'teal.800' : 'coolGray.800'}
                      >
                        {item.label}
                      </Text>
                    </Box>
                  )}
                </Pressable>
              );
            })}
          </VStack>

          {/* Footer */}
          <Box flex={1} justifyContent="flex-end" pb={5} alignItems="center">
            <Text fontSize="xs" color="gray.400">
              © 2025 BusinessSahayata
            </Text>
          </Box>
        </Box>
      </Animated.View>
    </>
  );
};

export default Sidebar;
