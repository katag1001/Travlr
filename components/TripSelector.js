import React, { useEffect, useState } from 'react';
import { View, Keyboard, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Menu, IconButton, Text } from 'react-native-paper';
import { getTrips, deleteTrip } from '../storage/tripStorage';
import { useTrip } from './TripContext';

export default function TripSelectorCard({ onEdit }) {
  const [trips, setTrips] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const { selectedTrip, selectedTripId, selectTrip } = useTrip();

  useEffect(() => {
    const loadTrips = async () => {
      const tr = await getTrips();
      setTrips(tr);

      if (tr.length > 0 && !selectedTripId) {
        selectTrip(tr[0]);
      }
    };
    loadTrips();
  }, [selectedTripId]);

  const toggleDropdown = () => {
    Keyboard.dismiss();
    // Always close menu when opening dropdown
    if (menuVisible) setMenuVisible(false);
    setDropdownVisible(!dropdownVisible);
  };

  const handleSelectTrip = (trip) => {
    selectTrip(trip);
    setDropdownVisible(false);
  };

  const handleDeleteTrip = (trip) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete "${trip.tripName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTrip(trip.id);
            const updated = await getTrips();
            setTrips(updated);
            selectTrip(updated[0] ?? null);
          },
        },
      ]
    );
  };

  return (
    <Card style={styles.card}>
      {/* Header with Edit/Delete Menu */}
      {selectedTrip && (
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }} />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
                size={24}
              />
            }
          >
            <Menu.Item
              leadingIcon="pencil"
              title="Edit Trip"
              onPress={() => {
                setMenuVisible(false);
                if (onEdit) onEdit(selectedTrip);
              }}
            />
            <Menu.Item
              leadingIcon="delete"
              title="Delete Trip"
              leadingIconColor="red"
              titleStyle={{ color: 'red' }}
              onPress={() => {
                setMenuVisible(false);
                handleDeleteTrip(selectedTrip);
              }}
            />
          </Menu>
        </View>
      )}

      {/* Touchable Card Body as Trip Selector */}
      <TouchableOpacity onPress={toggleDropdown} style={styles.selectorContainer}>
        <Text style={styles.tripName}>
          {selectedTrip ? selectedTrip.tripName : 'Select Trip'}
        </Text>
      </TouchableOpacity>

      {/* Dropdown Menu inside the card */}
      {dropdownVisible && (
        <View style={styles.dropdown}>
          {trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              onPress={() => handleSelectTrip(trip)}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownText}>{trip.tripName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginHorizontal: 4,
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  selectorContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tripName: {
    fontSize: 18,
    color: '#263041',
  },
  dropdown: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: '#263041',
  },
});
