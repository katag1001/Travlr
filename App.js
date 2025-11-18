// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';

import MainTabs from './MainTabs';
import { TripProvider } from './components/TripContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <TripProvider>
          <NavigationContainer>
            <MainTabs />
          </NavigationContainer>
        </TripProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
