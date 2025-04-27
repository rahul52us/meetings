import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Pdf from 'react-native-pdf';
import Header from '../Header/Header';
import { useNavigation } from '@react-navigation/native';
import FormDrawerModal from '../../component/FormDrawerModal';
import EditSVG from '../../../assets/edit';
import { appRequest } from '../../../routes';
import NotifyModal from '../NotifyModal/NotifyModal';

const PDFViewer = ({ route }: any) => {
  const { pdfData, folder, documentDetails } = route.params;
  const navigation = useNavigation<any>();

  const [modalData, setModalData] = useState({
    isVisible: false,
    status: '',
    text: '',
  });

  const [formModal, setFormModal] = useState({
    open: false,
    data: null,
    type: 'add',
    id: null,
  });

  const [saving, setSaving] = useState(false);

  const closeFormModal = () => {
    setFormModal(prev => ({ ...prev, open: false }));
  };

  const handleEditPress = () => {
    setFormModal({
      open: true,
      data: documentDetails?.extractedData || null,
      type: 'edit',
      id: documentDetails?._id || null,
    });
  };

  const handleSaveEditData = async (savedData: any) => {
    try {
      setSaving(true);

      const response: any = await appRequest('pdfdetails', 'updateExtracedData', {
        data: savedData,
        id: formModal?.id,
      });

      if (response.status === 'success') {
        setModalData({
          isVisible: true,
          status: 'Success',
          text: 'Document updated successfully.',
        });
        closeFormModal();
        // getPdfs();
      } else {
        setModalData({
          isVisible: true,
          status: 'Error',
          text: 'Document update failed.',
        });
      }
    } catch (err) {
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'Document update failed.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        showBackButton
        onBackPress={() => navigation.navigate('DocumentList', { folder })}
        title={pdfData.name}
      />

      {/* Edit Button */}
      <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
        <EditSVG width={20} height={20} color="#fff" />
      </TouchableOpacity>

      {/* PDF/Image Viewer */}
      {pdfData?.type.includes('image') ? (
        <Image
          source={{ uri: pdfData?.file }}
          style={styles.noDataImage}
          resizeMode="contain"
        />
      ) : (
        <Pdf
          source={{ uri: pdfData?.file, cache: true }}
          onLoadComplete={(numberOfPages: number) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page: number, numberOfPages: number) => {
            console.log(`Current page: ${page}`);
          }}
          onError={(error: any) => {
            console.log(error);
          }}
          onPressLink={(uri: string) => {
            console.log(`Link pressed: ${uri}`);
          }}
          style={styles.pdf}
        />
      )}

      {/* Modal */}
      <FormDrawerModal
        isLoading={saving}
        onSave={handleSaveEditData}
        visible={formModal.open}
        onClose={closeFormModal}
        data={formModal.data}
      />
       <NotifyModal
        visible={modalData}
        onClose={() => {
          setModalData({
            isVisible: false,
            status: '',
            text: '',
          })
        }}
        textColor="#38B2AC"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: 20,
  },
  noDataImage: {
    width: '90%',
    height: '90%',
    margin: 20,
  },
  editButton: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 10,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 50,
    elevation: 4,
  },
});

export default PDFViewer;
