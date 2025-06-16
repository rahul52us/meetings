import React, { useEffect, useState, useContext, useRef, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  Modal,
  TextInput,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appRequest } from '../../routes'; // Assumed API request function

// Mock PassportValidationComponent (replace with actual import)
const PassportValidationComponent = ({ open, onClose, item, handleGetUser }: {
  open: boolean;
  onClose: () => void;
  item: Job;
  handleGetUser: (isTabSwitch?: boolean) => Promise<void>;
}) => {
  if (!open) return null;
  return (
    <Modal visible={open} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Validate Passport for {item.jobDetails?.jobTitle}</Text>
          <Pressable
            style={styles.modalButton}
            onPress={async () => {
              await handleGetUser();
              onClose();
            }}
          >
            <Text style={styles.modalButtonText}>Validate (Mock)</Text>
          </Pressable>
          <Pressable style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// Interfaces
interface ApiResponse {
  status: string;
  data?: Job[];
  totalPages?: number;
  message?: string;
}

interface FileObject {
  name: string;
  size: number;
  type: string;
  content: { [key: number]: number };
  url: string;
}

interface Job {
  _id?: string;
  jobDetails?: {
    jobType?: string;
    jobTitle?: string;
    jobCategory?: string;
    experience?: string;
    passportNumber?: string;
    location?: string;
    salary?: string;
    isVerified?: boolean; // Added for passport validation
  };
  jobScope?: string;
  employerName?: { name?: string };
  agentName?: { name?: string };
  createdBy?: { name?: string };
}

interface AppContextType {
  toastNotify: (params: { title: string; message: string; type: string }) => void;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobScope?: string;
  getHyperJobData?: () => void;
  jobDetails?: Job | null;
  job?: Job | null;
  setEditJobDetails?: (job: Job | null) => void;
  getUserData?: () => void;
}

// App Context
const AppContext = React.createContext<AppContextType>({
  toastNotify: ({ title, message }) => Alert.alert(title, message),
});

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Utility Functions
const maskAadhaar = (number: string | undefined): string =>
  number ? `****${number?.slice(-4)}` : 'NA';

const formatJobScope = (scope: string): string => {
  if (scope === 'hyper_local') return 'Hyper Local';
  if (scope === 'abroad') return 'Abroad';
  return 'NA';
};

// Custom Loader Component
const CustomLoader = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  return (
    <View style={[styles.loaderOverlay, { height: screenHeight * 0.6 }]}>
      <Animated.View style={[styles.loaderContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.loaderIcon}>⏳</Text>
      </Animated.View>
      <Text style={styles.loaderText}>Loading Jobs...</Text>
    </View>
  );
};

// Modal Components
const AddJobDrawer: React.FC<ModalProps> = ({ isOpen, onClose, jobScope, getHyperJobData }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [jobTitle, setJobTitle] = useState('');
  const [salary, setSalary] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleSave = async () => {
    if (!jobTitle || !salary) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const response: any = await appRequest('hyperJob', 'createHyperJob', {
        jobDetails: { jobTitle, salary },
        jobScope,
      });
      if (response.status === 'success') {
        getHyperJobData?.();
        setJobTitle('');
        setSalary('');
        onClose();
      } else {
        Alert.alert('Error', response.message ?? 'Failed to add job');
      }
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add job');
    }
  };

  return (
    <Modal visible={isOpen} animationType="none" transparent>
      <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Job ({formatJobScope(jobScope ?? '')})</Text>
            <Pressable onPress={onClose} accessibilityLabel="Close modal">
              <Text style={styles.modalCloseIcon}>✖️</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.modalInput}
            placeholder="Job Title"
            value={jobTitle}
            onChangeText={setJobTitle}
            accessibilityLabel="Job Title"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Salary (₹)"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            accessibilityLabel="Salary"
          />
          <Pressable style={styles.modalButton} onPress={handleSave} accessibilityLabel="Save job">
            <Text style={styles.modalButtonText}>Save</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
};

const JobDetails: React.FC<ModalProps> = ({ isOpen, onClose, jobDetails }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  if (!jobDetails) return null;

  return (
    <Modal visible={isOpen} animationType="none" transparent>
      <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Job Details</Text>
            <Pressable onPress={onClose} accessibilityLabel="Close modal">
              <Text style={styles.modalCloseIcon}>✖️</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalText}>Title: {jobDetails.jobDetails?.jobTitle ?? 'NA'}</Text>
            <Text style={styles.modalText}>Type: {jobDetails.jobDetails?.jobType ?? 'NA'}</Text>
            <Text style={styles.modalText}>Scope: {formatJobScope(jobDetails.jobScope ?? 'NA')}</Text>
            <Text style={styles.modalText}>Employer: {jobDetails.employerName?.name ?? 'NA'}</Text>
            <Text style={styles.modalText}>Agent: {jobDetails.agentName?.name ?? 'NA'}</Text>
            <Text style={styles.modalText}>Category: {jobDetails.jobDetails?.jobCategory ?? 'NA'}</Text>
            <Text style={styles.modalText}>Experience: {jobDetails.jobDetails?.experience ?? 'NA'}</Text>
            {jobDetails.jobScope === 'abroad' && (
              <Text style={styles.modalText}>Passport: {maskAadhaar(jobDetails.jobDetails?.passportNumber)}</Text>
            )}
            <Text style={styles.modalText}>Location: {jobDetails.jobDetails?.location ?? 'NA'}</Text>
            <Text style={styles.modalText}>Salary: ₹ {jobDetails.jobDetails?.salary ?? 'NA'}</Text>
            <Text style={styles.modalText}>Created By: {jobDetails.createdBy?.name ?? 'NA'}</Text>
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
};

const JobEditDrawer: React.FC<ModalProps> = ({ isOpen, onClose, job, setEditJobDetails, getUserData }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [jobTitle, setJobTitle] = useState(job?.jobDetails?.jobTitle ?? '');
  const [salary, setSalary] = useState(job?.jobDetails?.salary ?? '');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  useEffect(() => {
    setJobTitle(job?.jobDetails?.jobTitle ?? '');
    setSalary(job?.jobDetails?.salary ?? '');
  }, [job]);

  const handleSave = async () => {
    if (!jobTitle || !salary) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const response: any = await appRequest('hyperJob', 'updateHyperJob', {
        id: job?._id,
        jobDetails: { jobTitle, salary },
      });
      if (response.status === 'success') {
        getUserData?.();
        setEditJobDetails?.({ ...job, jobDetails: { ...job?.jobDetails, jobTitle, salary } });
        onClose();
      } else {
        Alert.alert('Error', response.message ?? 'Failed to update job');
      }
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update job');
    }
  };

  if (!job) return null;

  return (
    <Modal visible={isOpen} animationType="none" transparent>
      <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Job</Text>
            <Pressable onPress={onClose} accessibilityLabel="Close modal">
              <Text style={styles.modalCloseIcon}>✖️</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.modalInput}
            placeholder="Job Title"
            value={jobTitle}
            onChangeText={setJobTitle}
            accessibilityLabel="Job Title"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Salary (₹)"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            accessibilityLabel="Salary"
          />
          <Pressable style={styles.modalButton} onPress={handleSave} accessibilityLabel="Save job">
            <Text style={styles.modalButtonText}>Save</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
};

// Memoized Table Row
const TableRow = memo(
  ({
    item,
    index,
    totalTableWidth,
    setSelectedJob,
    setIsDetailsOpen,
    setIsEditOpen,
    toastNotify,
    handleDelete,
    setValidationModalOpen,
    setValidationItem,
    rowHighlight,
    setRowHighlight,
  }: {
    item: any;
    index: number;
    totalTableWidth: number;
    setSelectedJob: React.Dispatch<React.SetStateAction<Job | null>>;
    setIsDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
    toastNotify: (params: { title: string; message: string; type: string }) => void;
    handleDelete: (job: Job) => void;
    setValidationModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setValidationItem: React.Dispatch<React.SetStateAction<Job | null>>;
    rowHighlight: string | null;
    setRowHighlight: React.Dispatch<React.SetStateAction<string | null>>;
  }) => {
    return (
      <Pressable
        style={[
          styles.tableRow,
          {
            minWidth: totalTableWidth,
            backgroundColor: rowHighlight === item._id ? '#B0E0E6' : index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
          },
        ]}
        onPress={() => {
          setSelectedJob(item);
          setIsDetailsOpen(true);
        }}
        onPressIn={() => setRowHighlight(item._id)}
        onPressOut={() => setRowHighlight(null)}
        accessibilityLabel={`View details for ${item.jobDetails?.jobTitle ?? 'job'}`}
        accessibilityRole="button"
      >
        <Text style={[styles.tableCell, { width: COLUMN_WIDTHS.jobTitle }]} numberOfLines={1} ellipsizeMode="tail">
          {item.jobDetails?.jobTitle ?? 'NA'}
        </Text>
        <Text style={[styles.tableCell, { width: COLUMN_WIDTHS.jobScope }]} numberOfLines={1} ellipsizeMode="tail">
          {formatJobScope(item.jobScope ?? '')}
        </Text>
        <Text style={[styles.tableCell, { width: COLUMN_WIDTHS.salary }]} numberOfLines={1} ellipsizeMode="tail">
          ₹ {item.jobDetails?.salary ?? 'NA'}
        </Text>
        {item.jobScope === 'abroad' && (
          <Pressable
            style={[styles.tableCell, { width: COLUMN_WIDTHS.passportNumber }]}
            onPress={() => {
              if (!item.jobDetails?.isVerified) {
                // setValidationItem(item);
                // setValidationModalOpen(true);
              } else {
                // toastNotify({ title: 'Already Verified', message: 'Passport is already validated.' });
              }
            }}
            accessibilityLabel={`Validate passport for ${item.jobDetails?.jobTitle ?? 'job'}`}
            accessibilityRole="button"
          >
            <Text style={styles.tableCellText} numberOfLines={1} ellipsizeMode="tail">
              {maskAadhaar(item.jobDetails?.passportNumber)}
            </Text>
          </Pressable>
        )}
        {item.jobScope !== 'abroad' && (
          <Text style={[styles.tableCell, { width: COLUMN_WIDTHS.passportNumber }]} numberOfLines={1} ellipsizeMode="tail">
            NA
          </Text>
        )}
        <View style={[styles.tableCell, { width: COLUMN_WIDTHS.actions, flexDirection: 'row', gap: 6 }]}>
          <TouchableOpacity
            onPress={() => {
              setSelectedJob(item);
              setIsEditOpen(true);
            }}
            accessibilityLabel={`Edit ${item.jobDetails?.jobTitle ?? 'job'}`}
            accessibilityRole="button"
          >
            <Text style={[styles.iconText, { color: '#4FD1C5' }]}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            accessibilityLabel={`Delete ${item.jobDetails?.jobTitle ?? 'job'}`}
            accessibilityRole="button"
          >
            <Text style={[styles.iconText, { color: '#EF4444' }]}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  },
  (prevProps, nextProps) => prevProps.item === nextProps.item && prevProps.index === nextProps.index
);

const COLUMN_WIDTHS = {
  jobTitle: 200,
  jobScope: 120,
  salary: 100,
  passportNumber: 120,
  actions: 100,
};

const JobList: React.FC = () => {
  const [jobData, setJobData] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<FileObject[] | null>(null);
  const [activeTab, setActiveTab] = useState<'hyper_local' | 'abroad'>('hyper_local');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [sortField, setSortField] = useState<'jobTitle' | 'salary' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationItem, setValidationItem] = useState<Job | null>(null);
  const [rowHighlight, setRowHighlight] = useState<string | null>(null);

  const { toastNotify } = useContext(AppContext);
  const prevActiveTab = useRef(activeTab);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pageChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tabAnim = useRef(new Animated.Value(activeTab === 'hyper_local' ? 0 : 1)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

  const getUserData = useCallback(
    async (isTabSwitch = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        if (isTabSwitch) {
          setIsTabLoading(true);
        } else {
          setIsLoading(true);
        }
        const response: any = await appRequest('hyperJob', 'getHyperJobData', {
          page: currentPage,
          limit: 10,
          type: activeTab,
          search: search.trim(),
        });
        if (response.status === 'success') {
          setJobData(response.data ?? []);
          setTotalPages(response.totalPages ?? 1);
        } else {
          toastNotify({
            title: 'Error',
            message: response.message ?? 'Failed to fetch jobs',
            type: 'error',
          });
          setJobData([]);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        toastNotify({
          title: 'Error',
          message: err instanceof Error ? err.message : 'Failed to fetch jobs',
          type: 'error',
        });
        setJobData([]);
      } finally {
        if (isTabSwitch) {
          setIsTabLoading(false);
        } else {
          setIsLoading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [currentPage, activeTab, search, toastNotify]
  );

  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout | null = null;
    if (!search) {
      getUserData(prevActiveTab.current !== activeTab);
    } else {
      debounceTimeout = setTimeout(() => {
        getUserData();
      }, 500);
    }
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [currentPage, activeTab, search, getUserData]);

  useEffect(() => {
    getUserData(true);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    Animated.timing(tabAnim, {
      toValue: activeTab === 'hyper_local' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    prevActiveTab.current = activeTab;
  }, [activeTab]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages || page === currentPage) return;
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current);
      }
      pageChangeTimeoutRef.current = setTimeout(() => {
        setCurrentPage(page);
      }, 300);
    },
    [totalPages, currentPage]
  );

  const handleFileUpload = useCallback(async () => {
    const file = { name: 'sample.xlsx', size: 1024, type: 'application/vnd.ms-excel' };
    try {
      const contentObject: { [key: number]: number } = {};
      for (let i = 0; i < file.size; i++) {
        contentObject[i] = Math.random() * 255;
      }
      const updatedFile: FileObject[] = [
        {
          name: file.name,
          size: file.size,
          type: file.type,
          content: contentObject,
          url: 'file://sample.xlsx',
        },
      ];
      setUploadedFile(updatedFile);
    } catch (err: unknown) {
      toastNotify({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to select file',
        type: 'error',
      });
    }
  }, [toastNotify]);

  const handlePostExcel = useCallback(async () => {
    if (!uploadedFile || uploadedFile.length === 0) return;
    try {
      const data = uploadedFile.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        content: file.content,
      }));
      const response: any = await appRequest('hyperJob', 'bulkCreateHyperJobData', { file: data });
      if (response.status === 'success') {
        getUserData();
        setUploadedFile(null);
        toastNotify({ title: 'Uploaded Successfully', message: '', type: 'success' });
      } else {
        toastNotify({
          title: 'Upload Failed',
          message: response.message ?? 'Failed to upload',
          type: 'error',
        });
      }
    } catch (err: unknown) {
      toastNotify({
        title: 'Upload Failed',
        message: err instanceof Error ? err.message : 'Failed to upload',
        type: 'error',
      });
    }
  }, [uploadedFile, getUserData, toastNotify]);

  useEffect(() => {
    handlePostExcel();
  }, [uploadedFile, handlePostExcel]);

  const toggleFab = useCallback(() => {
    Animated.timing(fabAnim, {
      toValue: isFabOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setIsFabOpen((prev) => !prev);
  }, [isFabOpen]);

  const clearSearch = () => {
    setSearch('');
    setCurrentPage(1);
  };

  const handleSort = useCallback((field: 'jobTitle' | 'salary') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }, [sortField, sortOrder]);

  const sortedData = useMemo(() => {
    return [...jobData].sort((a, b) => {
      if (!sortField) return 0;
      const aValue = sortField === 'jobTitle' ? a.jobDetails?.jobTitle : a.jobDetails?.salary;
      const bValue = sortField === 'jobTitle' ? b.jobDetails?.jobTitle : b.jobDetails?.salary;
      if (!aValue || !bValue) return 0;
      if (sortField === 'salary') {
        return sortOrder === 'asc'
          ? parseFloat(aValue) - parseFloat(bValue)
          : parseFloat(bValue) - parseFloat(aValue);
      }
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [jobData, sortField, sortOrder]);

  const handleDelete = useCallback(
    async (job: Job) => {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete ${job.jobDetails?.jobTitle ?? 'this job'}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const response: any = await appRequest('hyperJob', 'deleteHyperJob', { id: job._id });
                if (response.status === 'success') {
                  toastNotify({
                    title: 'Success',
                    message: 'Job deleted successfully',
                    type: 'success',
                  });
                  getUserData();
                } else {
                  toastNotify({
                    title: 'Error',
                    message: response.message ?? 'Failed to delete job',
                    type: 'error',
                  });
                }
              } catch (err: unknown) {
                toastNotify({
                  title: 'Error',
                  message: err instanceof Error ? err.message : 'Failed to delete job',
                  type: 'error',
                });
              }
            },
          },
        ]
      );
    },
    [toastNotify, getUserData]
  );

  const columns = [
    { key: 'jobTitle', title: 'Job Title', width: COLUMN_WIDTHS.jobTitle },
    { key: 'jobScope', title: 'Job Scope', width: COLUMN_WIDTHS.jobScope },
    { key: 'salary', title: 'Salary', width: COLUMN_WIDTHS.salary },
    { key: 'passportNumber', title: 'Passport No.', width: COLUMN_WIDTHS.passportNumber },
    { key: 'actions', title: 'Actions', width: COLUMN_WIDTHS.actions },
  ];

  const totalTableWidth = columns.reduce((sum, col) => sum + col.width, 0);

  const renderTableHeader = useCallback(() => (
    <View style={[styles.tableHeader, { minWidth: totalTableWidth }]}>
      {columns.map((column) => (
        <Pressable
          key={column.key}
          style={[styles.tableHeaderCell, { width: column.width }]}
          onPress={() =>
            column.key === 'jobTitle'
              ? handleSort('jobTitle')
              : column.key === 'salary'
              ? handleSort('salary')
              : null
          }
          accessibilityLabel={`Sort by ${column.title}`}
          accessibilityRole="button"
        >
          <Text style={styles.tableHeaderText} numberOfLines={1} ellipsizeMode="tail">
            {column.title}
            {sortField === column.key && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
          </Text>
        </Pressable>
      ))}
    </View>
  ), [totalTableWidth, sortField, sortOrder, handleSort]);

  const renderTable = useCallback(() => (
    <View style={[styles.tableContainer, { height: screenHeight * 0.6 }]}>
      <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={true}>
        <View style={{ minWidth: totalTableWidth }}>
          {renderTableHeader()}
          <FlatList
            data={sortedData}
            renderItem={({ item, index }) => (
              <TableRow
                item={item}
                index={index}
                totalTableWidth={totalTableWidth}
                setSelectedJob={setSelectedJob}
                setIsDetailsOpen={setIsDetailsOpen}
                setIsEditOpen={setIsEditOpen}
                toastNotify={toastNotify}
                handleDelete={handleDelete}
                setValidationModalOpen={setValidationModalOpen}
                setValidationItem={setValidationItem}
                rowHighlight={rowHighlight}
                setRowHighlight={setRowHighlight}
              />
            )}
            keyExtractor={(item, index) => item._id || `${item.jobDetails?.jobTitle}-${index}`}
            initialNumToRender={10}
            windowSize={10}
            ListEmptyComponent={
              isTabLoading ? (
                <CustomLoader />
              ) : !isLoading && sortedData.length === 0 ? (
                <View style={[styles.emptyState, { height: screenHeight * 0.6 }]}>
                  <Text style={styles.noDataText}>No jobs found</Text>
                  <Pressable
                    style={styles.emptyStateButton}
                    onPress={() => setIsAddOpen(true)}
                    accessibilityLabel="Add a job"
                    accessibilityRole="button"
                  >
                    <Text style={styles.emptyStateButtonText}>Add a Job</Text>
                  </Pressable>
                </View>
              ) : null
            }
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        </View>
      </ScrollView>
    </View>
  ), [
    sortedData,
    isTabLoading,
    isLoading,
    totalTableWidth,
    renderTableHeader,
    setSelectedJob,
    setIsDetailsOpen,
    setIsEditOpen,
    toastNotify,
    handleDelete,
    setValidationModalOpen,
    setValidationItem,
    rowHighlight,
    setRowHighlight,
  ]);

  const renderPagination = useCallback(() => (
    <View style={styles.paginationContainer}>
      <Pressable
        style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
        onPress={() => handlePageChange(currentPage - 1)}
        accessibilityLabel="Go to previous page"
        accessibilityRole="button"
        disabled={currentPage === 1}
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
        disabled={currentPage === totalPages}
      >
        <Text style={styles.paginationButtonText}>Next</Text>
      </Pressable>
    </View>
  ), [totalPages, currentPage, handlePageChange]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Job Listings</Text>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              value={search}
              onChangeText={setSearch}
              accessibilityLabel="Search jobs"
              accessibilityRole="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Text style={styles.clearIcon}>✖️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabList}>
            {['Hyper Local', 'Abroad'].map((tab, index) => (
              <Pressable
                key={tab}
                style={[
                  styles.tab,
                  activeTab === (index === 0 ? 'hyper_local' : 'abroad') && styles.activeTab,
                ]}
                onPress={() => {
                  setActiveTab(index === 0 ? 'hyper_local' : 'abroad');
                  setCurrentPage(1);
                  setUploadedFile(null);
                }}
                accessibilityLabel={`Switch to ${tab} jobs`}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === (index === 0 ? 'hyper_local' : 'abroad') && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  transform: [
                    {
                      translateX: tabAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, screenWidth / 2 - 16],
                      }),
                    },
                  ],
                } as ViewStyle,
              ]}
            />
          </View>
          {isLoading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#4FD1C5" />
              <Text style={styles.loaderText}>{isTabLoading ? 'Loading Jobs...' : 'Searching Jobs...'}</Text>
            </View>
          )}
          {renderTable()}
        </View>

        {renderPagination()}

        <Animated.View
  style={[
    styles.fabContainer,
    {
      transform: [
        { translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -240] }) },
      ],
    },
  ]}
>
          {isFabOpen && (
            <>
              <TouchableOpacity
                style={styles.fabSubButton}
                onPress={() => setIsAddOpen(true)}
                accessibilityLabel="Add new job"
                accessibilityRole="button"
              >
                <View style={styles.fabSubButtonContent}>
                  <Text style={styles.fabIcon}>➕</Text>
                  <Text style={styles.fabSubButtonLabel}>Add Job</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.fabSubButton}
                onPress={handleFileUpload}
                accessibilityLabel="Upload Excel file"
                accessibilityRole="button"
              >
                <View style={styles.fabSubButtonContent}>
                  <Text style={styles.fabIcon}>⬆️</Text>
                  <Text style={styles.fabSubButtonLabel}>Upload</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.fabSubButton}
                onPress={() => getUserData()}
                accessibilityLabel="Refresh job list"
                accessibilityRole="button"
              >
                <View style={styles.fabSubButtonContent}>
                  <Text style={styles.fabIcon}>🔄</Text>
                  <Text style={styles.fabSubButtonLabel}>Refresh</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.fabButton}
            onPress={toggleFab}
            accessibilityLabel={isFabOpen ? 'Close actions' : 'Open actions'}
            accessibilityRole="button"
          >
            <Text style={styles.fabIcon}>{isFabOpen ? '✖️' : '➕'}</Text>
          </TouchableOpacity>
        </Animated.View>

        <AddJobDrawer
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          jobScope={activeTab}
          getHyperJobData={getUserData}
        />
        <JobDetails
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedJob(null);
          }}
          jobDetails={selectedJob}
        />
        <JobEditDrawer
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          setEditJobDetails={setSelectedJob}
          getUserData={getUserData}
        />
        {validationModalOpen && validationItem && (
          <PassportValidationComponent
            open={validationModalOpen}
            onClose={() => setValidationModalOpen(false)}
            item={validationItem}
            handleGetUser={getUserData}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 8,
  },
  searchIcon: {
    fontSize: 20,
    color: '#718096',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
  },
  clearButton: {
    padding: 8,
  },
  clearIcon: {
    fontSize: 20,
    color: '#718096',
  },
  tabContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  tabList: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
    marginHorizontal: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
      android: { elevation: 2 },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: '#4FD1C5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 4,
    width: '50%',
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  tableContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  tableHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A202C',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    height: 60,
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  tableCellText: {
    fontSize: 13,
    color: '#2D3748',
    textAlign: 'center',
  },
  iconText: {
    fontSize: 15,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 16,
  },
  paginationButton: {
    backgroundColor: '#EDF2F7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 100,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '600',
  },
  paginationText: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '400',
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
  loaderContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  loaderIcon: {
    fontSize: 40,
    color: '#4FD1C5',
  },
  loaderText: {
    fontSize: 16,
    color: '#2D3748',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyStateButton: {
    backgroundColor: '#4FD1C5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  fabButton: {
    backgroundColor: '#4FD1C5',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  fabSubButton: {
    backgroundColor: '#4FD1C5',
    width: 60,
    height: 30,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  fabSubButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabSubButtonLabel: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fabIcon: {
    fontSize: 8,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
      android: { elevation: 5 },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  modalCloseIcon: {
    fontSize: 24,
    color: '#718096',
  },
  modalBody: {
    marginBottom: 16,
    maxHeight: screenHeight * 0.5,
  },
  modalText: {
    fontSize: 14,
    color: '#2D3748',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: '#EDF2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#2D3748',
    marginBottom: 12,
  },
  modalButton: {
    backgroundColor: '#4FD1C5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default JobList;