import React from 'react';
import BusinessAnalytics from './BusinessAnalytics';
import BusinessSettings from './BusinessSettings';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BusinessHome from './BusinessHome';

const Tab = createBottomTabNavigator();

const Business = () => {
  // Mock account information (replace with actual user data)

  return (
    <Tab.Navigator initialRouteName='Home'>
      <Tab.Screen name='Home' component={BusinessHome}/>
      <Tab.Screen name='Analytics' component={BusinessAnalytics}/>
      <Tab.Screen name='Settings' component={BusinessSettings}/>
    </Tab.Navigator>
  );
};

export default Business;
