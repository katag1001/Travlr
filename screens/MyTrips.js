import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, Platform, Modal } from 'react-native';
import {Text,Button,Card,Divider,TextInput,Portal,Provider as PaperProvider,IconButton,} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';

import {getTrips,addTrip,updateTrip,deleteTrip,} from '../storage/tripStorage';


function TripForm({
  initialData = {},
  onSubmit,
  onCancel,
}) {
  const [tripName, setTripName] = useState(initialData.tripName || '');
  const [startDate, setStartDate] = useState(initialData.startDate || '');
  const [endDate, setEndDate] = useState(initialData.endDate || '');

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
    if (!tripName || !startDate || !endDate) {
      Alert.alert('All fields are required.');
      return;
    }
    const data = {
      ...initialData,
      tripName,
      startDate,
      endDate,
      id: initialData.id || uuidv4(),
    };
    onSubmit(data);
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Trip Name</Text>
      <TextInputWrapped value={tripName} onChangeText={setTripName} />

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

// Optimized TextInput Component
const TextInputWrapped = React.memo(({ value, onChangeText }) => {
  return (
    <TextInput
      mode="outlined"
      value={value}
      onChangeText={onChangeText}
      style={{ marginBottom: 12 }}
    />
  );
});

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadTrips = useCallback(async () => {
    const data = await getTrips();
    setTrips(data);
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleAddOrUpdate = async (tripData) => {
    if (tripData.id && trips.some((t) => t.id === tripData.id)) {
      await updateTrip(tripData);
    } else {
      await addTrip(tripData);
    }
    await loadTrips();
    setShowForm(false);
    setEditingTrip(null);
    setIsModalVisible(false);
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setIsModalVisible(true);
  };

  const handleDelete = async (tripId) => {
    Alert.alert('Delete Trip', 'Are you sure you want to delete?', [
      { text: 'Cancel', style: 'cancel' },
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
    <Card style={styles.card} onPress={() => handleEdit(item)}>
      <Card.Title
        title={item.tripName}
        subtitle={`${item.startDate} → ${item.endDate}`}
        right={(props) => (
          <IconButton
            {...props}
            icon="delete"
            onPress={() => handleDelete(item.id)}
            color="red"
          />
        )}
      />
    </Card>
  );

  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {!showForm && !isModalVisible && (
            <Button
              icon="plus"
              mode="contained"
              onPress={() => setShowForm(true)}
              style={styles.button}
            >
              New Trip
            </Button>
          )}

          {showForm && !editingTrip && (
            <TripForm
              onSubmit={handleAddOrUpdate}
              onCancel={() => setShowForm(false)}
            />
          )}

          <FlatList
            data={trips}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripCard item={item} />}
            ListEmptyComponent={<Text>No trips yet.</Text>}
          />

          <Portal>
            <Modal
              visible={isModalVisible}
              transparent
              onRequestClose={() => {
                setIsModalVisible(false);
                setEditingTrip(null);
              }}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <TripForm
                    initialData={editingTrip}
                    onSubmit={handleAddOrUpdate}
                    onCancel={() => {
                      setIsModalVisible(false);
                      setEditingTrip(null);
                    }}
                  />
                </View>
              </View>
            </Modal>
          </Portal>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'pink',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  form: {
    marginVertical: 10,
  },
  dateButton: {
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  button: {
    marginVertical: 10,
  },
  card: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
});
