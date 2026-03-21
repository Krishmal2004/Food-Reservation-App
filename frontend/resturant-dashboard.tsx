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
  TouchableWithoutFeedback,
  RefreshControl
} from 'react-native';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';

// Mock Data
const INITIAL_RESERVATIONS = [
  { id: '1', customerName: 'Alice Smith', date: 'Today, 7:00 PM', guests: 2, status: 'Confirmed', notes: 'Anniversary dinner' },
  { id: '2', customerName: 'Bob Jones', date: 'Tomorrow, 8:00 PM', guests: 4, status: 'Pending', notes: 'Window seat if possible' },
];

const CUSTOMER_FEEDBACKS = [
  { id: '1', customer: 'Alice Smith', text: 'Amazing food and great atmosphere!', rating: 5, date: 'Oct 24, 2024' },
  { id: '2', customer: 'Charlie Brown', text: 'Delivery was a bit late, but good.', rating: 4, date: 'Oct 15, 2024' },
];

const RestaurantDashboard = ({ route, navigation }: { route: any, navigation: any }) => {
  
  // 1. Get restaurant ID and Details passed from Login screen
  const loggedInRestaurantId = route?.params?.resturantId || '';
  
  const [packages, setPackages] = useState<any[]>([]);
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  const [refreshing, setRefreshing] = useState(false);
  
  // 2. Map Profile State from Login params
  const [profile, setProfile] = useState({
    name: route?.params?.restaurantName || 'Italian Bistro',
    email: route?.params?.email || 'contact@italianbistro.com',
    password: 'password123'
  });
  
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...profile });

  // Package Modal State
  const [pkgModalVisible, setPkgModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [pkgState, setPkgState] = useState({ title: '', price: '', note: '', image: '' });

  // Reservation Modal State
  const [resModalVisible, setResModalVisible] = useState(false);
  const [selectedRes, setSelectedRes] = useState<any>(null);

  // ==========================================
  // SAFE FETCH PACKAGES FROM DATABASE
  // ==========================================
  const fetchPackages = async () => {
    if (!loggedInRestaurantId) {
      console.log("⚠️ No Restaurant ID found. Please log out and log back in.");
      return;
    }

    try {
      console.log(`🔄 Fetching packages for ID: ${loggedInRestaurantId}...`);
      const response = await fetch(`http://10.0.2.2:5000/api/resturant/get-food-packages/${loggedInRestaurantId}`);
      
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

  const handleSaveProfile = () => {
    setProfile(tempProfile);
    setProfileModalVisible(false);
    Alert.alert("Success", "Profile updated successfully.");
  };

  const handleDeletePackage = (id: string) => {
    Alert.alert("Delete Package", "Are you sure you want to delete this food package?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setPackages(packages.filter(pkg => pkg.id !== id)) }
    ]);
  };

  const handleOpenAddPkgModal = () => {
    setEditingPackage(null);
    setPkgState({ title: '', price: '', note: '', image: '' });
    setPkgModalVisible(true);
  };

  const handleOpenEditPkgModal = (pkg: any) => {
    setEditingPackage(pkg);
    setPkgState({ title: pkg.title, price: pkg.price, note: pkg.note || '', image: pkg.image });
    setPkgModalVisible(true);
  };

  // 3. FUNCTION TO PICK IMAGE FROM PHONE
  const handleUploadPhoto = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.5,
      maxWidth: 800, // Compress dimensions to prevent huge payload sizes
      maxHeight: 800,
    }

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', 'ImagePicker Error: ' + response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const base64Image = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
        setPkgState(prev => ({ ...prev, image: base64Image }));
      }
    });
  };

  // 4. SAVE PACKAGE TO DATABASE (HANDLES CREATE & EDIT)
  const handleSavePackage = async () => {
    if (!pkgState.title || !pkgState.price) {
      Alert.alert("Error", "Please fill out title and price.");
      return;
    }

    if (!loggedInRestaurantId) {
      Alert.alert("Error", "Restaurant ID not found. Please log out and log in again.");
      return;
    }

    const finalNote = pkgState.note || 'No description provided';
    const finalImage = pkgState.image || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=1000';
    
    try {
      // Logic to switch between Creating and Editing
      const isEditing = !!editingPackage;
      
      // FIXED THE URL LOGIC HERE:
      const url = isEditing 
        ? `http://10.0.2.2:5000/api/resturant/update-food-package/${editingPackage.id}`
        : `http://10.0.2.2:5000/api/resturant/create-food-package`; 
        
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resturantId: loggedInRestaurantId,
          title: pkgState.title,
          price: pkgState.price,
          note: finalNote,
          image: finalImage
        }),
      });
      
      const textResponse = await response.text();
      
      // Handle HTML error pages gracefully
      if (textResponse.startsWith('<!DOCTYPE html>')) {
        if (response.status === 413) {
          Alert.alert("Error 413", "The image file is too large! Make sure your server.js limit is increased.");
        } else if (response.status === 404) {
          Alert.alert("Error 404", "Route not found. Make sure your backend is running.");
        } else {
          Alert.alert(`Server Error (${response.status})`, "The server crashed. Check your backend console.");
        }
        console.error("HTML ERROR RESPONSE:", textResponse);
        return;
      }
      
      try {
        const data = JSON.parse(textResponse);
        if(response.ok) {
          await fetchPackages(); // Refresh packages from server
          setPkgModalVisible(false);
          Alert.alert("Success", isEditing ? "Food package updated!" : "Food package created!");
        } else {
          Alert.alert("Error", data.message || "Failed to save package.");
        }
      } catch (e) {
        console.error("Save error, raw response:", textResponse);
        Alert.alert("Error", "Server returned an invalid response.");
      }
    } catch (error) {
      console.error('Package save error:', error);
      Alert.alert("Network Error", "Could not connect to the server.");
      setPkgModalVisible(false);
    };
  };

  const handleOpenResModal = (res: any) => {
    setSelectedRes(res);
    setResModalVisible(true);
  };

  const handleUpdateResStatus = (newStatus: string) => {
    setReservations(reservations.map(r => r.id === selectedRes.id ? { ...r, status: newStatus } : r));
    setSelectedRes({ ...selectedRes, status: newStatus });
    Alert.alert("Status Updated", `Reservation marked as ${newStatus}.`);
  };

  const renderReservation = (res: any) => (
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
  );

  const renderFoodPackage = (pkg: any) => (
    <View key={pkg.id || Math.random().toString()} style={styles.packageCard}>
      <Image source={{ uri: pkg.image }} style={styles.packageImage} />
      <View style={styles.packageInfo}>
        <Text style={styles.packageTitle}>{pkg.title}</Text>
        <Text style={styles.packagePrice}>{pkg.price}</Text>
        {pkg.note ? <Text style={styles.packageNote} numberOfLines={2}>{pkg.note}</Text> : null}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => handleOpenEditPkgModal(pkg)}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeletePackage(pkg.id)}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F9" />
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
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Customer Reservations</Text>
          {reservations.map(renderReservation)}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Food Packages</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddPkgModal}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {packages.length === 0 ? (
              <Text style={{ color: '#666', fontStyle: 'italic', marginVertical: 10 }}>No food packages found. Pull down to refresh or Add one!</Text>
            ) : (
              packages.map(renderFoodPackage)
            )}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Customer Feedbacks</Text>
          {CUSTOMER_FEEDBACKS.map(fb => (
            <View key={fb.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{fb.customer}</Text>
                <Text style={styles.ratingText}>★ {fb.rating}</Text>
              </View>
              <Text style={styles.feedbackDate}>{fb.date}</Text>
              <Text style={styles.feedbackText}>"{fb.text}"</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={profileModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Text style={styles.inputLabel}>Restaurant Name</Text>
              <TextInput style={styles.input} value={tempProfile.name} onChangeText={t => setTempProfile({...tempProfile, name: t})} />
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput style={styles.input} value={tempProfile.email} onChangeText={t => setTempProfile({...tempProfile, email: t})} keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput style={styles.input} value={tempProfile.password} onChangeText={t => setTempProfile({...tempProfile, password: t})} secureTextEntry />
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

      {/* Package Modal */}
      <Modal visible={pkgModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingPackage ? 'Edit Package' : 'Add New Package'}</Text>
              <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight: 400}}>
                <Text style={styles.inputLabel}>Package Name</Text>
                <TextInput style={styles.input} placeholder="e.g. VIP Dinner" value={pkgState.title} onChangeText={t => setPkgState({...pkgState, title: t})} />
                <Text style={styles.inputLabel}>Price</Text>
                <TextInput style={styles.input} placeholder="e.g. $49.99" value={pkgState.price} onChangeText={t => setPkgState({...pkgState, price: t})} />
                <Text style={styles.inputLabel}>Additional Note / Description</Text>
                <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} placeholder="What's included?" multiline numberOfLines={3} value={pkgState.note} onChangeText={t => setPkgState({...pkgState, note: t})} />
                <Text style={styles.inputLabel}>Package Photo</Text>
                {pkgState.image ? (
                  <Image source={{ uri: pkgState.image }} style={styles.previewImage} />
                ) : null}
                <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadPhoto}>
                  <Text style={styles.uploadBtnText}>{pkgState.image ? 'Change Photo from Gallery' : 'Upload Photo from Gallery'}</Text>
                </TouchableOpacity>
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setPkgModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSavePackage}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

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
  scrollContent: { paddingBottom: 40 },
  sectionContainer: { marginBottom: 30, paddingHorizontal: 24, zIndex: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  cardSubtitle: { fontSize: 14, color: '#666666', marginBottom: 4 },
  clickHint: { fontSize: 12, color: '#007AFF', fontStyle: 'italic', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusConfirmed: { backgroundColor: '#E8F5E9' },
  statusPending: { backgroundColor: '#FFF3E0' },
  statusCancelled: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#1A1A1A' },
  horizontalScroll: { paddingRight: 24, marginHorizontal: -24, paddingLeft: 24 },
  packageCard: {
    width: 240, backgroundColor: '#FFFFFF', borderRadius: 16, marginRight: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4
  },
  packageImage: { width: '100%', height: 140, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  packageInfo: { padding: 14 },
  packageTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  packagePrice: { fontSize: 15, fontWeight: '600', color: '#FF5A5F', marginBottom: 6 },
  packageNote: { fontSize: 13, color: '#666', marginBottom: 12, lineHeight: 18 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto' },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  editBtn: { backgroundColor: '#F0F8FF', marginRight: 8 },
  deleteBtn: { backgroundColor: '#FFF0F1' },
  editBtnText: { color: '#007AFF', fontWeight: '600', fontSize: 13 },
  deleteBtnText: { color: '#FF3B30', fontWeight: '600', fontSize: 13 },
  addBtn: { backgroundColor: '#FF5A5F', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  ratingText: { color: '#F5B041', fontWeight: '700', fontSize: 14 },
  feedbackDate: { fontSize: 12, color: '#A0A0A0', marginBottom: 8 },
  feedbackText: { fontSize: 14, color: '#4A4A4A', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#E0E0E0' },
  previewImage: { width: '100%', height: 120, borderRadius: 8, marginBottom: 10, marginTop: 5 },
  uploadBtn: { backgroundColor: '#E0E0E0', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5, marginBottom: 10 },
  uploadBtnText: { fontSize: 14, fontWeight: '600', color: '#333' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F5F5F5', marginRight: 10 },
  saveBtn: { backgroundColor: '#FF5A5F', marginLeft: 10 },
  cancelBtnText: { color: '#555', fontWeight: '600', fontSize: 16 },
  saveBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  resDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  resDetailLabel: { fontSize: 15, color: '#666' },
  resDetailValue: { fontSize: 15, color: '#111', flex: 1, textAlign: 'right', marginLeft: 15 },
  statusActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  statusUpdateBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center', marginHorizontal: 4 },
  statusUpdateText: { fontSize: 13, fontWeight: '600' }
});

export default RestaurantDashboard;