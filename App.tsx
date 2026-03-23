import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image,View } from 'react-native';

// Import your screens
import LandingPage from './frontend/index';
import SignupScreen from './frontend/signup';
import LoginScreen from './frontend/login';
import UserDashboard from './frontend/user-dashboard';
import UserProfileEdit from './frontend/user-profile-edit';
import RestaurantSignup from './frontend/restaurant-signup';
import RestaurantLogin from './frontend/restaurant-login';
import RestaurantDashboard from './frontend/resturant-dashboard';
import SeeAllPackages from './frontend/user/SeeAllPackages';
import BookNow from './frontend/user/BookNow';
import RestaurantDetails from './frontend/user/RestaurantDetails';
import ReservationDetails from './frontend/user/ReservationDetails';
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen
          name="Landing"
          component={LandingPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="UserDashboard"
          component={UserDashboard}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="UserProfileEdit"
          component={UserProfileEdit}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RestaurantSignup"
          component={RestaurantSignup}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RestaurantLogin"
          component={RestaurantLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RestaurantDashboard"
          component={RestaurantDashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SeeAllPackages"
          component={SeeAllPackages}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookNow"
          component={BookNow}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RestaurantDetails"
          component={RestaurantDetails}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ReservationDetails"
          component={ReservationDetails}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    
  );
};

export default App;