import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../api';
//import SeeAllPackages from './SeeAllPackages';

const FoodPackagesList = () => {
  const navigation = useNavigation<any>();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPackages = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/resturant/get-all-food-packages`);
        const data = await response.json();
        
        if (response.ok && data.packages) {
          setPackages(data.packages);
        }
      } catch (error) {
        console.error('Error fetching food packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPackages();
  }, []);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Food Packages</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SeeAllPackages')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF5A5F" style={styles.loader} />
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {packages.map(pkg => (
            <TouchableOpacity key={pkg.id} style={styles.packageCard} activeOpacity={0.9}>
              <Image source={{ uri: pkg.image }} style={styles.packageImage} />
              <View style={styles.packageInfo}>
                <Text style={styles.packageTitle} numberOfLines={1}>{pkg.title}</Text>
                
                {/* Checks if the price already includes a currency symbol, if not, prepends a '$' */}
                <Text style={styles.packagePrice}>
                  {pkg.price.startsWith('$') || pkg.price.startsWith('Rs') || pkg.price.startsWith('€') 
                    ? pkg.price 
                    : `$${pkg.price}`}
                </Text>

                <TouchableOpacity style={styles.reserveButtonWrapper}>
                  <Text style={styles.reserveButtonText}>Reserve</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5A5F',
  },
  loader: {
    marginVertical: 20,
  },
  horizontalScroll: {
    paddingLeft: 24,
    paddingRight: 8,
  },
  packageCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  packageImage: {
    width: '100%',
    height: 130,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  packageInfo: {
    padding: 14,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF5A5F',
    marginBottom: 12,
  },
  reserveButtonWrapper: {
    backgroundColor: '#FFF0F1',
    borderWidth: 1,
    borderColor: '#FF5A5F',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#FF5A5F',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default FoodPackagesList;