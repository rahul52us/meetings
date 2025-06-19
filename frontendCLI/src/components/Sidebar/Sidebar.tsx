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
  HStack,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BackIcon from '../../assets/icons/BackIcon';
import { BaseScreens, BaseStackNavigationProp } from '../../navigations/BaseStack';
import { useUser } from '../authGuard/UserContext';

import DashboardIcon from '../../assets/icons/DashboardIcon';
import PeopleIcon from '../../assets/icons/PeopleIcon';
import SchoolIcon from '../../assets/icons/SchoolIcon';
import BusinessIcon from '../../assets/icons/BussinessIcon';
import WorkIcon from '../../assets/icons/WorkIcon';
import AgentIcon from '../../assets/icons/AgentIcon';
import LogoutIcon from '../../assets/icons/LogoutIcon';

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
    { label: 'Dashboard', screen: 'Dashboard', icon: DashboardIcon },
    { label: 'Job Seekers', screen: 'JobSeekers', icon: PeopleIcon },
    { label: 'Mentors', screen: 'Mentors', icon: SchoolIcon },
    { label: 'Employers', screen: 'Employers', icon: BusinessIcon },
    { label: 'Job List', screen: 'JobLists', icon: WorkIcon },
    { label: 'Agents', screen: 'Agents', icon: AgentIcon },
    { label: 'Logout', screen: 'Logout', icon: LogoutIcon },
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
          pt={10}
          px={4}
          borderRightRadius="3xl"
          shadow={9}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            onPress={() => handleSlide(-320, onClose)}
            size="sm"
            position="absolute"
            top={3}
            left={3}
            _pressed={{ bg: '#ccfbf1' }} // teal.100
            zIndex={1}
          >
            <BackIcon size={22} />
          </Button>

          {/* Profile Section */}
          <Pressable onPress={() => closeAndNavigate('Profile')} _pressed={{ opacity: 0.9 }}>
            <VStack space={1} alignItems="center" mb={4}>
              <Avatar
                source={{
                  uri:
                    accountDetails?.profileDetails?.profileDetails?.avatar ||
                    'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Photos.png',
                }}
                size="lg"
                borderColor="#14b8a6" // teal.500
                borderWidth={1.5}
                shadow={2}
              />
              <Text fontSize="sm" fontWeight="bold" color="#134e4a">
                {accountDetails?.name || 'Unknown'}
              </Text>
              <Text fontSize="xs" color="#0d9488">
                {accountDetails?.username || 'user'}
              </Text>
              <Box px={2.5} py={0.5} bg="#ccfbf1" borderRadius="full" mt={0.5}>
                <Text fontSize="xs" color="#0d9488" fontWeight="semibold">
                  {accountDetails?.role?.toUpperCase() || 'USER'}
                </Text>
              </Box>
            </VStack>
          </Pressable>

          <Divider mb={4} bg="#e5e7eb" /> {/* coolGray.200 */}

          {/* Menu Items */}
          <VStack space={1}>
            {menuItems.map(({ label, screen, icon: IconComponent }) => {
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
                  _pressed={{ bg: '#f3f4f6' }} // coolGray.100
                >
                  {({ isPressed }) => {
                    const bgColor = isSelected
                      ? '#0d9488'
                      : isPressed
                      ? '#f3f4f6'
                      : 'white';

                    const textColor = isSelected ? 'white' : '#1f2937'; // coolGray.800
                    const iconColor = isSelected ? 'white' : '#0d9488';

                    return (
                      <Box
                        px={3}
                        py={2.5}
                        borderRadius="xl"
                        bg={bgColor}
                        shadow={isSelected ? 2 : 0}
                        borderWidth={isSelected ? 0 : 1}
                        borderColor={isSelected ? 'transparent' : '#e5e7eb'}
                      >
                        <HStack alignItems="center" space={3}>
                          <IconComponent size={18} color={iconColor} />
                          <Text
                            fontSize="md"
                            fontWeight={isSelected ? 'bold' : 'medium'}
                            color={textColor}
                          >
                            {label}
                          </Text>
                        </HStack>
                      </Box>
                    );
                  }}
                </Pressable>
              );
            })}
          </VStack>

          {/* Footer */}
          <Box flex={1} justifyContent="flex-end" pb={4} alignItems="center">
            <Text fontSize="xs" color="#9ca3af">© 2025 SequelString</Text>
          </Box>
        </Box>
      </Animated.View>
    </>
  );
};

export default Sidebar;
