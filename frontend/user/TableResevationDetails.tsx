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
  ActivityIndicator
} from 'react-native';

const TableReservationDetails = ({ route, navigation }: any) => {
  // EXTRACTED: tablePackage alongside pkg
  const { restaurant, userEmail, package: pkg, tablePackage } = route?.params || {};

  const [customerName, setCustomerName] = useState('');
  
  // AUTO-FILL: Date, Time, and Guests if a table was selected
  const [date, setDate] = useState(tablePackage?.date || '');
  const [time, setTime] = useState(tablePackage?.time || '');
  const [guests, setGuests] = useState(tablePackage?.seats ? tablePackage.seats.toString() : '');
  const [note, setNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine Price and Title dynamically based on what was selected
  const displayPrice = tablePackage?.price || pkg?.price || '0';
  const displayTitle = tablePackage ? `Table ${tablePackage.tableNumber}` : pkg?.title;
  const isTableBooking = !!tablePackage;

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
          tablePackageId: tablePackage?.id || null, // Send table ID as well
          customerName: customerName,
          date: date,
          time: time,
          guests: guests,
          price: displayPrice, // Send price dynamically
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
        
        {/* DYNAMIC PRICE & PACKAGE HEADER */}
        {(pkg || tablePackage) && (
          <View style={styles.packageInfoContainer}>
             <Text style={styles.packageName}>
               {isTableBooking ? '📌 Selected Table: ' : '🍱 Selected Package: '} {displayTitle}
             </Text>
             <Text style={styles.priceText}>💰 Total Price: ${displayPrice}</Text>
          </View>
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A0A0A0"
            value={date}
            onChangeText={setDate}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Time *</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM AM/PM"
            placeholderTextColor="#A0A0A0"
            value={time}
            onChangeText={setTime}
          />
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
  restaurantName: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', marginBottom: 16 },
  
  // NEW PRICE HEADER STYLES
  packageInfoContainer: {
    backgroundColor: '#FFF0F0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5A5F'
  },
  packageName: { 
    fontSize: 15, 
    color: '#333', 
    fontWeight: '700', 
    marginBottom: 6 
  },
  priceText: { 
    fontSize: 18, 
    color: '#FF5A5F', 
    fontWeight: '900' 
  },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '700', color: '#2C3E50', marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAECEE', borderRadius: 12, padding: 16, fontSize: 16, color: '#1A1A1A', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  textArea: { height: 120, textAlignVertical: 'top' },
  confirmButton: { backgroundColor: '#FF5A5F', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 20, shadowColor: '#FF5A5F', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 },
  confirmButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' }
});

export default TableReservationDetails;