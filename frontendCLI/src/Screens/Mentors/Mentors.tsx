import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appRequest } from '../../routes';
import { maskAadhaar } from '../../utils/function';
import AadharValidationComponent from '../../components/component/AadharValidations';
import { COLUMN_WIDTHS, columns } from './utils/constant';
import ViewModal from './component/ViewModal';
import EditModal from './component/EditModal';
import CreateModal from './component/CreateModal';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { useUser } from '../../components/authGuard/UserContext';
import { PaginationLimit } from '../../utils/constant';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false })}
            accessibilityLabel="Retry loading component"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const MentorIndex: React.FC = () => {
  const { toastNotify } = useUser();
  const [modalState, setModalState] = useState<{
    type: 'none' | 'duplicateAgents' | 'viewDetails' | 'addOptions' | 'editUser' | 'createUser';
    data?: any;
  }>({ type: 'none' });
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationItem, setValidationItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rowHighlight, setRowHighlight] = useState<string | null>(null);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const modalFadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (modalState.type === 'addOptions') {
      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalState.type, modalFadeAnim]);

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  const handleGetUser = useCallback(
    async (page: number, value: string) => {
      console.log(`Fetching page ${page} with search "${value}"`);
      try {
        setLoading(true);
        const response: any = await appRequest('mentor', 'get', {
          type: 'mentor',
          value,
          limit: PaginationLimit,
          sort: 1,
          page,
        });
        if (response.status === 'success' && Array.isArray(response.data)) {
          setData(response.data);
          setTotalPages(response.totalPages || 1);
        } else {
          setData([]);
          toastNotify({
            status: 'error',
            title: response.message || 'Failed to fetch mentors',
          });
        }
      } catch (error: any) {
        console.error('Get Mentors Error:', error);
        toastNotify({
          status: 'error',
          title: error.message || 'Failed to fetch mentors',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toastNotify]
  );

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setCurrentPage(1);
        handleGetUser(1, value);
      }, 1000),
    [debounce, handleGetUser]
  );

  useEffect(() => {
    if (initialLoad) {
      handleGetUser(1, '');
      setInitialLoad(false);
    } else {
      debouncedSearch(search);
    }
  }, [search, initialLoad, debouncedSearch, handleGetUser]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        handleGetUser(page, search);
      }
    },
    [totalPages, handleGetUser, search]
  );

  const handleBulkUpload = useCallback(async () => {
    try {
      setBulkUploadLoading(true);

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
      });

      if (!result || !Array.isArray(result) || result.length === 0) {
        toastNotify({
          status: 'error',
          title: 'No file selected',
        });
        return;
      }

      const file = result[0];

      if (!file.uri || !file.name) {
        toastNotify({
          status: 'error',
          title: 'Invalid file selected',
        });
        return;
      }

      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        toastNotify({
          status: 'error',
          title: 'Please select an Excel file (.xlsx or .xls)',
        });
        return;
      }

      // Read file as base64
      const base64 = await RNFS.readFile(file.uri, 'base64');

      // Convert base64 to binary string
      const binary = atob(base64);

      // Convert binary string to byte array
      const byteArray = [];
      for (let i = 0; i < binary.length; i++) {
        byteArray.push(binary.charCodeAt(i));
      }

      // Format data as stringified array
      const payload = [{ file: JSON.stringify(byteArray) }];

      // Send to backend
      const response: any = await appRequest('mentor', 'createExcel', payload);

      if (response.status !== 'error') {
        setData(response.data || []);
        toastNotify({
          status: 'success',
          title: 'Uploaded Successfully',
        });
        handleGetUser(1, search);
        setModalState({ type: 'none' });
      } else {
        toastNotify({
          status: 'error',
          title: 'Upload Failed',
        });
      }
    } catch (error: any) {
      console.error('Bulk Upload Error:', error);
      if (DocumentPicker.isCancel(error)) {
        toastNotify({
          status: 'error',
          title: 'File selection cancelled',
        });
      } else {
        toastNotify({
          status: 'error',
          title: 'Upload Failed',
        });
      }
    } finally {
      setBulkUploadLoading(false);
    }
  }, [toastNotify, handleGetUser, search]);

  const handleAddAgent = useCallback(() => {
    setModalState({ type: 'createUser' });
  }, []);

  const handleEditEmployer = useCallback((user: any) => {
    setSelectedUser(user);
    setModalState({ type: 'editUser', data: user });
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch('');
    setCurrentPage(1);
    handleGetUser(1, '');
  }, [handleGetUser]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setSearch('');
    setCurrentPage(1);
    handleGetUser(1, '');
  }, [handleGetUser]);

  const totalTableWidth = columns.reduce((sum, col) => sum + col.width, 0);

  const renderTableHeader = useCallback(() => (
    <View style={[styles.tableHeader, { minWidth: totalTableWidth }]}>
      {columns.map((column) => (
        <View key={column.key} style={[styles.tableHeaderCell, { width: column.width }]}>
          <Text style={styles.tableHeaderText} numberOfLines={1} ellipsizeMode="tail">
            {column.title}
          </Text>
        </View>
      ))}
    </View>
  ), [totalTableWidth]);

  const renderTableRow = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <Pressable
        style={[
          styles.tableRow,
          {
            minWidth: totalTableWidth,
            backgroundColor: rowHighlight === item._id ? '#B0E0E6' : index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
          },
        ]}
        onPress={() => {
          setSelectedUser(item);
          setModalState({ type: 'viewDetails', data: item });
        }}
        onPressIn={() => setRowHighlight(item._id)}
        onPressOut={() => setRowHighlight(null)}
        accessibilityLabel={`View details for user ${item.name || 'Unknown'}`}
        accessibilityRole="button"
      >
        <Text style={[styles.tableCell, { width: COLUMN_WIDTHS.profileId }]} numberOfLines={1} ellipsizeMode="tail">
          {item.profile?.profileId || 'N/A'}
        </Text>
        <Text style={[styles.tableCell, { width: COLUMN_WIDTHS.name }]} numberOfLines={1} ellipsizeMode="tail">
          {item.name || 'N/A'}
        </Text>
        <Text style={[styles.tableCell, { width: COLUMN_WIDTHS.email }]} numberOfLines={1} ellipsizeMode="tail">
          {item.email || 'N/A'}
        </Text>
        <Text style={[styles.tableCell, { width: COLUMN_WIDTHS.username }]} numberOfLines={1} ellipsizeMode="tail">
          {item.username || 'N/A'}
        </Text>
        <Pressable
          style={[styles.tableCell, { width: COLUMN_WIDTHS.aadharNumber }]}
          onPress={() => {
            if (!item.is_active) {
              setValidationItem({ ...item, user: item?._id });
              setValidationModalOpen(true);
            } else {
              toastNotify({
                status: 'success',
                title: 'Aadhaar is already validated.',
              });
            }
          }}
          accessibilityLabel={`Validate Aadhaar for user ${item.name || 'Unknown'}`}
          accessibilityRole="button"
        >
          <Text style={styles.tableCellText} numberOfLines={1} ellipsizeMode="tail">
            {maskAadhaar(item.profile?.profileDetails?.aadharNumber)}
          </Text>
        </Pressable>
        <Text style={[styles.tableCell, { width: COLUMN_WIDTHS.isActive }]} numberOfLines={1} ellipsizeMode="tail">
          {item.is_active ? 'Yes' : 'No'}
        </Text>
        <View style={[styles.tableCell, { width: COLUMN_WIDTHS.actions }]}>
          <Pressable
            onPress={() => handleEditEmployer(item)}
            accessibilityLabel={`Edit user ${item.name || 'Unknown'}`}
            accessibilityRole="button"
          >
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
        </View>
      </Pressable>
    ),
    [totalTableWidth, rowHighlight, toastNotify, handleEditEmployer]
  );

  const renderAddOptionsModal = useCallback(() => {
    if (modalState.type !== 'addOptions') return null;

    return (
      <Modal
        visible
        animationType="fade"
        transparent
        onRequestClose={() => setModalState({ type: 'none' })}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalFadeAnim,
                transform: [
                  {
                    scale: modalFadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#E5E7EB' }} />

            {/* Body */}
            <View style={[styles.modalBody, { alignItems: 'center', gap: 16 }]}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.button,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                  },
                ]}
                onPress={handleAddAgent}
                accessibilityLabel="Add single agent"
                accessibilityRole="button"
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>👤 Add Single Mentor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.button,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                  },
                  bulkUploadLoading && styles.buttonDisabled,
                ]}
                onPress={handleBulkUpload}
                disabled={bulkUploadLoading}
                accessibilityLabel="Add bulk mentors"
                accessibilityRole="button"
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  📁 {bulkUploadLoading ? 'Uploading...' : 'Add Bulk Mentors'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={[styles.modalFooter, { justifyContent: 'center' }]}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    minWidth: 140,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderColor: '#008080',
                  },
                ]}
                onPress={() => setModalState({ type: 'none' })}
                accessibilityLabel="Cancel modal"
                accessibilityRole="button"
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelButtonText, { fontSize: 15 }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }, [modalState, handleAddAgent, handleBulkUpload, bulkUploadLoading, modalFadeAnim]);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mentors</Text>
          <View style={styles.headerActions}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={handleSearch}
                placeholder="Search mentors..."
                placeholderTextColor="#9CA3AF"
                accessibilityLabel="Search Mentors"
                accessibilityRole="search"
              />
              {search.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearSearch}
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                >
                  <Text style={styles.clearButtonText}>X</Text>
                </TouchableOpacity>
              )}
            </View>
            <Pressable
              style={styles.iconButton}
              onPress={handleRefresh}
              accessibilityLabel="Refresh user list"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Refresh</Text>
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => setModalState({ type: 'addOptions' })}
              accessibilityLabel="Open add user options"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Add</Text>
            </Pressable>
          </View>
        </View>

        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#008080" />
            <Text style={styles.loadingText}>
              {initialLoad ? 'Loading Mentors...' : 'Searching Mentors...'}
            </Text>
          </View>
        )}

        <View style={styles.tableContainer}>
          <ScrollView horizontal bounces={false}>
            <View style={{ minWidth: totalTableWidth }}>
              {renderTableHeader()}
              <FlatList
                data={data}
                renderItem={renderTableRow}
                keyExtractor={(item) => item._id}
                initialNumToRender={10}
                windowSize={10}
                ListEmptyComponent={
                  loading ? null : (
                    <View style={styles.emptyState}>
                      <Text style={styles.noDataText}>No Mentors found</Text>
                      <Pressable
                        style={styles.button}
                        onPress={handleRefresh}
                        accessibilityLabel="Retry loading Mentors"
                        accessibilityRole="button"
                      >
                        <Text style={styles.buttonText}>Retry</Text>
                      </Pressable>
                    </View>
                  )
                }
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#008080" />
                }
              />
            </View>
          </ScrollView>
        </View>

        <View style={styles.paginationContainer}>
          <Pressable
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={() => handlePageChange(currentPage - 1)}
            accessibilityLabel="Go to previous page"
            accessibilityRole="button"
          >
            <Text style={styles.paginationButtonText}>Previous</Text>
          </Pressable>
          <Text style={styles.paginationText}>
            Page {currentPage} of {totalPages}
          </Text>
          <Pressable
            style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
            onPress={() => handlePageChange(currentPage + 1)}
            accessibilityLabel="Go to next page"
            accessibilityRole="button"
          >
            <Text style={styles.paginationButtonText}>Next</Text>
          </Pressable>
        </View>

        <ViewModal
          isOpen={modalState.type === 'viewDetails'}
          user={selectedUser}
          onClose={() => setModalState({ type: 'none' })}
        />
        {modalState.type === 'editUser' && (
          <EditModal
            isOpen={modalState.type === 'editUser'}
            data={selectedUser}
            onClose={() => setModalState({ type: 'none' })}
            fetchRecords={() => handleGetUser(currentPage, "")}
            />
        )}
        <CreateModal
          isOpen={modalState.type === 'createUser'}
          onClose={() => setModalState({ type: 'none' })}
          fetchRecords={() => handleGetUser(currentPage, "")}
        />
        {renderAddOptionsModal()}
        {validationModalOpen && validationItem && (
          <AadharValidationComponent
            open={validationModalOpen}
            onClose={() => setValidationModalOpen(false)}
            item={validationItem}
            handleGetUser={() => handleGetUser(currentPage, "")}
            />
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#008080',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  searchContainer: {
    flex: 1,
    minWidth: 150,
    maxWidth: 300,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
  },
  clearButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  iconButton: {
    backgroundColor: '#008080',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  button: {
    backgroundColor: '#008080',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButton: {
    minWidth: 150,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008080',
  },
  actionText: {
    fontSize: 14,
    color: '#008080',
    fontWeight: '500',
  },
  tableContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
  },
  tableHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    height: 48,
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
  },
  tableCellText: {
    fontSize: 13,
    color: '#111827',
    textAlign: 'center',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 8,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  noDataText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    gap: 16,
  },
  paginationButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    minWidth: 100,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  paginationText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '400',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.7,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 5 },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#008080',
    flex: 1,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  modalBody: {
    padding: 16,
    gap: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    flex: 2,
    textAlign: 'right',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#008080',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
});

export default MentorIndex;