/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
// import DocumentScannerApp from './src/DocumentScannerApp';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeBaseProvider } from 'native-base';
import BaseStack from './src/navigations/BaseStack';
import customTheme from './src/theme/theme';

function App() {
  return (
    <NativeBaseProvider theme={customTheme}>
    <NavigationContainer>
    <SafeAreaProvider>
      <BaseStack />
      {/* <Toast /> */}
    </SafeAreaProvider>
  </NavigationContainer>
  </NativeBaseProvider>
  );
}
export default App;
