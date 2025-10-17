import React, { useEffect, useState } from 'react';
import {View,StyleSheet,ScrollView,Alert,Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Text,Card,TextInput,Button,IconButton,Divider} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import TripSelector from '../components/TripSelector';
import { getTrips } from '../storage/tripStorage';
import { useTrip } from '../components/TripContext';
import {getHotelsForTrip,addHotel,updateHotel,deleteHotel} from '../storage/hotelStorage';


export default function Hotels() {
  const { selectedTripId, selectedTrip } = useTrip();
  const [hotels, setHotels] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    hotelName: '',
    hotelPlace: '',
    hotelAddress: '',
    cost: '',
    startDate: '',
    endDate: '',
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const isEditing = !!form.id;


  useEffect(() => {
    if (selectedTripId) {
      loadHotels();
    }
  }, [selectedTripId]);

  const loadHotels = async () => {
    const h = await getHotelsForTrip(selectedTripId);
    const sorted = h.sort((a, b) => {
      return new Date(parseDate(a.startDate)) - new Date(parseDate(b.startDate));
    });
    setHotels(sorted);
  };

  const resetForm = () => {
    setForm({
      id: null,
      hotelName: '',
      hotelPlace: '',
      hotelAddress: '',
      cost: '',
      startDate: '',
      endDate: '',
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

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setForm({ ...form, startDate: formatDate(selectedDate) });
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setForm({ ...form, endDate: formatDate(selectedDate) });
    }
  };

  const handleSubmit = async () => {
  const { hotelName, hotelPlace, hotelAddress, cost, startDate, endDate } = form;

  if (!hotelName || !startDate || !endDate) {
    Alert.alert('Hotel name and dates are required.');
    return;
  }

  const newHotel = {
    id: isEditing ? form.id : Date.now().toString(),
    tripId: selectedTripId,
    hotelName,
    hotelPlace,
    hotelAddress,
    cost: parseFloat(cost) || 0,
    startDate,
    endDate,
  };

  try {
    if (isEditing) {
      await updateHotel(newHotel);
    } else {
      await addHotel(newHotel);
    }

    resetForm();
    loadHotels();
  } catch (err) {
    console.error('💥 Failed to save hotel:', err);
    Alert.alert('Error', 'Failed to save hotel. Check console for details.');
  }
};


  const handleEdit = (hotel) => {
    setForm({
      id: hotel.id,
      hotelName: hotel.hotelName,
      hotelPlace: hotel.hotelPlace,
      hotelAddress: hotel.hotelAddress,
      cost: hotel.cost.toString(),
      startDate: hotel.startDate,
      endDate: hotel.endDate,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Hotel', 'Are you sure you want to delete this hotel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteHotel(id);
          loadHotels();
        },
      },
    ]);
  };

  const tripStartDate = selectedTrip ? parseDate(selectedTrip.startDate) : null;
  const tripEndDate = selectedTrip ? parseDate(selectedTrip.endDate) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <TripSelector/>

      {selectedTripId && !showForm && (
        <Button
          icon="plus"
          mode="contained"
          onPress={() => setShowForm(true)}
          style={styles.button}
        >
          Add Hotel
        </Button>
      )}

      {showForm && (
        <View style={styles.form}>
          <TextInput
            label="Hotel Name"
            value={form.hotelName}
            onChangeText={(text) => setForm({ ...form, hotelName: text })}
            style={styles.input}
          />
          <TextInput
            label="Hotel Place"
            value={form.hotelPlace}
            onChangeText={(text) => setForm({ ...form, hotelPlace: text })}
            style={styles.input}
          />
          <TextInput
            label="Hotel Address"
            value={form.hotelAddress}
            onChangeText={(text) => setForm({ ...form, hotelAddress: text })}
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
            {form.startDate ? `Start: ${form.startDate}` : 'Select Start Date'}
          </Button>

          <Button
            icon="calendar"
            mode="outlined"
            onPress={() => setShowEndPicker(true)}
            style={styles.dateButton}
          >
            {form.endDate ? `End: ${form.endDate}` : 'Select End Date'}
          </Button>

          {showStartPicker && (
            <DateTimePicker
              value={tripStartDate || new Date()}
              mode="date"
              display="default"
              onChange={onStartDateChange}
              minimumDate={tripStartDate}
              maximumDate={tripEndDate}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={tripEndDate || new Date()}
              mode="date"
              display="default"
              onChange={onEndDateChange}
              minimumDate={tripStartDate}
              maximumDate={tripEndDate}
            />
          )}

          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            {isEditing ? 'Update Hotel' : 'Save Hotel'}
          </Button>
          <Button onPress={resetForm} style={styles.cancelButton}>
            Cancel
          </Button>
          <Divider style={{ marginVertical: 20 }} />
        </View>
      )}

      <View style={styles.list}>
        {hotels.map((hotel) => (
          <Card key={hotel.id} style={styles.card} onPress={() => handleEdit(hotel)}>
            <Card.Title
              title={hotel.hotelName || 'Unnamed Hotel'}
              subtitle={`${hotel.startDate} → ${hotel.endDate}`}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="delete"
                  onPress={() => handleDelete(hotel.id)}
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
