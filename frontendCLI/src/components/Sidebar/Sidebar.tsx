import React, {useEffect, useRef} from 'react';
import {
  Box,
  VStack,
  Text,
  HStack,
  Pressable,
  Divider,
  Button,
} from 'native-base';
// import { Ionicons } from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Animated, ViewStyle, TouchableWithoutFeedback} from 'react-native';

import BackIcon from '../../assets/icons/BackIcon';
import Home from '../../assets/icons/Home';
import UserIcon from '../../assets/icons/UserIcon';
import { BaseScreens, BaseStackNavigationProp } from '../../navigations/BaseStack';
import AsyncStorage from '@react-native-async-storage/async-storage';


type MenuItem = {
  label: string;
  icon?: JSX.Element;
  // route?: AuthScreens.TransportationSelection | AuthScreens.History | AuthScreens.Profile | BaseScreens.UnAuthStack;  // Ensure this matches the keys from RootStackParamList
  onPress: () => void;
  disabled?: boolean;
};

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
};

const Sidebar = ({visible, onClose}: SidebarProps) => {
  const {navigate, reset} = useNavigation<BaseStackNavigationProp>();
  const route = useRoute();

  const slideAnim = useRef(new Animated.Value(-300)).current;

  // Hardcoded values
  const profileImage =
    'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Photos.png';
  const username = 'John Doe';


  const logout = () => {
    AsyncStorage.removeItem("auth-token").then(() => {
      reset({
          index: 0,
          routes: [{name: BaseScreens.UnAuthStack}],
      });
  }).catch(err => {
      console.error("Error clearing auth token:", err);
  });  };

  const menuItems: MenuItem[] = [
    {
      label: 'Contacts',
      icon: <Home size={25} />,
      // route: AuthScreens.TransportationSelection,
      onPress: () => {
        if (route.name !== BaseScreens.AuthStack) {
          // navigate(AuthScreens.TransportationSelection);
        }
        slideOut();
      },
    },
    {
      label: 'Logout',
      icon: <UserIcon />,
      // route: BaseScreens.UnAuthStack,
      onPress: () => {
        logout();
        slideOut();
      },
    },
  ];

  useEffect(() => {
    if (visible) {
      slideIn();
    } else {
      slideOut();
    }
  }, [visible]);

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

  const sidebarStyle: ViewStyle = {
    transform: [{translateX: slideAnim}],
    position: 'absolute',
    width: 300,
    height: 900,
    zIndex: 1000,
    backgroundColor: 'white',
  };

  return (
    <>
      {visible && (
        //overlay
        <TouchableWithoutFeedback onPress={onClose}>
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999,
            }}
          />
        </TouchableWithoutFeedback>
      )}
      <Animated.View style={sidebarStyle}>
        <Box p={4} flex={1} borderRightWidth={1} borderColor="gray.200">
          <Button
            variant="ghost"
            onPress={() => slideOut()}
            size={'sm'}
            width={'10'}>
            <BackIcon size={20} />
          </Button>

          {/* Profile Section */}
          {/* <VStack space={3} alignItems="center">
                        <Avatar
                            source={{ uri: profileImage }}
                            size="xl"
                            borderWidth={2}
                            borderColor="yellow.400"
                        />
                        <Text fontSize="xl" fontWeight="bold">{loggedInUserLoading ? "..." : loggedInUser?.user.name || "NA"}</Text>
                    </VStack> */}

          {/* Menu Items */}
          <VStack space={4} mt={8}>
            {menuItems.map((item, index) => (
              <Pressable
                disabled={item.disabled}
                key={index}
                onPress={item.onPress}>
                <HStack space={4} alignItems="center">
                  {item?.icon}
                  <Text fontSize="md">{item.label}</Text>
                </HStack>
                {index < menuItems.length - 1 && <Divider mt={4} />}
              </Pressable>
            ))}
          </VStack>
        </Box>
      </Animated.View>
    </>
  );
};

export default Sidebar;
