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
            <Text style={styles.modalTitle}>Agent Details</Text>
            <Pressable onPress={handleClose}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView contentContainerStyle={styles.modalBody}>
            {[
              { label: 'Agent ID:', value: user.profile?.profileId },
              { label: 'Name:', value: user.name },
              { label: 'Email:', value: user.email },
              { label: 'Mobile No.:', value: user.username },
              {
                label: 'Aadhaar No.:',
                value: maskAadhaar(user.profile?.profileDetails?.aadharNumber),
              },
              { label: 'Agent Type:', value: user.profile?.profileDetails?.agentType },
              { label: 'Verified:', value: user.is_active ? 'Yes' : 'No' },
            ].map(({ label, value }) => (
              <View key={label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value || 'N/A'}</Text>
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
    paddingBottom: 0,
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
