import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
  RefreshControl,
  Animated,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appRequest } from '../../routes';
import { maskAadhaar } from '../../utils/function';
import AadharValidationComponent from '../../components/component/AadharValidations';

interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  is_active: boolean;
  user?: { id: string }; // For Aadhaar validation
  profile?: {
    profileId?: string;
    profileDetails?: {
      aadharNumber?: string;
      agentType?: string;
    };
  };
}

interface DuplicateAgent {
  name: string;
  moNumber: string;
}

interface ApiResponse {
  status: string;
  message?: string;
  data?: User[];
  totalPages?: number;
}

interface AppContextType {
  toastNotify: (params: { title: string; message: string; type?: string }) => void;
}

const AppContext = React.createContext<AppContextType>({
  toastNotify: ({ title, message }) => Alert.alert(title, message),
});

const PaginationLimit = 10;

const COLUMN_WIDTHS = {
  profileId: 100,
  name: 160,
  email: 180,
  username: 120,
  aadharNumber: 120,
  agentType: 120,
  isActive: 100,
  actions: 80,
};

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

const CreateAgentExcel: React.FC = () => {
  const { toastNotify } = useContext(AppContext);
  const [modalState, setModalState] = useState<{
    type: 'none' | 'duplicateAgents' | 'agentDetails' | 'addOptions';
    data?: User | DuplicateAgent[];
  }>({ type: 'none' });
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationItem, setValidationItem] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [data, setData] = useState<User[]>([]);
  const [duplicateData, setDuplicateData] = useState<DuplicateAgent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [rowHighlight, setRowHighlight] = useState<string | null>(null);
  const modalFadeAnim = useState(new Animated.Value(0))[0];

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  const handleGetUser = useCallback(
    async (page = currentPage, value = search) => {
      try {
        setLoading(true);
        const response: any = await appRequest('agent', 'getAgents', {
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
            title: 'Error',
            message: response.message || 'Failed to fetch agents',
            type: 'error',
          });
        }
      } catch (error: any) {
        console.error('Get Agents Error:', error);
        toastNotify({
          title: 'Error',
          message: error.message || 'Failed to fetch agents',
          type: 'error',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, search, toastNotify]
  );

  const debouncedSearch = useMemo(
    () => debounce((value: string) => handleGetUser(1, value), 1000),
    [debounce, handleGetUser]
  );

  useEffect(() => {
    if (initialLoad) {
      handleGetUser();
      setInitialLoad(false);
    } else {
      debouncedSearch(search);
    }
  }, [search, handleGetUser, initialLoad, debouncedSearch]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        handleGetUser(page);
      }
    },
    [totalPages, handleGetUser]
  );

  const handleFileUpload = useCallback(() => {
    toastNotify({
      title: 'Feature Unavailable',
      message: 'Bulk agent upload is not implemented yet.',
    });
    setModalState({ type: 'none' });
  }, [toastNotify]);

  const handleAddAgent = useCallback(() => {
    toastNotify({
      title: 'Coming Soon',
      message: 'Create agent form not implemented',
    });
    setModalState({ type: 'none' });
  }, [toastNotify]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
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

  const columns = [
    { key: 'profileId', title: 'Agent ID', width: COLUMN_WIDTHS.profileId },
    { key: 'name', title: 'Name', width: COLUMN_WIDTHS.name },
    { key: 'email', title: 'Email', width: COLUMN_WIDTHS.email },
    { key: 'username', title: 'Mobile No.', width: COLUMN_WIDTHS.username },
    { key: 'aadharNumber', title: 'Aadhar No.', width: COLUMN_WIDTHS.aadharNumber },
    { key: 'agentType', title: 'Agent Type', width: COLUMN_WIDTHS.agentType },
    { key: 'isActive', title: 'Verified', width: COLUMN_WIDTHS.isActive },
    { key: 'actions', title: 'Actions', width: COLUMN_WIDTHS.actions },
  ];

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
          setSelectedAgent(item);
          setModalState({ type: 'agentDetails', data: item });
        }}
        onPressIn={() => setRowHighlight(item._id)}
        onPressOut={() => setRowHighlight(null)}
        accessibilityLabel={`View details for agent ${item.name || 'Unknown'}`}
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
              setValidationItem(item);
              setValidationModalOpen(true);
            } else {
              toastNotify({ title: 'Already Verified', message: 'Aadhaar is already validated.' });
            }
          }}
          accessibilityLabel={`Validate Aadhaar for agent ${item.name || 'Unknown'}`}
          accessibilityRole="button"
        >
          <Text style={styles.tableCellText} numberOfLines={1} ellipsizeMode="tail">
            {maskAadhaar(item.profile?.profileDetails?.aadharNumber)}
          </Text>
        </Pressable>
        <Text style={[styles.tableCell, { width: COLUMN_WIDTHS.agentType }]} numberOfLines={1} ellipsizeMode="tail">
          {item.profile?.profileDetails?.agentType || 'N/A'}
        </Text>
        <Text style={[styles.tableCell, { width: COLUMN_WIDTHS.isActive }]} numberOfLines={1} ellipsizeMode="tail">
          {item.is_active ? 'Yes' : 'No'}
        </Text>
        <View style={[styles.tableCell, { width: COLUMN_WIDTHS.actions }]}>
          <Pressable
            onPress={() => toastNotify({ title: 'Coming Soon', message: 'Edit agent not implemented' })}
            accessibilityLabel={`Edit agent ${item.name || 'Unknown'}`}
            accessibilityRole="button"
          >
            <Text style={styles.actionText}>Edit</Text>
          </Pressable>
        </View>
      </Pressable>
    ),
    [totalTableWidth, rowHighlight, toastNotify]
  );

  const renderAgentDetailsModal = useCallback(() => {
    if (!selectedAgent || modalState.type !== 'agentDetails') return null;
    Animated.timing(modalFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    return (
      <Modal
        visible={modalState.type === 'agentDetails'}
        animationType="none"
        transparent={true}
        onRequestClose={() => {
          Animated.timing(modalFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
            setModalState({ type: 'none' })
          );
        }}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalFadeAnim,
                transform: [{ scale: modalFadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agent Details</Text>
              <Pressable
                onPress={() => {
                  Animated.timing(modalFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
                    setModalState({ type: 'none' })
                  );
                }}
                accessibilityLabel={`Close details for agent ${selectedAgent.name || 'Unknown'}`}
                accessibilityRole="button"
              >
                <Text style={styles.modalClose}>X</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Agent ID:</Text>
                <Text style={styles.detailValue}>{selectedAgent.profile?.profileId || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedAgent.name || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedAgent.email || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mobile No.:</Text>
                <Text style={styles.detailValue}>{selectedAgent.username || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Aadhaar No.:</Text>
                <Text style={styles.detailValue}>{maskAadhaar(selectedAgent.profile?.profileDetails?.aadharNumber)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Agent Type:</Text>
                <Text style={styles.detailValue}>{selectedAgent.profile?.profileDetails?.agentType || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Verified:</Text>
                <Text style={styles.detailValue}>{selectedAgent.is_active ? 'Yes' : 'No'}</Text>
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  Animated.timing(modalFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
                    setModalState({ type: 'none' })
                  );
                }}
                accessibilityLabel={`Close details for agent ${selectedAgent.name || 'Unknown'}`}
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }, [modalState, selectedAgent, modalFadeAnim]);

  const renderDuplicateAgentsModal = useCallback(() => {
    if (modalState.type !== 'duplicateAgents') return null;
    Animated.timing(modalFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    return (
      <Modal
        visible={modalState.type === 'duplicateAgents'}
        animationType="none"
        transparent={true}
        onRequestClose={() => {
          Animated.timing(modalFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
            setModalState({ type: 'none' })
          );
        }}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalFadeAnim,
                transform: [{ scale: modalFadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Duplicate Agents</Text>
              <Pressable
                onPress={() => {
                  Animated.timing(modalFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
                    setModalState({ type: 'none' })
                  );
                }}
                accessibilityLabel="Close duplicate agents modal"
                accessibilityRole="button"
              >
                <Text style={styles.modalClose}>X</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              {duplicateData.length > 0 ? (
                <View style={styles.tableContainer}>
                  <View style={[styles.tableHeader, { minWidth: 300 }]}>
                    <Text style={[styles.tableHeaderText, { width: 150 }]}>Name</Text>
                    <Text style={[styles.tableHeaderText, { width: 150 }]}>Mobile Number</Text>
                  </View>
                  <FlatList
                    data={duplicateData}
                    renderItem={({ item, index }) => (
                      <View
                        style={[
                          styles.tableRow,
                          { minWidth: 300, backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB' },
                        ]}
                      >
                        <Text style={[styles.tableCell, { width: 150 }]} numberOfLines={1} ellipsizeMode="tail">
                          {item.name}
                        </Text>
                        <Text style={[styles.tableCell, { width: 150 }]} numberOfLines={1} ellipsizeMode="tail">
                          {item.moNumber}
                        </Text>
                      </View>
                    )}
                    keyExtractor={(_, index) => `duplicate-${index}`}
                  />
                </View>
              ) : (
                <Text style={styles.noDataText}>No duplicates found</Text>
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  Animated.timing(modalFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
                    setModalState({ type: 'none' })
                  );
                }}
                accessibilityLabel="Close duplicate agents modal"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }, [modalState, duplicateData, modalFadeAnim]);

  const renderAddOptionsModal = useCallback(() => {
    if (modalState.type !== 'addOptions') return null;
    Animated.timing(modalFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    return (
      <Modal
        visible={modalState.type === 'addOptions'}
        animationType="none"
        transparent={true}
        onRequestClose={() => {
          Animated.timing(modalFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
            setModalState({ type: 'none' })
          );
        }}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalFadeAnim,
                transform: [{ scale: modalFadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Agent Options</Text>
              <Pressable
                onPress={() => {
                  Animated.timing(modalFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
                    setModalState({ type: 'none' })
                  );
                }}
                accessibilityLabel="Close add agent options modal"
                accessibilityRole="button"
              >
                <Text style={styles.modalClose}>X</Text>
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Pressable
                style={[styles.button, styles.modalButton]}
                onPress={handleAddAgent}
                accessibilityLabel="Add single agent"
                accessibilityRole="button"
              >
                <Text style={styles.buttonText}>Add Single Agent</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.modalButton, styles.buttonDisabled]}
                disabled={true}
                accessibilityLabel="Add bulk agents (disabled)"
                accessibilityRole="button"
              >
                <Text style={styles.buttonText}>Add Bulk Agents</Text>
              </Pressable>
            </View>
            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  Animated.timing(modalFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
                    setModalState({ type: 'none' })
                  );
                }}
                accessibilityLabel="Close add agent options modal"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }, [modalState, handleAddAgent, modalFadeAnim]);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Agents</Text>
          <View style={styles.headerActions}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={handleSearch}
                placeholder="Search agents..."
                placeholderTextColor="#9CA3AF"
                accessibilityLabel="Search agents"
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
              accessibilityLabel="Refresh agent list"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Refresh</Text>
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => setModalState({ type: 'addOptions' })}
              accessibilityLabel="Open add agent options"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Add</Text>
            </Pressable>
          </View>
        </View>

        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#008080" />
            <Text style={styles.loadingText}>{initialLoad ? 'Loading Agents...' : 'Searching Agents...'}</Text>
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
                      <Text style={styles.noDataText}>No agents found</Text>
                      <Pressable
                        style={styles.button}
                        onPress={handleRefresh}
                        accessibilityLabel="Retry loading agents"
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

        {renderAgentDetailsModal()}
        {renderDuplicateAgentsModal()}
        {renderAddOptionsModal()}
        {validationModalOpen && validationItem && (
          <AadharValidationComponent
            open={validationModalOpen}
            onClose={() => setValidationModalOpen(false)}
            item={validationItem}
            handleGetUser={handleGetUser}
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
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButton: {
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#008080',
  },
  modalClose: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
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

export default CreateAgentExcel;