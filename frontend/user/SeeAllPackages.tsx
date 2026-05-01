import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { BASE_URL } from '../api';

const SeeAllPackages = ({ navigation }: any) => {
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
        console.error('Error fetching all food packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPackages();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} // Expands touch target
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonIcon}>❮</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>All Food Packages</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {packages.map(pkg => (
            <TouchableOpacity key={pkg.id} style={styles.packageCard} activeOpacity={0.9}>
              <Image source={{ uri: pkg.image }} style={styles.packageImage} />
              <View style={styles.packageInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.packageTitle}>{pkg.title}</Text>
                  
                  {/* Checks if the price already includes a currency symbol, if not, prepends a '$' */}
                  <Text style={styles.packagePrice}>
                    {pkg.price.startsWith('$') || pkg.price.startsWith('Rs') || pkg.price.startsWith('€') 
                      ? pkg.price 
                      : `$${pkg.price}`}
                  </Text>
                </View>
                
                {/* Dynamically loads the note, falls back to a default description if none exists */}
                <Text style={styles.packageDesc}>
                  {pkg.note || 'A delicious and curated selection of dishes perfect for any occasion.'}
                </Text>
                
                <TouchableOpacity style={styles.reserveBtn} activeOpacity={0.8}>
                  <Text style={styles.reserveBtnText}>Reserve Package</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    // FIX: Push header down safely below Android status bar
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEE',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F4F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonIcon: {
    fontSize: 20,
    color: '#333333',
    fontWeight: '800',
    marginLeft: -2, // Visually centers the chevron inside the circle
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 44,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  packageImage: {
    width: '100%',
    height: 180,
  },
  packageInfo: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    flex: 1,
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF5A5F',
  },
  packageDesc: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 22,
    marginBottom: 16,
  },
  reserveBtn: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  reserveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SeeAllPackages;