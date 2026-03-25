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
  ActivityIndicator,
  LayoutAnimation,
  UIManager
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TableDetails = ({ navigation, route }: any) => {
  // Accept both spellings to be safe, as RestaurantDetails passes 'restaurant'
  const { restaurant, resturant, userEmail } = route?.params || {};
  const currentRestaurant = restaurant || resturant;
  
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [restaurantTables, setRestaurantTables] = useState<Record<string, any[]>>({});
  const [loadingTables, setLoadingTables] = useState<Record<string, boolean>>({});

  // Initialize the restaurant list with the passed restaurant
  useEffect(() => {
    if (currentRestaurant) {
      setRestaurants([currentRestaurant]);
      const actualRestId = currentRestaurant._id || currentRestaurant.id;
      
      // Auto-expand and fetch tables for the passed restaurant
      if (actualRestId) {
        setExpandedId(actualRestId);
        fetchTablePackages(actualRestId);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [currentRestaurant]);

  const fetchTablePackages = async (restaurantId: string) => {
    setLoadingTables(prev => ({ ...prev, [restaurantId]: true }));
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/resturant/get-table-packages/${restaurantId}`);
      const data = await response.json();

      if(response.ok && data.tables) {
        setRestaurantTables(prev => ({ ...prev, [restaurantId]: data.tables }));
      }
    } catch(error) {
      console.error("Error fetching table packages for restaurant:", error);
    } finally {
      setLoadingTables(prev => ({ ...prev, [restaurantId]: false }));
      setIsLoading(false);
    }
  };

  const toggleRestaurant = async (restaurantId: string) => {
    if (!restaurantId) return; 
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    if (expandedId === restaurantId) {
       setExpandedId(null);
       return;
    }
    
    setExpandedId(restaurantId);
    
    // Fetch tables if we haven't already
    if (!restaurantTables[restaurantId]) {
      fetchTablePackages(restaurantId);
    }
  };

  const handleBookTable = (rest: any, table: any, actualRestId: string) => {
    navigation.navigate('TableReservationDetails', {
      userEmail,
      restaurant: { ...rest, id: actualRestId },
      package: null,
      tablePackage: table
    });
  };

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
        <Text style={styles.headerTitle}>Available Tables</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF5A5F" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageSubtitle}>Browse restaurants and find the perfect table for your next visit.</Text>
          
          {restaurants.length === 0 ? (
             <Text style={styles.emptyText}>No restaurants found.</Text>
          ) : (
            restaurants.map((rest: any) => {
              const actualRestId = rest._id || rest.id;
              const isExpanded = expandedId === actualRestId;
              const tables = restaurantTables[actualRestId] || [];
              const isLoadingTables = loadingTables[actualRestId];
              const restName = rest.restaurantName || rest.name || 'Unknown Restaurant';
              
              return (
                <View key={actualRestId} style={styles.restaurantCard}>
                  <TouchableOpacity 
                    style={styles.restaurantHeader} 
                    activeOpacity={0.9}
                    onPress={() => toggleRestaurant(actualRestId)}
                  >
                    <Image 
                      source={{ uri: rest.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070' }} 
                      style={styles.restaurantImage} 
                    />
                    <View style={styles.restaurantInfo}>
                      <Text style={styles.restaurantName} numberOfLines={1}>{restName}</Text>
                      <Text style={styles.restaurantSub}>{rest.cuisine || 'Restaurant'} • ★ {rest.rating || '5.0'}</Text>
                    </View>
                    <View style={styles.expandIconContainer}>
                      <Text style={styles.expandIcon}>{isExpanded ? '⌃' : '⌄'}</Text>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.tablesContainer}>
                      <View style={styles.tablesHeaderRow}>
                         <Text style={styles.tablesSectionTitle}>Available Tables</Text>
                      </View>
                      
                      {isLoadingTables ? (
                        <ActivityIndicator size="small" color="#FF5A5F" style={{ marginVertical: 20 }} />
                      ) : tables.length === 0 ? (
                        <Text style={styles.noTablesText}>No tables currently available for this restaurant.</Text>
                      ) : (
                        tables.map((table: any) => (
                          <View key={table.id} style={styles.tableCard}>
                            <View style={styles.tableHeaderRow}>
                              <Text style={styles.tableTitle}>{table.tableNumber}</Text>
                              <View style={styles.seatsBadge}>
                                <Text style={styles.seatsText}>{table.seats} Seats</Text>
                              </View>
                            </View>

                            <View style={styles.tableDetailsGrid}>
                              {/* --- ADDED PRICE FIELD HERE --- */}
                              <View style={styles.tableInfoCol}>
                                <Text style={styles.infoLabel}>💰 Price</Text>
                                <Text style={[styles.infoValue, { color: '#FF5A5F' }]}>
                                  ${table.price || '0'}
                                </Text>
                              </View>
                              <View style={styles.tableInfoCol}>
                                <Text style={styles.infoLabel}>📅 Date</Text>
                                <Text style={styles.infoValue}>{table.date}</Text>
                              </View>
                              <View style={styles.tableInfoCol}>
                                <Text style={styles.infoLabel}>⏰ Time</Text>
                                <Text style={styles.infoValue}>{table.time}</Text>
                              </View>
                            </View>

                            {table.note ? (
                              <View style={styles.noteContainer}>
                                <Text style={styles.tableNote} numberOfLines={3}>📝 {table.note}</Text>
                              </View>
                            ) : null}

                            <TouchableOpacity 
                              style={styles.bookBtn} 
                              activeOpacity={0.8}
                              onPress={() => handleBookTable(rest, table, actualRestId)}
                            >
                              <Text style={styles.bookBtnText}>Book This Table</Text>
                            </TouchableOpacity>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </View>
              );
            })
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
    zIndex: 10,
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#7F8C8D',
    marginBottom: 20,
    lineHeight: 22,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 40,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  restaurantSub: {
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  expandIconContainer: {
    width: 30,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  expandIcon: {
    fontSize: 24,
    color: '#BDC3C7',
    fontWeight: '300',
  },
  tablesContainer: {
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16,
    paddingTop: 20,
  },
  tablesHeaderRow: {
    marginBottom: 16,
  },
  tablesSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34495E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noTablesText: {
    color: '#95A5A6',
    fontStyle: 'italic',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAECEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  seatsBadge: {
    backgroundColor: '#E8F6F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seatsText: {
    color: '#16A085',
    fontSize: 12,
    fontWeight: '800',
  },
  tableDetailsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F8F9F9',
    borderRadius: 8,
    padding: 12,
  },
  tableInfoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
  },
  noteContainer: {
    backgroundColor: '#FEF9E7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F1C40F',
  },
  tableNote: {
    fontSize: 13,
    color: '#7D6608',
    lineHeight: 18,
  },
  bookBtn: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default TableDetails;