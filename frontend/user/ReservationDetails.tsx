import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Generate some standard time slots for the dropdown
const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM'
];

const ReservationDetails = ({ route, navigation }: any) => {
  const { restaurant, userEmail, package: pkg } = route?.params || {};

  const [customerName, setCustomerName] = useState('');
  const [guests, setGuests] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date State
  const [date, setDate] = useState(''); // Stores the YYYY-MM-DD string
  const [dateObj, setDateObj] = useState(new Date()); // Stores actual Date object
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Time State
  const [time, setTime] = useState('');
  const [showTimeModal, setShowTimeModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userEmail) return;
      try {
        const response = await fetch(`http://10.0.2.2:5000/api/auth/profile/${userEmail}`);
        const data = await response.json();
        
        if (response.ok && data.user) {
          const formattedName = data.user.fullName
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          setCustomerName(formattedName);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [userEmail]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    // On Android, we need to hide the picker immediately after selection
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDateObj(selectedDate);
      // Format as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDate(formattedDate);
    }
  };

  const handleConfirm = async () => {
    if (!customerName || !date || !time || !guests) {
      Alert.alert('Validation Error', 'Please fill in all mandatory fields.');
      return;
    }

    if (!restaurant?.id || !userEmail) {
      Alert.alert('Error', 'Missing restaurant or user data. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://10.0.2.2:5000/api/user/create-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail,
          restaurantId: restaurant.id,
          packageId: pkg?.id || null,
          customerName: customerName,
          date: date,
          time: time,
          guests: guests,
          note: note
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Reservation request sent successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Booking Error', data.message || 'Failed to create reservation.');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert('Network Error', 'Could not connect to the backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonIcon}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservation</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {restaurant && (
          <Text style={styles.restaurantName}>Booking at {restaurant.name}</Text>
        )}
        {pkg && (
          <Text style={styles.packageName}>Package: {pkg.title}</Text>
        )}
        {pkg && pkg.price && (
          <Text style={styles.packageName}>Price: ${pkg.price}</Text>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Customer Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. John Doe"
            placeholderTextColor="#A0A0A0"
            value={customerName}
            onChangeText={setCustomerName}
          />
        </View>

        {/* DATE PICKER */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date *</Text>
          <TouchableOpacity 
            style={styles.fakeInput} 
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={date ? styles.inputText : styles.placeholderText}>
              {date ? date : 'Select Date'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateObj}
              mode="date"
              display="default"
              minimumDate={new Date()} // Prevent booking in the past
              onChange={onDateChange}
            />
          )}
        </View>

        {/* TIME DROPDOWN */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Time *</Text>
          <TouchableOpacity 
            style={styles.fakeInput} 
            onPress={() => setShowTimeModal(true)}
            activeOpacity={0.7}
          >
            <Text style={time ? styles.inputText : styles.placeholderText}>
              {time ? time : 'Select Time'}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Number of Guests *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2"
            placeholderTextColor="#A0A0A0"
            keyboardType="numeric"
            value={guests}
            onChangeText={setGuests}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special requests or allergies?"
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={handleConfirm} 
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
             <ActivityIndicator color="#FFFFFF" />
          ) : (
             <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* TIME SELECTION MODAL */}
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimeModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <FlatList
              data={TIME_SLOTS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.timeOption}
                  onPress={() => {
                    setTime(item);
                    setShowTimeModal(false);
                  }}
                >
                  <Text style={[styles.timeOptionText, time === item && styles.timeOptionTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.cancelModalButton} onPress={() => setShowTimeModal(false)}>
              <Text style={styles.cancelModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EAECEE' },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F4F4', alignItems: 'center', justifyContent: 'center' },
  backButtonIcon: { fontSize: 20, color: '#333333', fontWeight: '800', marginLeft: -2 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  headerSpacer: { width: 44 },
  content: { padding: 24, paddingBottom: 40 },
  restaurantName: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', marginBottom: 4 },
  packageName: { fontSize: 16, color: '#FF5A5F', fontWeight: '700', marginBottom: 24 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '700', color: '#2C3E50', marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAECEE', borderRadius: 12, padding: 16, fontSize: 16, color: '#1A1A1A', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  fakeInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAECEE', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  inputText: { fontSize: 16, color: '#1A1A1A' },
  placeholderText: { fontSize: 16, color: '#A0A0A0' },
  dropdownIcon: { fontSize: 12, color: '#A0A0A0' },
  textArea: { height: 120, textAlignVertical: 'top' },
  confirmButton: { backgroundColor: '#FF5A5F', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 20, shadowColor: '#FF5A5F', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 },
  confirmButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '60%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  timeOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  timeOptionText: { fontSize: 16, color: '#333333', fontWeight: '500' },
  timeOptionTextSelected: { color: '#FF5A5F', fontWeight: '800' },
  cancelModalButton: { marginTop: 16, paddingVertical: 16, alignItems: 'center', backgroundColor: '#F8F9F9', borderRadius: 12 },
  cancelModalText: { fontSize: 16, fontWeight: '700', color: '#E74C3C' }
});

export default ReservationDetails;