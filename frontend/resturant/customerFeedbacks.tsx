import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../api';

const CustomerFeedbacks = ({ loggedInRestaurantId }: { loggedInRestaurantId?: string }) => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedbacks = async () => {
    if (!loggedInRestaurantId) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/user/restaurant-reviews/${loggedInRestaurantId}`);
      const data = await response.json();
      
      if (response.ok && data.reviews) {
        const formattedFeedbacks = data.reviews.map((r: any) => ({
          id: r._id,
          customer: r.userId?.fullName || 'Anonymous Customer', 
          text: r.text,
          rating: r.rating,
          date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));
        setFeedbacks(formattedFeedbacks);
      }
    } catch (error) {
      console.error('Error fetching customer feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeedbacks();
    }, [loggedInRestaurantId])
  );

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Customer Feedbacks</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#FF5A5F" />
      ) : feedbacks.length > 0 ? (
        feedbacks.map(fb => (
          <View key={fb.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{fb.customer}</Text>
              <Text style={styles.ratingText}>★ {fb.rating}</Text>
            </View>
            <Text style={styles.feedbackDate}>{fb.date}</Text>
            <Text style={styles.feedbackText}>"{fb.text}"</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No feedbacks yet.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 30, paddingHorizontal: 24, zIndex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },

  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', textTransform: 'capitalize' },
  ratingText: { color: '#F5B041', fontWeight: '700', fontSize: 14 },
  feedbackDate: { fontSize: 12, color: '#A0A0A0', marginBottom: 8 },
  feedbackText: { fontSize: 14, color: '#4A4A4A', fontStyle: 'italic' },
  emptyContainer: { padding: 20, backgroundColor: '#FFF', borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0', borderStyle: 'dashed' },
  emptyText: { color: '#A0A0A0', fontSize: 15, fontStyle: 'italic' }
});

export default CustomerFeedbacks;