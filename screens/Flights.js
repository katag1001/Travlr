import React, { useEffect, useState } from 'react';
import {View,StyleSheet,ScrollView,Alert,Platform, SafeAreaView} from 'react-native';
import {Text,Card,TextInput,Button,IconButton,Divider} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import TripSelector from '../components/TripSelector';
import { getTrips } from '../storage/tripStorage';
import {getFlightsForTrip,addFlight,updateFlight,deleteFlight} from '../storage/flightStorage';


export default function Flights() {
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [Flights, setFlights] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    flightFrom: '',
    flightTo: '',
    FlightAddress: '',
    cost: '',
    flightDate: '',
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const isEditing = !!form.id;

  useEffect(() => {
    const loadTrips = async () => {
      const allTrips = await getTrips();
      setTrips(allTrips);
      const trip = allTrips.find((t) => t.id === selectedTripId);
      setSelectedTrip(trip || null);
    };
    loadTrips();
  }, [selectedTripId]);

  useEffect(() => {
    if (selectedTripId) {
      loadFlights();
    }
  }, [selectedTripId]);

  const loadFlights = async () => {
    const h = await getFlightsForTrip(selectedTripId);
    const sorted = h.sort((a, b) => {
      return new Date(parseDate(a.flightDate)) - new Date(parseDate(b.flightDate));
    });
    setFlights(sorted);
  };

  const resetForm = () => {
    setForm({
      id: null,
      flightFrom: '',
      flightTo: '',
      FlightAddress: '',
      cost: '',
      flightDate: '',
    });
    setShowForm(false);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const onflightDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setForm({ ...form, flightDate: formatDate(selectedDate) });
    }
  };


  const handleSubmit = async () => {
    const { flightFrom, flightTo, FlightAddress, cost, flightDate} = form;

    if (!flightFrom || !flightDate ) {
      Alert.alert('Flight name and date are required.');
      return;
    }

    const newFlight = {
      id: isEditing ? form.id : Date.now().toString(),
      tripId: selectedTripId,
      flightFrom,
      flightTo,
      FlightAddress,
      cost: parseFloat(cost) || 0,
      flightDate,
    };

    if (isEditing) {
      await updateFlight(newFlight);
    } else {
      await addFlight(newFlight);
    }

    resetForm();
    loadFlights();
  };

  const handleEdit = (Flight) => {
    setForm({
      id: Flight.id,
      flightFrom: Flight.flightFrom,
      flightTo: Flight.flightTo,
      FlightAddress: Flight.FlightAddress,
      cost: Flight.cost.toString(),
      flightDate: Flight.flightDate,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Flight', 'Are you sure you want to delete this Flight?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFlight(id);
          loadFlights();
        },
      },
    ]);
  };

  const tripStartDate = selectedTrip ? parseDate(selectedTrip.flightDate) : null;
  const tripEndDate = selectedTrip ? parseDate(selectedTrip.endDate) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <TripSelector selectedTripId={selectedTripId} onSelectTrip={setSelectedTripId} />

      {selectedTripId && !showForm && (
        <Button
          icon="plus"
          mode="contained"
          onPress={() => setShowForm(true)}
          style={styles.button}
        >
          Add Flight
        </Button>
      )}

      {showForm && (
        <View style={styles.form}>
          <TextInput
            label="Flight Name"
            value={form.flightFrom}
            onChangeText={(text) => setForm({ ...form, flightFrom: text })}
            style={styles.input}
          />
          <TextInput
            label="Flight Place"
            value={form.flightTo}
            onChangeText={(text) => setForm({ ...form, flightTo: text })}
            style={styles.input}
          />
          <TextInput
            label="Flight Address"
            value={form.FlightAddress}
            onChangeText={(text) => setForm({ ...form, FlightAddress: text })}
            style={styles.input}
          />
          <TextInput
            label="Cost"
            keyboardType="numeric"
            value={form.cost}
            onChangeText={(text) => setForm({ ...form, cost: text })}
            style={styles.input}
          />

          <Button
            icon="calendar"
            mode="outlined"
            onPress={() => setShowStartPicker(true)}
            style={styles.dateButton}
          >
            {form.flightDate ? `Start: ${form.flightDate}` : 'Select Flight Date'}
          </Button>

          {showStartPicker && (
            <DateTimePicker
              value={tripStartDate || new Date()}
              mode="date"
              display="default"
              onChange={onflightDateChange}
              minimumDate={tripStartDate}
              maximumDate={tripEndDate}
            />
          )}

          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            {isEditing ? 'Update Flight' : 'Save Flight'}
          </Button>
          <Button onPress={resetForm} style={styles.cancelButton}>
            Cancel
          </Button>
          <Divider style={{ marginVertical: 20 }} />
        </View>
      )}

      <View style={styles.list}>
        {Flights.map((Flight) => (
          <Card key={Flight.id} style={styles.card} onPress={() => handleEdit(Flight)}>
            <Card.Title
              title={`${Flight.flightFrom} → ${Flight.flightTo}` || 'Unnamed Flight'}
              subtitle={`${Flight.flightDate}`}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="delete"
                  onPress={() => handleDelete(Flight.id)}
                />
              )}
            />
          </Card>
        ))}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'pink',
  },
  container: {
    padding: 16,
  },
  form: {
    marginTop: 16,
  },
  input: {
    marginBottom: 8,
  },
  dateButton: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  button: {
    marginVertical: 8,
  },
  cancelButton: {
    marginBottom: 16,
  },
  list: {
    marginTop: 8,
  },
  card: {
    marginBottom: 12,
  },
});
