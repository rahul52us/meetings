import React, {useCallback, useEffect, useState} from 'react';
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
  Dimensions,
  Pressable,
} from 'react-native';
import {useUser} from '../../../components/authGuard/UserContext';
import {
  getOptionsFromMasterData,
  replaceLabelValueObjects,
} from '../../../utils/function';
import {appRequest} from '../../../routes';
import {
  districtOptions,
  localBodyOptions,
  nicOptions,
} from '../../../utils/variables';
import SearchableSelect from '../../../components/component/SearchableSelect';
import AsyncSelectSearchable from '../../../components/component/AsyncSelectSearchable';

// Type definitions
interface FormValues {
  employerId: string;
  employerName: string;
  jobId: string;
  jobTitle: string;
  jobCategory: string;
  jobType: string;
  jobDescription: string;
  minQualifications: string;
  skills: string; // Comma-separated string
  experience: string;
  salary: string;
  benefits: string;
  location: string;
  workConditions: string;
  district: string;
  agentName: string;
  nicCode: string;
  passportNumber?: string;
  firmName: string;
  localBody: string;
  localBodyWardNumber: string;
  firmAddress: string;
  primarySector: string;
  subSector: string;
  proprietorName: string;
  aadharNumber: string;
  mobileNumber: string;
  emailId: string;
  jobFairConnection: string;
}

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchRecords: () => void;
  jobScope?: 'hyper_local' | 'abroad';
}

const AddJobModal: React.FC<AddJobModalProps> = ({
  isOpen,
  onClose,
  fetchRecords,
  jobScope,
}) => {
  const {toastNotify, accountDetails} = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterData, setMasterData] = useState<any>(null);
  const [formValues, setFormValues] = useState<any>({
    employerId: '',
    employerName: '',
    jobId: '123456',
    jobTitle: '',
    jobCategory: '',
    jobType: '',
    jobDescription: '',
    minQualifications: '',
    skills: '',
    experience: '',
    salary: '',
    benefits: '',
    location: '',
    workConditions: '',
    district: '',
    agentName: '',
    nicCode: '',
    passportNumber: undefined,
    firmName: '',
    localBody: '',
    localBodyWardNumber: '',
    firmAddress: '',
    primarySector: '',
    subSector: '',
    proprietorName: '',
    aadharNumber: '',
    mobileNumber: '',
    emailId: '',
    jobFairConnection: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});

  const jobFairOptions = [
    {label: 'Yes', value: 'yes'},
    {label: 'No', value: 'no'},
  ];

  // Fetch master data
  const getMasterData = useCallback(async () => {
    try {
      const response: any = await appRequest('masterData', 'getMasterData', {});
      if (response.status === 'success') {
        setMasterData(response.data);
      }
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      getMasterData();
    }
  }, [isOpen, getMasterData]);

  useEffect(() => {
    setFormValues((it : any) => ({...it, agentName : {label : accountDetails?.name || accountDetails?.username, value : accountDetails?.userId}}))
  },[accountDetails])

  // Validate form
  const validateForm = useCallback(() => {
    const requiredFields: {
      field: keyof FormValues;
      message: string;
    }[] = [
      {field: 'employerName', message: 'Employer name is required.'},
      {field: 'jobTitle', message: 'Job title is required.'},
      {field: 'skills', message: 'At least one skill is required.'},
      {
        field: 'minQualifications',
        message: 'Minimum qualification is required.',
      },
      {field: 'jobType', message: 'Job type is required.'},
      {field: 'jobCategory', message: 'Job category is required.'},
      {field: 'experience', message: 'Experience level is required.'},
      {field: 'salary', message: 'Monthly salary is required.'},
      {field: 'location', message: 'Location is required.'},
      {field: 'jobDescription', message: 'Job description is required.'},
      {field: 'firmName', message: 'Name of firm is required.'},
      {field: 'localBody', message: 'Local body is required.'},
      {field: 'firmAddress', message: 'Firm address is required.'},
      {field: 'primarySector', message: 'Primary sector is required.'},
      {field: 'subSector', message: 'Sub-sector is required.'},
      {field: 'proprietorName', message: 'Proprietor name is required.'},
      {field: 'aadharNumber', message: 'Aadhar number is required.'},
      {field: 'mobileNumber', message: 'Mobile number is required.'},
    ];

    let newErrors: Partial<Record<keyof FormValues, string>> = {};
    let isValid = true;

    for (const {field, message} of requiredFields) {
      if (!formValues[field]) {
        newErrors[field] = message;
        isValid = false;
      }
    }

    if (formValues.aadharNumber && !/^\d{12}$/.test(formValues.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar number must be 12 digits';
      isValid = false;
    }

    if (
      formValues.mobileNumber &&
      !/^[1-9]\d{9}$/.test(formValues.mobileNumber)
    ) {
      newErrors.mobileNumber =
        'Mobile number must be 10 digits and cannot start with 0';
      isValid = false;
    }

    if (
      formValues.emailId &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.emailId)
    ) {
      newErrors.emailId = 'Invalid email format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formValues]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        jobDetails: {
          ...replaceLabelValueObjects(formValues),
          skills: formValues.skills
            .split(',')
            .map((s: any) => s.trim())
            .filter(Boolean),
        },
        company: accountDetails.company._id,
        jobScope : jobScope
      };
      console.log('payload are', payload)

      const response: any = await appRequest(
        'hyperJob',
        'createHyperJobData',
        payload,
      );
      if (response.status === 'success') {
        toastNotify({
          status: 'success',
          title: 'Job Created',
        });
        fetchRecords();
        onClose();
        setFormValues({
          employerId: '',
          employerName: '',
          jobId: '123456',
          jobTitle: '',
          jobCategory: '',
          jobType: '',
          jobDescription: '',
          minQualifications: '',
          skills: '',
          experience: '',
          salary: '',
          benefits: '',
          location: '',
          workConditions: '',
          district: '',
          agentName: '',
          nicCode: '',
          passportNumber: undefined,
          firmName: '',
          localBody: '',
          localBodyWardNumber: '',
          firmAddress: '',
          primarySector: '',
          subSector: '',
          proprietorName: '',
          aadharNumber: '',
          mobileNumber: '',
          emailId: '',
          jobFairConnection: '',
        });
        setErrors({});
      } else {
        throw new Error(response.message || 'Failed to create job');
      }
    } catch (error: any) {
      console.error('Error creating job:', error);
      toastNotify({
        status: 'error',
        title: error.message || 'Failed to create job',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formValues,
    accountDetails,
    fetchRecords,
    onClose,
    toastNotify,
    validateForm,
    jobScope,
  ]);

  // Handle input changes
  const handleChange = useCallback((name: keyof FormValues, value: any) => {
    setFormValues((prev: any) => ({...prev, [name]: value}));
    setErrors(prev => ({...prev, [name]: ''}));
  }, []);

  // Get options from master data
  const jobCategories =
    getOptionsFromMasterData('jobCategory', masterData) || [];
  const jobTypes = getOptionsFromMasterData('jobType', masterData) || [];
  const minQualifications =
    getOptionsFromMasterData('minimumQualifications', masterData) || [];
  const experienceOptions =
    getOptionsFromMasterData('experience', masterData) || [];

  // Filter local body options
  const filteredLocalBodyOptions = localBodyOptions
    .filter((it: any) => it.DistID === formValues.district)
    .map((it: any) => ({
      label: it.label || it.name || '',
      value: it.value || it.id || '',
    }));


  return (
    <Modal
      visible={isOpen}
      animationType="fade" // or "none"
      onRequestClose={onClose}
      accessibilityLabel="Add new job modal">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <View style={styles.stickyHeader}>
          <Text style={styles.modalTitle}>Add New Job</Text>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close add job modal"
            accessibilityRole="button">
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Job Information */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Job Information</Text>
            <Text style={styles.label}>Job Title</Text>
            <TextInput
              value={formValues.jobTitle}
              onChangeText={val => handleChange('jobTitle', val)}
              placeholder="Enter job title"
              placeholderTextColor="#6B7280"
              style={styles.input}
              accessibilityLabel="Job title"
            />
            {errors.jobTitle && (
              <Text style={styles.error}>{errors.jobTitle}</Text>
            )}

            <SearchableSelect
              label="Job Category"
              selectedValue={formValues.jobCategory}
              options={jobCategories}
              onValueChange={val => handleChange('jobCategory', val)}
            />
            {errors.jobCategory && (
              <Text style={styles.error}>{errors.jobCategory}</Text>
            )}

            <SearchableSelect
              label="Job Type"
              selectedValue={formValues.jobType}
              options={jobTypes}
              onValueChange={val => handleChange('jobType', val)}
            />
            {errors.jobType && (
              <Text style={styles.error}>{errors.jobType}</Text>
            )}

            <Text style={styles.label}>Job Description</Text>
            <TextInput
              value={formValues.jobDescription}
              onChangeText={val => handleChange('jobDescription', val)}
              placeholder="Describe the job role"
              placeholderTextColor="#6B7280"
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              accessibilityLabel="Job description"
            />
            {errors.jobDescription && (
              <Text style={styles.error}>{errors.jobDescription}</Text>
            )}
          </View>

          {/* Employer & Agent Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Employer & Agent</Text>
            <AsyncSelectSearchable
              label="Employer Name"
              selectedValue={formValues.employerName}
              fetchOptions={async query => {
                const res: any = await appRequest('mentor', 'getActiveUsers', {
                  type: 'employer',
                  value: query,
                });
                return (
                  res?.data?.map((it: any) => ({
                    label: it?.name || it?.username,
                    value: it?._id,
                    profileId: it?.profileId,
                  })) || []
                );
              }}
              onValueChange={option => {
                handleChange('employerName', {
                  label: option.label,
                  value: option?.value,
                });
                handleChange('employerId', option.profileId);
              }}
              placeholder="Search employer"
            />

            {errors.employerName && (
              <Text style={styles.error}>{errors.employerName}</Text>
            )}

            <AsyncSelectSearchable
              label="Agent Name"
              selectedValue={formValues.agentName}
              defaultOptions={[
                {
                  label: accountDetails?.name || accountDetails?.username,
                  value: accountDetails?.userId,
                },
              ]}
              fetchOptions={async (query: string) => {
                const res: any = await appRequest('mentor', 'getActiveUsers', {
                  type: 'agent',
                  value: query,
                });
                return (
                  res?.data?.map((it: any) => ({
                    label: it?.name || it?.username,
                    value: it?._id,
                  })) || []
                );
              }}
              onValueChange={(option: any) => {
                handleChange('agentName', option);
              }}
              placeholder="Search Agent"
            />

            <Text style={styles.label}>Employer ID</Text>
            <TextInput
              value={formValues.employerId ? `EM-${formValues.employerId}` : ''}
              editable={false}
              style={[styles.input, styles.disabledInput]}
              accessibilityLabel="Employer ID (disabled)"
            />

            {jobScope === 'abroad' && (
              <>
                <Text style={styles.label}>Passport Number</Text>
                <TextInput
                  value={formValues.passportNumber || ''}
                  onChangeText={val => handleChange('passportNumber', val)}
                  placeholder="Enter passport number"
                  placeholderTextColor="#6B7280"
                  style={styles.input}
                  accessibilityLabel="Passport number"
                />
              </>
            )}

            <Text style={styles.label}>Name of Firm</Text>
            <TextInput
              value={formValues.firmName}
              onChangeText={val => handleChange('firmName', val)}
              placeholder="Enter firm name"
              placeholderTextColor="#6B7280"
              style={styles.input}
              accessibilityLabel="Name of firm"
            />
            {errors.firmName && (
              <Text style={styles.error}>{errors.firmName}</Text>
            )}

            <SearchableSelect
              label="District"
              selectedValue={formValues.district}
              options={districtOptions}
              onValueChange={val => {
                handleChange('district', val);
                handleChange('localBody', '');
              }}
            />

            <SearchableSelect
              label="Local Body"
              selectedValue={formValues.localBody}
              options={filteredLocalBodyOptions}
              onValueChange={(val : any) => {
                console.log(val)
                handleChange('localBody', val)}}
              // accessibilityLabel="Select local body"
            />
            {errors.localBody && (
              <Text style={styles.error}>{errors.localBody}</Text>
            )}

            <Text style={styles.label}>Local Body Ward Number</Text>
            <TextInput
              value={formValues.localBodyWardNumber}
              onChangeText={val => handleChange('localBodyWardNumber', val)}
              placeholder="Enter ward number"
              placeholderTextColor="#6B7280"
              style={styles.input}
              keyboardType="numeric"
              accessibilityLabel="Local body ward number"
            />

            <Text style={styles.label}>Firm Address (with Pincode)</Text>
            <TextInput
              value={formValues.firmAddress}
              onChangeText={val => handleChange('firmAddress', val)}
              placeholder="Enter firm address"
              placeholderTextColor="#6B7280"
              style={styles.input}
              accessibilityLabel="Firm address"
            />
            {errors.firmAddress && (
              <Text style={styles.error}>{errors.firmAddress}</Text>
            )}

            <SearchableSelect
              label="Primary Sector (NIC)"
              selectedValue={formValues.primarySector}
              options={nicOptions}
              onValueChange={val => handleChange('primarySector', val)}
              // accessibilityLabel="Select primary sector"
            />
            {errors.primarySector && (
              <Text style={styles.error}>{errors.primarySector}</Text>
            )}

            <SearchableSelect
              label="Sub-Sector (NIC)"
              selectedValue={formValues.subSector}
              options={nicOptions}
              onValueChange={val => handleChange('subSector', val)}
              // accessibilityLabel="Select sub-sector"
            />
            {errors.subSector && (
              <Text style={styles.error}>{errors.subSector}</Text>
            )}

            <Text style={styles.label}>Proprietor Name</Text>
            <TextInput
              value={formValues.proprietorName}
              onChangeText={val => handleChange('proprietorName', val)}
              placeholder="Enter proprietor name"
              placeholderTextColor="#6B7280"
              style={styles.input}
              accessibilityLabel="Proprietor name"
            />
            {errors.proprietorName && (
              <Text style={styles.error}>{errors.proprietorName}</Text>
            )}

            <Text style={styles.label}>Aadhar Number</Text>
            <TextInput
              value={formValues.aadharNumber}
              onChangeText={val => handleChange('aadharNumber', val)}
              placeholder="12-digit Aadhar number"
              placeholderTextColor="#6B7280"
              style={styles.input}
              keyboardType="numeric"
              accessibilityLabel="Aadhar number"
            />
            {errors.aadharNumber && (
              <Text style={styles.error}>{errors.aadharNumber}</Text>
            )}

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              value={formValues.mobileNumber}
              onChangeText={val => handleChange('mobileNumber', val)}
              placeholder="10-digit mobile number"
              placeholderTextColor="#6B7280"
              style={styles.input}
              keyboardType="numeric"
              accessibilityLabel="Mobile number"
            />
            {errors.mobileNumber && (
              <Text style={styles.error}>{errors.mobileNumber}</Text>
            )}

            <Text style={styles.label}>Email ID</Text>
            <TextInput
              value={formValues.emailId}
              onChangeText={val => handleChange('emailId', val)}
              placeholder="e.g., employer@example.com"
              placeholderTextColor="#6B7280"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email ID"
            />
            {errors.emailId && (
              <Text style={styles.error}>{errors.emailId}</Text>
            )}

            <SearchableSelect
              label="Connect with Vijnana Keralam Job Fairs?"
              selectedValue={formValues.jobFairConnection}
              options={jobFairOptions}
              onValueChange={val => handleChange('jobFairConnection', val)}
              // accessibilityLabel="Select job fair connection"
            />

            {!jobScope && (
              <SearchableSelect
                label="NIC Code"
                selectedValue={formValues.nicCode}
                options={nicOptions}
                onValueChange={val => handleChange('nicCode', val)}
                // accessibilityLabel="Select NIC code"
              />
            )}
          </View>

          {/* Qualifications & Skills */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Qualifications & Skills</Text>
            <SearchableSelect
              label="Minimum Qualification"
              selectedValue={formValues.minQualifications}
              options={minQualifications}
              onValueChange={val => handleChange('minQualifications', val)}
              // accessibilityLabel="Select minimum qualification"
            />
            {errors.minQualifications && (
              <Text style={styles.error}>{errors.minQualifications}</Text>
            )}

            <SearchableSelect
              label="Experience"
              selectedValue={formValues.experience}
              options={experienceOptions}
              onValueChange={val => handleChange('experience', val)}
              // accessibilityLabel="Select experience level"
            />
            {errors.experience && (
              <Text style={styles.error}>{errors.experience}</Text>
            )}

            <Text style={styles.label}>Skills</Text>
            <TextInput
              value={formValues.skills}
              onChangeText={val => handleChange('skills', val)}
              placeholder="Enter skills (comma-separated, e.g., JavaScript, Python)"
              placeholderTextColor="#6B7280"
              style={styles.input}
              accessibilityLabel="Skills"
            />
            {errors.skills && <Text style={styles.error}>{errors.skills}</Text>}
          </View>

          {/* Salary & Benefits */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Salary & Benefits</Text>
            <Text style={styles.label}>Monthly Salary</Text>
            <TextInput
              value={formValues.salary}
              onChangeText={val => handleChange('salary', val)}
              placeholder="Enter amount in USD"
              placeholderTextColor="#6B7280"
              style={styles.input}
              keyboardType="numeric"
              accessibilityLabel="Monthly salary"
            />
            {errors.salary && <Text style={styles.error}>{errors.salary}</Text>}

            <Text style={styles.label}>Benefits</Text>
            <TextInput
              value={formValues.benefits}
              onChangeText={val => handleChange('benefits', val)}
              placeholder="List additional benefits"
              placeholderTextColor="#6B7280"
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              accessibilityLabel="Benefits"
            />
          </View>

          {/* Location & Work Conditions */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Location & Conditions</Text>
            <Text style={styles.label}>Location</Text>
            <TextInput
              value={formValues.location}
              onChangeText={val => handleChange('location', val)}
              placeholder="Enter city or region"
              placeholderTextColor="#6B7280"
              style={styles.input}
              accessibilityLabel="Location"
            />
            {errors.location && (
              <Text style={styles.error}>{errors.location}</Text>
            )}

            <Text style={styles.label}>Work Conditions</Text>
            <TextInput
              value={formValues.workConditions}
              onChangeText={val => handleChange('workConditions', val)}
              placeholder="Specify work conditions"
              placeholderTextColor="#6B7280"
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              accessibilityLabel="Work conditions"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, styles.cancelButton]}
            onPress={onClose}
            accessibilityLabel="Cancel creating job"
            accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.saveButton,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityLabel="Create job"
            accessibilityRole="button">
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
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
  disabledInput: {
    backgroundColor: '#E5E7EB',
    color: '#6B7280',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {elevation: 3},
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
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {elevation: 3},
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

export default AddJobModal;
