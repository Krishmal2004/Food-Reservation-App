import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
  KeyboardAvoidingView,
  Alert,
  TextInput
} from 'react-native';

const RestaurantDetails = ({ route, navigation }: any) => {
  const { restaurant } = route?.params || {};

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleFeedbackSubmit = () => {
    Alert.alert("Success", "Your feedback was submitted successfully!");
    setFeedbackModalVisible(false);
    setTimeout(() => {
      setRating(5);
      setReviewText('');
    }, 300);
  };

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonIcon}>❮</Text>
          </TouchableOpacity>
        </View>
        <Text style={{textAlign: 'center', marginTop: 40}}>Restaurant data not found.</Text>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Cover Image */}
        <Image source={{ uri: restaurant.image }} style={styles.coverImage} />
        
        <View style={styles.infoSection}>
           <Text style={styles.title}>{restaurant.name}</Text>
           <Text style={styles.subtitle}>{restaurant.cuisine}  •  ★ {restaurant.rating}</Text>
           
           <TouchableOpacity 
             style={styles.feedbackListBtn} 
             activeOpacity={0.7}
             onPress={() => {
               setRating(5);
               setReviewText('');
               setFeedbackModalVisible(true);
             }}
           >
             <Text style={styles.feedbackListBtnText}>⭐ Leave Feedback</Text>
           </TouchableOpacity>
        </View>

        {/* Reservations */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionIcon}>🕒</Text>
            <Text style={styles.sectionTitle}>Available Times Today</Text>
          </View>
          <View style={styles.timesContainer}>
            {restaurant.reservationsAvailable.map((time: string) => (
              <TouchableOpacity key={time} style={styles.timePill} activeOpacity={0.7}>
                <Text style={styles.timeText}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Food Packages */}
        <View style={styles.section}>
           <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionIcon}>🍱</Text>
            <Text style={styles.sectionTitle}>Exclusive Packages</Text>
          </View>
          <View style={styles.packagesContainer}>
            {restaurant.packages.map((pkg: any) => (
              <View key={pkg.id} style={styles.packageCard}>
                <View style={{flex: 1}}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>{pkg.price}</Text>
                </View>
                <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8}>
                  <Text style={styles.bookBtnText}>Book</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Feedback Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Leave Feedback</Text>
            <Text style={styles.modalSubtitle}>{restaurant.name}</Text>
            <Text style={styles.modalDate}>On {currentDate}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rating</Text>
              <View style={styles.starSelectionContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity 
                    key={star} 
                    style={styles.starButton}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.starIcon, rating >= star ? styles.starIconActive : styles.starIconInactive]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Review (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="Tell us about your experience..."
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButtonRowBtn, styles.cancelButton]} onPress={() => setFeedbackModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButtonRowBtn, styles.saveButton]} onPress={handleFeedbackSubmit}>
                <Text style={styles.saveButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEE',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonIcon: {
    fontSize: 20,
    color: '#333333',
    fontWeight: '800',
    marginLeft: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  coverImage: {
    width: '100%',
    height: 220,
  },
  infoSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timePill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeText: {
    color: '#2C3E50',
    fontWeight: '800',
    fontSize: 15,
  },
  packagesContainer: {
    gap: 16,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9F9',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECEE',
  },
  packageName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF5A5F',
  },
  bookBtn: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  feedbackListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FEF5E7',
    borderRadius: 12,
    marginTop: 16,
  },
  feedbackListBtnText: {
    color: '#D68910',
    fontSize: 15,
    fontWeight: '700',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 18,
    color: '#2980B9',
    fontWeight: '700',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 20,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9F9',
    borderWidth: 1,
    borderColor: '#EAECEE',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1A1A1A',
  },
  textArea: {
    height: 100,
  },
  starSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  starButton: {
    padding: 2,
  },
  starIcon: {
    fontSize: 42,
  },
  starIconActive: {
    color: '#F39C12',
  },
  starIconInactive: {
    color: '#EAECEE',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  modalButtonRowBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F4F4',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#27AE60',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default RestaurantDetails;
