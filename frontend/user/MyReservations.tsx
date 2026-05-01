import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';
import { BASE_URL } from '../api';

const MyReservations = ({ userEmail }: { userEmail: string }) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentLoadingId, setPaymentLoadingId] = useState<string | null>(null);

  // Initialize Stripe hooks
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const fetchReservations = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/user/reservation/${userEmail}`);
      const data = await response.json();
      if (response.ok && data.reservations) {
        setReservations(data.reservations);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
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
        onPress: async () => {
          try {
            // Delete from database
            const response = await fetch(`${BASE_URL}/api/user/delete-reservation/${id}`, {
              method: 'DELETE'
            });
            if(response.ok) {
              setReservations(prev => prev.filter(r => r.id !== id));
              Alert.alert('Success', 'Reservation cancelled successfully.');
            } else {
              Alert.alert('Error', 'Failed to cancel reservation.');
            }
          } catch (error) {
            Alert.alert('Network Error', 'Could not connect to the server.');
          }
        }
      }
    ]);
  };

  const handlePayNow = async (id: string, price: number) => {
    setPaymentLoadingId(id);

    try {
      const response = await fetch(`${BASE_URL}/api/payment/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price, currency: 'usd' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() =>({}));
        Alert.alert('Payment Error', errorData.error || errorData.message || 'Failed to initialize payment intent.');
        setPaymentLoadingId(null);
        return;
      }

      const { clientSecret } = await response.json();

      // 2. Initialize the Stripe Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Restaurant Booking App',
      });

      if (initError) {
        Alert.alert('Error', initError.message);
        setPaymentLoadingId(null);
        return;
      }

      // 3. Present the Payment Sheet to the user
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment failed', presentError.message);
        }
      } else {
        // 4. If payment is successful, update the reservation status to 'paid' in your DB
        const updateResponse = await fetch(`${BASE_URL}/api/user/update-status/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paid' })
        });
        
        if (updateResponse.ok) {
          setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'paid' } : r));
          Alert.alert('Payment Successful', 'Your reservation is now fully confirmed and paid!');
        } else {
          Alert.alert('Warning', 'Payment succeeded, but failed to update status. Please contact support.');
        }
      }
    } catch (error) {
      console.error('Payment flow error:', error);
      Alert.alert('Network Error', 'Could not connect to the payment server.');
    } finally {
      setPaymentLoadingId(null);
    }
  };

  if (!userEmail) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🛒 My Cart / Reservations</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#FF5A5F" style={{ marginTop: 20 }} />
      ) : reservations.length > 0 ? (
        reservations.map((item) => {
          // Normalizing status to lowercase for comparison
          const currentStatus = item.status?.toLowerCase() || 'pending';
          const isPayingThisItem = paymentLoadingId === item.id;
          
          return (
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
                   <Text style={[
                     styles.statusText, 
                     { color: currentStatus === 'paid' ? '#27AE60' : currentStatus === 'confirmed' ? '#2980B9' : '#E67E22' }
                   ]}>
                     Status: {currentStatus.toUpperCase()}
                   </Text>
                 </View>
                 
                 {/* Provide user instruction if pending */}
                 {currentStatus === 'pending' && (
                   <Text style={styles.pendingHint}>Awaiting restaurant confirmation before payment.</Text>
                 )}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.btn, styles.deleteBtn]}
                  onPress={() => handleDelete(item.id, item.restaurantName)}
                  activeOpacity={0.7}
                  disabled={isPayingThisItem}
                >
                  <Text style={styles.deleteBtnText}>Cancel</Text>
                </TouchableOpacity>
                
                {/* LOCKED UNTIL RESTAURANT CONFIRMS */}
                {currentStatus === 'confirmed' && (
                  <TouchableOpacity 
                    style={[styles.btn, styles.payBtn, isPayingThisItem && styles.payBtnDisabled]}
                    onPress={() => handlePayNow(item.id, item.price)}
                    activeOpacity={0.7}
                    disabled={isPayingThisItem}
                  >
                    {isPayingThisItem ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.payBtnText}>Pay Now</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, marginBottom: 24 },
  headerRow: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#EAECEE', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 12 },
  restaurantName: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', flex: 1 },
  price: { fontSize: 18, fontWeight: '900', color: '#FF5A5F' },
  detailsContainer: { gap: 8 },
  detailText: { fontSize: 15, color: '#666666', fontWeight: '600' },
  statusBadge: { marginTop: 4, backgroundColor: '#F8F9F9', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 13, fontWeight: '800' },
  pendingHint: { fontSize: 12, color: '#A0A0A0', fontStyle: 'italic', marginTop: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FFE0E0' },
  deleteBtnText: { color: '#E74C3C', fontWeight: '800', fontSize: 15 },
  payBtn: { backgroundColor: '#FF5A5F', shadowColor: '#FF5A5F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  payBtnDisabled: { backgroundColor: '#FFA0A3' },
  payBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  emptyContainer: { padding: 30, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EAECEE', borderStyle: 'dashed' },
  emptyText: { color: '#AAB7B8', fontSize: 16, fontWeight: '600' }
});

export default MyReservations;