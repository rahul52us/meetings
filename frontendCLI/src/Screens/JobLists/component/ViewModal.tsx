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
} from 'react-native';
import { maskAadhaar } from '../../../utils/function';
import { districtOptions, localBodyOptions } from '../../../utils/variables';

interface ViewModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, user, onClose }) => {
  const [showContent, setShowContent] = useState(false);
  const modalFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen && user) {
      setShowContent(true);
      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
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

  if (!isOpen || !user || !showContent) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="none"
      transparent
      onRequestClose={handleClose}
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
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Job Details</Text>
            <Pressable onPress={handleClose}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView contentContainerStyle={styles.modalBody}>
            {[
              {
                title: '🧾 Job Info',
                data: [
                  { label: 'Job Title', value: user.jobDetails?.jobTitle },
                  { label: 'Category', value: user.jobDetails?.jobCategory },
                  { label: 'Type', value: user.jobDetails?.jobType },
                  { label: 'Location', value: user.jobDetails?.location },
                  { label: 'Experience', value: user.jobDetails?.experience },
                  { label: 'Salary', value: user.jobDetails?.salary },
                  {
                    label: 'Skills',
                    value: user.jobDetails?.skills?.join(', '),
                  },
                  { label: 'Benefits', value: user.jobDetails?.benefits },
                  {
                    label: 'Conditions',
                    value: user.jobDetails?.workConditions,
                  },
                ],
              },
              {
                title: '🏢 Employer Info',
                data: [
                  { label: 'Firm Name', value: user.jobDetails?.firmName },
                  { label: 'Address', value: user.jobDetails?.firmAddress },
                  { label: 'District', value: districtOptions.find((it : any) => it?.value === user.jobDetails?.district)?.label || "NA"},
                  { label: 'Local Body', value: localBodyOptions.find((it : any) => it?.value === user.jobDetails?.localBody)?.label || "NA"},
                  {
                    label: 'Ward No.',
                    value: user.jobDetails?.localBodyWardNumber,
                  },
                  {
                    label: 'Proprietor',
                    value: user.jobDetails?.proprietorName,
                  },
                  { label: 'Email', value: user.jobDetails?.emailId },
                  { label: 'Mobile', value: user.jobDetails?.mobileNumber },
                  {
                    label: 'Aadhaar',
                    value: maskAadhaar(user.jobDetails?.aadharNumber),
                  },
                ],
              },
              {
                title: '📌 Metadata',
                data: [
                  { label: 'Employer', value: user.employerName?.name },
                  { label: 'Agent', value: user.agentName?.name },
                  {
                    label: 'Scope',
                    value: (
                      <Text
                        style={[
                          styles.badge,
                          user.jobScope === 'hyper_local'
                            ? styles.badgeGreen
                            : user.jobScope === 'abroad'
                            ? styles.badgeBlue
                            : styles.badgeGray,
                        ]}
                      >
                        {user.jobScope === 'hyper_local'
                          ? 'Hyper Local'
                          : user.jobScope === 'abroad'
                          ? 'Abroad'
                          : 'N/A'}
                      </Text>
                    ),
                  },
                  { label: 'Created By', value: user.createdBy?.name },
                  {
                    label: 'Created At',
                    value: new Date(user.createdAt).toLocaleString(),
                  },
                ],
              },
            ].map((section) => (
              <View key={section.title} style={styles.sectionCard}>
                <Text style={styles.cardTitle}>{section.title}</Text>
                {section.data.map(({ label, value }) => (
                  <View key={label} style={styles.cardRow}>
                    <Text style={styles.cardLabel}>{label}</Text>
                    {typeof value === 'string' || typeof value === 'number' ? (
                      <Text style={styles.cardValue}>{value || 'N/A'}</Text>
                    ) : (
                      value || <Text style={styles.cardValue}>N/A</Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
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
    maxWidth: 420,
    maxHeight: '90%',
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
  sectionCard: {
    marginBottom: 20,
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  cardRow: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '400',
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeGreen: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  badgeBlue: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  badgeGray: {
    backgroundColor: '#E5E7EB',
    color: '#374151',
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
});

export default ViewModal;
