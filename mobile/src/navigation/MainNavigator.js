import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

import DashboardScreen from '../screens/DashboardScreen';
import ClientsScreen from '../screens/ClientsScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import UsersScreen from '../screens/UsersScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Title>Profile</Title>
      <Paragraph style={{ marginTop: 20 }}>
        {user?.firstName} {user?.lastName}
      </Paragraph>
      <Paragraph>{user?.email}</Paragraph>
      <Paragraph>{user?.phoneNumber}</Paragraph>
      <Paragraph style={{ marginTop: 10, fontWeight: 'bold' }}>
        {user?.role === 'SCHEDULER' ? 'Scheduler' : 'Healthcare Worker'}
      </Paragraph>
      <Button
        mode="contained"
        onPress={logout}
        style={{ marginTop: 30 }}
        icon="logout"
      >
        Logout
      </Button>
    </View>
  );
};

const MainTabs = () => {
  const { user } = useAuth();
  const isScheduler = user?.role === 'SCHEDULER';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'view-dashboard';
          } else if (route.name === 'Clients') {
            iconName = 'account-group';
          } else if (route.name === 'Appointments') {
            iconName = 'calendar-clock';
          } else if (route.name === 'Users') {
            iconName = 'account-multiple';
          } else if (route.name === 'Profile') {
            iconName = 'account-circle';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Clients" 
        component={ClientsScreen}
        options={{ title: 'Clients' }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      {isScheduler && (
        <Tab.Screen 
          name="Users" 
          component={UsersScreen}
          options={{ title: 'Users' }}
        />
      )}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated ? <MainTabs /> : <AuthStack />;
};

export default MainNavigator;
