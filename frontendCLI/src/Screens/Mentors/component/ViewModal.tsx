import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Animated,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { getShortName, maskAadhaar } from '../../../utils/function';
import FileViewerModal from '../../../components/component/FileViewerModal';
import { districtOptions, jobStationsOption, localBodyOptions, nicOptions } from '../../../utils/variables';

interface User {
  _id?: string;
  profile?: {
    profileId?: string;
    profileDetails?: {
      employerName?: string;
      aadharNumber?: string;
      agencyName?: string;
      ownOrReferral?: string;
      jobStationName?: string;
      campaignName?: string;
      sourceOfData?: string;
      nicSectorCode?: string;
      district?: string;
      localBodyName?: string;
      latestWardNumber?: string;
      employerCategory?: string;
      sectorOfBusiness?: string;
    };
  };
  agentUpdatingDetails?: {
    name?: string;
  };
  resumeDetails?: Array<{ filename?: string; _id?: string }>;
  referralLetterDetails?: Array<{ filename?: string; _id?: string }>;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  createdAt?: string;
}

interface ViewModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, user, onClose }) => {
  const [showContent, setShowContent] = useState(false);
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    professional: false,
    profile: false,
    documents: false,
  });

  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const openFileViewer = (fileId?: any) => {
    if (fileId) {
      setSelectedFileId(fileId);
      setIsFileViewerOpen(true);
    }
  };

  const closeFileViewer = () => {
    setIsFileViewerOpen(false);
    setSelectedFileId(null);
  };

  useEffect(() => {
    if (isOpen && user) {
      setExpandedSections({
        personal: true,
        professional: false,
        profile: false,
        documents: false,
      });
      setShowContent(true);
      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setShowContent(false);
    }
  }, [isOpen, user, modalFadeAnim]);

  const handleClose = () => {
    Animated.timing(modalFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowContent(false);
      onClose();
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isOpen || !user || !showContent) return null;

  const sections = [
    {
      key: 'personal',
      title: 'Personal Information',
      color: '#319795',
      data: [
        { label: 'ID:', value: user.profile?.profileId || 'N/A' },
        { label: 'Name:', value: user.name || user.profile?.profileDetails?.employerName || 'N/A' },
        { label: 'Username:', value: user.username || 'N/A' },
        { label: 'Email:', value: user.email || 'N/A' },
        { label: 'Aadhaar Number:', value: maskAadhaar(user.profile?.profileDetails?.aadharNumber || '') || 'N/A' },
        { label: 'Mobile Number:', value: user.username || 'N/A' },
      ],
    },
    {
      key: 'professional',
      title: 'Professional Information',
      color: '#3B82F6',
      data: [
        { label: 'Role:', value: user.role || 'N/A' },
        { label: 'Account Status:', value: user.is_active ? 'Active' : 'Inactive', color: user.is_active ? '#10B981' : '#EF4444' },
        { label: 'Created At:', value: user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A' },
      ],
    },
    {
      key: 'profile',
      title: 'Profile Details',
      color: '#7C3AED',
      data: [
        { label: 'Agency:', value: user.profile?.profileDetails?.agencyName || 'N/A' },
        { label: 'Own or Referral:', value: user.profile?.profileDetails?.ownOrReferral || 'N/A' },
        { label: 'Agent:', value: user.agentUpdatingDetails?.name || 'N/A' },
        { label: 'Job Station:', value: jobStationsOption.find((it : any) => it.value === user.profile?.profileDetails?.jobStationName)?.label || 'N/A' },
        { label: 'Campaign:', value: user.profile?.profileDetails?.campaignName || 'N/A' },
        { label: 'Source of Data:', value: user.profile?.profileDetails?.sourceOfData || 'N/A' },
        { label: 'NIC Sector:', value: nicOptions.find((it : any) => it.value === user.profile?.profileDetails?.nicSectorCode)?.label || 'N/A' },
        { label: 'District:', value: districtOptions.find((it : any) => it.value === user.profile?.profileDetails?.district)?.label || 'N/A' },
        { label: 'Local Body:', value: localBodyOptions.find((it : any) => it.value === user.profile?.profileDetails?.localBodyName)?.label || 'N/A' },
        { label: 'Latest Ward No:', value: user.profile?.profileDetails?.latestWardNumber || 'N/A' },
        { label: 'Employer Category:', value: user.profile?.profileDetails?.employerCategory || 'N/A' },
        { label: 'Sector of Business:', value: user.profile?.profileDetails?.sectorOfBusiness || 'N/A' },
      ],
    },
    {
      key: 'documents',
      title: 'Documents',
      color: '#F59E0B',
      data: [
        {
          label: 'Resume:',
          value: getShortName(user.resumeDetails?.[0]?.filename) || 'N/A',
          onPress: user.resumeDetails?.[0]?._id ? () => openFileViewer(user.resumeDetails?.[0]) : undefined,
        },
        {
          label: 'Referral Letter:',
          value: getShortName(user.referralLetterDetails?.[0]?.filename) || 'N/A',
          onPress: user.referralLetterDetails?.[0]?._id ? () => openFileViewer(user.referralLetterDetails?.[0]) : undefined,
        },
      ],
    },
  ];

  return (
    <Modal visible={isOpen} animationType="none" transparent onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modalContent, {
          opacity: modalFadeAnim,
          transform: [{ scale: modalFadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
        }]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mentor Details</Text>
            <Pressable onPress={handleClose}><Text style={styles.modalClose}>✕</Text></Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            {sections.map((section) => (
              <View key={section.key} style={styles.sectionContainer}>
                <Pressable
                  style={[styles.sectionHeader, { backgroundColor: section.color }]}
                  onPress={() => toggleSection(section.key as keyof typeof expandedSections)}
                >
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionIcon}>{expandedSections[section.key as keyof typeof expandedSections] ? '−' : '+'}</Text>
                </Pressable>
                {expandedSections[section.key as keyof typeof expandedSections] && (
                  <View style={styles.sectionContent}>
                    {section.data.map((item: any, index: number) => (
                      <View key={index} style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{item.label}</Text>
                        {item.onPress ? (
                          <TouchableOpacity onPress={item.onPress}>
                            <Text style={[styles.detailValue, { color: '#319795' }]}>{item.value}</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={[styles.detailValue, item.color && { color: item.color }]}>{item.value}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      <FileViewerModal
        isOpen={isFileViewerOpen}
        onClose={closeFileViewer}
        file={selectedFileId ?? ''}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#008080',
    flex: 1,
  },
  modalClose: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    alignItems: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  sectionContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  sectionContent: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
});
export default ViewModal;


