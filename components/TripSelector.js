
import React, { useEffect, useState } from 'react';
import { View, Keyboard } from 'react-native';
import { Menu, Button } from 'react-native-paper';
import { getTrips } from '../storage/tripStorage';

export default function TripSelector({ selectedTripId, onSelectTrip }) {
  const [trips, setTrips] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const loadTrips = async () => {
      const tr = await getTrips();
      setTrips(tr);
    };
    loadTrips();
  }, [selectedTripId, menuVisible]);

  const selectedTrip = trips.find(t => t.id === selectedTripId);

  const openMenu = () => {
    Keyboard.dismiss();
    setMenuVisible(true);
  };

  return (
    <View>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <Button mode="outlined" onPress={openMenu}>
            {selectedTrip ? selectedTrip.tripName : 'Select Trip'}
          </Button>
        }
      >
        {trips.map((trip) => (
          <Menu.Item
            key={trip.id}
            title={trip.tripName}
            onPress={() => {
              onSelectTrip(trip.id);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
}
