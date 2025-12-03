import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import Background from '../components/Background';


import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';

import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';

import Banner from '../components/Banner';
import TripSelector from '../components/TripSelector';
import ReusableFab from '../components/ReusableFab';

import { useTrip } from '../components/TripContext';
import {
  getTrips,
  addTrip,
  updateTrip,
  deleteTrip,
} from '../storage/tripStorage';

import { getThemeFromTripName } from '../components/ThemeMapper';

export default function Home({ navigation }) {
  const { selectedTrip, selectedTripId, selectTrip } = useTrip();

  const [trips, setTrips] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const [tripName, setTripName] = useState('');
  const [theme, setTheme] = useState('North America');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Load trips from storage
  const loadTrips = async () => {
    const tr = await getTrips();
    setTrips(tr);
  };

  useEffect(() => {
    loadTrips();
  }, []);

  // Auto-select first trip if none selected
  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      selectTrip(trips[0]);
    }
  }, [trips]);

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const resetForm = () => {
    setTripName('');
    setTheme('North America');
    setStartDate('');
    setEndDate('');
    setEditingTrip(null);
  };

  const openModalForEdit = (trip) => {
    setEditingTrip(trip);
    setTripName(trip.tripName);
    setTheme(trip.theme);
    setStartDate(trip.startDate);
    setEndDate(trip.endDate);
    setModalVisible(true);
  };

  const handleSaveTrip = async () => {
    if (!tripName || !startDate || !endDate) {
      alert('All fields are required.');
      return;
    }


    const autoTheme = getThemeFromTripName(tripName);

    const newTrip = {
      id: editingTrip?.id || uuidv4(),
      tripName,
      theme: autoTheme,
      startDate,
      endDate,
    };

    if (editingTrip) {
      await updateTrip(newTrip);
    } else {
      await addTrip(newTrip);
      selectTrip(newTrip);
    }

    loadTrips();
    setModalVisible(false);
    resetForm();
  };

  const handleDeleteSelectedTrip = () => {
    if (!selectedTrip) return;

    Alert.alert(
      'Delete Trip',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTrip(selectedTrip.id);
            const updated = await getTrips();
            setTrips(updated);
            selectTrip(updated[0] ?? null);
          },
        },
      ]
    );
  };

  return (
    <Background theme={selectedTrip?.theme}>


    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>

            {/* Banner 
            {selectedTrip && <Banner theme={selectedTrip.theme} />}*/}

            <ScrollView>

              {/* Trip selector */}
              <TripSelector />

              {selectedTrip && (
                <View style={styles.tripActionsRow}>
                  <Button
                    mode="outlined"
                    icon="pencil"
                    onPress={() => openModalForEdit(selectedTrip)}
                    style={{ marginRight: 10 }}
                  >
                    Edit
                  </Button>

                  <Button
                    mode="outlined"
                    icon="delete"
                    textColor="red"
                    onPress={handleDeleteSelectedTrip}
                  >
                    Delete
                  </Button>
                </View>
              )}

              {/* No trips case */}
              {trips.length === 0 ? (
                <View style={{ marginTop: 40, alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, opacity: 0.7 }}>
                    No trips yet! Add a new trip to get started.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Navigation buttons */}
                  <View style={{ marginTop: 20 }}>
                    <Button
                      mode="contained"
                      style={styles.navButton}
                      disabled={!selectedTripId}
                      onPress={() => navigation.navigate('Packing')}
                    >
                      Packing
                    </Button>

                    <Button
                      mode="contained"
                      style={styles.navButton}
                      disabled={!selectedTripId}
                      onPress={() => navigation.navigate('Budget')}
                    >
                      Budget
                    </Button>

                    <Button
                      mode="contained"
                      style={styles.navButton}
                      disabled={!selectedTripId}
                      onPress={() => navigation.navigate('Hotels')}
                    >
                      Hotels
                    </Button>

                    <Button
                      mode="contained"
                      style={styles.navButton}
                      disabled={!selectedTripId}
                      onPress={() => navigation.navigate('Itinerary')}
                    >
                      Itinerary
                    </Button>
                  </View>
                </>
              )}

            </ScrollView>

            {/* New Trip FAB */}
            <ReusableFab
              icon="plus"
              label="New Trip"
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
            />

            {/* Trip Modal */}
            <Portal>
              <Modal
                visible={modalVisible}
                onDismiss={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                contentContainerStyle={styles.modalContainer}
              >
                <ScrollView>
                  <TextInput
                    label="Trip Name"
                    value={tripName}
                    onChangeText={setTripName} // theme not updated here
                    mode="outlined"
                    style={{ marginBottom: 12 }}
                  />

                  {/* Display theme only for editing existing trip */}
                  {editingTrip && <Text style={{ marginBottom: 12 }}>Theme: {theme}</Text>}

                  <Button
                    mode="outlined"
                    icon="calendar"
                    onPress={() => setShowStartPicker(true)}
                    style={styles.dateButton}
                  >
                    {startDate ? `Start: ${startDate}` : 'Select Start Date'}
                  </Button>

                  {showStartPicker && (
                    <DateTimePicker
                      mode="date"
                      value={new Date()}
                      onChange={(e, d) => {
                        setShowStartPicker(false);
                        if (d) setStartDate(formatDate(d));
                      }}
                    />
                  )}

                  <Button
                    mode="outlined"
                    icon="calendar"
                    onPress={() => setShowEndPicker(true)}
                    style={styles.dateButton}
                  >
                    {endDate ? `End: ${endDate}` : 'Select End Date'}
                  </Button>

                  {showEndPicker && (
                    <DateTimePicker
                      mode="date"
                      value={new Date()}
                      onChange={(e, d) => {
                        setShowEndPicker(false);
                        if (d) setEndDate(formatDate(d));
                      }}
                    />
                  )}

                  <Button
                    mode="contained"
                    onPress={handleSaveTrip}
                    style={styles.button}
                  >
                    {editingTrip ? 'Update Trip' : 'Save Trip'}
                  </Button>

                  <Button
                    onPress={() => {
                      setModalVisible(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </ScrollView>
              </Modal>
            </Portal>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, },
  container: { flex: 1, padding: 16 },
  navButton: { marginVertical: 10, paddingVertical: 8 },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 20,
  },
  dateButton: { marginVertical: 8 },
  button: { marginVertical: 10 },
  tripActionsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
    background: {
    flex: 1,
    resizeMode: 'cover', 
  },
});
