// App.js

import * as React from 'react';
import { BottomNavigation, Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-get-random-values';


import Packing from './screens/Packing';
import Budget from './screens/Budget';
import Hotels from './screens/Hotels';
import Itinerary from './screens/Itinerary';
import MyTrips from './screens/MyTrips'

export default function App() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'trips', title: 'My trips', focusedIcon: 'suitcase', unfocusedIcon: 'suitcase-outline' },
    { key: 'packing', title: 'Packing', focusedIcon: 'suitcase', unfocusedIcon: 'suitcase-outline' },
    { key: 'budget', title: 'Budget', focusedIcon: 'cash', unfocusedIcon: 'cash' },
    { key: 'hotels', title: 'Hotels', focusedIcon: 'hotel', unfocusedIcon: 'hotel' },
    { key: 'itinerary', title: 'Itinerary', focusedIcon: 'calendar', unfocusedIcon: 'calendar-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    packing: Packing,
    budget: Budget,
    hotels: Hotels,
    itinerary: Itinerary,
    trips: MyTrips,
  });

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
