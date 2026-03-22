import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';

const UserProfileEdit = ({ navigation, route }: { navigation: any, route: any }) => {
  // Replace this with the actual logged-in user's email passed from the previous screen
  const currentEmail = route.params?.currentEmail || 'your_actual_test_email@gmail.com'; 

  // Start with empty strings instead of 'John Doe'
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); 
  // --- NEW: FETCH USER DATA WHEN SCREEN LOADS ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:5000/api/auth/profile/${currentEmail}`);
        const rawText = await response.text();
        try {
          const data = JSON.parse(rawText);
          if(response.ok && data.user) {
            setFullName(data.user.fullName);
            setMobileNumber(data.user.mobileNumber);
            setEmail(data.user.email);
          }
        } catch (jsonError) {
          console.error("❌ Backend did not send JSON! Raw response was:", rawText);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [currentEmail]);
  const handleSave = async () => {
    if (!fullName || !mobileNumber || !email) {
      Alert.alert('Validation Error', 'Name, mobile, and email cannot be empty.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/auth/update-profile/${currentEmail}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentEmail: currentEmail, 
          fullName,
          mobileNumber,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Update Failed', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Network Error', 'Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show a loading spinner while fetching the data from the database
  if (isFetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF5A5F" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          disabled={isLoading}
        >
          <Text style={styles.backButtonIcon}>❮</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <TouchableOpacity
          style={styles.headerTextButton}
          onPress={handleSave}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FF5A5F" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Avatar Section */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.avatarImage}
              />
              <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.8}>
                <Text style={styles.editAvatarIcon}>📷</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.6}>
              <Text style={styles.changePictureText}>Change Picture</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#A0A0A0"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="Enter your mobile number"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password (Optional)</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Leave blank to keep current"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                editable={!isLoading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ... KEEP YOUR EXISTING STYLES AT THE BOTTOM ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    height: Platform.OS === 'android' ? 56 + (StatusBar.currentHeight || 0) : 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },

  headerIconButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },

  headerTextButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },

  backButtonIcon: {
    fontSize: 24,
    color: '#333333',
    fontWeight: '800',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5A5F',
  },

  keyboardView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  avatarContainer: { alignItems: 'center', marginVertical: 30 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },

  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF5A5F',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  editAvatarIcon: { fontSize: 14, color: '#FFFFFF' },
  changePictureText: { fontSize: 14, fontWeight: '600', color: '#FF5A5F' },

  formContainer: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 20 },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    marginLeft: 4,
  },

  input: {
    backgroundColor: '#F7F7F7',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
});

export default UserProfileEdit;