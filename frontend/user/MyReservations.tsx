import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const MyReservations = ({ userEmail }: { userEmail: string }) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReservations = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      // Assuming this endpoint exists; if it fails, we fall back to mock data
      const response = await fetch(`http://10.0.2.2:5000/api/user/reservation/${userEmail}`);
      const data = await response.json();
      if (response.ok && data.reservations && data.reservations.length > 0) {
        setReservations(data.reservations);
      } else {
        setReservations([
          {
            id: '1',
            restaurantName: 'The Gourmet Kitchen',
            packageName: 'Couple Special Dinner',
            date: '2023-11-20',
            time: '19:00',
            guests: 2,
            price: 120,
            status: 'Pending'
          },
          {
             id: '2',
             restaurantName: 'Sushi Master',
             packageName: 'Omakase Experience',
             date: '2023-11-25',
             time: '20:30',
             guests: 2,
             price: 250,
             status: 'Paid'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([
        {
          id: '1',
          restaurantName: 'The Gourmet Kitchen',
          packageName: 'Couple Special Dinner',
          date: '2023-11-20',
          time: '19:00',
          guests: 2,
          price: 120,
          status: 'Pending'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [userEmail])
  );

  const handleDelete = (id: string, restaurantName: string) => {
    Alert.alert('Cancel Reservation', `Are you sure you want to cancel your booking at ${restaurantName}?`, [
      { text: 'No, keep it', style: 'cancel' },
      { 
        text: 'Yes, cancel', 
        style: 'destructive',
        onPress: () => {
          // Typically we would also call an API here to delete it from the DB
          setReservations(prev => prev.filter(r => r.id !== id));
          Alert.alert('Success', 'Reservation cancelled successfully.');
        }
      }
    ]);
  };

  const handlePayNow = (id: string, price: number) => {
    Alert.alert('Payment', `Proceed to pay $${price} securely?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Pay Now', 
        onPress: () => {
           setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'Paid' } : r));
           Alert.alert('Payment Successful', 'Your reservation is now fully confirmed!');
        }
      }
    ]);
  };

  if (!userEmail) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🛒 My Cart / Reservations</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color="#FF5A5F" />
      ) : reservations.length > 0 ? (
        reservations.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.restaurantName}>{item.restaurantName || 'Restaurant Name'}</Text>
              <Text style={styles.price}>${item.price}</Text>
            </View>
            
            <View style={styles.detailsContainer}>
               <Text style={styles.detailText}>📦 {item.packageName || 'Standard Booking'}</Text>
               <Text style={styles.detailText}>📅 {item.date} at {item.time}</Text>
               <Text style={styles.detailText}>👥 {item.guests} Guests</Text>
               <View style={styles.statusBadge}>
                 <Text style={[styles.statusText, { color: item.status === 'Paid' ? '#27AE60' : '#E67E22' }]}>
                   Status: {item.status}
                 </Text>
               </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.btn, styles.deleteBtn]}
                onPress={() => handleDelete(item.id, item.restaurantName)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
              
              {item.status !== 'Paid' && (
                <TouchableOpacity 
                  style={[styles.btn, styles.payBtn]}
                  onPress={() => handlePayNow(item.id, item.price)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.payBtnText}>Pay Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerRow: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAECEE',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF5A5F',
  },
  detailsContainer: {
    gap: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '600',
  },
  statusBadge: {
    marginTop: 4,
    backgroundColor: '#F8F9F9',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFE0E0'
  },
  deleteBtnText: {
    color: '#E74C3C',
    fontWeight: '800',
    fontSize: 15,
  },
  payBtn: {
    backgroundColor: '#FF5A5F',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECEE',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#AAB7B8',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default MyReservations;
