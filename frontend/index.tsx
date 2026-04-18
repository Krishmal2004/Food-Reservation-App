import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LandingPage = ({ navigation }: { navigation: any }) => {
  const [showRoles, setShowRoles] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981&auto=format&fit=crop' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.contentContainer}>
              <View style={styles.textContainer}>
                <Text style={styles.brandName}>
                  CRAVE<Text style={styles.brandNameHighlight}>WAVE</Text>
                </Text>
                <Text style={styles.tagline}>
                  Discover the best foods from over 1,000 restaurants and get fast delivery to your doorstep.
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                {!showRoles ? (
                  <TouchableOpacity 
                    style={styles.loginButton}
                    activeOpacity={0.8}
                    onPress={() => setShowRoles(true)}
                  >
                    <Text style={styles.loginButtonText}>Get Started</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.loginButton}
                      activeOpacity={0.8}
                      onPress={() => { navigation.navigate('Login') }}
                    >
                      <Text style={styles.loginButtonText}>Customer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.signupButton}
                      activeOpacity={0.8}
                      onPress={() => { navigation.navigate('RestaurantLogin') }}
                    >
                      <Text style={styles.signupButtonText}>Restaurant</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Dark overlay for text readability
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    width: '100%',
  },
  textContainer: {
    marginBottom: 40,
  },
  brandName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 12,
  },
  brandNameHighlight: {
    color: '#FF5A5F',
  },
  tagline: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
    fontWeight: '500',
    paddingRight: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#FF5A5F',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5A5F',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signupButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default LandingPage;
