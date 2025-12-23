import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-get-random-values';

import { TripProvider } from './components/TripContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './screens/Home';
import Packing from './screens/Packing';
import Budget from './screens/Budget';
import Hotels from './screens/Hotels';
import Itinerary from './screens/Itinerary';
import Transport from './screens/Transport';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <TripProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Packing" component={Packing} />
            <Stack.Screen name="Budget" component={Budget} />
            <Stack.Screen name="Hotels" component={Hotels} />
            <Stack.Screen name="Itinerary" component={Itinerary} />
            <Stack.Screen name="Transport" component={Transport} />
          </Stack.Navigator>
        </NavigationContainer>
      </TripProvider>
    </PaperProvider>
  );
}
