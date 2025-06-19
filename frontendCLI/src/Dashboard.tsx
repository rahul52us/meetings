import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { appRequest } from './routes';

const screenWidth = Dimensions.get('window').width;

type User = {
  _id: string;
  name: string;
  email: string;
  moNumber: string;
  username: string;
  gstin: string;
  type: string;
  pan: string;
  description: string;
  company?: any;
};

interface ChartDetails {
  title: string;
  labelData: string[];
  graphData: number[];
  bgColor: string[];
  borderW: number;
  borderColor: string;
}

interface TableData {
  id: number;
  status: string;
  name: string;
  applied: number | string;
}

interface CardData {
  title: string;
  count: number;
  description: string;
  icon: string;
  cardBg: string;
}

export default function AgentDashboard() {
  const [genderCounts, setGenderCounts] = useState<any>({ male: 0, female: 0 });
  const [orderCounts, setOrderCounts] = useState<any>({
    scholarship: 0,
    job: 0,
    course: 0,
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [search, setSearch] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('People');

  const handleGetUser = async (currentP?: number, valu?: any) => {
    try {
      setLoading(true);
      let value = valu ? valu : '';
      let limit = 10;
      let sort = 1;
      let page = currentP ? currentP : currentPage;
      const response: any = await appRequest('seeker', 'getSeekers', {
        value,
        limit,
        sort,
        page,
      });
      if (response) {
        if (Array.isArray(response?.data)) {
          setData(response?.data);
          setTotalPages(response?.totalPages);
        } else {
          setData([]);
        }
      } else {
        console.log('Error getting the user:', response.message || 'Something went wrong.');
      }
    } catch (error: any) {
      console.log('Error getting the user:', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const getGenderCounts = async () => {
    try {
      setSearch(true);
      const query: any = {}; // No date filters
      const response: any = await appRequest('seeker', 'genderCounts', query);
      const orderResponse: any = await appRequest('order', 'getOrderCount', query);
      if (orderResponse.status === 'success') {
        let obj: any = {};
        const dt = orderResponse.data.filter(
          (item: any) => item._id === 'dsep:scholarships'
        );
        if (dt.length) {
          obj['scholarship'] = dt[0].totalCount;
        }
        const dts = orderResponse.data.filter(
          (item: any) => item._id === 'onest:work-opportunities'
        );
        if (dts.length) {
          obj['job'] = dts[0].totalCount;
        }
        const Coursedts = orderResponse.data.filter(
          (item: any) => item._id === 'onest:learning-experiences'
        );
        if (Coursedts.length) {
          obj['course'] = Coursedts[0].totalCount;
        }
        setOrderCounts({
          scholarship: obj.scholarship || 0,
          job: obj.job || 0,
          course: obj.course || 0,
        });
      }

      if (response.status === 'success') {
        const counts: any = {};
        response.data.forEach((item: any) => {
          counts[item._id] = item.count;
        });
        setGenderCounts(counts);
      } else {
        console.log('Error getting the counts:', 'Failed to Get Counts.');
      }
    } catch (err: any) {
      console.log('Error getting the counts:', err.message || 'Failed to Get Counts.');
    } finally {
      setSearch(false);
    }
  };

  useEffect(() => {
    getGenderCounts();
  }, []);

  const handleSearch = () => {
    getGenderCounts();
  };

  const handleRefresh = () => {
    setGenderCounts({ male: 0, female: 0 });
    setOrderCounts({ scholarship: 0, job: 0, course: 0 });
    getGenderCounts();
  };

  const dummyData: ChartDetails = {
    title: 'Application Status',
    labelData: ['PEOPLE', 'JOBS'],
    graphData: [
      Number(genderCounts?.male || 0) + Number(genderCounts?.female || 0),
      genderCounts.jobs || 0,
    ],
    bgColor: ['#FBB6CE', '#90CDF4'],
    borderW: 1,
    borderColor: '#fff',
  };


  let totalCount = 0;
  if (Object.keys(genderCounts).length > 0) {
    totalCount = (genderCounts.male || 0) + (genderCounts.female || 0);
  }

  const cardData: CardData[] = [
    {
      title: 'People Onboarded',
      count: totalCount,
      description: 'Total No of People Onboarded',
      icon: '👥',
      cardBg: '#DBEAFE',
    },
    {
      title: 'Jobs',
      count: genderCounts.jobs || 0,
      description: 'Total Number of Jobs',
      icon: '💼',
      cardBg: '#F3E8FF',
    },
  ];

  const isMobile = screenWidth < 768;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Insights for People and Jobs</Text>
        </View>
      </View>
      <View style={isMobile ? styles.cardContainerMobile : styles.cardContainer}>
        <View style={[styles.genderCard, { backgroundColor: '#FFE4E6' }]}>
          <Text style={styles.cardTitle}>Male & Female</Text>
          <Text style={styles.cardDescription}>Total Gender Count</Text>
          <View style={styles.genderCountContainer}>
            <Text style={styles.genderText}>Male: {genderCounts?.male || 0}</Text>
            <Text style={styles.genderText}>Female: {genderCounts?.female || 0}</Text>
          </View>
        </View>
        {cardData.map((item, index) => (
          <View key={index} style={[styles.card, { backgroundColor: item.cardBg }]}>
            <View style={styles.cardOverlay} />
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <Text style={styles.cardCount}>{item.count}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        ))}
      </View>

      {search ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#319795" />
        </View>
      ) : (
        <View style={styles.tabContainer}>
          <View style={styles.tabList}>
            {['People', 'Job'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={isMobile ? styles.chartContainerMobile : styles.chartContainer}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{dummyData.title}</Text>
              {dummyData.labelData.map((label, index) => (
                <View key={index} style={styles.chartDataRow}>
                  <View
                    style={[styles.chartColorBox, { backgroundColor: dummyData.bgColor[index] }]}
                  />
                  <Text style={styles.chartData}>
                    {label}: {dummyData.graphData[index]}
                  </Text>
                </View>
              ))}
            </View>
            {/* <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Status</Text>
                <Text style={styles.tableHeaderCell}>Name</Text>
                <Text style={styles.tableHeaderCell}>Applied</Text>
              </View>
              {dummyTableData.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlternate]}
                >
                  <Text style={styles.tableCell}>{item.status}</Text>
                  <Text style={styles.tableCell}>{item.name}</Text>
                  <Text style={styles.tableCell}>{item.applied}</Text>
                </View>
              ))}
            </View> */}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.5,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#64748B',
    marginTop: 4,
  },
  headerDivider: {
    height: 3,
    width: 60,
    backgroundColor: '#319795',
    marginTop: 8,
    borderRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#319795',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#319795',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#FFFFFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16,
  },
  cardContainerMobile: {
    flexDirection: 'column',
    marginBottom: 24,
    gap: 16,
  },
  genderCard: {
    padding: 20,
    borderRadius: 16,
    width: screenWidth < 768 ? '100%' : '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    width: screenWidth < 768 ? '100%' : '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  cardCount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#319795',
    marginVertical: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  genderCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tabContainer: {
    marginTop: 16,
  },
  tabList: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#319795',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#319795',
    fontWeight: '700',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  chartContainerMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    marginBottom:40
  },
  chartCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: screenWidth < 768 ? '100%' : '40%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  chartDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  chartColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  chartData: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
  },
  tableHeaderCell: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRowAlternate: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 64,
  },
});