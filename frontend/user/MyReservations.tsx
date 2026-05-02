import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Alert, Modal, ScrollView, TextInput, Platform, StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { BASE_URL } from '../api';

const MyReservations = ({ userEmail }: { userEmail: string }) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentLoadingId, setPaymentLoadingId] = useState<string | null>(null);

  // Payment Method Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  // Bank Deposit Modal
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankDepositorName, setBankDepositorName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [depositDate, setDepositDate] = useState('');
  const [depositTime, setDepositTime] = useState('');
  const [depositFile, setDepositFile] = useState<any>(null);
  const [isBankSubmitting, setIsBankSubmitting] = useState(false);

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const getNow = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    return { date, time: `${hours}:${mins}` };
  };

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
    } catch {
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchReservations(); }, [userEmail]));

  const handleDelete = (id: string, restaurantName: string) => {
    Alert.alert('Cancel Reservation', `Cancel booking at ${restaurantName}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, cancel', style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/user/delete-reservation/${id}`, { method: 'DELETE' });
            if (res.ok) {
              setReservations(prev => prev.filter(r => r.id !== id));
              Alert.alert('Cancelled', 'Reservation cancelled successfully.');
            } else {
              Alert.alert('Error', 'Failed to cancel reservation.');
            }
          } catch {
            Alert.alert('Network Error', 'Could not connect to the server.');
          }
        }
      }
    ]);
  };


  const openPaymentModal = (item: any) => {
    setSelectedReservation(item);
    setShowPaymentModal(true);
  };

  const handleCardPayment = async () => {
    if (!selectedReservation) return;
    setShowPaymentModal(false);
    const id = selectedReservation.id;
    const price = selectedReservation.price;
    setPaymentLoadingId(id);
    try {
      const response = await fetch(`${BASE_URL}/api/payment/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price, currency: 'usd' }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        Alert.alert('Payment Error', err.error || 'Failed to initialize payment.');
        setPaymentLoadingId(null);
        return;
      }
      const { clientSecret } = await response.json();
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Restaurant Booking App',
      });
      if (initError) {
        Alert.alert('Error', initError.message);
        setPaymentLoadingId(null);
        return;
      }
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') Alert.alert('Payment failed', presentError.message);
      } else {
        const updateRes = await fetch(`${BASE_URL}/api/user/update-status/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paid' })
        });
        if (updateRes.ok) {
          // Remove from list once paid
          setReservations(prev => prev.filter(r => r.id !== id));
          Alert.alert('Payment Successful', 'Your reservation is confirmed and paid! 🎉');
        } else {
          Alert.alert('Warning', 'Payment succeeded but status update failed. Contact support.');
        }
      }
    } catch {
      Alert.alert('Network Error', 'Could not connect to payment server.');
    } finally {
      setPaymentLoadingId(null);
    }
  };

  const openBankDepositForm = () => {
    setShowPaymentModal(false);
    if (!selectedReservation) return;
    const { date, time } = getNow();
    setDepositDate(date);
    setDepositTime(time);
    setBankDepositorName('');
    setBankAccountNumber('');
    setBankReference('');
    setDepositFile(null);
    setShowBankModal(true);
  };

  const handlePickFile = () => {
    launchImageLibrary(
      // includeBase64: true is required since we are sending JSON instead of FormData
      { mediaType: 'photo', quality: 0.5, includeBase64: true },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to pick image.');
          return;
        }
        const asset = response.assets?.[0];
        if (asset) {
          const fileName = asset.fileName || asset.uri?.split('/').pop() || 'receipt.jpg';
          setDepositFile({
            uri: asset.uri,
            name: fileName,
            mimeType: asset.type || 'image/jpeg',
            base64: asset.base64 // Save the base64 string
          });
        }
      }
    );
  };

  const handleBankDepositSubmit = async () => {
    if (!bankDepositorName || !bankAccountNumber || !bankReference) {
      Alert.alert('Validation', 'Please fill in all required fields.');
      return;
    }
    if (!selectedReservation) return;
    setIsBankSubmitting(true);
    try {
      // Build standard JSON payload instead of FormData
      const payload = {
        reservationId: selectedReservation.id,
        depositorName: bankDepositorName,
        accountNumber: bankAccountNumber,
        reference: bankReference,
        depositDate: depositDate,
        depositTime: depositTime,
        packageName: selectedReservation.packageName || 'Standard Booking',
        price: String(selectedReservation.price),
        // Format the base64 string properly for the backend
        receiptImage: depositFile ? `data:${depositFile.mimeType};base64,${depositFile.base64}` : null
      };

      const res = await fetch(`${BASE_URL}/api/payment/bank-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Remove from list after deposit submission
        setReservations(prev => prev.filter(r => r.id !== selectedReservation.id));
        setShowBankModal(false);
        Alert.alert('Submitted ✅', 'Your bank deposit has been submitted for verification. We will confirm shortly.');
      } else {
        const errorData = await res.json().catch(() => ({}));
        Alert.alert('Error', errorData.error || 'Failed to submit deposit. Please try again.');
      }
    } catch {
      Alert.alert('Network Error', 'Could not connect to the server.');
    } finally {
      setIsBankSubmitting(false);
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
          const currentStatus = item.status?.toLowerCase() || 'pending';
          const isPayingThisItem = paymentLoadingId === item.id;
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.restaurantName}>{item.restaurantName || 'Restaurant'}</Text>
                <Text style={styles.price}>${item.price}</Text>
              </View>
              <View style={styles.detailsContainer}>
                <Text style={styles.detailText}>📦 {item.packageName || 'Standard Booking'}</Text>
                <Text style={styles.detailText}>📅 {item.date} at {item.time}</Text>
                <Text style={styles.detailText}>👥 {item.guests} Guests</Text>
                <View style={styles.statusBadge}>
                  <Text style={[styles.statusText, {
                    color: currentStatus === 'paid' ? '#27AE60'
                      : currentStatus === 'confirmed' ? '#2980B9'
                      : currentStatus === 'deposit_pending' ? '#8E44AD'
                      : '#E67E22'
                  }]}>
                    Status: {currentStatus === 'deposit_pending' ? 'DEPOSIT PENDING' : currentStatus.toUpperCase()}
                  </Text>
                </View>
                {currentStatus === 'pending' && (
                  <Text style={styles.pendingHint}>Awaiting restaurant confirmation before payment.</Text>
                )}
              </View>
              {currentStatus === 'confirmed' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.deleteBtn]}
                    onPress={() => handleDelete(item.id, item.restaurantName)}
                    disabled={isPayingThisItem}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.payBtn, isPayingThisItem && styles.payBtnDisabled]}
                    onPress={() => openPaymentModal(item)}
                    disabled={isPayingThisItem}
                    activeOpacity={0.7}
                  >
                    {isPayingThisItem
                      ? <ActivityIndicator size="small" color="#FFFFFF" />
                      : <Text style={styles.payBtnText}>💳 Pay Now</Text>
                    }
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      )}

      {/* ── Payment Method Modal ── */}
      <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowPaymentModal(false)}>
          <View style={styles.paymentSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Choose Payment Method</Text>
            <Text style={styles.sheetSub}>Select how you'd like to pay for your reservation</Text>

            {selectedReservation && (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>📦 {selectedReservation.packageName || 'Standard Booking'}</Text>
                <Text style={styles.summaryPrice}>${selectedReservation.price}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.methodCard} onPress={handleCardPayment} activeOpacity={0.8}>
              <View style={styles.methodIconWrap}>
                <Text style={styles.methodIcon}>💳</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Card Payment</Text>
                <Text style={styles.methodDesc}>Pay securely via Stripe</Text>
              </View>
              <Text style={styles.methodArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.methodCard, styles.bankCard]} onPress={openBankDepositForm} activeOpacity={0.8}>
              <View style={[styles.methodIconWrap, styles.bankIconWrap]}>
                <Text style={styles.methodIcon}>🏦</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Bank Deposit</Text>
                <Text style={styles.methodDesc}>Upload your deposit receipt</Text>
              </View>
              <Text style={styles.methodArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelMethodBtn} onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.cancelMethodText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Bank Deposit Form Modal ── */}
      <Modal visible={showBankModal} transparent animationType="slide" onRequestClose={() => setShowBankModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.bankSheet}>
            <View style={styles.sheetHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>🏦 Bank Deposit</Text>
              <Text style={styles.sheetSub}>Fill in your deposit details and upload the receipt</Text>

              {/* Auto-filled Summary */}
              <View style={styles.autofillBox}>
                <Text style={styles.autofillTitle}>📋 Booking Summary (Auto-filled)</Text>
                <View style={styles.autofillRow}>
                  <Text style={styles.autofillLabel}>Package</Text>
                  <Text style={styles.autofillValue}>{selectedReservation?.packageName || 'Standard Booking'}</Text>
                </View>
                <View style={styles.autofillRow}>
                  <Text style={styles.autofillLabel}>Amount</Text>
                  <Text style={[styles.autofillValue, { color: '#FF5A5F', fontWeight: '800' }]}>${selectedReservation?.price}</Text>
                </View>
                <View style={styles.autofillRow}>
                  <Text style={styles.autofillLabel}>Date</Text>
                  <Text style={styles.autofillValue}>{depositDate}</Text>
                </View>
                <View style={styles.autofillRow}>
                  <Text style={styles.autofillLabel}>Time</Text>
                  <Text style={styles.autofillValue}>{depositTime}</Text>
                </View>
              </View>

              {/* Depositor Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Depositor Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Full name of depositor"
                  placeholderTextColor="#A0A0A0"
                  value={bankDepositorName}
                  onChangeText={setBankDepositorName}
                />
              </View>

              {/* Account Number */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Account / Reference No. *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Bank account or reference number"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="numeric"
                  value={bankAccountNumber}
                  onChangeText={setBankAccountNumber}
                />
              </View>

              {/* Transfer Reference */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Transfer Reference *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. TXN123456"
                  placeholderTextColor="#A0A0A0"
                  value={bankReference}
                  onChangeText={setBankReference}
                />
              </View>

              {/* File Upload */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Upload Receipt (Optional)</Text>
                <TouchableOpacity style={styles.uploadBox} onPress={handlePickFile} activeOpacity={0.7}>
                  {depositFile ? (
                    <View style={styles.fileSelected}>
                      <Text style={styles.fileIcon}>📎</Text>
                      <Text style={styles.fileName} numberOfLines={1}>{depositFile.name}</Text>
                      <TouchableOpacity onPress={() => setDepositFile(null)}>
                        <Text style={styles.removeFile}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Text style={styles.uploadIcon}>📤</Text>
                      <Text style={styles.uploadText}>Tap to upload receipt</Text>
                      <Text style={styles.uploadSub}>PDF, JPG, PNG supported</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Bank Details */}
              <View style={styles.bankInfoBox}>
                <Text style={styles.bankInfoTitle}>🏛️ Bank Transfer Details</Text>
                <Text style={styles.bankInfoLine}>Bank: National Bank of Commerce</Text>
                <Text style={styles.bankInfoLine}>Account Name: Restaurant Booking Ltd</Text>
                <Text style={styles.bankInfoLine}>Account No: 1234-5678-9012</Text>
                <Text style={styles.bankInfoLine}>Branch: Main Branch</Text>
                <Text style={styles.bankInfoLine}>Swift Code: NBCOUSD</Text>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, isBankSubmitting && styles.submitBtnDisabled]}
                onPress={handleBankDepositSubmit}
                disabled={isBankSubmitting}
                activeOpacity={0.8}
              >
                {isBankSubmitting
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.submitBtnText}>Submit Deposit</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelMethodBtn} onPress={() => setShowBankModal(false)}>
                <Text style={styles.cancelMethodText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  emptyText: { color: '#AAB7B8', fontSize: 16, fontWeight: '600' },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  paymentSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  bankSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36, maxHeight: '92%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', textAlign: 'center', marginBottom: 6 },
  sheetSub: { fontSize: 14, color: '#7F8C8D', textAlign: 'center', marginBottom: 20 },

  summaryBox: { backgroundColor: '#FFF5F5', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FFE0E0' },
  summaryLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  summaryPrice: { fontSize: 20, fontWeight: '900', color: '#FF5A5F' },

  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FB', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#EAECEE' },
  bankCard: { backgroundColor: '#F5F0FF', borderColor: '#E0D5FF' },
  methodIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFE8E8', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  bankIconWrap: { backgroundColor: '#EDE0FF' },
  methodIcon: { fontSize: 22 },
  methodInfo: { flex: 1 },
  methodTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  methodDesc: { fontSize: 13, color: '#7F8C8D', marginTop: 2 },
  methodArrow: { fontSize: 24, color: '#BDC3C7', fontWeight: '300' },

  cancelMethodBtn: { marginTop: 8, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F2F4F4', borderRadius: 14 },
  cancelMethodText: { fontSize: 15, fontWeight: '700', color: '#E74C3C' },

  // Bank Deposit Form
  autofillBox: { backgroundColor: '#F0FAF4', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#D5F0E0' },
  autofillTitle: { fontSize: 14, fontWeight: '800', color: '#27AE60', marginBottom: 12 },
  autofillRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  autofillLabel: { fontSize: 13, color: '#7F8C8D', fontWeight: '600' },
  autofillValue: { fontSize: 13, color: '#1A1A1A', fontWeight: '700' },

  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 14, fontWeight: '700', color: '#2C3E50', marginBottom: 8 },
  formInput: { backgroundColor: '#F8F9FB', borderWidth: 1, borderColor: '#EAECEE', borderRadius: 12, padding: 14, fontSize: 15, color: '#1A1A1A' },

  uploadBox: { borderWidth: 2, borderColor: '#DEDEDE', borderStyle: 'dashed', borderRadius: 14, minHeight: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
  uploadPlaceholder: { alignItems: 'center', padding: 20 },
  uploadIcon: { fontSize: 32, marginBottom: 8 },
  uploadText: { fontSize: 15, fontWeight: '700', color: '#555' },
  uploadSub: { fontSize: 12, color: '#A0A0A0', marginTop: 4 },
  fileSelected: { flexDirection: 'row', alignItems: 'center', padding: 16, width: '100%' },
  fileIcon: { fontSize: 24, marginRight: 10 },
  fileName: { flex: 1, fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
  removeFile: { fontSize: 18, color: '#E74C3C', fontWeight: '700', paddingHorizontal: 8 },

  bankInfoBox: { backgroundColor: '#EBF5FB', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#AED6F1' },
  bankInfoTitle: { fontSize: 14, fontWeight: '800', color: '#2980B9', marginBottom: 10 },
  bankInfoLine: { fontSize: 13, color: '#2C3E50', fontWeight: '600', marginBottom: 4 },

  submitBtn: { backgroundColor: '#FF5A5F', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12, shadowColor: '#FF5A5F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  submitBtnDisabled: { backgroundColor: '#FFA0A3' },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});

export default MyReservations;