import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const CUSTOMER_FEEDBACKS = [
  { id: '1', customer: 'Alice Smith', text: 'Amazing food and great atmosphere!', rating: 5, date: 'Oct 24, 2024' },
  { id: '2', customer: 'Charlie Brown', text: 'Delivery was a bit late, but good.', rating: 4, date: 'Oct 15, 2024' },
];

const CustomerFeedbacks = () => {
  return (
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  ratingText: { color: '#F5B041', fontWeight: '700', fontSize: 14 },
  feedbackDate: { fontSize: 12, color: '#A0A0A0', marginBottom: 8 },
  feedbackText: { fontSize: 14, color: '#4A4A4A', fontStyle: 'italic' },
});

export default CustomerFeedbacks;