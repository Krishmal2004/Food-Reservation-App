import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const CustomerEventReservations = ({ loggedInRestaurantId }: { loggedInRestaurantId?: string }) => {
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
        `http://10.0.2.2:5000/api/user/restaurant-bookings/${loggedInRestaurantId}`
      );
      const data = await response.json();

      if (response.ok && data.bookings) {
        setReservations(data.bookings);
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
      const resId = selectedRes._id || selectedRes.id;

      const response = await fetch(`http://10.0.2.2:5000/api/user/update-event-status/${resId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setReservations(reservations.map(r => (r._id === resId || r.id === resId) ? { ...r, status: newStatus } : r));
        setSelectedRes({ ...selectedRes, status: newStatus });
        Alert.alert("Status Updated", `Reservation successfully marked as ${newStatus.toUpperCase()}.`);
        setResModalVisible(false);
      } else {
        const data = await response.json();
        Alert.alert("Error", data.message || "Failed to update reservation status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Network Error", "Could not connect to the backend server.");
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Customer Event Bookings</Text>

      {!loggedInRestaurantId ? (
        <Text style={{ color: 'red' }}>Restaurant ID missing. Please login again.</Text>
      ) : isLoading ? (
        <ActivityIndicator size="small" color="#FF5A5F" />
      ) : reservations.length === 0 ? (
        <Text style={{ color: '#666', fontStyle: 'italic' }}>No event bookings yet.</Text>
      ) : (
        reservations.map(res => (
          <TouchableOpacity key={res._id || res.id} style={styles.card} onPress={() => handleOpenResModal(res)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{res.userEmail}</Text>
              <View
                style={[
                  styles.statusBadge,
                  res.status?.toLowerCase() === 'confirmed' || res.status?.toLowerCase() === 'approved' || res.status?.toLowerCase() === 'paid'
                    ? styles.statusConfirmed
                    : res.status?.toLowerCase() === 'cancelled' || res.status?.toLowerCase() === 'rejected'
                      ? styles.statusCancelled
                      : styles.statusPending
                ]}
              >
                <Text style={[styles.statusText, (res.status?.toLowerCase() === 'cancelled' || res.status?.toLowerCase() === 'rejected') && { color: '#FFF' }]}>
                  {res.status ? res.status.toUpperCase() : 'PENDING'}
                </Text>
              </View>
            </View>

            <Text style={styles.cardSubtitle}>
              {res.eventType} • {res.date} {res.time ? `• ${res.time}` : ''} • {res.guests} Guests
            </Text>
            
            <Text style={styles.cardSubtitle}>
              Hall: {res.packageId?.title || 'Unknown Hall'}
            </Text>

            <Text style={styles.clickHint}>Tap to view details</Text>
          </TouchableOpacity>
        ))
      )}

      {/* Reservation Details Modal */}
      <Modal visible={resModalVisible} animationType="fade" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setResModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { paddingBottom: 30 }]}>
                {selectedRes && (
                  <>
                    <Text style={styles.modalTitle}>Event Booking Details</Text>

                    <View style={styles.resDetailRow}>
                      <Text style={styles.resDetailLabel}>Customer:</Text>
                      <Text style={styles.resDetailValue}>{selectedRes.userEmail}</Text>
                    </View>

                    <View style={styles.resDetailRow}>
                      <Text style={styles.resDetailLabel}>Package:</Text>
                      <Text style={styles.resDetailValue}>
                        {selectedRes.packageId?.title || 'Custom Package'}
                      </Text>
                    </View>

                    {selectedRes.eventType && (
                      <View style={styles.resDetailRow}>
                        <Text style={styles.resDetailLabel}>Event Type:</Text>
                        <Text style={styles.resDetailValue}>{selectedRes.eventType}</Text>
                      </View>
                    )}

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
                      <Text style={styles.resDetailValue}>{selectedRes.specialRequests || 'None'}</Text>
                    </View>

                    <View style={styles.resDetailRow}>
                      <Text style={styles.resDetailLabel}>Current Status:</Text>
                      <Text style={[styles.resDetailValue, { fontWeight: '700' }]}>{selectedRes.status ? selectedRes.status.toUpperCase() : 'PENDING'}</Text>
                    </View>

                    {/* CONDITIONAL BUTTON RENDERING */}
                    {selectedRes.status?.toLowerCase() !== 'cancelled' && selectedRes.status?.toLowerCase() !== 'paid' && (
                      <>
                        <Text style={[styles.inputLabel, { marginTop: 20, textAlign: 'center' }]}>Manage Booking</Text>
                        
                        <View style={styles.statusActionRow}>
                          {/* Only show Accept if the booking is still pending */}
                          {selectedRes.status?.toLowerCase() !== 'confirmed' && (
                            <TouchableOpacity
                              style={[styles.statusUpdateBtn, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}
                              onPress={() => handleUpdateResStatus('Confirmed')}
                            >
                              <Text style={[styles.statusUpdateText, { color: '#2E7D32' }]}>Accept</Text>
                            </TouchableOpacity>
                          )}

                          {/* Always allow cancellation unless it is already cancelled or paid */}
                          <TouchableOpacity
                            style={[styles.statusUpdateBtn, { backgroundColor: '#FFEBEE', borderColor: '#F44336' }]}
                            onPress={() => handleUpdateResStatus('Cancelled')}
                          >
                            <Text style={[styles.statusUpdateText, { color: '#C62828' }]}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}

                    <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn, { marginTop: 20 }]} onPress={() => setResModalVisible(false)}>
                      <Text style={styles.cancelBtnText}>Close</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 30, paddingHorizontal: 24, zIndex: 1, paddingTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  cardSubtitle: { fontSize: 14, color: '#666666', marginBottom: 4 },
  clickHint: { fontSize: 12, color: '#6C5CE7', fontStyle: 'italic', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 10 },
  statusConfirmed: { backgroundColor: '#E8F5E9' },
  statusPending: { backgroundColor: '#FFF3E0' },
  statusCancelled: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#1A1A1A' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 10 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F5F5F5' },
  cancelBtnText: { color: '#555', fontWeight: '600', fontSize: 16 },
  resDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  resDetailLabel: { fontSize: 14, color: '#666', flex: 1 },
  resDetailValue: { fontSize: 14, color: '#111', flex: 2, textAlign: 'right', marginLeft: 10 },
  statusActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  statusUpdateBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center', marginHorizontal: 4 },
  statusUpdateText: { fontSize: 14, fontWeight: '700' }
});

export default CustomerEventReservations;