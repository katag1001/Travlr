// screens/MyTrips.js
import React, { useEffect, useState, useCallback } from 'react';
import {View, StyleSheet, FlatList, Alert, Platform,} from 'react-native';
import {Text, Button, Card, Divider,} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';
import { TextInput } from 'react-native-paper';

import {getTrips, addTrip, updateTrip,deleteTrip,} from '../storage/tripStorage';

function TripForm({
  initialData = {},
  onSubmit,
  onCancel,
}) {

  const [tripName, setTripName] = useState(initialData.tripName || '');
  const [startDate, setStartDate] = useState(initialData.startDate || '');
  const [endDate, setEndDate] = useState(initialData.endDate || '');
  const [location, setLocation] = useState(initialData.location || '');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(formatDate(selectedDate));
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(formatDate(selectedDate));
    }
  };

  const handleSubmit = () => {
    if (!tripName || !startDate || !endDate || !location) {
      Alert.alert('All fields are required.');
      return;
    }
    const data = {
      ...initialData,
      tripName,
      startDate,
      endDate,
      location,
      id: initialData.id || uuidv4(),
    };
    onSubmit(data);
  };

  return (
    <View style={styles.form}>
      <Text
        style={{ marginBottom: 4, fontSize: 16 }}
      >
        Trip Name
      </Text>
      <View style={{ marginBottom: 12 }}>
        <TextInputWrapped
          value={tripName}
          onChangeText={setTripName}
        />
      </View>

      <Button
        icon="calendar"
        mode="outlined"
        onPress={() => setShowStartPicker(true)}
        style={styles.dateButton}
      >
        {startDate ? `Start: ${startDate}` : 'Select Start Date'}
      </Button>

      <Button
        icon="calendar"
        mode="outlined"
        onPress={() => setShowEndPicker(true)}
        style={styles.dateButton}
      >
        {endDate ? `End: ${endDate}` : 'Select End Date'}
      </Button>

      <Text
        style={{ marginBottom: 4, marginTop: 12, fontSize: 16 }}
      >
        Location
      </Text>
      <View style={{ marginBottom: 12 }}>
        <TextInputWrapped
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onStartDateChange}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onEndDateChange}
        />
      )}

      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        {initialData.id ? 'Update Trip' : 'Save Trip'}
      </Button>
      <Button onPress={onCancel} style={styles.button}>
        Cancel
      </Button>
      <Divider style={{ marginVertical: 20 }} />
    </View>
  );
}


const TextInputWrapped = React.memo(({ value, onChangeText }) => {
  return (
    <TextInput
      mode="outlined"
      value={value}
      onChangeText={onChangeText}
    />
  );
});

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const loadTrips = useCallback(async () => {
    const data = await getTrips();
    setTrips(data);
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleAddOrUpdate = async (tripData) => {
    if (tripData.id && trips.some(t => t.id === tripData.id)) {
      // update
      await updateTrip(tripData);
    } else {
      // add new
      await addTrip(tripData);
    }
    await loadTrips();
    setShowForm(false);
    setEditingTrip(null);
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setShowForm(true);
  };

  const handleDelete = async (tripId) => {
    Alert.alert('Delete Trip', 'Are you sure you want to delete?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTrip(tripId);
          await loadTrips();
        },
      },
    ]);
  };

  const TripCard = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title title={item.tripName} subtitle={item.location} />
      <Card.Content>
        <Text>Start: {item.startDate}</Text>
        <Text>End: {item.endDate}</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => handleEdit(item)}>Edit</Button>
        <Button onPress={() => handleDelete(item.id)} textColor="red">
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      {!showForm && (
        <Button
          icon="plus"
          mode="contained"
          onPress={() => setShowForm(true)}
          style={styles.button}
        >
          New Trip
        </Button>
      )}
      {showForm && (
        <TripForm
          initialData={editingTrip || {}}
          onSubmit={handleAddOrUpdate}
          onCancel={() => {
            setShowForm(false);
            setEditingTrip(null);
          }}
        />
      )}

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TripCard item={item} />}
        ListEmptyComponent={<Text>No trips yet.</Text>}
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'pink',
  },
  container: { flex: 1, padding: 20 },
  form: { marginVertical: 10 },
  dateButton: { marginBottom: 10, justifyContent: 'flex-start' },
  button: { marginVertical: 10 },
  card: { marginBottom: 15 },
});
