import React, { useState, useEffect, useCallback } from 'react';
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
  TextInput,
  Modal,
  KeyboardAvoidingView,
  RefreshControl
} from 'react-native';

import CustomerReservations from './resturant/CustomerReservations';
import FoodPackages from './resturant/FoodPackages';
import FunctionHallPackages from './resturant/FunctionHallPackages';
import CustomerFeedbacks from './resturant/CustomerFeedbacks';
import CustomerEventReservations from './resturant/CustomerEventReservations';
import { BASE_URL } from './api';
const RestaurantDashboard = ({ route, navigation }: { route: any, navigation: any }) => {

  // 1. Get restaurant ID and Details passed from Login screen
  const loggedInRestaurantId = route?.params?.resturantId || '';

  const [packages, setPackages] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 2. Map Profile State from Login params
  const [profile, setProfile] = useState({
    name: route?.params?.restaurantName || 'Italian Bistro',
    email: route?.params?.email || 'contact@italianbistro.com',
    password: ''
  });

  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });
  const [activeTab, setActiveTab] = useState('reservations');

  const fetchPackages = async () => {
    if (!loggedInRestaurantId) return;

    try {
      const response = await fetch(`${BASE_URL}/api/resturant/get-food-packages/${loggedInRestaurantId}`);
      const rawText = await response.text();
      try {
        const data = JSON.parse(rawText);
        if (response.ok && data.packages) {
          setPackages(data.packages);
        }
      } catch (jsonError) {
        console.error("❌ Backend did not send JSON! Raw response was:", rawText);
      }
    } catch (error) {
      console.error('❌ Error fetching packages:', error);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [loggedInRestaurantId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPackages();
    setRefreshing(false);
  }, [loggedInRestaurantId]);
  // ==========================================

  const handleLogout = () => {
    setProfileMenuVisible(false);
    navigation.navigate('RestaurantLogin');
    Alert.alert("Logged Out", "You have been logged out successfully.");
  };

  const handleSaveProfile = async () => {
    console.log("Frontend saving for is: ", loggedInRestaurantId);
    if (!tempProfile.name || !tempProfile.email) {
      Alert.alert("Validation Error", "Name and Email cannot be empty.");
      return;
    }
    if (!loggedInRestaurantId) {
      Alert.alert("Error", "Resturant ID not found. Please log in again.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/api/auth/update-resturant-profile/${loggedInRestaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          restaurantName: tempProfile.name,
          email: tempProfile.email,
          password: tempProfile.password
        })
      });
      const data = await response.json();
      if (response.ok) {
        setProfile({
          ...profile,
          name: data.resturant.restaurantName,
          email: data.resturant.email
        });
        setProfileModalVisible(false);
        Alert.alert("Success", "Profile updated successfully.");
      } else {
        Alert.alert("Error", data.message || "Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Profile update error: ", error);
      Alert.alert("Network Error", "Could not connect to server. Please check your internet connection and try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile.name} 👋</Text>
          <Text style={styles.subtitle}>Manage your business efficiently</Text>
        </View>
        <View>
          <TouchableOpacity
            style={styles.profileAvatar}
            activeOpacity={0.7}
            onPress={() => setProfileMenuVisible(!profileMenuVisible)}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974' }}
              style={styles.avatarImage}
            />
          </TouchableOpacity>

          {profileMenuVisible && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setProfileMenuVisible(false); setTempProfile(profile); setProfileModalVisible(true); }}>
                <Text style={styles.dropdownText}>Edit Profile</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                <Text style={[styles.dropdownText, { color: '#E74C3C' }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF5A5F']} />
        }
      >

        {/* COMPONENT 1: RESERVATIONS */}
        {activeTab === 'reservations' && (
          <CustomerReservations loggedInRestaurantId={loggedInRestaurantId}/>
        )}

        {/* COMPONENT 2: FOOD PACKAGES */}
        {activeTab === 'packages' && (
          <>
            <FoodPackages
              loggedInRestaurantId={loggedInRestaurantId}
              packages={packages}
              setPackages={setPackages}
              fetchPackages={fetchPackages}
            />
            <FunctionHallPackages loggedInRestaurantId={loggedInRestaurantId} />
          </>
        )}

        {/* COMPONENT 3: EVENT BOOKINGS */}
        {activeTab === 'events' && (
          <CustomerEventReservations loggedInRestaurantId={loggedInRestaurantId}/>
        )}

        {/* COMPONENT 4: FEEDBACKS */}
        {activeTab === 'feedbacks' && (
          <CustomerFeedbacks loggedInRestaurantId={loggedInRestaurantId}/>
        )}

      </ScrollView>

      {/* Mobile Bottom Menu */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => setActiveTab('reservations')}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuText, activeTab === 'reservations' && styles.menuTextActiveIcon]}>📅</Text>
          <Text style={[styles.menuTextSmall, activeTab === 'reservations' && styles.menuTextActive]}>Reservations</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => setActiveTab('packages')}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuText, activeTab === 'packages' && styles.menuTextActiveIcon]}>🍔</Text>
          <Text style={[styles.menuTextSmall, activeTab === 'packages' && styles.menuTextActive]}>Packages</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => setActiveTab('events')}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuText, activeTab === 'events' && styles.menuTextActiveIcon]}>🎉</Text>
          <Text style={[styles.menuTextSmall, activeTab === 'events' && styles.menuTextActive]}>Events</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => setActiveTab('feedbacks')}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuText, activeTab === 'feedbacks' && styles.menuTextActiveIcon]}>⭐</Text>
          <Text style={[styles.menuTextSmall, activeTab === 'feedbacks' && styles.menuTextActive]}>Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Edit Modal */}
      <Modal visible={profileModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Text style={styles.inputLabel}>Restaurant Name</Text>
              <TextInput style={styles.input} value={tempProfile.name} onChangeText={t => setTempProfile({ ...tempProfile, name: t })} />
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput style={styles.input} value={tempProfile.email} onChangeText={t => setTempProfile({ ...tempProfile, email: t })} keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput style={styles.input} value={tempProfile.password} onChangeText={t => setTempProfile({ ...tempProfile, password: t })} secureTextEntry />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setProfileModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveProfile}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10,
    paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 20, backgroundColor: '#F9F9F9'
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#666666' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
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
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#E0E0E0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 24 },
  dropdownMenu: {
    position: 'absolute', top: 60, right: 24, backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 8,
    width: 150, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5, zIndex: 20
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16 },
  dropdownText: { fontSize: 15, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#F0F0F0' },
  scrollContent: { paddingBottom: 100 },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 100,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  menuText: {
    fontSize: 22,
    marginBottom: 4,
    opacity: 0.4,
  },
  menuTextActiveIcon: {
    opacity: 1,
  },
  menuTextSmall: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  menuTextActive: {
    color: '#FF5A5F',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#E0E0E0' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F5F5F5', marginRight: 10 },
  saveBtn: { backgroundColor: '#FF5A5F', marginLeft: 10 },
  cancelBtnText: { color: '#555', fontWeight: '600', fontSize: 16 },
  saveBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});

export default RestaurantDashboard;