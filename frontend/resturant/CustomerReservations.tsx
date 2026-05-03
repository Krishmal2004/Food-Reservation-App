import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../api';

const CustomerReservations = ({ loggedInRestaurantId }: { loggedInRestaurantId?: string }) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [resModalVisible, setResModalVisible] = useState(false);
  const [selectedRes, setSelectedRes] = useState<any>(null);

  const fetchReservations = async () => {
    if (!loggedInRestaurantId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/user/reservation/resturant/${loggedInRestaurantId}`
      );
      const data = await response.json();

      if (response.ok && data.reservations) {
        setReservations(data.reservations);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error('Error fetching restaurant reservations:', error);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [loggedInRestaurantId])
  );

  const handleOpenResModal = (res: any) => {
    setSelectedRes(res);
    setResModalVisible(true);
  };

  const handleUpdateResStatus = async (newStatus: string) => {
    if (!selectedRes) return;

    try {
      const response = await fetch(`${BASE_URL}/api/user/update-status/${selectedRes.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setReservations(reservations.map(r => r.id === selectedRes.id ? { ...r, status: newStatus } : r));
        setSelectedRes({ ...selectedRes, status: newStatus });
        Alert.alert('Status Updated', `Reservation marked as ${newStatus.toUpperCase()}.`);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to update reservation status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Network Error', 'Could not connect to the backend server.');
    }
  };

  const handleDeleteReservation = () => {
    if (!selectedRes) return;

    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel and remove this reservation? This action cannot be undone.',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // UPDATED: Now calls the DELETE endpoint to permanently remove the reservation
              const response = await fetch(
                `${BASE_URL}/api/user/delete-reservation/${selectedRes.id}`,
                {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                }
              );

              if (response.ok) {
                // Remove from local list immediately
                setReservations(prev => prev.filter(r => r.id !== selectedRes.id));
                setResModalVisible(false);
                setSelectedRes(null);
                Alert.alert('Removed', 'Reservation has been cancelled and removed from the database.');
              } else {
                const data = await response.json();
                Alert.alert('Error', data.message || 'Failed to cancel reservation.');
              }
            } catch (error) {
              console.error('Error deleting reservation:', error);
              Alert.alert('Network Error', 'Could not connect to the backend server.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Customer Reservations</Text>

      {!loggedInRestaurantId ? (
        <Text style={{ color: 'red' }}>Restaurant ID missing. Please login again.</Text>
      ) : isLoading ? (
        <ActivityIndicator size="small" color="#FF5A5F" />
      ) : reservations.length === 0 ? (
        <Text style={{ color: '#666', fontStyle: 'italic' }}>No reservations yet.</Text>
      ) : (
        reservations.map(res => (
          <TouchableOpacity key={res.id} style={styles.card} onPress={() => handleOpenResModal(res)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{res.customerName}</Text>
              <View
                style={[
                  styles.statusBadge,
                  res.status === 'confirmed' || res.status === 'paid'
                    ? styles.statusConfirmed
                    : res.status === 'cancelled'
                      ? styles.statusCancelled
                      : styles.statusPending
                ]}
              >
                <Text style={[styles.statusText, res.status === 'cancelled' && { color: '#FFF' }]}>
                  {res.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.cardSubtitle}>
              {res.date} {res.time ? `• ${res.time}` : ''} • {res.guests} Guests
            </Text>

            <Text style={styles.clickHint}>Tap to view/edit</Text>
          </TouchableOpacity>
        ))
      )}

      {/* Reservation Details Modal */}
      <Modal visible={resModalVisible} animationType="fade" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setResModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {selectedRes && (
                  <>
                    <Text style={styles.modalTitle}>Reservation Details</Text>

                    <View style={styles.resDetailRow}>
                      <Text style={styles.resDetailLabel}>Customer:</Text>
                      <Text style={styles.resDetailValue}>{selectedRes.customerName}</Text>
                    </View>

                    <View style={styles.resDetailRow}>
                      <Text style={styles.resDetailLabel}>Package:</Text>
                      <Text style={styles.resDetailValue}>
                        {selectedRes.packageName || 'Standard Booking'} (${selectedRes.price || '0'})
                      </Text>
                    </View>

                    <View style={styles.resDetailRow}>
                      <Text style={styles.resDetailLabel}>Date & Time:</Text>
                      <Text style={styles.resDetailValue}>
                        {selectedRes.date} {selectedRes.time || ''}
                      </Text>
                    </View>

                    <View style={styles.resDetailRow}>
                      <Text style={styles.resDetailLabel}>Guests:</Text>
                      <Text style={styles.resDetailValue}>{selectedRes.guests}</Text>
                    </View>

                    <View style={styles.resDetailRow}>
                      <Text style={styles.resDetailLabel}>Notes:</Text>
                      <Text style={styles.resDetailValue}>{selectedRes.notes || 'None'}</Text>
                    </View>

                    <View style={styles.resDetailRow}>
                      <Text style={styles.resDetailLabel}>Payment:</Text>
                      <Text style={styles.resDetailValue}>
                        {selectedRes.paymentMethod === 'bank' ? 'Bank Deposit' : selectedRes.paymentMethod === 'card' ? 'Card (Stripe)' : 'N/A'}
                      </Text>
                    </View>

                    <View style={[styles.resDetailRow, { borderBottomWidth: 0 }]}>
                      <Text style={styles.resDetailLabel}>Status:</Text>
                      <Text style={[styles.resDetailValue, { fontWeight: '700',
                        color: selectedRes.status === 'confirmed' || selectedRes.status === 'paid' ? '#2E7D32'
                          : selectedRes.status === 'cancelled' ? '#C62828' : '#E65100'
                      }]}>{selectedRes.status?.toUpperCase() || 'PENDING'}</Text>
                    </View>

                    {/* Payment Slip Image */}
                    {selectedRes.paymentSlip ? (
                      <View style={styles.slipContainer}>
                        <Text style={styles.slipLabel}>📄 Payment Slip</Text>
                        <Image
                          source={{ uri: selectedRes.paymentSlip }}
                          style={styles.slipImage}
                          resizeMode="contain"
                        />
                      </View>
                    ) : selectedRes.paymentMethod === 'bank' ? (
                      <View style={styles.slipContainer}>
                        <Text style={[styles.slipLabel, { color: '#E65100' }]}>⚠️ No payment slip uploaded yet.</Text>
                      </View>
                    ) : null}

                    {/* CONDITIONAL STATUS BUTTON RENDERING */}
                    {selectedRes.status === 'paid' ? (
                      <Text style={styles.statusMessage}>
                        ✅ User has already paid for this reservation.
                      </Text>
                    ) : selectedRes.status === 'cancelled' ? (
                      <Text style={[styles.statusMessage, { color: '#C62828' }]}>
                        🚫 This reservation has been cancelled.
                      </Text>
                    ) : (
                      <>
                        <Text style={[styles.inputLabel, { marginTop: 16, textAlign: 'center' }]}>Manage Reservation</Text>
                        <View style={styles.statusActionRow}>
                          {/* Confirm button — hidden if already confirmed */}
                          {selectedRes.status !== 'confirmed' && (
                            <TouchableOpacity
                              style={[styles.statusUpdateBtn, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}
                              onPress={() => handleUpdateResStatus('confirmed')}
                            >
                              <Text style={[styles.statusUpdateText, { color: '#2E7D32' }]}>✓ Confirm</Text>
                            </TouchableOpacity>
                          )}

                          {/* Cancel & Remove button */}
                          <TouchableOpacity
                            style={[styles.statusUpdateBtn, { backgroundColor: '#FFEBEE', borderColor: '#F44336' }]}
                            onPress={handleDeleteReservation}
                          >
                            <Text style={[styles.statusUpdateText, { color: '#C62828' }]}>✕ Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}

                    <TouchableOpacity style={[styles.modalBtn, styles.closeBtn, { marginTop: 16 }]} onPress={() => setResModalVisible(false)}>
                      <Text style={styles.closeBtnText}>Close</Text>
                    </TouchableOpacity>
                  </>
                )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 30, paddingHorizontal: 24, zIndex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  cardSubtitle: { fontSize: 14, color: '#666666', marginBottom: 4 },
  clickHint: { fontSize: 12, color: '#007AFF', fontStyle: 'italic', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusConfirmed: { backgroundColor: '#E8F5E9' },
  statusPending: { backgroundColor: '#FFF3E0' },
  statusCancelled: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#1A1A1A' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, maxHeight: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 10 },
  modalBtn: { padding: 14, borderRadius: 8, alignItems: 'center' },
  closeBtn: { backgroundColor: '#F5F5F5' },
  closeBtnText: { color: '#555', fontWeight: '600', fontSize: 15 },
  resDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  resDetailLabel: { fontSize: 14, color: '#666', flex: 1 },
  resDetailValue: { fontSize: 14, color: '#111', flex: 2, textAlign: 'right', marginLeft: 10 },
  slipContainer: { marginTop: 14, marginBottom: 4, alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  slipLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 10 },
  slipImage: { width: '100%', height: 200, borderRadius: 8 },
  statusMessage: { textAlign: 'center', color: '#2E7D32', fontWeight: 'bold', marginVertical: 12, fontSize: 14 },
  statusActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 8 },
  statusUpdateBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  statusUpdateText: { fontSize: 14, fontWeight: '700' }
});

export default CustomerReservations;