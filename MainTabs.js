import React from 'react';
import { BottomNavigation } from 'react-native-paper';

import Packing from './screens/Packing';
import Budget from './screens/Budget';
import Hotels from './screens/Hotels';
import Itinerary from './screens/Itinerary';
import MyTrips from './screens/MyTrips';

export default function MainTabs() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'trips', title: 'My trips', focusedIcon: 'palm-tree', unfocusedIcon: 'palm-tree' },
    { key: 'packing', title: 'Packing', focusedIcon: 'bag-suitcase', unfocusedIcon: 'bag-suitcase-outline' },
    { key: 'budget', title: 'Budget', focusedIcon: 'cash', unfocusedIcon: 'cash' },
    { key: 'hotels', title: 'Hotels', focusedIcon: 'office-building', unfocusedIcon: 'office-building-outline' },
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
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}
