import React from 'react';
import {View, StyleSheet} from 'react-native';
import { Box } from 'native-base';
import FolderDocumentList from './components/FolderDocumentList';
import {RootStackParamList} from './types/navigation';
import {createStackNavigator} from '@react-navigation/stack';
import DocumentList from './components/DocumentList';
import PDFViewer from './components/common/PDFViewer/PDFViewer';

const DocScannerPage = () => {
  const Stack = createStackNavigator<RootStackParamList>();

  return (
    <View style={styles.container}>
      <Box flex={1} bg={'white'}>
            {/* Sidebar */}
            {/* Header */}
            <Stack.Navigator initialRouteName="FolderDocumentList">
          <Stack.Screen
            name="FolderDocumentList"
            component={FolderDocumentList}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="DocumentList"
            component={DocumentList}
            options={{headerShown: false}}
          />
          <Stack.Screen name="PDFViewer" component={PDFViewer} options={{headerShown: false}} />
        </Stack.Navigator>
        </Box>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },

  header: {
    height: 60,
    backgroundColor: '#1A202C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  //   button: {
  //     width: 50,
  //     height: 50,
  //     borderRadius: 25,
  //     backgroundColor: '#007AFF',
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     elevation: 3,
  //   },
  folderItem: {padding: 16, borderBottomWidth: 1, borderBottomColor: '#ddd'},
  folderName: {fontSize: 18, fontWeight: 'bold'},
  folderDetails: {fontSize: 14, color: '#555'},
  inputContainer: {flexDirection: 'row', marginTop: 16},
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginRight: 8,
  },
});

export default DocScannerPage;
