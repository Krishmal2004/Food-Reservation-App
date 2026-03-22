import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Accept userEmail as a prop
const UserFeedbacks = ({ userEmail }: { userEmail?: string }) => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete' | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  // Edit State
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState('');

  // Fetch feedbacks from DB
  const fetchFeedbacks = async () => {
    if (!userEmail) return;
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/user/show-reviews/${userEmail}`);
      const data = await response.json();
      
      if (response.ok && data.reviews) {
        // Format data for our UI
        const formattedFeedbacks = data.reviews.map((r: any) => ({
          id: r._id,
          restaurant: r.restaurantId?.restaurantName || 'Unknown Restaurant',
          text: r.text,
          rating: r.rating,
          date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));
        setFeedbacks(formattedFeedbacks);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run this every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFeedbacks();
    }, [userEmail])
  );

  const openModal = (type: 'view' | 'edit' | 'delete', feedback: any) => {
    setSelectedFeedback(feedback);
    setModalType(type);
    if (type === 'edit') {
      setEditRating(feedback.rating);
      setEditText(feedback.text);
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      setModalType(null);
      setSelectedFeedback(null);
    }, 300);
  };

  // Note: For actual delete/edit, you will need new backend routes (PUT/DELETE) later.
  // For now, this just updates the local state so the UI works.
  const confirmDelete = () => {
    if (selectedFeedback) {
      setFeedbacks(feedbacks.filter(fb => fb.id !== selectedFeedback.id));
    }
    closeModal();
  };

  const saveEdit = () => {
    if (selectedFeedback) {
      setFeedbacks(feedbacks.map(fb => 
        fb.id === selectedFeedback.id 
          ? { ...fb, text: editText, rating: editRating } 
          : fb
      ));
    }
    closeModal();
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Feedbacks</Text>
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF5A5F" style={{ marginTop: 20 }} />
      ) : feedbacks.length > 0 ? (
        feedbacks.map(fb => (
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
              <TouchableOpacity style={[styles.actionPill, styles.viewPill]} onPress={() => openModal('view', fb)} activeOpacity={0.7}>
                <Text style={[styles.actionText, styles.viewText]}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionPill, styles.editPill]} onPress={() => openModal('edit', fb)} activeOpacity={0.7}>
                <Text style={[styles.actionText, styles.editText]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionPill, styles.deletePill]} onPress={() => openModal('delete', fb)} activeOpacity={0.7}>
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>You have no feedbacks yet.</Text>
        </View>
      )}

      {/* KEEP ALL YOUR EXISTING MODAL CODE EXACTLY THE SAME BELOW THIS LINE */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            
            {/* VIEW MODAL */}
            {modalType === 'view' && selectedFeedback && (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>{selectedFeedback.restaurant}</Text>
                  <View style={styles.ratingBadgeLarge}>
                    <Text style={styles.ratingTextLarge}>★ {selectedFeedback.rating}</Text>
                  </View>
                </View>
                <Text style={styles.modalDate}>Posted on {selectedFeedback.date}</Text>
                <View style={styles.modalBody}>
                  <Text style={styles.modalBodyText}>"{selectedFeedback.text}"</Text>
                </View>
                <TouchableOpacity style={[styles.modalButton, styles.primaryButton]} onPress={closeModal}>
                  <Text style={styles.primaryButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}

            {/* EDIT MODAL */}
            {modalType === 'edit' && selectedFeedback && (
              <>
                <Text style={styles.modalTitle}>Edit Feedback</Text>
                <Text style={styles.modalSubtitle}>{selectedFeedback.restaurant}</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Rating</Text>
                  <View style={styles.starSelectionContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} style={styles.starButton} onPress={() => setEditRating(star)} activeOpacity={0.7}>
                        <Text style={[styles.starIcon, editRating >= star ? styles.starIconActive : styles.starIconInactive]}>★</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Review</Text>
                  <TextInput style={[styles.input, styles.textArea]} value={editText} onChangeText={setEditText} multiline numberOfLines={4} textAlignVertical="top" />
                </View>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity style={[styles.modalButtonRowBtn, styles.cancelButton]} onPress={closeModal}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButtonRowBtn, styles.saveButton]} onPress={saveEdit}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* DELETE MODAL */}
            {modalType === 'delete' && selectedFeedback && (
              <>
                <View style={styles.deleteIconContainer}>
                   <Text style={styles.deleteIconText}>🗑️</Text>
                </View>
                <Text style={styles.modalTitleCentered}>Delete Feedback?</Text>
                <Text style={styles.modalSubtitleCentered}>Are you sure you want to delete your feedback for {selectedFeedback.restaurant}? This action cannot be undone.</Text>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity style={[styles.modalButtonRowBtn, styles.cancelButton]} onPress={closeModal}>
                    <Text style={styles.cancelButtonText}>Keep It</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButtonRowBtn, styles.destructiveButton]} onPress={confirmDelete}>
                    <Text style={styles.destructiveButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// KEEP YOUR EXACT SAME STYLES HERE...
const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  feedbackCard: { backgroundColor: '#FFFFFF', marginHorizontal: 24, marginBottom: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  feedbackTitleContainer: { flex: 1 },
  feedbackRestaurant: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  feedbackDate: { fontSize: 12, color: '#888888', fontWeight: '500' },
  ratingBadge: { backgroundColor: '#FFF8E1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginLeft: 10 },
  ratingText: { color: '#F39C12', fontWeight: '800', fontSize: 12 },
  feedbackText: { fontSize: 14, color: '#4A4A4A', lineHeight: 22, fontStyle: 'italic', marginBottom: 18 },
  feedbackActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  actionPill: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  viewPill: { backgroundColor: '#EBF5FB' },
  viewText: { color: '#2980B9' },
  editPill: { backgroundColor: '#FEF5E7' },
  editText: { color: '#D68910' },
  deletePill: { backgroundColor: '#FDEDEC' },
  deleteText: { color: '#E74C3C' },
  emptyStateContainer: { padding: 24, alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 24, borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', borderStyle: 'dashed' },
  emptyStateText: { fontSize: 15, color: '#A0A0A0', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', flex: 1 },
  modalTitleCentered: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 12 },
  modalSubtitle: { fontSize: 16, color: '#888888', marginBottom: 20, fontWeight: '500' },
  modalSubtitleCentered: { fontSize: 15, color: '#666666', marginBottom: 24, textAlign: 'center', lineHeight: 22 },
  modalDate: { fontSize: 13, color: '#888888', marginBottom: 20 },
  ratingBadgeLarge: { backgroundColor: '#FFF8E1', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginLeft: 10 },
  ratingTextLarge: { color: '#F39C12', fontWeight: '800', fontSize: 14 },
  modalBody: { backgroundColor: '#F8F9F9', padding: 20, borderRadius: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#2980B9' },
  modalBodyText: { fontSize: 16, color: '#333333', lineHeight: 24, fontStyle: 'italic' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#4A4A4A', marginBottom: 8 },
  input: { backgroundColor: '#F8F9F9', borderWidth: 1, borderColor: '#EAECEE', borderRadius: 12, padding: 14, fontSize: 16, color: '#1A1A1A' },
  textArea: { height: 100 },
  starSelectionContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 12 },
  starButton: { padding: 2 },
  starIcon: { fontSize: 42 },
  starIconActive: { color: '#F39C12' },
  starIconInactive: { color: '#EAECEE' },
  modalButton: { width: '100%', padding: 16, borderRadius: 14, alignItems: 'center' },
  primaryButton: { backgroundColor: '#2980B9' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalButtonRowBtn: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center' },
  cancelButton: { backgroundColor: '#F2F4F4' },
  cancelButtonText: { color: '#7F8C8D', fontSize: 16, fontWeight: '700' },
  saveButton: { backgroundColor: '#27AE60' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  destructiveButton: { backgroundColor: '#E74C3C' },
  destructiveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  deleteIconContainer: { alignItems: 'center', marginBottom: 16, backgroundColor: '#FDEDEC', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignSelf: 'center' },
  deleteIconText: { fontSize: 30 },
});

export default UserFeedbacks;