import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { replaceLabelValueObjects } from '../../../utils/function';
import { appRequest } from '../../../routes';
import { useUser } from '../../../components/authGuard/UserContext';
import { jobStationsOption } from '../../../utils/variables';
import SearchableSelect from '../../../components/component/SearchableSelect';

const agentTypeOptions = [
  { label: 'Job Station', value: 'jobStation' },
  { label: 'Institutional Agents', value: 'institutional' },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  fetchRecords?: () => void;
};

export default function CreateModal({
  isOpen,
  onClose,
  fetchRecords,
}: Props) {
  const { toastNotify } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    moNumber: '',
    aadharNumber: '',
    agentType: '',
    jobStation: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    moNumber: '',
    aadharNumber: '',
    agentType: '',
    jobStation: '',
  });

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let newErrors = {
      name: '',
      email: '',
      moNumber: '',
      aadharNumber: '',
      agentType: '',
      jobStation: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.moNumber.trim()) {
      newErrors.moNumber = 'Mobile number is required';
      isValid = false;
    } else if (!/^[1-9]\d{9}$/.test(formData.moNumber)) {
      newErrors.moNumber = 'Mobile number must be 10 digits and cannot start with 0';
      isValid = false;
    }

    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar number is required';
      isValid = false;
    } else if (!/^\d{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar number must be 12 digits';
      isValid = false;
    }

    if (!formData.agentType) {
      newErrors.agentType = 'Please select agent type';
      isValid = false;
    }

    if (!formData.jobStation) {
      newErrors.jobStation = 'Please select job station';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = replaceLabelValueObjects({
        ...formData,
        mobileNumber: formData.moNumber,
        jobStation: formData.jobStation,
        agentType: formData.agentType,
        type: 'agent',
      });

      const response: any = await appRequest('agent', 'create', payload);

      if (response?.status === 'success') {
        toastNotify({
          status: 'success',
          title: 'Job Created',
        });
        fetchRecords?.();
        onClose();
        setFormData({
          name: '',
          email: '',
          moNumber: '',
          aadharNumber: '',
          agentType: '',
          jobStation: '',
        });
        setErrors({
          name: '',
          email: '',
          moNumber: '',
          aadharNumber: '',
          agentType: '',
          jobStation: '',
        });
      } else {
        throw new Error(response?.message || 'Failed to create agent');
      }
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toastNotify({
        status: 'error',
        title: error.message || 'Failed to create agent',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.stickyHeader}>
          <Text style={styles.modalTitle}>Create New Job</Text>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close create agent modal"
            accessibilityRole="button"
          >
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={formData.name}
            onChangeText={val => setFormData({ ...formData, name: val })}
            placeholder="Enter agent's full name"
            placeholderTextColor="#6B7280"
            style={styles.input}
            accessibilityLabel="Full name"
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={formData.email}
            onChangeText={val => setFormData({ ...formData, email: val })}
            placeholder="e.g., agent@example.com"
            placeholderTextColor="#6B7280"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            accessibilityLabel="Email address"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            value={formData.moNumber}
            onChangeText={val => setFormData({ ...formData, moNumber: val })}
            placeholder="10-digit mobile number"
            placeholderTextColor="#6B7280"
            style={styles.input}
            keyboardType="numeric"
            accessibilityLabel="Mobile number"
          />
          {errors.moNumber && <Text style={styles.error}>{errors.moNumber}</Text>}

          <Text style={styles.label}>Aadhar Number</Text>
          <TextInput
            value={formData.aadharNumber}
            onChangeText={val => setFormData({ ...formData, aadharNumber: val })}
            placeholder="12-digit Aadhar number"
            placeholderTextColor="#6B7280"
            style={styles.input}
            keyboardType="numeric"
            accessibilityLabel="Aadhar number"
          />
          {errors.aadharNumber && <Text style={styles.error}>{errors.aadharNumber}</Text>}

          <SearchableSelect
            label="Job Type"
            selectedValue={formData.agentType}
            options={agentTypeOptions}
            onValueChange={val => setFormData({ ...formData, agentType: val })}
          />
          {errors.agentType && <Text style={styles.error}>{errors.agentType}</Text>}

          <SearchableSelect
            label="Job Station"
            selectedValue={formData.jobStation}
            options={jobStationsOption}
            onValueChange={val => setFormData({ ...formData, jobStation: val })}
          />
          {errors.jobStation && <Text style={styles.error}>{errors.jobStation}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, styles.cancelButton]}
            onPress={onClose}
            accessibilityLabel="Cancel creating agent"
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityLabel="Create agent"
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>Create</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
    fontSize: 15,
    color: '#1F2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
    fontSize: 15,
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4,
  },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#008080',
    letterSpacing: 0.2,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008080',
  },
  saveButton: {
    backgroundColor: '#008080',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});