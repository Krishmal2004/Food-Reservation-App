import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { BASE_URL } from '../api';

interface Review {
  id: string;
  userEmail: string;
  rating: number;
  text: string;
  images: string[];
  date: string;
}

const ReviewSection = ({ restaurantId }: { restaurantId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!restaurantId) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${BASE_URL}/api/user/get-reviews/${restaurantId}`
        );
        const data = await response.json();

        if (response.ok && data.reviews) {
          const formatted: Review[] = data.reviews.map((r: any) => ({
            id: r._id,
            userEmail: r.userEmail || 'Anonymous',
            rating: r.rating,
            text: r.text,
            images: r.images || [],
            date: new Date(r.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          }));
          setReviews(formatted);

          if (formatted.length > 0) {
            const avg =
              formatted.reduce((sum, r) => sum + r.rating, 0) / formatted.length;
            setAverageRating(Math.round(avg * 10) / 10);
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [restaurantId]);

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5]
      .map(star => (star <= rating ? '★' : '☆'))
      .join('');
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionIcon}>💬</Text>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        {reviews.length > 0 && (
          <View style={styles.avgBadge}>
            <Text style={styles.avgText}>★ {averageRating}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color="#FF5A5F" style={{ marginVertical: 20 }} />
      ) : reviews.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🌟</Text>
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptySubtitle}>Be the first to share your experience!</Text>
        </View>
      ) : (
        reviews.map(review => (
          <View key={review.id} style={styles.reviewCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {review.userEmail.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardHeaderInfo}>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {review.userEmail}
                </Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingStars}>{renderStars(review.rating)}</Text>
                <Text style={styles.ratingNumber}>{review.rating}/5</Text>
              </View>
            </View>

            {/* Review Text */}
            {review.text ? (
              <View style={styles.reviewTextBox}>
                <Text style={styles.reviewText}>"{review.text}"</Text>
              </View>
            ) : null}

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesRow}
              >
                {review.images.map((uri, idx) => (
                  <Image
                    key={idx}
                    source={{ uri }}
                    style={styles.reviewImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: { fontSize: 22, marginRight: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', flex: 1 },
  avgBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  avgText: { color: '#F39C12', fontWeight: '800', fontSize: 14 },

  // Empty state
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECEE',
    borderStyle: 'dashed',
  },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: '#999' },

  // Review card
  reviewCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAECEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },
  cardHeaderInfo: { flex: 1 },
  userEmail: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  reviewDate: { fontSize: 12, color: '#888' },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingStars: { color: '#F39C12', fontSize: 13, letterSpacing: 1 },
  ratingNumber: { color: '#B7770D', fontSize: 11, fontWeight: '600', marginTop: 2 },

  reviewTextBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5A5F',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 22,
    fontStyle: 'italic',
  },

  imagesRow: { marginTop: 6 },
  reviewImage: {
    width: 110,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
});

export default ReviewSection;
