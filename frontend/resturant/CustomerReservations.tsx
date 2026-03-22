import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Alert } from 'react-native';

const INITIAL_RESERVATIONS = [
  { id: '1', customerName: 'Alice Smith', date: 'Today, 7:00 PM', guests: 2, status: 'Confirmed', notes: 'Anniversary dinner' },
  { id: '2', customerName: 'Bob Jones', date: 'Tomorrow, 8:00 PM', guests: 4, status: 'Pending', notes: 'Window seat if possible' },
];

const CustomerReservations = () => {
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [resModalVisible, setResModalVisible] = useState(false);
  const [selectedRes, setSelectedRes] = useState<any>(null);

  const handleOpenResModal = (res: any) => {
    setSelectedRes(res);
    setResModalVisible(true);
  };

  const handleUpdateResStatus = (newStatus: string) => {
    setReservations(reservations.map(r => r.id === selectedRes.id ? { ...r, status: newStatus } : r));
    setSelectedRes({ ...selectedRes, status: newStatus });
    Alert.alert("Status Updated", `Reservation marked as ${newStatus}.`);
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Customer Reservations</Text>
      
      {reservations.map(res => (
        <TouchableOpacity key={res.id} style={styles.card} onPress={() => handleOpenResModal(res)}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{res.customerName}</Text>
            <View style={[styles.statusBadge, res.status === 'Confirmed' ? styles.statusConfirmed : (res.status === 'Cancelled' ? styles.statusCancelled : styles.statusPending)]}>
              <Text style={[styles.statusText, res.status === 'Cancelled' && {color: '#FFF'}]}>{res.status}</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>{res.date} • {res.guests} Guests</Text>
          <Text style={styles.clickHint}>Tap to view/edit</Text>
        </TouchableOpacity>
      ))}

      {/* Reservation Details Modal */}
      <Modal visible={resModalVisible} animationType="fade" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setResModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { paddingBottom: 30 }]}>
                {selectedRes && (
                  <>
                    <Text style={styles.modalTitle}>Reservation Details</Text>
                    <View style={styles.resDetailRow}>
                      <Text style={styles.resDetailLabel}>Customer:</Text>
                      <Text style={styles.resDetailValue}>{selectedRes.customerName}</Text>
                    </View>
                    <View style={styles.resDetailRow}>
                      <Text style={styles.resDetailLabel}>Date & Time:</Text>
                      <Text style={styles.resDetailValue}>{selectedRes.date}</Text>
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
                      <Text style={styles.resDetailLabel}>Current Status:</Text>
                      <Text style={[styles.resDetailValue, {fontWeight: '700'}]}>{selectedRes.status}</Text>
                    </View>

                    <Text style={[styles.inputLabel, {marginTop: 20}]}>Update Status</Text>
                    <View style={styles.statusActionRow}>
                      <TouchableOpacity style={[styles.statusUpdateBtn, {backgroundColor: '#E8F5E9', borderColor: '#4CAF50'}]} onPress={() => handleUpdateResStatus('Confirmed')}>
                        <Text style={[styles.statusUpdateText, {color: '#2E7D32'}]}>Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.statusUpdateBtn, {backgroundColor: '#FFF3E0', borderColor: '#FF9800'}]} onPress={() => handleUpdateResStatus('Pending')}>
                        <Text style={[styles.statusUpdateText, {color: '#E65100'}]}>Pending</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.statusUpdateBtn, {backgroundColor: '#FFEBEE', borderColor: '#F44336'}]} onPress={() => handleUpdateResStatus('Cancelled')}>
                        <Text style={[styles.statusUpdateText, {color: '#C62828'}]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn, {marginTop: 20}]} onPress={() => setResModalVisible(false)}>
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
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 10 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F5F5F5', marginRight: 10 },
  cancelBtnText: { color: '#555', fontWeight: '600', fontSize: 16 },
  resDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  resDetailLabel: { fontSize: 15, color: '#666' },
  resDetailValue: { fontSize: 15, color: '#111', flex: 1, textAlign: 'right', marginLeft: 15 },
  statusActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  statusUpdateBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center', marginHorizontal: 4 },
  statusUpdateText: { fontSize: 13, fontWeight: '600' }
});

export default CustomerReservations;