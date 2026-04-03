import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Event_Booking = ({ route }: { route: any }) => {
  const navigation = useNavigation();
  const userEmail = route?.params?.currentEmail;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('');
  const [eventType, setEventType] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventTypes = ['Birthday', 'Corporate', 'Wedding', 'Anniversary', 'Other'];

  const handleBookHall = () => {
    if (!date || !time || !guests || !eventType) {
      Alert.alert('Missing Details', 'Please fill in all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    // Simulate booking process
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Booking Successful',
        'Your function hall reservation request has been received. We will contact you shortly.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
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

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                value={date}
                onChangeText={setDate}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Time *</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                placeholderTextColor="#999"
                value={time}
                onChangeText={setTime}
              />
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
        <TouchableOpacity 
          style={[styles.bookBtn, isSubmitting && styles.bookBtnDisabled]} 
          onPress={handleBookHall}
          disabled={isSubmitting}
        >
          <Text style={styles.bookBtnText}>{isSubmitting ? 'Booking...' : 'Book Hall'}</Text>
        </TouchableOpacity>
      </View>
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
  bookBtn: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  bookBtnDisabled: {
    backgroundColor: '#A29BFE',
  },
  bookBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Event_Booking;