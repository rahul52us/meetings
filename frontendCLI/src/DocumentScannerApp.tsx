import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

const DocumentScannerApp = ({capturedImage, setCapturedImage}: any) => {

  return (
    <View style={styles.container}>
      {capturedImage && (
        <View style={styles.previewContainer}>
          <Image
            source={{uri: capturedImage?.[0] || ''}}
            style={styles.imagePreview}
          />
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setCapturedImage(null)}>
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  captureButton: {
    padding: 15,
    backgroundColor: 'orange',
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  resetButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 10,
  },
});

export default DocumentScannerApp;
