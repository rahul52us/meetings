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

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
  setCurrentScreen?:any;
};

const Sidebar = ({ visible, onClose, setCurrentScreen }: SidebarProps) => {
  const { accountDetails } = useUser();
  const navigation = useNavigation<BaseStackNavigationProp>();
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const [selectedItem, setSelectedItem] = useState('Dashboard');

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('auth-token');
      navigation.reset({
        index: 0,
        routes: [{ name: BaseScreens.UnAuthStack }],
      });
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  const handleSlide = (toValue: number, onComplete?: () => void) => {
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onComplete?.());
  };

  useEffect(() => {
    visible ? handleSlide(0) : handleSlide(-320);
  }, [visible]);

  const closeAndNavigate = (screen: string) => {
    handleSlide(-320, () => {
      setCurrentScreen?.(screen);
      setSelectedItem(screen);
      onClose();
    });
  };

  const sidebarStyle: ViewStyle = {
    transform: [{ translateX: slideAnim }],
    position: 'absolute',
    width: 320,
    height: '100%',
    zIndex: 1000,
  };

  const menuItems = [
    { label: 'Dashboard', screen: 'Dashboard' },
    { label: 'Job Seekers', screen: 'JobSeekers' },
    { label: 'Mentors', screen: 'Mentors' },
    { label: 'Employers', screen: 'Employers' },
    { label: 'Job List', screen: 'JobLists' },
    { label: 'Agents', screen: 'Agents' },
    { label: 'Logout', screen: 'Logout' },
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
        <Box
          flex={1}
          bg="white"
          pt={12}
          px={5}
          borderRightRadius="3xl"
          shadow={9}
        >
          <Button
            variant="ghost"
            onPress={() => handleSlide(-320, onClose)}
            size="sm"
            position="absolute"
            top={3}
            left={3}
            _pressed={{ bg: 'teal.200' }}
            zIndex={1}
          >
            <BackIcon size={22} />
          </Button>

          {/* Profile Section */}
          <Pressable
            onPress={() => closeAndNavigate('Profile')}
            _pressed={{ opacity: 0.85 }}
          >
            <VStack space={2} alignItems="center" mb={6}>
              <Avatar
                source={{
                  uri:
                    accountDetails?.profileDetails?.profileDetails?.avatar ||
                    'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Photos.png',
                }}
                size="xl"
                borderColor="teal.500"
                borderWidth={2}
                shadow={4}
              />
              <Text fontSize="lg" fontWeight="bold" color="teal.900">
                {accountDetails?.name || 'Unknown'}
              </Text>
              <Text fontSize="xs" color="teal.600">
                {accountDetails?.username || 'user'}
              </Text>
              <Box px={3} py={1} bg="teal.200" borderRadius="full" mt={1}>
                <Text fontSize="xs" color="teal.800" fontWeight="bold">
                  {accountDetails?.role?.toUpperCase() || 'USER'}
                </Text>
              </Box>
            </VStack>
          </Pressable>

          <Divider mb={5} bg="teal.300" />

          {/* Menu Items */}
          <VStack space={2}>
            {menuItems.map(({ label, screen }) => {
              const isSelected = selectedItem === screen;
              const isLogout = screen === 'Logout';

              return (
                <Pressable
                  key={screen}
                  onPress={() => {
                    if (isLogout) {
                      logout();
                      handleSlide(-320, onClose);
                    } else {
                      closeAndNavigate(screen);
                    }
                  }}
                  _pressed={{ bg: 'teal.100' }}
                >
                  {({ isPressed }) => {
                    const bgColor = isSelected
                      ? 'teal.600'
                      : isPressed
                      ? 'teal.100'
                      : 'transparent';

                    const textColor = isSelected ? 'white' : 'teal.800';

                    return (
                      <Box
                        px={4}
                        py={3}
                        borderRadius="full"
                        bg={bgColor}
                        shadow={isSelected ? 2 : 0}
                      >
                        <Text
                          fontSize="md"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          color={textColor}
                          textAlign="center"
                        >
                          {label}
                        </Text>
                      </Box>
                    );
                  }}
                </Pressable>
              );
            })}
          </VStack>

          {/* Footer */}
          <Box flex={1} justifyContent="flex-end" pb={5} alignItems="center">
            <Text fontSize="xs" color="teal.600">
              © 2025 BusinessSahayata
            </Text>
          </Box>
        </Box>
      </Animated.View>
    </>
  );
};

export default Sidebar;
