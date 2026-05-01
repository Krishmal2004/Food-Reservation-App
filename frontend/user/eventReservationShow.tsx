import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Platform
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MobileMenu from './mobileMenu';
import { BASE_URL } from '../api';

const EventReservationShow = ({ route }: { route: any }) => {
  const loggedInEmail = route?.params?.currentEmail;
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    if (!loggedInEmail) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/user/user-booking/${loggedInEmail}`);
      const data = await response.json();
      if (response.ok && data.bookings) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching event bookings:', error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [loggedInEmail])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Events</Text>
        <TouchableOpacity 
          style={styles.newBookingBtn}
          onPress={() => navigation.navigate('Event_Booking', { currentEmail: loggedInEmail })}
        >
          <Text style={styles.newBookingText}>+ Book Event</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#6C5CE7" style={styles.loader} />
        ) : bookings.length > 0 ? (
          bookings.map((item) => (
            <View key={item._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {item.packageId?.title || 'Event Package'}
                </Text>
                <View style={styles.eventTypeBadge}>
                  <Text style={styles.eventTypeText}>{item.eventType}</Text>
                </View>
              </View>
              
              <View style={styles.detailsContainer}>
                 <Text style={styles.detailText}>📅 {item.date} at {item.time}</Text>
                 <Text style={styles.detailText}>👥 {item.guests} Guests</Text>
                 <Text style={styles.detailText}>💰 ${item.packageId?.price || 'N/A'}</Text>
                 {item.specialRequests ? (
                   <Text style={styles.detailText} numberOfLines={3}>
                     📝 {item.specialRequests}
                   </Text>
                 ) : null}
                 <View style={styles.statusBadgeRow}>
                   <Text style={[
                     styles.statusText, 
                     { color: item.status?.toLowerCase() === 'confirmed' || item.status?.toLowerCase() === 'approved' ? '#27AE60' : item.status?.toLowerCase() === 'paid' ? '#2980B9' : item.status?.toLowerCase() === 'cancelled' || item.status?.toLowerCase() === 'rejected' ? '#C0392B' : '#E67E22' }
                   ]}>
                     Status: {item.status?.toUpperCase() || 'PENDING'}
                   </Text>
                 </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎫</Text>
            <Text style={styles.emptyText}>No event bookings found.</Text>
            <TouchableOpacity 
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('Event_Booking', { currentEmail: loggedInEmail })}
            >
              <Text style={styles.emptyBtnText}>Browse Event Packages</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <MobileMenu loggedInEmail={loggedInEmail} activeTab="Events" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F9F9F9',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#1A1A1A' 
  },
  newBookingBtn: { 
    backgroundColor: '#EAE6FF', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20 
  },
  newBookingText: { 
    color: '#6C5CE7', 
    fontWeight: '700', 
    fontSize: 14 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: { 
    padding: 24, 
    paddingBottom: 120, // Extra padding to stay above the MobileMenu
    flexGrow: 1, 
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8, 
    elevation: 3 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0', 
    paddingBottom: 12 
  },
  eventTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#1A1A1A', 
    flex: 1,
    marginRight: 10,
  },
  eventTypeBadge: { 
    backgroundColor: '#F5F5F5', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  eventTypeText: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#555' 
  },
  detailsContainer: { 
    gap: 10 
  },
  detailText: { 
    fontSize: 15, 
    color: '#444', 
    fontWeight: '500',
    lineHeight: 22,
  },
  statusBadgeRow: { 
    marginTop: 8, 
    backgroundColor: '#F8F9F9', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE'
  },
  statusText: { 
    fontSize: 13, 
    fontWeight: '800' 
  },
  emptyContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    borderWidth: 2, 
    borderColor: '#EAECEE', 
    borderStyle: 'dashed', 
    padding: 40,
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: { 
    color: '#7F8C8D', 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyBtn: { 
    backgroundColor: '#6C5CE7', 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    borderRadius: 12,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyBtnText: { 
    color: '#FFF', 
    fontWeight: '800', 
    fontSize: 15 
  }
});

export default EventReservationShow;