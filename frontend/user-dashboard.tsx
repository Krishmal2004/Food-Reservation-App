import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Platform,
  Alert,
} from 'react-native';

// Import the split components (adjust the path if they are inside a folder like './components/')
import BookTableBanner from './user/BookTableBanner';
import FoodPackagesList from './user/FoodPackagesList';
import UserFeedbacks from './user/UserFeedbacks';

const UserDashboard = ({ navigation,route }: { navigation: any; route: any }) => {
  const loggedInEmail = route?.params?.currentEmail;

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => navigation.navigate('Login'), style: "destructive" }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, John! 👋</Text>
          <Text style={styles.subtitle}>Ready to satisfy your cravings?</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileAvatar} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('UserProfileEdit',{currentEmail: loggedInEmail})}
          >
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              style={styles.avatarImage} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Render the 3 separate components */}
        <BookTableBanner />
        <FoodPackagesList />
        <UserFeedbacks />

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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutBtn: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFEBEB',
    borderRadius: 8,
  },
  logoutText: {
    color: '#E74C3C',
    fontWeight: '700',
    fontSize: 13,
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
});

export default UserDashboard;