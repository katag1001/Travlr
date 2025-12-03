import React, { useEffect, useState } from 'react';
import { View, Keyboard } from 'react-native';
import { Menu, Button } from 'react-native-paper';
import { getTrips } from '../storage/tripStorage';
import { useTrip } from './TripContext';

export default function TripSelector() {
  const [trips, setTrips] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);

  const {
    selectedTripId,
    setSelectedTripId,
    setSelectedTrip,
  } = useTrip();

  useEffect(() => {
    const loadTrips = async () => {
      const tr = await getTrips();
      setTrips(tr);

      const trip = tr.find((t) => t.id === selectedTripId);
      if (trip) {
        setSelectedTrip(trip); 
      }
    };
    loadTrips();
  }, [selectedTripId, menuVisible]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

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
          <Button  onPress={openMenu}>
            {selectedTrip ? selectedTrip.tripName : 'Select Trip'}
          </Button>
        }
      >
        {trips.map((trip) => (
          <Menu.Item
            key={trip.id}
            title={trip.tripName}
            onPress={() => {
              setSelectedTripId(trip.id);
              setSelectedTrip(trip);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>
    </View>
  );
}
