import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../components/authGuard/UserContext';
import { BaseScreens, BaseStackNavigationProp } from '../../navigations/BaseStack';
import { maskAadhaar } from '../../utils/function';
import { jobStationsOption } from '../../utils/variables';

const ProfileScreen = () => {
  const { accountDetails } = useUser();
  const navigation = useNavigation<BaseStackNavigationProp>();

  const profile = accountDetails?.profileDetails?.profileDetails || {};
  const company = accountDetails?.company || {};

  const goToDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: BaseScreens.AuthStack,
          params: {
            screen: 'Dashboard'
          },
        },
      ],
    });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Section */}
        <View style={styles.headerBackground}>
          <View style={styles.profileTop}>
            <Image
              source={{
                uri:
                  profile.avatar ||
                  'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Photos.png',
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{profile.name || 'No Name'}</Text>
            <Text style={styles.email}>{profile.email || '-'}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👤 {company?.type === "agent" ? "Agent Profile" : "Profile Details"}</Text>
          <InfoRow label="Name" value={profile.name} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Mobile Number" value={profile.moNumber} />
          <InfoRow label="Role" value={accountDetails.role} />
          <InfoRow label="Agent Type" value={profile.agentType} />
          <InfoRow label="Job Station Code" value={profile.jobStation ? jobStationsOption.find((it : any) => it?.value === profile.jobStation)?.label : "NA"} />
          <InfoRow label="Company Type" value={company.type} />
          <InfoRow label="Aadhar Number" value={maskAadhaar(profile.aadharNumber)} />
        </View>
      </ScrollView>
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.fancyButton} onPress={goToDashboard}>
          <Text style={styles.fancyButtonText}>🚀 Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  container: {
    paddingBottom: 40,
  },
  headerBackground: {
    backgroundColor: '#319795',
    paddingBottom: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileTop: {
    alignItems: 'center',
    paddingTop: 48,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#E6FFFA',
  },
  card: {
    marginTop: -40,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C7A7B',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 8,
  },
  row: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  bottomAction: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F9FAFB',
  },
  fancyButton: {
    backgroundColor: '#2C7A7B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
  },
  fancyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;