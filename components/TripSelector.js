import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { getTrips, deleteTrip } from '../storage/tripStorage';
import { useTrip } from './TripContext';

export default function TripSelectorCard({ onEdit }) {
  const [trips, setTrips] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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
    if (menuVisible) return;
    setDropdownVisible(!dropdownVisible);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    setDropdownVisible(false);
  };

  const handleSelectTrip = (trip) => {
    selectTrip(trip);
    setDropdownVisible(false);
  };

  const handleDeleteTrip = (trip) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete ${String(trip?.tripName ?? '')}?`,
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
    setMenuVisible(false);
  };

  return (
    <View style={{ position: 'relative' }}>
      <Card style={styles.card}>
        {/* 3 dots dropdown menu */}
        {selectedTrip && (
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }} /> {/* spacer to push text to center */}
            <Text style={styles.headerText}>Current Trip</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={toggleMenu}>
                <IconButton icon="dots-vertical" size={24} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Trip selector menu */}
        <TouchableOpacity
          onPress={toggleDropdown}
          style={styles.selectorContainer}
          activeOpacity={0.8}
        >
          <Text style={styles.tripName}>
  {selectedTrip?.tripName ? String(selectedTrip.tripName) : 'Add a new trip to get started!'}
</Text>


        </TouchableOpacity>

        {/* Trip selector dropdown */}
        {dropdownVisible && (
          <View style={styles.dropdown}>
            {trips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                onPress={() => handleSelectTrip(trip)}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownText}>
                  {String(trip?.tripName ?? '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      {/* Overlay + menu */}
      {menuVisible && (
        <>
          {/* Full-screen transparent overlay */}
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          />

          {/* Absolute-positioned menu dropdown */}
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (onEdit) onEdit(selectedTrip);
                setMenuVisible(false);
              }}
            >
              <Text>Edit Trip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleDeleteTrip(selectedTrip)}
            >
              <Text style={{ color: 'red' }}>Delete Trip</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 2,
    marginHorizontal: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  headerText: {
    fontSize: 16,
    color: '#263041',
    textAlign: 'center',
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  menuDropdown: {
    position: 'absolute',
    top: 40,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 1000,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
