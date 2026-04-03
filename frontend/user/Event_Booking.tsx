import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker'; 

const timeOptions = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM', '09:00 PM', '10:00 PM'
];

const Event_Booking = ({ route }: { route: any }) => {
  const navigation = useNavigation();
  const userEmail = route?.params?.currentEmail;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('');
  const [eventType, setEventType] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  // Date and Time Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [dateValue, setDateValue] = useState<Date>(new Date());

  const eventTypes = ['Birthday', 'Corporate', 'Wedding', 'Anniversary', 'Other'];

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/resturant/get-all-hall-packages');
        const data = await response.json();
        if (response.ok && data.packages) {
          setPackages(data.packages);
        }
      } catch (error) {
        console.error('Error fetching hall packages:', error);
      } finally {
        setIsLoadingPackages(false);
      }
    };
    fetchPackages();
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS until dismissed manually
    if (event.type === 'set' && selectedDate) {
      setShowDatePicker(false);
      setDateValue(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      setDate(formattedDate);
    } else {
      setShowDatePicker(false); // Dismiss on cancel
    }
  };

  const handleBookHall = async () => {
    if (!selectedPackage) {
      Alert.alert('Selection Required', 'Please select a function hall package.');
      return;
    }

    if (!date || !time || !guests || !eventType) {
      Alert.alert('Missing Details', 'Please fill in all mandatory fields.');
      return;
    }

    if (!userEmail) {
      Alert.alert('Error', 'User email not found. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Sending data to your backend
      const response = await fetch('http://10.0.2.2:5000/api/user/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: userEmail,
          packageId: selectedPackage.id || selectedPackage._id, // Handles both id or _id
          resturantId: selectedPackage.resturantId,
          eventType: eventType,
          date: date,
          time: time,
          guests: guests,
          specialRequests: specialRequests
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Booking Successful',
          'Your function hall reservation request has been received. We will contact you shortly.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Booking Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      Alert.alert('Network Error', 'Could not connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Function Hall</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formContainer}>
          
          <Text style={styles.sectionTitle}>Select Function Hall *</Text>
          {isLoadingPackages ? (
            <ActivityIndicator size="small" color="#6C5CE7" style={{ marginBottom: 20 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.packagesScroll}>
              {packages.length === 0 ? (
                <Text style={{ color: '#999', fontStyle: 'italic', marginBottom: 20 }}>No function hall packages available.</Text>
              ) : (
                packages.map((pkg) => (
                  <TouchableOpacity 
                    key={pkg.id} 
                    style={[styles.packageCard, selectedPackage?.id === pkg.id && styles.packageCardSelected]}
                    onPress={() => setSelectedPackage(pkg)}
                  >
                    <Image source={{ uri: pkg.image }} style={styles.packageImage} />
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageTitle}>{pkg.title}</Text>
                      <Text style={styles.packagePrice}>${pkg.price}</Text>
                      <Text style={styles.detailText}>Capacity: {pkg.capacity}</Text>
                      {pkg.freeDate || pkg.freeTime ? (
                        <Text style={styles.detailText}>Free: {pkg.freeDate} {pkg.freeTime}</Text>
                      ) : null}
                      <Text style={styles.detailText} numberOfLines={2}>{pkg.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}

          <Text style={styles.sectionTitle}>Event Details</Text>
          
          <Text style={styles.label}>Event Type *</Text>
          <View style={styles.eventTypeContainer}>
            {eventTypes.map((type) => (
              <TouchableOpacity 
                key={type} 
                style={[styles.typeOption, eventType === type && styles.typeOptionSelected]}
                onPress={() => setEventType(type)}
              >
                <Text style={[styles.typeText, eventType === type && styles.typeTextSelected]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date & Time Row - Replaced with Picker Buttons */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: date ? '#333' : '#999' }}>
                  {date || 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Time *</Text>
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowTimeDropdown(true)}
              >
                <Text style={{ color: time ? '#333' : '#999' }}>
                  {time || 'Select Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>Number of Guests *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 50"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={guests}
            onChangeText={setGuests}
          />

          <Text style={styles.label}>Special Requests (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any specific arrangements, decor, catering needs?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={specialRequests}
            onChangeText={setSpecialRequests}
          />

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bookBtn, isSubmitting && styles.bookBtnDisabled]} 
            onPress={handleBookHall}
            disabled={isSubmitting}
          >
            <Text style={styles.bookBtnText}>{isSubmitting ? 'Booking...' : 'Book Hall'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Native Date Picker Component */}
      {showDatePicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          minimumDate={new Date()} // Disables selecting past dates
          onChange={handleDateChange}
        />
      )}

      {/* Custom Time Dropdown Modal */}
      <Modal visible={showTimeDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setShowTimeDropdown(false)}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Select Time</Text>
            <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: 250 }}>
              {timeOptions.map((timeOption) => (
                <TouchableOpacity 
                  key={timeOption} 
                  style={styles.dropdownItem} 
                  onPress={() => {
                    setTime(timeOption);
                    setShowTimeDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText, 
                    time === timeOption && styles.dropdownItemSelectedText
                  ]}>
                    {timeOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 15,
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  // Added picker button style to match the input style
  pickerButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    minHeight: 48,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  textArea: {
    minHeight: 100,
  },
  eventTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  typeOption: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#FFF',
  },
  typeOptionSelected: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  typeText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  typeTextSelected: {
    color: '#FFF',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    color: '#555',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookBtn: {
    flex: 1,
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginLeft: 10,
  },
  bookBtnDisabled: {
    backgroundColor: '#A29BFE',
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  packagesScroll: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  packageCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  packageCardSelected: {
    borderColor: '#6C5CE7',
  },
  packageImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  packageInfo: {
    padding: 12,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C5CE7',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  
  // Custom Dropdown Modal Styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  dropdownItemSelectedText: {
    color: '#6C5CE7',
    fontWeight: '700',
  },
});

export default Event_Booking;