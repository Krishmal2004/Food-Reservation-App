import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
  Alert,
} from 'react-native';

// Mock Data
const FOOD_PACKAGES = [
  { 
    id: '1', 
    title: 'Couples Dinner', 
    price: '$49.99', 
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974' 
  },
  { 
    id: '2', 
    title: 'Family Feast', 
    price: '$89.99', 
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069' 
  },
  { 
    id: '3', 
    title: 'Party Special', 
    price: '$129.99', 
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070' 
  },
];

const INITIAL_FEEDBACKS = [
  { id: '1', restaurant: 'Italian Bistro', text: 'Amazing food and great atmosphere! Will definitely come back.', rating: 5, date: 'Oct 24, 2024' },
  { id: '2', restaurant: 'Burger King', text: 'Delivery was a bit late, but the burger was hot and tasty.', rating: 4, date: 'Oct 15, 2024' },
];

const UserDashboard = ({ navigation }: { navigation: any }) => {
  const [feedbacks, setFeedbacks] = useState(INITIAL_FEEDBACKS);

  const handleDeleteFeedback = (id: string) => {
    Alert.alert(
      "Delete Feedback",
      "Are you sure you want to delete this feedback?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => setFeedbacks(feedbacks.filter(fb => fb.id !== id))
        }
      ]
    );
  };

  const handleEditFeedback = (feedback: any) => {
    Alert.alert("Edit Feedback", `Editing feedback for ${feedback.restaurant}\n\n(This would open an edit modal)`);
  };

  const handleViewFeedback = (feedback: any) => {
    Alert.alert("View Feedback", `Rating: ${feedback.rating} Stars\n\nReview: \n${feedback.text}`);
  };

  const renderFoodPackage = (pkg: any) => (
    <TouchableOpacity key={pkg.id} style={styles.packageCard} activeOpacity={0.9}>
      <Image source={{ uri: pkg.image }} style={styles.packageImage} />
      <View style={styles.packageInfo}>
        <Text style={styles.packageTitle}>{pkg.title}</Text>
        <Text style={styles.packagePrice}>{pkg.price}</Text>
        <TouchableOpacity style={styles.reserveButtonWrapper}>
          <Text style={styles.reserveButtonText}>Reserve</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFeedback = (fb: any) => (
    <View key={fb.id} style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <View style={styles.feedbackTitleContainer}>
          <Text style={styles.feedbackRestaurant}>{fb.restaurant}</Text>
          <Text style={styles.feedbackDate}>{fb.date}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>★ {fb.rating}</Text>
        </View>
      </View>
      
      <Text style={styles.feedbackText} numberOfLines={2}>"{fb.text}"</Text>
      
      <View style={styles.feedbackActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleViewFeedback(fb)}>
          <Text style={[styles.actionText, { color: '#4A90E2' }]}>View</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEditFeedback(fb)}>
          <Text style={[styles.actionText, { color: '#F39C12' }]}>Edit</Text>
        </TouchableOpacity>
        <View style={styles.actionDivider} />
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteFeedback(fb.id)}>
          <Text style={[styles.actionText, { color: '#E74C3C' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, John! 👋</Text>
          <Text style={styles.subtitle}>Ready to satisfy your cravings?</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileAvatar} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('UserProfileEdit')}
        >
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.avatarImage} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Table Booking Section */}
        <TouchableOpacity style={styles.bookingBanner} activeOpacity={0.8} onPress={() => {}}>
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070' }}
            style={styles.bookingBannerImage}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.bookingBannerOverlay}>
              <Text style={styles.bookingBannerTitle}>Book a Table</Text>
              <Text style={styles.bookingBannerSub}>Skip the wait and reserve your spot instantly.</Text>
              <View style={styles.whiteButton}>
                <Text style={styles.whiteButtonText}>Book Now</Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Food Packages Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Food Packages</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {FOOD_PACKAGES.map(renderFoodPackage)}
          </ScrollView>
        </View>

        {/* Feedback Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Feedbacks</Text>
          </View>
          {feedbacks.length > 0 ? (
            feedbacks.map(renderFeedback)
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>You have no feedbacks yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 20,
    backgroundColor: '#F9F9F9',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bookingBanner: {
    marginHorizontal: 24,
    marginBottom: 30,
    height: 160,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  bookingBannerImage: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingBannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Overlay to make text readable
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
  },
  bookingBannerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  bookingBannerSub: {
    color: '#E0E0E0',
    fontSize: 14,
    marginBottom: 16,
    maxWidth: '80%',
  },
  whiteButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  whiteButtonText: {
    color: '#FF5A5F', // Primary app color
    fontWeight: '700',
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5A5F',
  },
  horizontalScroll: {
    paddingLeft: 24,
    paddingRight: 8,
  },
  packageCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  packageImage: {
    width: '100%',
    height: 130,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  packageInfo: {
    padding: 14,
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
    color: '#FF5A5F', // Primary Color
    marginBottom: 12,
  },
  reserveButtonWrapper: {
    backgroundColor: '#FFF0F1',
    borderWidth: 1,
    borderColor: '#FF5A5F',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#FF5A5F',
    fontWeight: '600',
    fontSize: 14,
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  feedbackTitleContainer: {
    flex: 1,
  },
  feedbackRestaurant: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  feedbackDate: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  ratingBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  ratingText: {
    color: '#F5B041',
    fontWeight: '700',
    fontSize: 12,
  },
  feedbackText: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  feedbackActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E0E0E0',
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#A0A0A0',
  },
});

export default UserDashboard;
