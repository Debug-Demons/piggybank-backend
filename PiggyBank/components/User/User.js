import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import UserHome from './UserHome';
import UserAnalytics from './UserAnalytics';
import UserSettings from './UserSettings';

const Tab = createBottomTabNavigator();

const User = () => {
    <Tab.Navigator initialRouteName='Home'>
        <Tab.Screen name='Home' component={UserHome} />
        <Tab.Screen name='Analytics' component={UserAnalytics} />
        <Tab.Screen name='Settings' component={UserSettings} />
    </Tab.Navigator>
}

export default User;