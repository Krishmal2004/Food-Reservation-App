import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BookTableBanner = () => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity style={styles.bookingBanner} activeOpacity={0.8} onPress={() => navigation.navigate('BookNow')}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070' }}
        style={styles.bookingBannerImage}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.bookingBannerOverlay}>
          <Text style={styles.bookingBannerTitle}>Book a Table</Text>
          <Text style={styles.bookingBannerSub}>Skip the wait and reserve your spot instantly.</Text>
          <View style={styles.whiteButton}>
            <Text style={styles.whiteButtonText}>Book Now</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bookingBanner: {
    marginHorizontal: 24,
    marginBottom: 30,
    height: 160,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  bookingBannerImage: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingBannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
  },
  bookingBannerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  bookingBannerSub: {
    color: '#E0E0E0',
    fontSize: 14,
    marginBottom: 16,
    maxWidth: '80%',
  },
  whiteButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  whiteButtonText: {
    color: '#FF5A5F',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default BookTableBanner;