import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';

const BookNow = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real restaurants from MongoDB
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/auth/all-resturants');
        const data = await response.json();

        if (response.ok && data.allResturants) {
          const formattedRestaurants = data.allResturants.map((res: any, index: number) => ({
            id: res._id,
            name: res.restaurantName,
            rating: (4 + Math.random()).toFixed(1), // Random rating between 4.0 - 5.0
            cuisine: index % 2 === 0 ? 'International' : 'Continental',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070', 
            packages: [
              { id: 'p1', name: 'Standard Package', price: '$49.99' }
            ],
            reservationsAvailable: ['18:00', '19:30', '21:00']
          }));
          
          setRestaurants(formattedRestaurants);
        }
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(r => 
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonIcon}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Table</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisines..."
            placeholderTextColor="#A0A0A0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {filteredRestaurants.map(restaurant => {
            return (
              <TouchableOpacity 
                key={restaurant.id} 
                style={styles.restaurantCard}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('RestaurantDetails', { restaurant })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <Text style={styles.restaurantCuisine}>{restaurant.cuisine} • ★ {restaurant.rating}</Text>
                  </View>
                  <View style={styles.navIconContainer}>
                     <Text style={styles.navIconText}>❯</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredRestaurants.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No restaurants found matching "{searchQuery}".</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#A0A0A0',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    marginLeft: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSpacer: {
    width: 44,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F4',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    padding: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleContainer: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  navIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9EBEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#A0A0A0',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default BookNow;