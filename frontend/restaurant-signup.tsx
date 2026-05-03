import React, { useState } from 'react';
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
  useWindowDimensions,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { BASE_URL } from './api';

const RestaurantSignup = ({ navigation }: { navigation: any }) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Government approval form
  const [approvalImage, setApprovalImage] = useState<string | null>(null);
  const [isPickingImage, setIsPickingImage] = useState(false);

  const { width, height } = useWindowDimensions();

  const pickApprovalImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
      includeBase64: true,
    };
    setIsPickingImage(true);
    launchImageLibrary(options, (response) => {
      setIsPickingImage(false);
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Could not open image library.');
        return;
      }
      if (response.assets && response.assets[0]?.base64) {
        setApprovalImage(`data:image/jpeg;base64,${response.assets[0].base64}`);
      }
    });
  };

  const handleSignup = async () => {
    if (!restaurantName || !email || !password) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }
    if (!approvalImage) {
      Alert.alert('Validation Error', 'Please upload your Government Approval Form to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register-restaurant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName,
          email,
          password,
          approvalFormImage: approvalImage,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Restaurant account created successfully! We will review your approval form shortly.');
        navigation.navigate('RestaurantLogin');
      } else {
        Alert.alert('Signup Failed', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Network Error', 'Could not connect to the server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { minHeight: height * 0.9 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('RestaurantLogin')}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonIcon}>❮</Text>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Partner with Us</Text>
            <Text style={styles.subtitle}>
              Register your restaurant and reach more customers.
            </Text>
          </View>

          <View style={styles.formContainer}>

            {/* Restaurant Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Restaurant Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your restaurant name"
                placeholderTextColor="#A0A0A0"
                value={restaurantName}
                onChangeText={setRestaurantName}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="restaurant@example.com"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* ── Government Approval Form Upload ── */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Government Approval Form <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.uploadHint}>
                Upload a clear photo or scan of your official business / government registration document.
              </Text>

              {approvalImage ? (
                /* Preview */
                <View style={styles.previewContainer}>
                  <Image
                    source={{ uri: approvalImage }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <View style={styles.previewBadge}>
                    <Text style={styles.previewBadgeText}>✔ Document Uploaded</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.reuploadBtn}
                    onPress={pickApprovalImage}
                    activeOpacity={0.7}
                    disabled={isPickingImage}
                  >
                    <Text style={styles.reuploadBtnText}>🔄 Replace Document</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Upload trigger */
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={pickApprovalImage}
                  activeOpacity={0.7}
                  disabled={isPickingImage}
                >
                  {isPickingImage ? (
                    <ActivityIndicator size="large" color="#FF5A5F" />
                  ) : (
                    <>
                      <Text style={styles.uploadIcon}>📄</Text>
                      <Text style={styles.uploadTitle}>Tap to Upload Document</Text>
                      <Text style={styles.uploadSubtitle}>
                        JPG / PNG · Max 5 MB
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Notice */}
            <View style={styles.noticeBox}>
              <Text style={styles.noticeIcon}>ℹ️</Text>
              <Text style={styles.noticeText}>
                Your approval form will be reviewed by our team before your account is activated. This typically takes 1–2 business days.
              </Text>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && { opacity: 0.7 }]}
              activeOpacity={0.8}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>Create Restaurant Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('RestaurantLogin')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: '6%',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 20,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    alignSelf: 'flex-start',
  },
  backButtonIcon: { fontSize: 20, color: '#333333', marginRight: 6, fontWeight: '700' },
  backButtonText: { fontSize: 16, color: '#333333', fontWeight: '600' },
  headerContainer: { marginBottom: 32 },
  title: { fontSize: 34, fontWeight: '800', color: '#1A1A1A', marginBottom: 10, letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: '#666666', lineHeight: 24 },

  formContainer: { flex: 1, marginBottom: 30 },
  inputGroup: { marginBottom: 22 },
  label: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 10, marginLeft: 4 },
  required: { color: '#FF5A5F' },
  input: {
    backgroundColor: '#F7F7F7',
    height: 58,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },

  /* Upload hint */
  uploadHint: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
    marginLeft: 4,
    lineHeight: 20,
  },

  /* Upload dashed box */
  uploadBox: {
    borderWidth: 2,
    borderColor: '#FF5A5F',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    gap: 8,
  },
  uploadIcon: { fontSize: 40 },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: '#FF5A5F' },
  uploadSubtitle: { fontSize: 12, color: '#AA5050' },

  /* Preview */
  previewContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#EAECEE' },
  previewImage: { width: '100%', height: 200 },
  previewBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    alignItems: 'center',
  },
  previewBadgeText: { color: '#2E7D32', fontWeight: '700', fontSize: 14 },
  reuploadBtn: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    alignItems: 'center',
  },
  reuploadBtnText: { color: '#555', fontWeight: '600', fontSize: 14 },

  /* Notice */
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF5FB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    alignItems: 'flex-start',
    gap: 10,
  },
  noticeIcon: { fontSize: 18, marginTop: 1 },
  noticeText: { flex: 1, fontSize: 13, color: '#2471A3', lineHeight: 20 },

  /* Button */
  signupButton: {
    backgroundColor: '#FF5A5F',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signupButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },

  /* Footer */
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
  footerText: { fontSize: 15, color: '#666666' },
  loginText: { fontSize: 15, fontWeight: '700', color: '#FF5A5F' },
});

export default RestaurantSignup;