import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation';
import CameraSVG from '../assets/camera';
import ImageSVG from '../assets/image';
import {
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import DocumentScanner from 'react-native-document-scanner-plugin';
import {appRequest} from '../routes';
import Header from './common/Header/Header';
import BellIcon from '../assets/icons/BellIcon';
import {Button} from 'native-base';
import NotifyModal from './common/NotifyModal/NotifyModal';
import {Buffer} from 'buffer';
import FormDrawerModal from './component/FormDrawerModal';
import DocumentCard from './component/DocumentCard';
import { addNewContact, requestContactsPermission } from './common/utils/RequestContactPermissions';

type FolderDocumentsRouteProp = RouteProp<RootStackParamList, 'DocumentList'>;

function DocumentList() {
  const route = useRoute<FolderDocumentsRouteProp>();
  const {folder} = route.params;
  const [showScanner, setShowScanner] = useState(false);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any>([]);
  const [saving, setSaving] = useState(false);
  const [modalData, setModalData] = useState({
    isVisible: false,
    status: '',
    text: '',
  });
  const navigation = useNavigation<any>();
  const [isModalVisible, setIsModalVisible] = useState({
    open: false,
    data: null,
  });
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [documentProcessData, setDocumentProcessData] = useState<any>({});
  const closeModal = () => {
    setModalData({isVisible: false, status: '', text: ''});
  };

  const [formModal, setFormModal] = useState({open: false, data: null, type : 'add', id : null});

  // Functions to open and close the drawer
  const openFormModal = (dt: any) => setFormModal({open: true, data: dt, type : 'add', id : null});
  const closeFormModal = () => setFormModal({open: false, data: null, type : 'add', id : null});

  const getPdfs = async () => {
    try {
      setLoading(true);
      let values: any = {
        page: currentPage,
        limit: 8,
        parentId: folder?._id,
        search: '',
      };

      const response: any = await appRequest('pdfdetails', 'get', {...values});
      if (response.status === 'success') {
        setDocuments(response.data.data);
      } else {
        setModalData({
          isVisible: true,
          status: 'Error',
          text: 'No Data Found.',
        });
      }
    } catch (err: any) {
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'No Data Found.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPdfs();
  }, [currentPage]);

  const savePdfData = async (savedData : any) => {
    try {
      setSaving(true);
      let response: any = {};
      response = await appRequest('pdfdetails', 'create', {
        data: {values: []},
        folderId: documentProcessData?.parentId,
        pages: documentProcessData.pages,
        indexing: documentProcessData.indexing || [],
        files: [
          {
            file: documentProcessData.file,
            name: documentProcessData.name,
            type: documentProcessData.type,
          },
        ],
        extractedData : savedData
      });


      if (response.status === 'success') {
        const requestResponse = await requestContactsPermission()
      if(requestResponse){
        const {status, data} = await addNewContact(
          savedData?.name,
          savedData?.phone,
          savedData?.alternate_phone,
          savedData?.email,
          savedData?.company,
          savedData?.designation,
          savedData?.address,
          savedData?.city,
          savedData?.state,
          savedData?.pincode,
          savedData?.country,
          savedData?.dob,
          savedData?.website
        );
        if(status === "error"){
          Alert.alert("Error", String(data) || "Failed to save contact in phone.");
        }
      }
        setModalData({
          isVisible: true,
          status: 'Success',
          text: 'Document created successfully.',
        });
        closeFormModal();
        getPdfs();
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
      setSaving(false);
    }
  };

  const processDocumentWithAPI = async (
    base64Data: string,
    fileName: string,
    pages: number,
  ) => {
    try {
      const apiResponse: any = await appRequest('extract', 'extract', {
        file: base64Data,
      });

      const processedData = {
        name: fileName,
        file: base64Data,
        type: 'application/pdf',
        parentId: folder._id,
        pages: pages,
        indexing: [],
      };

      // console.log(apiResponse?.data?.message?.results[0]?.fields)
      setDocumentProcessData(processedData);
      let fields : any = {}
      if(Array.isArray(apiResponse?.data?.message?.results[0]?.fields)){
        fields = apiResponse?.data?.message?.results[0]?.fields[0]
      }
      openFormModal(fields || {});

    } catch (error) {
      console.error('Error processing document with API:', error);
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'Failed to process document with API.',
      });
    }
    finally {
      setSaving(false)
    }
  };

  const handleCameraClick = () => {
    setShowScanner(true);
    scanDocument();
  };

  const openImagePicker = async () => {
    setShowScanner(true);
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      selectionLimit: 0,
    };

    launchImageLibrary(options, async response => {
      if (response?.didCancel) {
        console.log('User cancelled image picker');
      } else if (response?.errorCode) {
        console.log('Image picker error: ', response.errorMessage);
      } else if (response.assets) {
        try {
          const imageUris: any = response.assets.map(asset => asset.uri);
          setCapturedImage(imageUris);
          const pages = response.assets.length;

          const htmlContent = await generateHtmlContent(imageUris);
          const date = new Date().getTime();
          await savePdf(
            htmlContent,
            `Scanned_Document_${date}`,
            'Documents',
            pages,
          );
        } catch (error) {
          console.error('Error processing images:', error);
          setModalData({
            isVisible: true,
            status: 'Error',
            text: 'Failed to process and save images.',
          });
        }
      }
    });
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
  padding: 2;
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
</div>
`;
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
      await processDocumentWithAPI(base64Prefix, fileName, pages);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'Failed to process and save images.',
      });
      setSaving(false);
    } finally {
      setCapturedImage(null);
      setShowScanner(false);
    }
  };

  const scanDocument = async () => {
    try {
      const imageUri: any = await DocumentScanner.scanDocument({
        croppedImageQuality: 100,
      });
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
          pages
        );
      }
    } catch (error) {
      console.error('Error scanning document:', error);
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'Failed to scan document and save images.',
      });
    }
  };

  const handleDelete = async (pdfId: any) => {
    try {
      setLoading(true);
      const response: any = await appRequest('pdfdetails', 'deleteFile', {
        id: pdfId,
      });
      if (response.status === 'success') {
        setModalData({
          isVisible: true,
          status: 'Success',
          text: 'Document deleted successfully.',
        });
        getPdfs();
      } else {
        setModalData({
          isVisible: true,
          status: 'Error',
          text: 'Failed to delete document.',
        });
      }
    } catch (error: any) {
      setModalData({
        isVisible: true,
        status: 'Error',
        text: 'Failed to delete document.',
      });
      console.error('Error deleting Document:', error);
    }
  };

  const openDeleteModal = (item: any) => {
    setIsModalVisible({open: true, data: item});
  };

  const closeDeleteModal = () => {
    setIsModalVisible({open: false, data: null});
  };

  const confirmDelete = (item: any) => {
    handleDelete(item._id);
    closeDeleteModal();
  };

  const createUrlFromBuffer = async (dt: any) => {
    const data = new Uint8Array(dt);
    const buffer = Buffer.from(data);
    const filePath = `${RNFS.DocumentDirectoryPath}/example.pdf`;

    try {
      await RNFS.writeFile(filePath, buffer.toString('base64'), 'base64');
      console.log('File saved to:', filePath);
      return `file:/${filePath}`;
    } catch (err) {
      console.error('Error saving file:', err);
    }
  };

  const uint8ArrayToBase64 = (uintArray: any) => {
    let binary = '';
    const len = uintArray.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uintArray[i]);
    }
    const base64String = btoa(binary);
    return `data:image/png;base64,${base64String}`;
  };

  const getFile = async (pdf: any, type: any) => {
    try {
      setPdfLoading(true);
      if (pdf) {
        const response: any = await appRequest('filesystem', 'get', {
          id: pdf?._id
        });

        if (response) {
          let source: any = '';
          if (type.startsWith('application')) {
            source = await createUrlFromBuffer(response);
          } else {
            const uintArray = new Uint8Array(response);
            source = uint8ArrayToBase64(uintArray);
          }
          return source;
        }
        if (response.error) {
          return 'error';
        }
      }
    } catch (error: any) {
      console.error('Error fetching PDF:', error.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleItemPress = async (data: any, item : any) => {
    try {
      const source = await getFile(data, data?.metadata?.contentType);
      const dt = {
        file: source,
        name: data?.filename,
        type: data?.metadata?.contentType,
      };
      if (source !== 'error') {
        navigation.navigate('PDFViewer', { setModalData , modalData , documentDetails : item, pdfData: dt, folder: folder});
      } else {
        console.log('Error fetching file.');
      }
    } catch (error : any) {
      console.log('Error fetching file:', error?.message);
    }
  };

  const handleSaveEditData = async (savedData : any) => {
    try {
      setSaving(true);
      let response: any = {};
      response = await appRequest('pdfdetails', 'updateExtracedData', {
        data: savedData,
        id : formModal?.id
      });
      if (response.status === 'success') {
       setModalData({
          isVisible: true,
          status: 'Success',
          text: 'Document created successfully.',
        });
        closeFormModal();
        getPdfs();
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
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Header
        showBackButton
        onBackPress={() => navigation.navigate('FolderDocumentList')}
        title={folder.name}
        rightComponent={
          <Button variant="ghost">
            <BellIcon size={20} />
          </Button>
        }
      />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#38B2AC" />
        </View>
      ) : documents?.length === 0 ? (
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/img/folder.png')}
            style={styles.noDataImage}
            resizeMode="contain"
          />
          <Text style={styles.noDataHeading}>No Documents</Text>
          <Text style={styles.noDataText}>
            Start scanning by camera or Import from gallery.
          </Text>
        </View>
      ) : (
        <View style={styles.pdfContainer}>
        <FlatList
          data={documents}
          keyExtractor={(item) => item.pdf_Id.toString()}
          renderItem={({ item }) => (
            <DocumentCard
              item={item}
              getPdfs={getPdfs}
              onPress={(dt : any) => handleItemPress(dt, item)}
              onDelete={openDeleteModal}
              onEdit={(dt : any) => {setFormModal({open : true, data : dt?.extractedData || {}, type : 'edit', id : dt?._id})}}
            />
          )}
        />
      </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.stickyContainer}>
          <TouchableOpacity onPress={handleCameraClick}>
            <CameraSVG height={25} width={25} color="white" />
          </TouchableOpacity>
          <View style={styles.divider}>
            <Text style={styles.dividerText}>|</Text>
          </View>
          <TouchableOpacity onPress={openImagePicker}>
            <ImageSVG height={25} width={25} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={saving}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSaving(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ActivityIndicator size="large" color="#38B2AC" />
            <Text style={styles.modalText}>
              Saving Document, please wait...
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={pdfLoading}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPdfLoading(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ActivityIndicator size="large" color="#38B2AC" />
            <Text style={styles.modalText}>
              Loading document. Please wait for some time.
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible.open}
        onRequestClose={closeDeleteModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Are you sure you want to delete this item?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.redButton]}
                onPress={closeDeleteModal}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.greenButton]}
                onPress={() => confirmDelete(isModalVisible.data)}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <NotifyModal
        visible={modalData}
        onClose={closeModal}
        textColor="#38B2AC"
      />
      <FormDrawerModal
        visible={formModal.open}
        data={formModal.data}
        isLoading={saving}
        onClose={closeFormModal}
        onSave={(savedData : any) => {formModal?.type === "edit" ? handleSaveEditData(savedData) : savePdfData(savedData)}}
      />
    </View>
  );
}

export default DocumentList;

const styles = StyleSheet.create({
  container: {flex: 1, position: 'relative'},
  header: {fontSize: 18, fontWeight: 'bold', padding: 16},
  documentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  loader: {
    marginTop: '80%',
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
    padding: 6,
    paddingEnd: 8,
    paddingStart: 8,
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  documentDetailsContainer: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    flex: 1,
  },
  documentName: {fontSize: 18, fontWeight: 'bold'},
  documentDetails: {fontSize: 14, color: '#555'},
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
  noDataImage: {
    width: 300,
    height: 300,
    marginTop: 80,
  },
  deleteButton: {
    backgroundColor: '#e53e3e',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  noDataHeading: {
    textAlign: 'center',
    fontSize: 20,
    color: '#888',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 4,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#38B2AC',
    padding: 6,
    borderRadius: 5,
    alignItems: 'center',
    width: 80,
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
  pdfContainer: {
    marginBottom:60
    // flex: 1,
    // justifyContent: 'flex-start',
    // alignItems: 'center',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
  },
  drawerContent: {
    width: 200,
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerText: {
    fontSize: 20,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#38B2AC',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
