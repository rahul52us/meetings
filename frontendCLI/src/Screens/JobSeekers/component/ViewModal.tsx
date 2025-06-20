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
import {
  districtOptions,
  jobStationsOption,
  localBodyOptions,
  nicOptions,
} from '../../../utils/variables';

const ViewModal = ({ isOpen, user, onClose }: any) => {
  const [showContent, setShowContent] = useState(false);
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedSections, setExpandedSections] = useState<any>({
    personal: true,
    professional: false,
    profile: false,
    documents: false,
    education: false,
    work: false,
    certifications: false,
    skills: false,
  });

  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);

  const openFileViewer = (fileId: any) => {
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
        education: false,
        work: false,
        certifications: false,
        skills: false,
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
  }, [isOpen, user]);

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

  const toggleSection = (section: any) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!isOpen || !user || !showContent) return null;

  const profile = user.profileDetails || {};
  const account = user.accountDetails || {};

  const normalizeArray = (input: any): any[] => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    return Object.values(input);
  };

  const sections = [
    {
      key: 'personal',
      title: 'Personal Info',
      color: '#4B5563',
      data: [
        { label: 'Profile ID', value: user.profileId },
        { label: 'Name', value: profile.name || 'N/A' },
        { label: 'Mobile', value: profile.moNumber || 'N/A' },
        { label: 'Email', value: profile.email || 'N/A' },
        { label: 'DOB', value: profile.dob || 'N/A' },
        { label: 'Sex', value: profile.sex || 'N/A' },
        { label: 'Marital Status', value: profile.maritalStatus || 'N/A' },
        { label: 'Address', value: profile.address || 'N/A' },
        { label: 'Nationality', value: profile.nationality || 'N/A' },
        { label: 'Aadhaar Number', value: maskAadhaar(profile.aadharNumber) },
      ],
    },
    {
      key: 'professional',
      title: 'Professional Info',
      color: '#2563EB',
      data: [
        { label: 'Job Type', value: profile.jobType },
        { label: 'Job Preference', value: profile.jobPreference },
        { label: 'Preferred Location', value: profile.preferredLocation },
        { label: 'Minimum Honorarium', value: profile.minimumHonorarium },
        { label: 'Interested Sector', value: profile.interestedSector },
        { label: 'Placement Status', value: profile.placed },
        { label: 'Campus Interview', value: profile.whetherCampusInterview },
        { label: 'Job Title', value: profile.jobTitle },
        { label: 'Location of Placement', value: profile.locationPlacement },
        { label: 'Created At', value: new Date(user.createdAt).toLocaleString() },
        {
          label: 'Account Status',
          value: account.is_active ? 'Active' : 'Inactive',
          color: account.is_active ? '#10B981' : '#EF4444',
        },
      ],
    },
    {
      key: 'profile',
      title: 'Profile Details',
      color: '#7C3AED',
      data: [
        { label: 'Agency', value: profile.agencyName },
        { label: 'Referral Type', value: profile.whetherOwnOrReferral },
        { label: 'Agent', value: user.agentUpdatingData?.name },
        {
          label: 'Job Station',
          value: jobStationsOption.find((it) => it.value === profile.jobStationName)?.label,
        },
        { label: 'Campaign', value: profile.campaignName },
        { label: 'Source of Data', value: profile.dataSource },
        {
          label: 'NIC Sector',
          value: nicOptions.find((it) => it.value === profile.nicSectorCode)?.label,
        },
        {
          label: 'District',
          value: districtOptions.find((it) => it.value === profile.district)?.label,
        },
        {
          label: 'Local Body',
          value: localBodyOptions.find((it) => it.value === profile.localBodyName)?.label,
        },
        { label: 'Ward Number', value: profile.latestWardNumber },
        { label: 'Employer', value: profile.employerName },
        { label: 'Employer Category', value: profile.employerCategory },
        { label: 'Sector of Business', value: profile.sectorOfBusiness },
      ],
    },
    {
      key: 'education',
      title: 'Education',
      color: '#10B981',
      data: normalizeArray(profile.education).length
        ? normalizeArray(profile.education).map((edu: any, idx: number) => ({
            label: `#${idx + 1}: ${edu.degree || 'Degree'} (${edu.stream || ''})`,
            value: `${edu.institutionName || ''}, ${edu.location || ''} (${edu.startDate || 'N/A'} - ${edu.endDate || 'N/A'})`,
          }))
        : [{ label: 'Education', value: 'N/A' }],
    },
    {
      key: 'work',
      title: 'Work History',
      color: '#EC4899',
      data: normalizeArray(profile.workHistory).length
        ? normalizeArray(profile.workHistory).map((work: any, idx: number) => ({
            label: `#${idx + 1}: ${work.title || 'Role'} @ ${work.company || 'Company'}`,
            value: `${work.location || 'Location'} (${work.startDate || 'N/A'} - ${work.current ? 'Present' : work.endDate || 'N/A'})`,
          }))
        : [{ label: 'Work History', value: 'N/A' }],
    },
    {
      key: 'certifications',
      title: 'Certifications',
      color: '#8B5CF6',
      data: normalizeArray(profile.certifications).length
        ? normalizeArray(profile.certifications).map((cert: any, idx: number) => ({
            label: `#${idx + 1}: ${cert.name || 'Certificate'}`,
            value: `Issued: ${cert.issueDate || 'N/A'}`,
          }))
        : [{ label: 'Certifications', value: 'N/A' }],
    },
    {
      key: 'skills',
      title: 'Skills',
      color: '#F43F5E',
      data: normalizeArray(profile.skills).length
        ? normalizeArray(profile.skills).map((skill: any, idx: number) => ({
            label: `#${idx + 1}`,
            value: typeof skill === 'string' ? skill : JSON.stringify(skill),
          }))
        : [{ label: 'Skills', value: 'N/A' }],
    },
    {
      key: 'documents',
      title: 'Documents',
      color: '#F59E0B',
      data: [
        {
          label: 'Resume',
          value: getShortName(user.resumeDetails?.[0]?.filename),
          onPress: user.resumeDetails?.[0]?._id ? () => openFileViewer(user.resumeDetails?.[0]) : undefined,
        },
        {
          label: 'Referral Letter',
          value: getShortName(user.referralLetterDetails?.[0]?.filename),
          onPress: user.referralLetterDetails?.[0]?._id ? () => openFileViewer(user.referralLetterDetails?.[0]) : undefined,
        },
      ],
    },
  ];

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose}>
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Job Seeker Details</Text>
            <Pressable onPress={handleClose}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            {sections.map((section) => (
              <View key={section.key} style={styles.sectionContainer}>
                <Pressable
                  style={[styles.sectionHeader, { backgroundColor: section.color }]}
                  onPress={() => toggleSection(section.key)}
                >
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionIcon}>{expandedSections[section.key] ? '−' : '+'}</Text>
                </Pressable>
                {expandedSections[section.key] && (
                  <View style={styles.sectionContent}>
                    {section.data.map((item: any, index: number) => (
                      <View
                        key={index}
                        style={[
                          styles.detailRow,
                          ['education', 'work', 'certifications'].includes(section.key) &&
                            styles.detailRowVertical,
                        ]}
                      >
                        <Text style={styles.detailLabel}>{item.label}</Text>
                        {item.onPress ? (
                          <TouchableOpacity onPress={item.onPress}>
                            <Text style={[styles.detailValue, { color: '#319795' }]}>...
                            {renderSafeValue(item.value)}</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text
                            style={[styles.detailValue, item.color && { color: item.color }]}
                          >
                            {renderSafeValue(item.value)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </Pressable>
          </View>
        </Animated.View>

        <FileViewerModal
          isOpen={isFileViewerOpen}
          onClose={closeFileViewer}
          file={selectedFileId ?? ''}
        />
      </View>
    </Modal>
  );
};

const renderSafeValue = (value: any) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'object') {
    if ('text' in value && 'hyperlink' in value) {
      return `${value.text} (${value.hyperlink})`;
    }
    return JSON.stringify(value);
  }
  return String(value);
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
    marginBottom: 12,
  },
  detailRowVertical: {
    flexDirection: 'column',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
  },
});

export default ViewModal;
