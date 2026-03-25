import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Modal, KeyboardAvoidingView, TextInput, Platform, Alert } from 'react-native';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import TableReservation from './Table-Reservation';

interface FoodPackagesProps {
  loggedInRestaurantId: string;
  packages: any[];
  setPackages: React.Dispatch<React.SetStateAction<any[]>>;
  fetchPackages: () => Promise<void>;
}

const FoodPackages: React.FC<FoodPackagesProps> = ({ loggedInRestaurantId, packages, setPackages, fetchPackages }) => {
  const [pkgModalVisible, setPkgModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [pkgState, setPkgState] = useState({ title: '', price: '', note: '', image: '' });

    const handleDeletePackage = (id: string) => {
    Alert.alert("Delete Package", "Are you sure you want to delete this food package?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            const response = await fetch(`http://10.0.2.2:5000/api/resturant/delete-food-package/${id}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              setPackages(packages.filter(pkg => pkg.id !== id));
              Alert.alert("Deleted", "Food package has been successfully deleted.");
            } else {
              const data = await response.json();
              Alert.alert("Error", data.message || "Failed to delete package.");
            }
          } catch (error) {
            console.error('Error deleting package:', error);
            Alert.alert("Network Error", "Could not connect to the server.");
          }
        } 
      }
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
      const isEditing = !!editingPackage;
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
      
      if (textResponse.startsWith('<!DOCTYPE html>')) {
        if (response.status === 413) {
          Alert.alert("Error 413", "The image file is too large! Make sure your server.js limit is increased.");
        } else if (response.status === 404) {
          Alert.alert("Error 404", "Route not found. Make sure your backend is running.");
        } else {
          Alert.alert(`Server Error (${response.status})`, "The server crashed. Check your backend console.");
        }
        return;
      }
      
      try {
        const data = JSON.parse(textResponse);
        if(response.ok) {
          await fetchPackages();
          setPkgModalVisible(false);
          Alert.alert("Success", isEditing ? "Food package updated!" : "Food package created!");
        } else {
          Alert.alert("Error", data.message || "Failed to save package.");
        }
      } catch (e) {
        Alert.alert("Error", "Server returned an invalid response.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to the server.");
      setPkgModalVisible(false);
    };
  };

  return (
    <>
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
          packages.map(pkg => (
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
          ))
        )}
      </ScrollView>

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
    </View>
    <TableReservation loggedInRestaurantId={loggedInRestaurantId} />
    </>
  );
};

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 30, paddingHorizontal: 24, zIndex: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  horizontalScroll: { paddingRight: 24, marginHorizontal: -24, paddingLeft: 24 },
  packageCard: { width: 240, backgroundColor: '#FFFFFF', borderRadius: 16, marginRight: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
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
  saveBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 }
});

export default FoodPackages;