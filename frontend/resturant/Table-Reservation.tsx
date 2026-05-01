import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  KeyboardAvoidingView, 
  TextInput, 
  Platform, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { BASE_URL } from '../api';

interface TableReservationProps {
  loggedInRestaurantId?: string;
}

// Pre-defined time slots for the dropdown
const timeOptions = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
  '08:00 PM', '09:00 PM', '10:00 PM'
];

const TableReservation: React.FC<TableReservationProps> = ({ loggedInRestaurantId }) => {
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Date and Time Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [dateValue, setDateValue] = useState<Date>(new Date());

  const [tableState, setTableState] = useState({ 
    tableNumber: '', 
    seats: '', 
    date: '', 
    time: '', 
    note: '',
    price: ''
  });

  // Fetch tables from backend
  const fetchTables = async () => {
    if (!loggedInRestaurantId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/resturant/get-table-packages/${loggedInRestaurantId}`);
      const data = await response.json();
      if (response.ok && data.tables) {
        setTables(data.tables);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [loggedInRestaurantId]);

  const handleDeleteTable = (id: string) => {
    Alert.alert("Delete Table", "Are you sure you want to delete this table package?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            const response = await fetch(`${BASE_URL}/api/resturant/delete-table-package/${id}`, {
              method: 'DELETE'
            });
            if (response.ok) {
              setTables(tables.filter(t => t.id !== id));
              Alert.alert("Deleted", "Table package has been deleted.");
            } else {
              Alert.alert("Error", "Failed to delete table.");
            }
          } catch (error) {
            Alert.alert("Network Error", "Could not connect to the server.");
          }
        } 
      }
    ]);
  };

  const handleOpenAddModal = () => {
    setEditingTable(null);
    setTableState({ tableNumber: '', seats: '', date: '', time: '', note: '', price: '' });
    setDateValue(new Date());
    setModalVisible(true);
  };

  const handleOpenEditModal = (table: any) => {
    setEditingTable(table);
    setTableState({ 
      tableNumber: table.tableNumber, 
      seats: table.seats.toString(), 
      date: table.date, 
      time: table.time, 
      note: table.note || '',
      price: table.price ? table.price.toString() : '' 
    });
    // Try to set the calendar to the existing date if editing
    if (table.date) {
      const parsedDate = new Date(table.date);
      if (!isNaN(parsedDate.getTime())) setDateValue(parsedDate);
    }
    setModalVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS until dismissed manually
    if (event.type === 'set' && selectedDate) {
      setShowDatePicker(false);
      setDateValue(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      setTableState({ ...tableState, date: formattedDate });
    } else {
      setShowDatePicker(false); // Dismiss on cancel
    }
  };

  const handleSaveTable = async () => {
    if (!tableState.tableNumber || !tableState.seats || !tableState.date || !tableState.time || !tableState.price) {
      Alert.alert("Error", "Please fill in all required fields (Table Number, Seats, Date, Time, Price).");
      return;
    }

    if (!loggedInRestaurantId) {
      Alert.alert("Error", "Restaurant ID not found. Please log in again.");
      return;
    }

    setIsSaving(true);
    
    try {
      const isEditing = !!editingTable;
      const url = isEditing 
        ? `${BASE_URL}/api/resturant/update-table-package/${editingTable.id}`
        : `${BASE_URL}/api/resturant/create-table-package`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resturantId: loggedInRestaurantId,
          ...tableState
        })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchTables(); 
        setModalVisible(false);
        Alert.alert("Success", isEditing ? "Table updated successfully!" : "Table added successfully!");
      } else {
        Alert.alert("Error", data.message || "Failed to save table.");
      }
    } catch (error) {
      console.error("Error saving table:", error);
      Alert.alert("Network Error", "Could not connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Table Packages</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal}>
          <Text style={styles.addBtnText}>+ Add Table</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color="#FF5A5F" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {tables.length === 0 ? (
            <Text style={{ color: '#666', fontStyle: 'italic', marginVertical: 10 }}>No table packages found. Add one!</Text>
          ) : (
            tables.map(table => (
              <View key={table.id} style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableTitle}>{table.tableNumber}</Text>
                  <View style={styles.seatsBadge}>
                    <Text style={styles.seatsText}>{table.seats} Seats</Text>
                  </View>
                </View>
                
                <View style={styles.tableInfoRow}>
                  <Text style={styles.infoLabel}>💰 Price:</Text>
                  <Text style={[styles.infoValue, { color: '#FF5A5F' }]}>${table.price}</Text>
                </View>
                <View style={styles.tableInfoRow}>
                  <Text style={styles.infoLabel}>📅 Date:</Text>
                  <Text style={styles.infoValue}>{table.date}</Text>
                </View>
                <View style={styles.tableInfoRow}>
                  <Text style={styles.infoLabel}>⏰ Time:</Text>
                  <Text style={styles.infoValue}>{table.time}</Text>
                </View>
                
                {table.note ? <Text style={styles.tableNote} numberOfLines={2}>📝 {table.note}</Text> : null}
                
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => handleOpenEditModal(table)}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteTable(table.id)}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Table Package Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingTable ? 'Edit Table Package' : 'Add New Table Package'}</Text>
              <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight: 500}}>
                
                <Text style={styles.inputLabel}>Table Number / Name</Text>
                <TextInput style={styles.input} placeholder="e.g. Table 5, Window Seat" value={tableState.tableNumber} onChangeText={t => setTableState({...tableState, tableNumber: t})} />
                
                <Text style={styles.inputLabel}>How many seats?</Text>
                <TextInput style={styles.input} placeholder="e.g. 4" keyboardType="numeric" value={tableState.seats} onChangeText={t => setTableState({...tableState, seats: t})} />
                
                <Text style={styles.inputLabel}>Price ($)</Text>
                <TextInput style={styles.input} placeholder="e.g. 50" keyboardType="numeric" value={tableState.price} onChangeText={t => setTableState({...tableState, price: t})} />

                {/* Calendar Date Picker Button */}
                <Text style={styles.inputLabel}>Available Date</Text>
                <TouchableOpacity style={styles.datePickerPseudo} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.pickerEmoji}>📅</Text>
                  <Text style={[styles.pickerInputText, { color: tableState.date ? '#333' : '#999' }]}>
                    {tableState.date || 'Select Date'}
                  </Text>
                </TouchableOpacity>

                {/* Time Dropdown Button */}
                <Text style={styles.inputLabel}>Available Time</Text>
                <TouchableOpacity style={styles.datePickerPseudo} onPress={() => setShowTimeDropdown(true)}>
                  <Text style={styles.pickerEmoji}>⏰</Text>
                  <Text style={[styles.pickerInputText, { color: tableState.time ? '#333' : '#999' }]}>
                    {tableState.time || 'Select Time'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Additional Note</Text>
                <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} placeholder="Any additional information?" multiline numberOfLines={3} value={tableState.note} onChangeText={t => setTableState({...tableState, note: t})} />
                
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)} disabled={isSaving}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSaveTable} disabled={isSaving}>
                  {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Table</Text>}
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
          minimumDate={new Date()} // Disable past dates
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
                    setTableState({ ...tableState, time: time });
                    setShowTimeDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText, 
                    tableState.time === time && styles.dropdownItemSelectedText
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
  sectionContainer: { marginBottom: 30, paddingHorizontal: 24, zIndex: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  horizontalScroll: { paddingRight: 24, marginHorizontal: -24, paddingLeft: 24 },
  tableCard: { width: 260, backgroundColor: '#FFFFFF', borderRadius: 16, marginRight: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4, padding: 16 },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tableTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  seatsBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  seatsText: { color: '#2E7D32', fontSize: 12, fontWeight: '700' },
  tableInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#666', width: 70 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1 },
  tableNote: { fontSize: 13, color: '#666', marginTop: 8, marginBottom: 12, fontStyle: 'italic', backgroundColor: '#F9F9F9', padding: 8, borderRadius: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
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
  datePickerPseudo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 12, height: 48 },
  pickerEmoji: { fontSize: 18, marginRight: 8 },
  pickerInputText: { flex: 1, fontSize: 15 },
  
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F5F5F5', marginRight: 10 },
  saveBtn: { backgroundColor: '#FF5A5F', marginLeft: 10 },
  cancelBtnText: { color: '#555', fontWeight: '600', fontSize: 16 },
  saveBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },

  // New Time Dropdown Styles
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  dropdownContainer: { width: '80%', backgroundColor: '#FFF', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  dropdownTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 10 },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropdownItemText: { fontSize: 16, color: '#333', textAlign: 'center' },
  dropdownItemSelectedText: { color: '#FF5A5F', fontWeight: '700' }
});

export default TableReservation;