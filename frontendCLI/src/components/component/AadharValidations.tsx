import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { appRequest } from '../../routes';
import { maskAadhaar } from '../../utils/function';

interface User {
  _id: string;
  user?: any; // For updateAadharDetails
  profile?: {
    profileDetails?: {
      aadharNumber?: string;
    };
  };
}

interface AadharResponse {
  status: string;
  data?: {
    status: string;
    message: {
      message?: { ref_id?: string; messsage?: string };
      status?: boolean;
      details?: any;
    };
  };
  message?: string;
}

interface UpdateResponse {
  status: string;
  message?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  item: any;
  handleGetUser?: () => void;
}

const AadharValidationComponent: React.FC<Props> = ({ open, onClose, item, handleGetUser }) => {
  const [step, setStep] = useState<'generate' | 'verify'>('generate');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [refId, setRefId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const modalFadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (open) {
      Animated.timing(modalFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      generateOtp();
    } else {
      Animated.timing(modalFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      reset();
    }
  }, [open]);

  const reset = () => {
    setStep('generate');
    setOtp('');
    setLoading(false);
    setRefId(null);
    setErrorMessage(null);
  };

  const generateOtp = async () => {
    setErrorMessage(null);
    try {
      setLoading(true);
      const response: any = await appRequest('user', 'aadharValidation', {
        value: item?.profile?.profileDetails?.aadharNumber
          ? String(item.profile.profileDetails.aadharNumber).replace(/\s/g, '')
          : '',
        subType: 'generate',
      });
      if (response.status === 'success') {
        if (
          response.data?.status === 'success' &&
          response.data.message.message?.messsage !== 'Invalid Aadhaar Card'
        ) {
          setRefId(response.data.message.message?.ref_id || null);
          setStep('verify');
          Alert.alert('OTP Sent', 'OTP sent successfully to the registered mobile number.');
        } else {
          setErrorMessage(
            response.data.message.message?.messsage ||
              response.data.message?.message ||
              'Could not generate OTP for Aadhaar validation.'
          );
        }
      } else {
        setErrorMessage('Could not generate OTP for Aadhaar validation.');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setErrorMessage(null);
    if (otp.length !== 6) {
      setErrorMessage('OTP must be 6 digits.');
      return;
    }
    try {
      setLoading(true);
      const response: any = await appRequest('user', 'aadharValidation', {
        otp,
        ref_id: refId,
        subType: 'verify',
      });
      if (response.status === 'success' && response?.data?.status !== 'error') {
        if (response.data.message.message?.status === false) {
          const errMsg =
            typeof response.data.message.message.details?.message === 'string'
              ? response.data.message.message.details.message
              : 'OTP verification failed';
          setErrorMessage(errMsg);
        } else {
          const updateResponse: any = await appRequest('user', 'updateAadharDetails', {
            user: item?.user,
            aadharDetails: response?.data?.message?.message?.details || {},
          });
          if (updateResponse?.status === 'success') {
            Alert.alert('Aadhaar Validated', 'Aadhaar validation successful!');
            if (handleGetUser) {
              handleGetUser();
            }
            onClose();
          } else {
            setErrorMessage('Failed to update details');
          }
        }
      } else {
        setErrorMessage('Failed to verify OTP');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={open} transparent={true} animationType="none" onRequestClose={loading ? undefined : onClose}>
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
            <Text style={styles.modalTitle}>Aadhaar Validation</Text>
            <Pressable
              onPress={loading ? undefined : onClose}
              accessibilityLabel="Close Aadhaar validation modal"
              accessibilityRole="button"
              disabled={loading}
            >
              <Text style={styles.modalClose}>X</Text>
            </Pressable>
          </View>
          <View style={styles.modalBody}>
            <View style={styles.aadharContainer}>
              <Text style={styles.label}>Aadhaar Number</Text>
              <Text style={styles.aadharText}>
                {maskAadhaar(item?.profile?.profileDetails?.aadharNumber)}
              </Text>
            </View>
            {step === 'verify' && (
              <View style={styles.formControl}>
                <Text style={styles.label}>Enter OTP</Text>
                <TextInput
                  style={styles.input}
                  maxLength={6}
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  editable={!loading}
                  accessibilityLabel="Enter OTP"
                />
                <Text style={styles.helperText}>
                  Please enter the OTP sent to your registered mobile number.
                </Text>
              </View>
            )}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#008080" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            )}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
          </View>
          <View style={styles.modalFooter}>
            {step === 'verify' ? (
              <Pressable
                style={[styles.button, otp.length !== 6 || loading ? styles.buttonDisabled : null]}
                onPress={verifyOtp}
                disabled={otp.length !== 6 || loading}
                accessibilityLabel="Verify OTP"
                accessibilityRole="button"
              >
                <Text style={styles.buttonText}>Verify OTP</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.button, loading ? styles.buttonDisabled : null]}
                onPress={generateOtp}
                disabled={loading}
                accessibilityLabel="Generate OTP"
                accessibilityRole="button"
              >
                <Text style={styles.buttonText}>Generate OTP</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.button, styles.cancelButton, loading ? styles.buttonDisabled : null]}
              onPress={loading ? undefined : onClose}
              disabled={loading}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Cancel</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: Dimensions.get('window').width * 0.85,
    maxHeight: Dimensions.get('window').height * 0.6,
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
    flexDirection: 'column',
    gap: 12,
  },
  aadharContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  aadharText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 1.2,
  },
  formControl: {
    flexDirection: 'column',
    gap: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#008080',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    gap: 12,
  },
  button: {
    backgroundColor: '#008080',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AadharValidationComponent;