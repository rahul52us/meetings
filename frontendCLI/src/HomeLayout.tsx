import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Box } from 'native-base';
import Dashboard from './Dashboard';
import Sidebar from './components/Sidebar/Sidebar';
import Employers from './Screens/Employers/Employers';
import Agents from './Screens/Agents/Agents';
import JobList from './Screens/JobLists/JobLists';
import ProfileIndex from './Screens/Profile/ProfileIndex';
import Mentors from './Screens/Mentors/Mentors'
import JobSeekers from './Screens/JobSeekers/JobSeekers';

type ScreenKey = 'Dashboard' | 'Profile' | 'Employers' | 'Mentors' | 'Agents' | 'JobSeekers'  | 'JobLists';

const HomeLayout = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>('Dashboard');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Profile':
          return <ProfileIndex />;
      case 'Employers':
        return <Employers />;
        case 'JobLists':
          return <JobList />;
      case 'Mentors':
        return <Mentors />;
      case 'JobSeekers':
          return <JobSeekers />;
      case 'Agents':
            return <Agents />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          style={styles.menuButton}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentScreen}</Text>
      </View>

      {/* Main Content */}
      <Box flex={1} bg="white" style={styles.contentArea}>
        {renderScreen()}
      </Box>

      {/* Sidebar Drawer */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        setCurrentScreen={setCurrentScreen}
      />
    </View>
  );
};

export default HomeLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 60,
    backgroundColor: '#1A202C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  menuButton: {
    marginRight: 16,
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  contentArea: {
    flex: 1,
    position: 'relative',
  },
});
