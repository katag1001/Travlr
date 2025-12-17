/*REACT IMPORTS -----------------------------------------------------------------------------*/
import React, { useEffect, useState } from 'react';
import {ImageBackground, View,StyleSheet,ScrollView,TouchableWithoutFeedback,Keyboard,KeyboardAvoidingView,Platform,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Portal, Modal, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';

import styles, { modalButtonText, modalDateButtonText, navButtonText} from './Stylesheet';

/*FUNCTION IMPORTS -----------------------------------------------------------------------------*/
import { useTrip } from '../components/TripContext';
import { getTrips, addTrip, updateTrip } from '../storage/tripStorage';
import { getThemeFromTripName } from '../components/ThemeMapper';

/*COMPONENTS IMPORTS -----------------------------------------------------------------------------*/
import TripSelectorCard from '../components/TripSelector';
import ReusableFab from '../components/ReusableFab';
import Background from '../components/Background';
import TextInputBox from '../components/TextInputBox';

/*MAIN FUNCTION -----------------------------------------------------------------------------*/
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

  const loadTrips = async () => {
    const tr = await getTrips();
    setTrips(tr);
  };

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    if (trips.length > 0 && !selectedTripId) {
      selectTrip(trips[0]);
    } else if (trips.length === 0) {
      selectTrip(null);
    }
  }, [trips]);

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1
    ).padStart(2, '0')}/${d.getFullYear()}`;
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
      selectTrip(newTrip); // update selected trip immediately
    } else {
      await addTrip(newTrip);
      selectTrip(newTrip);
    }

    await loadTrips(); // refresh trips list
    setModalVisible(false);
    resetForm();
  };

  const handleTripsUpdated = (updatedTrips) => {
    setTrips(updatedTrips);
    selectTrip(updatedTrips[0] ?? null);
  };

  return (
    <Background theme={selectedTrip?.theme}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <ScrollView>
                {trips.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No trips yet! Add a new trip to get started.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.navButtonContainer}>
                    <TripSelectorCard
                      trips={trips}
                      selectedTrip={selectedTrip}
                      onEdit={openModalForEdit}
                      onTripsChange={handleTripsUpdated}
                    />
                    <Button
                      mode="contained"
                      style={styles.navButton}
                      textColor={navButtonText}
                      disabled={!selectedTripId}
                      onPress={() => navigation.navigate('Itinerary')}
                    >
                      Itinerary
                    </Button>
                    <Button
                      mode="contained"
                      style={styles.navButton}
                      textColor={navButtonText}
                      disabled={!selectedTripId}
                      onPress={() => navigation.navigate('Budget')}
                    >
                      Budget
                    </Button>
                    <Button
                      mode="contained"
                      style={styles.navButton}
                      textColor={navButtonText}
                      disabled={!selectedTripId}
                      onPress={() => navigation.navigate('Hotels')}
                    >
                      Hotels
                    </Button>
                    <Button
                      mode="contained"
                      style={styles.navButton}
                      textColor={navButtonText}
                      disabled={!selectedTripId}
                      onPress={() => navigation.navigate('Packing')}
                    >
                      Packing
                    </Button>
                  </View>
                )}
              </ScrollView>

              <ReusableFab
                icon="plus"
                label="New Trip"
                onPress={() => {
                  resetForm();
                  setModalVisible(true);
                }}
              />


              {/* Popup Modal --------------------------------------------------------------- */}
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
                    <TextInputBox
                      label="Trip Name"
                      value={tripName}
                      onChangeText={setTripName}
                      placeholder="Enter trip name"
                    />

                    <Button
                      mode="contained"
                      icon="calendar"
                      onPress={() => setShowStartPicker(true)}
                      style={styles.dateButton}
                      textColor={modalDateButtonText}
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
                      mode="contained"
                      icon="calendar"
                      onPress={() => setShowEndPicker(true)}
                      style={styles.dateButton}
                      textColor={modalDateButtonText}
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
                      style={styles.modalButton}
                      textColor={modalButtonText}
                    >
                      {editingTrip ? 'Update Trip' : 'Save Trip'}
                    </Button>

                    <Button
                      mode="contained"
                      onPress={() => {
                        setModalVisible(false);
                        resetForm();
                      }}
                      style={styles.modalButton}
                      textColor={modalButtonText}
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


