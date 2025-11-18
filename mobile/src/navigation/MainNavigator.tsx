import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/theme';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PatientsScreen from '../screens/patients/PatientsScreen';
import AppointmentsScreen from '../screens/appointments/AppointmentsScreen';
import AIAssistantScreen from '../screens/ai-assistant/AIAssistantScreen';
import MoreScreen from '../screens/more/MoreScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Tableau de bord',
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Patients"
        component={PatientsScreen}
        options={{
          title: 'Patients',
          tabBarLabel: 'Patients',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: 'Rendez-vous',
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-clock" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{
          title: 'Assistant IA',
          tabBarLabel: 'IA',
          tabBarIcon: ({ color, size }) => (
            <Icon name="robot" size={size} color={color} />
          ),
          tabBarBadge: 'PRO',
          tabBarBadgeStyle: {
            backgroundColor: theme.colors.success,
            fontSize: 8,
          },
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          title: 'Plus',
          tabBarLabel: 'Plus',
          tabBarIcon: ({ color, size }) => <Icon name="menu" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
