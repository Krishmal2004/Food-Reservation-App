import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Modal, 
  KeyboardAvoidingView, 
  TextInput, 
  Platform, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { BASE_URL } from '../api';

interface FunctionHallPackagesProps {
  loggedInRestaurantId: string;
}

const timeOptions = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM', '09:00 PM', '10:00 PM'
];

const FunctionHallPackages: React.FC<FunctionHallPackagesProps> = ({ loggedInRestaurantId }) => {
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  
  // Date and Time Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [dateValue, setDateValue] = useState<Date>(new Date());

  const [pkgState, setPkgState] = useState({ 
    title: '', 
    capacity: '', 
    freeDate: '',  
    freeTime: '', 
    description: '', 
    packageDetails: '', 
    price: '',
    image: '' 
  });

  // 1. FETCH PACKAGES FROM DATABASE
  const fetchPackages = async () => {
    if (!loggedInRestaurantId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/resturant/get-hall-packages/${loggedInRestaurantId}`);
      const data = await response.json();
      if (response.ok && data.packages) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [loggedInRestaurantId]);

  const handleOpenAddModal = () => {
    setEditingPackage(null);
    setPkgState({ title: '', capacity: '', freeDate: '', freeTime: '', description: '', packageDetails: '', price: '', image: '' });
    setDateValue(new Date());
    setModalVisible(true);
  };

  const handleOpenEditModal = (pkg: any) => {
    setEditingPackage(pkg);
    setPkgState({ 
      title: pkg.title, 
      capacity: pkg.capacity, 
      freeDate: pkg.freeDate || '', 
      freeTime: pkg.freeTime || '', 
      description: pkg.description, 
      packageDetails: pkg.packageDetails, 
      price: pkg.price, 
      image: pkg.image 
    });
    
    if (pkg.freeDate) {
      const parsedDate = new Date(pkg.freeDate);
      if (!isNaN(parsedDate.getTime())) setDateValue(parsedDate);
    }
    setModalVisible(true);
  };

  // 2. DELETE PACKAGE FROM DATABASE
  const handleDeletePackage = (id: string) => {
    Alert.alert("Delete Package", "Are you sure you want to delete this function hall package?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            const response = await fetch(`${BASE_URL}/api/resturant/delete-hall-package/${id}`, {
              method: 'DELETE'
            });
            if (response.ok) {
              setPackages(packages.filter(pkg => pkg.id !== id));
              Alert.alert("Deleted", "Function hall package has been successfully deleted.");
            } else {
              Alert.alert("Error", "Failed to delete package.");
            }
          } catch (error) {
            Alert.alert("Network Error", "Could not connect to the server.");
          }
        } 
      }
    ]);
  };

  const handleUploadPhoto = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.5,
      maxWidth: 800,
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (event.type === 'set' && selectedDate) {
      setShowDatePicker(false);
      setDateValue(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0]; 
      setPkgState({ ...pkgState, freeDate: formattedDate });
    } else {
      setShowDatePicker(false); 
    }
  };

  // 3. SAVE TO DATABASE (CREATE OR UPDATE)
  const handleSavePackage = async () => {
    if (!pkgState.title || !pkgState.price || !pkgState.capacity) {
      Alert.alert("Error", "Please fill out required fields (Name, Capacity, Price).");
      return;
    }

    if (!loggedInRestaurantId) {
      Alert.alert("Error", "Restaurant ID not found. Please log in again.");
      return;
    }

    setIsSaving(true);
    const finalImage = pkgState.image || 'https://images.unsplash.com/photo-1549429402-39c4f5263654?q=80&w=2070';

    try {
      const isEditing = !!editingPackage;
      const url = isEditing 
        ? `${BASE_URL}/api/resturant/update-hall-package/${editingPackage.id}`
        : `${BASE_URL}/api/resturant/create-hall-package`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resturantId: loggedInRestaurantId,
          ...pkgState,
          image: finalImage
        })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchPackages(); // Refresh the list from the database
        setModalVisible(false);
        Alert.alert("Success", isEditing ? "Function hall updated!" : "Function hall created!");
      } else {
        Alert.alert("Error", data.message || "Failed to save package.");
      }
    } catch (error) {
      console.error("Error saving package:", error);
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Function Hall Packages</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color="#6C5CE7" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {packages.length === 0 ? (
            <Text style={{ color: '#666', fontStyle: 'italic', marginVertical: 10 }}>No function hall packages found. Add one!</Text>
          ) : (
            packages.map(pkg => (
              <View key={pkg.id} style={styles.packageCard}>
                <Image source={{ uri: pkg.image }} style={styles.packageImage} />
                <View style={styles.packageInfo}>
                  <Text style={styles.packageTitle}>{pkg.title}</Text>
                  <Text style={styles.packagePrice}>${pkg.price}</Text>
                  <Text style={styles.detailText}>Capacity: {pkg.capacity}</Text>
                  {pkg.freeDate || pkg.freeTime ? (
                    <Text style={styles.detailText}>
                      Free: {pkg.freeDate} {pkg.freeDate && pkg.freeTime ? 'at' : ''} {pkg.freeTime}
                    </Text>
                  ) : null}
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => handleOpenEditModal(pkg)}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeletePackage(pkg.id)}>
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Function Hall Package Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingPackage ? 'Edit Function Hall' : 'Add Function Hall'}</Text>
              
              <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight: 500}}>
                <Text style={styles.inputLabel}>Function Hall Name *</Text>
                <TextInput style={styles.input} placeholder="e.g. Grand Ballroom" value={pkgState.title} onChangeText={t => setPkgState({...pkgState, title: t})} />
                
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Capacity *</Text>
                    <TextInput style={styles.input} placeholder="e.g. 200 Guests" value={pkgState.capacity} onChangeText={t => setPkgState({...pkgState, capacity: t})} />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Price *</Text>
                    <TextInput style={styles.input} placeholder="e.g. $1000" keyboardType="numeric" value={pkgState.price} onChangeText={t => setPkgState({...pkgState, price: t})} />
                  </View>
                </View>

                {/* Date & Time Row */}
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Free Date</Text>
                    <TouchableOpacity 
                      style={styles.pickerButton} 
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={{ color: pkgState.freeDate ? '#333' : '#999' }}>
                        {pkgState.freeDate || 'Select Date'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Free Time</Text>
                    <TouchableOpacity 
                      style={styles.pickerButton} 
                      onPress={() => setShowTimeDropdown(true)}
                    >
                      <Text style={{ color: pkgState.freeTime ? '#333' : '#999' }}>
                        {pkgState.freeTime || 'Select Time'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Hall features, decor..." multiline numberOfLines={3} value={pkgState.description} onChangeText={t => setPkgState({...pkgState, description: t})} />

                <Text style={styles.inputLabel}>Package Details</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="What is included in the package?" multiline numberOfLines={3} value={pkgState.packageDetails} onChangeText={t => setPkgState({...pkgState, packageDetails: t})} />

                <Text style={styles.inputLabel}>Hall Photo</Text>
                {pkgState.image ? (
                  <Image source={{ uri: pkgState.image }} style={styles.previewImage} />
                ) : null}
                <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadPhoto}>
                  <Text style={styles.uploadBtnText}>{pkgState.image ? 'Change Photo from Gallery' : 'Upload Photo from Gallery'}</Text>
                </TouchableOpacity>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)} disabled={isSaving}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSavePackage} disabled={isSaving}>
                  {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save</Text>}
                </TouchableOpacity>
              </View>

            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Date Picker Component */}
      {showDatePicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          minimumDate={new Date()} 
          onChange={handleDateChange}
        />
      )}

      {/* Custom Time Dropdown Modal */}
      <Modal visible={showTimeDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setShowTimeDropdown(false)}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Select Time</Text>
            <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: 250 }}>
              {timeOptions.map((time) => (
                <TouchableOpacity 
                  key={time} 
                  style={styles.dropdownItem} 
                  onPress={() => {
                    setPkgState({ ...pkgState, freeTime: time });
                    setShowTimeDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText, 
                    pkgState.freeTime === time && styles.dropdownItemSelectedText
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: { marginTop: 10, marginBottom: 30, paddingHorizontal: 24, zIndex: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  horizontalScroll: { paddingRight: 24, marginHorizontal: -24, paddingLeft: 24 },
  packageCard: { width: 280, backgroundColor: '#FFFFFF', borderRadius: 16, marginRight: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  packageImage: { width: '100%', height: 160, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  packageInfo: { padding: 14 },
  packageTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  packagePrice: { fontSize: 15, fontWeight: '600', color: '#6C5CE7', marginBottom: 6 },
  detailText: { fontSize: 13, color: '#666', marginBottom: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  editBtn: { backgroundColor: '#F0F8FF', marginRight: 8 },
  deleteBtn: { backgroundColor: '#FFF0F1' },
  editBtnText: { color: '#007AFF', fontWeight: '600', fontSize: 13 },
  deleteBtnText: { color: '#FF3B30', fontWeight: '600', fontSize: 13 },
  addBtn: { backgroundColor: '#6C5CE7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#E0E0E0' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  textArea: { height: 80, textAlignVertical: 'top' },
  previewImage: { width: '100%', height: 120, borderRadius: 8, marginBottom: 10, marginTop: 5 },
  uploadBtn: { backgroundColor: '#E0E0E0', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5, marginBottom: 10 },
  uploadBtnText: { fontSize: 14, fontWeight: '600', color: '#333' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F5F5F5', marginRight: 10 },
  saveBtn: { backgroundColor: '#6C5CE7', marginLeft: 10 },
  cancelBtnText: { color: '#555', fontWeight: '600', fontSize: 16 },
  saveBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },

  // New Date/Time Picker Styles
  pickerButton: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#E0E0E0', height: 48, justifyContent: 'center' },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  dropdownContainer: { width: '80%', backgroundColor: '#FFF', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  dropdownTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 10 },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropdownItemText: { fontSize: 16, color: '#333', textAlign: 'center' },
  dropdownItemSelectedText: { color: '#6C5CE7', fontWeight: '700' }
});

export default FunctionHallPackages;