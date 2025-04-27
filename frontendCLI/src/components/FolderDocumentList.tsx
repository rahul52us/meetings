import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { appRequest } from '../routes';
import { DDMMYYYY_FORMAT, formatDateTime } from '../utils/dateUtils/dateUtils';
import DocumentScanner from 'react-native-document-scanner-plugin';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FolderSVG from '../assets/folder';
import CameraSVG from '../assets/camera';
import AddFolderSVG from '../assets/addfolder';
import { Dropdown } from 'react-native-element-dropdown';
import Sidebar from './Sidebar/Sidebar';
import Header from './common/Header/Header';
import HamburgerIcon from '../assets/icons/HamburgerIcon';
import { Button } from 'native-base';
import NotifyModal from './common/NotifyModal/NotifyModal';

export type FolderItemNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DocumentList'
>;

function FolderDocumentList() {
  const [folders, setFolders] = useState<any[]>([]);
  const [allFolders, setAllFolders] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [addFolderModalVisible, setAddFolderModalVisible] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [selectFolderModalVisible, setSelectFolderModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [inputArray, setInputArray] = useState<any>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalData, setModalData] = useState({ isVisible: false, status: '', text: '' });
  const [approval, setApproval] = useState(false);

  const closeModal = () => {
    setModalData({ isVisible: false, status: '', text: '' });
  };

  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };

  const handleCloseSidebar = () => {
    setMenuVisible(false);
  };

  const navigation = useNavigation<FolderItemNavigationProp>();
  const getFolders = async (page: number = 1) => {
    if (loading || (page > totalPages && isFetchingMore)) return;
    setLoading(true);

    try {
      let limit = 10;
      let getTotal = true
      const response: any = await appRequest('pdfdetails', 'getFolder', {
        page,
        limit,
        getTotal
      });

      if (response.status === 'success') {
        setFolders((prev) => (page === 1 ? response.data : [...prev, ...response.data]));
        setTotalPages(response.totalPages);
        setAllFolders(response.totalData)
      }
    } catch (err: any) {
      console.error('Error fetching folders:', err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    getFolders();
  }, []);

  const handleLoadMore = () => {
    if (!isFetchingMore && currentPage < totalPages) {
      setIsFetchingMore(true);
      setCurrentPage((prev) => prev + 1);
      getFolders(currentPage + 1);
    }
  };

  const onClose = () => {
    setNewFolderName('');
    setAddFolderModalVisible(false);
  };

  const convertToBase64 = async (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      fetch(filePath)
        .then(response => response.blob())
        .then(blob => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  };

  const generateHtmlContent = async (images: string[]): Promise<string> => {
    const tickets = await Promise.all(
      images.map(async (element: string, index: number) => {
        const base64Image = await convertToBase64(element);
        return `
      <div style="
  width: 100%;
  height: 100vh;
  page-break-inside: avoid;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;">
  <img
    src="${base64Image}"
    alt="Scanned Image ${index + 1}"
    style="
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
      margin: auto;
      page-break-after: always;"
  />
</div>`;
      }),
    );

    const allTicketsHtml = tickets.join('');
    return `
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .page-break { page-break-after: always; }
        .no-break { page-break-inside: avoid; }
      </style>
    </head>
    <body>
      ${allTicketsHtml}
    </body>
    </html>
  `;
  };

  const savePdf = async (
    htmlContent: string,
    fileName: string,
    directory: string,
    pages: any,
  ): Promise<void> => {
    try {
      setSaving(true);
      const options = {
        html: htmlContent,
        fileName,
        directory,
        base64: true,
      };
      const pdfFile: any = await RNHTMLtoPDF.convert(options);
      const pdfType = 'application/pdf';
      const base64Prefix = `data:${pdfType};base64,${pdfFile.base64}`;

      const pdfData = {
        name: options.fileName,
        file: base64Prefix,
        type: pdfType,
        parentId: selectedFolder,
        pages: pages,
        indexing: inputArray,
      };

      savePdfData(pdfData);
    } catch (error) {
      console.error('Error saving PDF:', error);
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'Failed to save document.',
      });
    } finally {
      setCapturedImage(null);
      setShowScanner(false);
    }
  };

  const savePdfData = async (pdfData: any) => {
    try {
      setLoading(true);
      let response: any = {};
      response = await appRequest('pdfdetails', 'create', {
        data: { values: [] },
        folderId: pdfData?.parentId,
        pages: pdfData.pages,
        indexing: pdfData.indexing,
        files: [{ file: pdfData.file, name: pdfData.name, type: pdfData.type }],
        appr: approval,
      });

      if (response.status === 'success') {
        setModalData({
          isVisible: true,
          status: 'Success',
          text: 'Document created successfully.',
        });
        //add navigation

      } else {
        setModalData({
          isVisible: true,
          status: 'Error',
          text: 'Document creation failed.',
        });
      }
    } catch (err: any) {
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'Document creation failed.',
      });
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response: any = await appRequest('pdfdetails', 'createFolder', {
        name: newFolderName,
        page: currentPage,
      });
      if (response.status === 'success') {
        setModalData({
          isVisible: true,
          status: 'Success',
          text: 'Folder created successfully.',
        });
        onClose();
        navigation.navigate('DocumentList', {
          folder: response.data,
        })
        getFolders(1);
      } else {
        setModalData({
          isVisible: true,
          status: 'Error',
          text: 'Folder creation failed.',
        });
      }
    } catch (err: any) {
      console.error('Error creating folder:', err);
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'Folder creation failed.',
      });
    }
  };

  const scanDocument = async () => {
    try {
      const imageUri: any = await DocumentScanner.scanDocument();
      setCapturedImage(imageUri);

      const images = imageUri?.scannedImages || [];
      if (images.length) {
        const pages = imageUri?.scannedImages?.length;
        const htmlContent = await generateHtmlContent(images);

        const date = new Date().getTime();

        await savePdf(
          htmlContent,
          `Scanned_Document_${date}`,
          'Documents',
          pages,
        );
      }
    } catch (error) {
      console.error('Error scanning document:', error);
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'Failed to scan and save document.',
      });
    }
  };

  const handleSavePdf = () => {
    if (selectedFolder) {
      console.log('Saving PDF to folder:', selectedFolder);
      setSelectFolderModalVisible(false);
      handleCameraClick();
    } else {
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'Please select a folder to save the PDF.',
      });
    }
  };

  const handleCameraClick = () => {

    setShowScanner(true);
    scanDocument();
  };

  const handleApprovalToggle = (value: boolean) => {
    setApproval(value);
  };

  return (
    <View style={styles.container}>
      {menuVisible && (
        <Sidebar visible={menuVisible} onClose={handleCloseSidebar} />
      )}

      <Header
        leftComponent={
          <Button variant="ghost" p={2} onPress={handleMenuToggle}>
            <HamburgerIcon size={20} />
          </Button>
        }
        title='Document Scanner'

      />
      <FlatList
        data={folders}
        style={{ flex: 1 }}
        keyExtractor={(item) => item.folderId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.folderItem}
            onPress={() =>
              navigation.navigate('DocumentList', {
                folder: item,
              })
            }>
            <View style={styles.folderIcon}>
              <FolderSVG color="#38B2AC" width={50} height={50} />
            </View>
            <View style={styles.folderContent}>
              <Text style={styles.folderName}>{item.name}</Text>
              <Text style={styles.folderDetails}>ID: {item.folderId}</Text>
              <Text style={styles.folderDetails}>
                Created: {formatDateTime(item.createdAt, DDMMYYYY_FORMAT, true)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? <ActivityIndicator size="small" color="#38B2AC" /> : null
        }
      />

      <View style={styles.buttonContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.stickyContainer}>
            <TouchableOpacity
              onPress={() => setSelectFolderModalVisible(true)}
            >
              <CameraSVG height={25} width={25} color="white" />
            </TouchableOpacity>
            <View style={styles.divider}>
              <Text style={styles.dividerText}>|</Text>
            </View>
            <TouchableOpacity
              onPress={() => setAddFolderModalVisible(true)}
            >
              <AddFolderSVG height={25} width={25} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={addFolderModalVisible}
          onRequestClose={() => setAddFolderModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New Folder</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Folder Name"
                value={newFolderName}
                onChangeText={setNewFolderName}
              />
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.redButton]}
                  onPress={() => setAddFolderModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.greenButton]}
                  onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={selectFolderModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectFolderModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Folder to Save PDF</Text>
              <Dropdown
                style={styles.dropdown}
                data={allFolders}
                labelField="name"
                valueField="_id"
                placeholder="Select a folder"
                value={selectedFolder}
                onChange={(item: any) => setSelectedFolder(item._id)}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={styles.itemTextStyle}
              />

              <View style={styles.switchContainer}>
                <Text style={styles.modalSubTitle}>Send for Approval:</Text>

                <Switch
                  value={approval}
                  onValueChange={handleApprovalToggle}
                />
              </View>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.redButton]}
                  onPress={() => setSelectFolderModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.greenButton]} onPress={handleSavePdf}>
                  <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={saving}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSaving(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Saving document. Please wait...</Text>
              <ActivityIndicator />
            </View>
          </View>
        </Modal>

        <NotifyModal
          visible={modalData}
          onClose={closeModal}
          textColor="#38B2AC"
        />
      </View>
    </View>
  );
}

export default FolderDocumentList;

const styles = StyleSheet.create({
  container: { flex: 1 },
  buttonContainer: { padding: 0 },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    elevation: 2,
    marginVertical: 2,
  },
  folderIcon: {
    marginRight: 10,
  },
  folderContent: {
    flex: 1,
  },
  folderName: { fontSize: 16, fontWeight: 'bold' },
  folderDetails: { fontSize: 14, color: 'gray' },
  button: {
    backgroundColor: '#38B2AC',
    padding: 6,
    borderRadius: 5,
    alignItems: 'center',
    width: 90,
    height: 35,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  redButton: {
    backgroundColor: '#D51A13',
  },
  greenButton: {
    backgroundColor: 'green',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },

  dropdown: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'gray',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'black',
  },
  itemTextStyle: {
    fontSize: 14,
  },

  inputContainer: {
    flexDirection: 'row',
    marginTop: 16,
    position: 'absolute',
    elevation: 5,
    bottom: 20,
    right: 20,
  },
  stickyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    height: 50,
    backgroundColor: '#38B2AC',
    borderRadius: 30,

    paddingVertical: 20,
    paddingHorizontal: 30,
    width: 160,
  },
  divider: {
    height: '100%',
    width: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubTitle: { fontSize: 18, fontWeight: 'bold' },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  switch: {
    fontSize: 16,
    color: '#333',
  },
});
