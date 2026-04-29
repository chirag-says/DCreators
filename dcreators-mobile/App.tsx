import React, { useEffect } from 'react';
import { useAuthStore } from './src/store/useAuthStore';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import BottomNavigation from './src/components/BottomNavigation';

import AnimatedSplashScreen from './src/screens/AnimatedSplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import IntroScreen from './src/screens/IntroScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CreatorProfileScreen from './src/screens/CreatorProfileScreen';
import CreatorOnboarding from './src/screens/CreatorOnboarding';
import AssignProjectScreen from './src/screens/AssignProjectScreen';
import SearchScreen from './src/screens/SearchScreen';
import FloatingQueryScreen from './src/screens/FloatingQueryScreen';
import ClientReviewScreen from './src/screens/ClientReviewScreen';
import ClientOnboardingScreen from './src/screens/ClientOnboardingScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import FilterScreen from './src/screens/FilterScreen';
import ClientWorkorderScreen from './src/screens/ClientWorkorderScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AssignMultipleScreen from './src/screens/AssignMultipleScreen';
import TermsScreen from './src/screens/TermsScreen';
import PortfolioGalleryScreen from './src/screens/PortfolioGalleryScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import FinalizeOfferScreen from './src/screens/FinalizeOfferScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import CreatorWorkorderScreen from './src/screens/CreatorWorkorderScreen';
import InvoiceScreen from './src/screens/InvoiceScreen';
import SavedCreatorsScreen from './src/screens/SavedCreatorsScreen';
import RatingReviewScreen from './src/screens/RatingReviewScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProductDetailsScreen from './src/screens/ProductDetailsScreen';
import MenuScreen from './src/screens/MenuScreen';
import MessagesListScreen from './src/screens/MessagesListScreen';
import EditConsultantProfileScreen from './src/screens/EditConsultantProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator 
      tabBar={(props) => <BottomNavigation {...props} />} 
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="CreatorProfile" component={CreatorProfileScreen} />
      <Tab.Screen name="AssignProject" component={AssignProjectScreen} />
      <Tab.Screen name="FloatingQuery" component={FloatingQueryScreen} />
      <Tab.Screen name="CreatorWorkorder" component={CreatorWorkorderScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#e8e8e8' } }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={AnimatedSplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="CreatorOnboarding" component={CreatorOnboarding} />
        <Stack.Screen name="ClientOnboarding" component={ClientOnboardingScreen} />
        
        {/* Main Logged-In Flow with Fixed Bottom Navigation */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Sub-screens (Bottom Nav hidden automatically when pushed) */}
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="EditConsultantProfile" component={EditConsultantProfileScreen} />
        <Stack.Screen name="AssignMultiple" component={AssignMultipleScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="FinalizeOffer" component={FinalizeOfferScreen} />
        <Stack.Screen name="ClientWorkorder" component={ClientWorkorderScreen} />
        <Stack.Screen name="ClientReview" component={ClientReviewScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />

        {/* Modals and Overlays */}
        <Stack.Screen name="Filter" component={FilterScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="PortfolioGallery" component={PortfolioGalleryScreen} options={{ presentation: 'fullScreenModal' }} />
        
        {/* Full screen features where bottom nav is usually hidden */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Invoice" component={InvoiceScreen} />
        <Stack.Screen name="SavedCreators" component={SavedCreatorsScreen} />
        <Stack.Screen name="RatingReview" component={RatingReviewScreen} />
        <Stack.Screen name="Shop" component={ShopScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} options={{ animation: 'slide_from_left' }} />
        <Stack.Screen name="MessagesList" component={MessagesListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
