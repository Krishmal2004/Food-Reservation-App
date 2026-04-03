import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface MobileMenuProps {
  loggedInEmail: string;
  activeTab?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ loggedInEmail, activeTab = 'Home' }) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => navigation.navigate('UserDashboard', { currentEmail: loggedInEmail })}
      >
        <View style={[styles.iconContainer, activeTab === 'Home' && styles.activeIconContainer]}>
          <Text style={[styles.icon, activeTab === 'Home' && styles.activeIcon]}>🏠</Text>
        </View>
        <Text style={[styles.label, activeTab === 'Home' && styles.activeLabel]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => navigation.navigate('SeeAllPackages')}
      >
        <View style={[styles.iconContainer, activeTab === 'Packages' && styles.activeIconContainer]}>
          <Text style={[styles.icon, activeTab === 'Packages' && styles.activeIcon]}>🍲</Text>
        </View>
        <Text style={[styles.label, activeTab === 'Packages' && styles.activeLabel]}>Packages</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => navigation.navigate('EventReservationShow', { currentEmail: loggedInEmail })}
      >
        <View style={[styles.iconContainer, activeTab === 'Events' && styles.activeIconContainer]}>
          <Text style={[styles.icon, activeTab === 'Events' && styles.activeIcon]}>📅</Text>
        </View>
        <Text style={[styles.label, activeTab === 'Events' && styles.activeLabel]}>Events</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => navigation.navigate('UserProfileEdit', { currentEmail: loggedInEmail })}
      >
        <View style={[styles.iconContainer, activeTab === 'Profile' && styles.activeIconContainer]}>
          <Text style={[styles.icon, activeTab === 'Profile' && styles.activeIcon]}>👤</Text>
        </View>
        <Text style={[styles.label, activeTab === 'Profile' && styles.activeLabel]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 10,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: '#FFF0F0',
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  activeIcon: {
    opacity: 1,
  },
  label: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#E74C3C',
    fontWeight: '700',
  },
});

export default MobileMenu;
