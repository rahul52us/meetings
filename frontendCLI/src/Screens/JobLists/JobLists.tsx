import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
import {appRequest} from '../../routes';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {useUser} from '../../components/authGuard/UserContext';
import {PaginationLimit} from '../../utils/constant';
import {COLUMN_WIDTHS, columns} from './utils/constant';
import ViewModal from './component/ViewModal';
import EditModal from './component/EditModal';
import CreateModal from './component/CreateModal';

class ErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {hasError: boolean}
> {
  state = {hasError: false};
  static getDerivedStateFromError() {
    return {hasError: true};
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Something went wrong. Please try again.
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => this.setState({hasError: false})}
            accessibilityLabel="Retry loading component"
            accessibilityRole="button">
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const AgentIndex: React.FC = () => {
  const {toastNotify} = useUser();
  const [modalState, setModalState] = useState<any>({type: 'none'});
  const [loading, setLoading] = useState({hyper_local: false, abroad: false});
  const [initialLoad, setInitialLoad] = useState({
    hyper_local: true,
    abroad: true,
  });
  const [search, setSearch] = useState({hyper_local: '', abroad: ''});
  const [currentPage, setCurrentPage] = useState({hyper_local: 1, abroad: 1});
  const [totalPages, setTotalPages] = useState({hyper_local: 1, abroad: 1});
  const [data, setData] = useState<{hyper_local: any[]; abroad: any[]}>({
    hyper_local: [],
    abroad: [],
  });
  const [refreshing, setRefreshing] = useState({
    hyper_local: false,
    abroad: false,
  });
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [rowHighlight, setRowHighlight] = useState<string | null>(null);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'hyper_local' | 'abroad'>(
    'hyper_local',
  );
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

  // Debounce utility for search
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

const handleGetUser = useCallback(
    async (page: number, value: string, tab: 'hyper_local' | 'abroad') => {
      try {
        setLoading(prev => ({...prev, [tab]: true}));
        const response: any = await appRequest('hyperJob', 'getHyperJobData', {
          page: currentPage,
          limit: PaginationLimit,
          type: tab,
          search: value,
        });
        if (response.status === 'success' && Array.isArray(response.data)) {
          setData(prev => ({...prev, [tab]: response.data}));
          setTotalPages(prev => ({...prev, [tab]: response.totalPages || 1}));
        } else {
          setData(prev => ({...prev, [tab]: []}));
          toastNotify({
            status: 'error',
            title: response.message || `Failed to fetch ${tab} agents`,
          });
        }
      } catch (error: any) {
        console.error(`Get ${tab} Agents Error:`, error);
        toastNotify({
          status: 'error',
          title: error.message || `Failed to fetch ${tab} agents`,
        });
      } finally {
        setLoading(prev => ({...prev, [tab]: false}));
        setRefreshing(prev => ({...prev, [tab]: false}));
      }
    },
    [toastNotify],
  );

  const debouncedSearch = useMemo(
    () => ({
      hyper_local: debounce((value: string) => {
        setCurrentPage(prev => ({...prev, hyper_local: 1}));
        handleGetUser(1, value, 'hyper_local');
      }, 1000),
      abroad: debounce((value: string) => {
        setCurrentPage(prev => ({...prev, abroad: 1}));
        handleGetUser(1, value, 'abroad');
      }, 1000),
    }),
    [debounce, handleGetUser],
  );

  useEffect(() => {
    if (initialLoad[activeTab]) {
      handleGetUser(1, search[activeTab], activeTab);
    }
  }, [activeTab, initialLoad, handleGetUser, search]);

  useEffect(() => {
    if (!initialLoad[activeTab]) {
      debouncedSearch[activeTab](search[activeTab]);
    }
  }, [search, activeTab, debouncedSearch, initialLoad]);

  const handleTabChange = useCallback(
    (tab: 'hyper_local' | 'abroad') => {
      setActiveTab(tab);
      setCurrentPage(prev => ({...prev, [tab]: 1}));
      if (initialLoad[tab]) {
        setInitialLoad(prev => ({...prev, [tab]: false}));
      }
    },
    [initialLoad],
  );

  // Change page
  const handlePageChange = useCallback(
    (page: number, tab: 'hyper_local' | 'abroad') => {
      if (page >= 1 && page <= totalPages[tab]) {
        setCurrentPage(prev => ({...prev, [tab]: page}));
        handleGetUser(page, search[tab], tab);
      }
    },
    [totalPages, handleGetUser, search],
  );

  const handleBulkUpload = useCallback(async () => {
    try {
      setBulkUploadLoading(true);
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
      });

      if (!result || !Array.isArray(result) || result.length === 0) {
        toastNotify({status: 'error', title: 'No file selected'});
        return;
      }

      const file = result[0];
      if (!file.uri || !file.name) {
        toastNotify({status: 'error', title: 'Invalid file selected'});
        return;
      }

      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        toastNotify({
          status: 'error',
          title: 'Please select an Excel file (.xlsx or .xls)',
        });
        return;
      }

      const base64 = await RNFS.readFile(file.uri, 'base64');
      const binary = atob(base64);
      const byteArray = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        byteArray[i] = binary.charCodeAt(i);
      }

      const payload = [
        {file: JSON.stringify(Array.from(byteArray)), agentType: activeTab},
      ];
      const response: any = await appRequest('job', 'createExcel', payload);

      if (response.status === 'success' && response.data) {
        setData(prev => ({...prev, [activeTab]: response.data}));
        toastNotify({status: 'success', title: 'Uploaded Successfully'});
        handleGetUser(1, search[activeTab], activeTab);
        setModalState({type: 'none'});
      } else {
        toastNotify({
          status: 'error',
          title: response.message || 'Upload Failed',
        });
      }
    } catch (error: any) {
      console.error('Bulk Upload Error:', error);
      if (DocumentPicker.isCancel(error)) {
        toastNotify({status: 'error', title: 'File selection cancelled'});
      } else {
        toastNotify({status: 'error', title: error.message || 'Upload Failed'});
      }
    } finally {
      setBulkUploadLoading(false);
    }
  }, [toastNotify, handleGetUser, search, activeTab]);

  // Open create job modal
  const handleAddData = useCallback(() => {
    setModalState({type: 'createJob', data: {agentType: activeTab}});
  }, [activeTab]);

  const handleEditData = useCallback((user: any) => {
    setSelectedUser(user);
    setModalState({type: 'editJob', data: user});
  }, []);

  const handleSearch = useCallback(
    (value: string, tab: 'hyper_local' | 'abroad') => {
      setSearch(prev => ({...prev, [tab]: value}));
    },
    [],
  );

  const handleClearSearch = useCallback(
    (tab: 'hyper_local' | 'abroad') => {
      setSearch(prev => ({...prev, [tab]: ''}));
      setCurrentPage(prev => ({...prev, [tab]: 1}));
      handleGetUser(1, '', tab);
    },
    [handleGetUser],
  );

  // Refresh data
  const handleRefresh = useCallback(
    (tab: 'hyper_local' | 'abroad') => {
      setRefreshing(prev => ({...prev, [tab]: true}));
      setSearch(prev => ({...prev, [tab]: ''}));
      setCurrentPage(prev => ({...prev, [tab]: 1}));
      handleGetUser(1, '', tab);
    },
    [handleGetUser],
  );

  // Calculate total table width
  const totalTableWidth = columns.reduce(
    (sum: number, col: {width: number}) => sum + col.width,
    0,
  );

  // Render table header
  const renderTableHeader = useCallback(
    () => (
      <View style={[styles.tableHeader, {minWidth: totalTableWidth}]}>
        {columns.map((column: {key: string; title: string; width: number}) => (
          <View
            key={column.key}
            style={[styles.tableHeaderCell, {width: column.width}]}>
            <Text
              style={styles.tableHeaderText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {column.title}
            </Text>
          </View>
        ))}
      </View>
    ),
    [totalTableWidth],
  );

  // Render table row
  const renderTableRow = useCallback(
    ({item, index}: {item: any; index: number}) => (
      <Pressable
        style={[
          styles.tableRow,
          {
            minWidth: totalTableWidth,
            backgroundColor:
              rowHighlight === item._id
                ? '#B0E0E6'
                : index % 2 === 0
                ? '#FFFFFF'
                : '#F9FAFB',
          },
        ]}
        onPress={() => {
          setSelectedUser(item);
          setModalState({type: 'viewDetails', data: item});
        }}
        onPressIn={() => setRowHighlight(item._id)}
        onPressOut={() => setRowHighlight(null)}
        accessibilityLabel={`View details for job ${item.name || 'Unknown'}`}
        accessibilityRole="button">
        <Text
          style={[styles.tableCell, {width: COLUMN_WIDTHS.jobType}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.jobDetails?.jobType || 'N/A'}
        </Text>
        <Text
          style={[styles.tableCell, {width: COLUMN_WIDTHS.jobTitle}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.jobDetails?.jobTitle || 'N/A'}
        </Text>
        <View style={[styles.tableCell, {width: COLUMN_WIDTHS.jobScope}]}>
          <View
            style={{
              backgroundColor:
                item?.jobScope === 'hyper_local'
                  ? '#D0F0C0'
                  : item?.jobScope === 'abroad'
                  ? '#BBDEFB'
                  : '#E0E0E0',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 12,
              alignSelf: 'center',
            }}>
            <Text
              style={{
                color:
                  item?.jobScope === 'hyper_local'
                    ? '#1B5E20'
                    : item?.jobScope === 'abroad'
                    ? '#0D47A1'
                    : '#757575',
                fontSize: 12,
                fontWeight: '600',
              }}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item?.jobScope === 'hyper_local'
                ? 'Hyper Local'
                : item?.jobScope === 'abroad'
                ? 'Abroad'
                : 'N/A'}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.tableCell, {width: COLUMN_WIDTHS.employerName}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.employerName?.name || 'N/A'}
        </Text>
        <Text
          style={[styles.tableCell, {width: COLUMN_WIDTHS.agentName}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item?.agentName?.name || 'N/A'}
        </Text>
        <Text
          style={[styles.tableCell, {width: COLUMN_WIDTHS.createdBy}]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.createdBy?.name || 'Unknown'}
        </Text>
        <View style={[styles.tableCell, {width: COLUMN_WIDTHS.actions}]}>
          <Pressable
            onPress={() => handleEditData(item)}
            accessibilityLabel={`Edit job ${item.name || 'Unknown'}`}
            accessibilityRole="button">
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
        </View>
      </Pressable>
    ),
    [totalTableWidth, rowHighlight, toastNotify, handleEditData],
  );

  // Render add options modal
  const renderAddOptionsModal = useCallback(() => {
    if (modalState.type !== 'addOptions') return null;

    return (
      <Modal
        visible
        animationType="fade"
        transparent
        onRequestClose={() => setModalState({type: 'none'})}>
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
            ]}>
            <View style={{height: 1, backgroundColor: '#E5E7EB'}} />
            <View style={[styles.modalBody, {alignItems: 'center', gap: 16}]}>
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
                onPress={handleAddData}
                accessibilityLabel="Add single job"
                accessibilityRole="button"
                activeOpacity={0.85}>
                <Text style={styles.buttonText}>👤 Add Single Agent</Text>
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
                accessibilityLabel="Add bulk agents"
                accessibilityRole="button"
                activeOpacity={0.85}>
                <Text style={styles.buttonText}>
                  📁 {bulkUploadLoading ? 'Uploading...' : 'Add Bulk Agents'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.modalFooter, {justifyContent: 'center'}]}>
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
                onPress={() => setModalState({type: 'none'})}
                accessibilityLabel="Cancel modal"
                accessibilityRole="button"
                activeOpacity={0.8}>
                <Text style={[styles.cancelButtonText, {fontSize: 15}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }, [
    modalState,
    handleAddData,
    handleBulkUpload,
    bulkUploadLoading,
    modalFadeAnim,
  ]);

  // Render tab content
  const renderTabContent = (tab: 'hyper_local' | 'abroad') => (
    <View style={styles.tableContainer}>
      <ScrollView horizontal bounces={false}>
        <View style={{minWidth: totalTableWidth}}>
          {renderTableHeader()}
          <FlatList
            data={data[tab]}
            renderItem={renderTableRow}
            keyExtractor={item => item._id}
            initialNumToRender={10}
            windowSize={10}
            ListEmptyComponent={
              loading[tab] ? null : (
                <View style={styles.emptyState}>
                  <Text style={styles.noDataText}>No {tab} agents found</Text>
                  <Pressable
                    style={styles.button}
                    onPress={() => handleRefresh(tab)}
                    accessibilityLabel={`Retry loading ${tab} agents`}
                    accessibilityRole="button">
                    <Text style={styles.buttonText}>Retry</Text>
                  </Pressable>
                </View>
              )
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing[tab]}
                onRefresh={() => handleRefresh(tab)}
                tintColor="#008080"
              />
            }
          />
        </View>
      </ScrollView>
    </View>
  );

  return (
    <ErrorBoundary>
      <SafeAreaView
        style={styles.container}
        edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Job Lists</Text>
          <View style={styles.tabContainer}>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === 'hyper_local' && styles.tabButtonActive,
              ]}
              onPress={() => handleTabChange('hyper_local')}
              accessibilityLabel="View hyper_local agents"
              accessibilityRole="button">
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'hyper_local' && styles.tabButtonTextActive,
                ]}>
                Local Jobs
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === 'abroad' && styles.tabButtonActive,
              ]}
              onPress={() => handleTabChange('abroad')}
              accessibilityLabel="View abroad agents"
              accessibilityRole="button">
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'abroad' && styles.tabButtonTextActive,
                ]}>
                Abroad Jobs
              </Text>
            </Pressable>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={search[activeTab]}
                onChangeText={value => handleSearch(value, activeTab)}
                placeholder={`Search jobs...`}
                placeholderTextColor="#9CA3AF"
                accessibilityLabel={`Search ${activeTab} jobs`}
                accessibilityRole="search"
              />
              {search[activeTab].length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => handleClearSearch(activeTab)}
                  accessibilityLabel={`Clear search for ${activeTab} jpbs`}
                  accessibilityRole="button">
                  <Text style={styles.clearButtonText}>X</Text>
                </TouchableOpacity>
              )}
            </View>
            <Pressable
              style={styles.iconButton}
              onPress={() => handleRefresh(activeTab)}
              accessibilityLabel={`Refresh ${activeTab} job list`}
              accessibilityRole="button">
              <Text style={styles.buttonText}>Refresh</Text>
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => setModalState({type: 'addOptions'})}
              accessibilityLabel="Open add job options"
              accessibilityRole="button">
              <Text style={styles.buttonText}>Add</Text>
            </Pressable>
          </View>
        </View>

        {loading[activeTab] && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#008080" />
            <Text style={styles.loadingText}>
              {initialLoad[activeTab]
                ? `Loading ${activeTab} Agents...`
                : `Searching ${activeTab} Agents...`}
            </Text>
          </View>
        )}

        {renderTabContent(activeTab)}

        <View style={styles.paginationContainer}>
          <Pressable
            style={[
              styles.paginationButton,
              currentPage[activeTab] === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={() =>
              handlePageChange(currentPage[activeTab] - 1, activeTab)
            }
            accessibilityLabel={`Go to previous page of ${activeTab} agents`}
            accessibilityRole="button">
            <Text style={styles.paginationButtonText}>Previous</Text>
          </Pressable>
          <Text style={styles.paginationText}>
            Page {currentPage[activeTab]} of {totalPages[activeTab]}
          </Text>
          <Pressable
            style={[
              styles.paginationButton,
              currentPage[activeTab] === totalPages[activeTab] &&
                styles.paginationButtonDisabled,
            ]}
            onPress={() =>
              handlePageChange(currentPage[activeTab] + 1, activeTab)
            }
            accessibilityLabel={`Go to next page of ${activeTab} agents`}
            accessibilityRole="button">
            <Text style={styles.paginationButtonText}>Next</Text>
          </Pressable>
        </View>

        <ViewModal
          isOpen={modalState.type === 'viewDetails'}
          user={selectedUser}
          onClose={() => setModalState({type: 'none'})}
        />
        {modalState.type === 'editJob' && selectedUser && (
          <EditModal
            isOpen={modalState.type === 'editJob'}
            data={selectedUser}
            onClose={() => setModalState({type: 'none'})}
            fetchRecords={() =>
              handleGetUser(
                currentPage[activeTab],
                search[activeTab],
                activeTab,
              )
            }
          />
        )}
        <CreateModal
          isOpen={modalState.type === 'createJob'}
          onClose={() => setModalState({type: 'none'})}
          fetchRecords={() =>
            handleGetUser(currentPage[activeTab], search[activeTab], activeTab)
          }
        />
        {renderAddOptionsModal()}
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
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {elevation: 3},
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#008080',
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  tabButtonActive: {
    backgroundColor: '#008080',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
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
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {elevation: 3},
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
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {elevation: 5},
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
    borderTopColor: '#E5E7EB',
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

export default AgentIndex;
