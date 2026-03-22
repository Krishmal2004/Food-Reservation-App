import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';

const ALL_PACKAGES = [
  { id: '1', title: 'Couples Dinner', price: '$49.99', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974' },
  { id: '2', title: 'Family Feast', price: '$89.99', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069' },
  { id: '3', title: 'Party Special', price: '$129.99', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070' },
  { id: '4', title: 'Weekend Brunch', price: '$39.99', image: 'https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?q=80&w=2070' },
  { id: '5', title: 'Gourmet Selection', price: '$159.99', image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070' },
  { id: '6', title: 'Vegan Delight', price: '$69.99', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070' },
];

const SeeAllPackages = ({ navigation }: any) => {
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {ALL_PACKAGES.map(pkg => (
          <TouchableOpacity key={pkg.id} style={styles.packageCard} activeOpacity={0.9}>
            <Image source={{ uri: pkg.image }} style={styles.packageImage} />
            <View style={styles.packageInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.packageTitle}>{pkg.title}</Text>
                <Text style={styles.packagePrice}>{pkg.price}</Text>
              </View>
              <Text style={styles.packageDesc}>A delicious and curated selection of dishes perfect for any occasion.</Text>
              <TouchableOpacity style={styles.reserveBtn} activeOpacity={0.8}>
                <Text style={styles.reserveBtnText}>Reserve Package</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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