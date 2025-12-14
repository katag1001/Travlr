/*REACT IMPORTS -----------------------------------------------------------------------------*/

import React, { useEffect, useState } from 'react';
import {ImageBackground,View,StyleSheet,ScrollView,TouchableWithoutFeedback,Keyboard,KeyboardAvoidingView,Platform,Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Text,Button,Portal,Modal,TextInput,Card,IconButton,Menu,} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';

/*fUNCTION IMPORTS -----------------------------------------------------------------------------*/

import { useTrip } from '../components/TripContext';
import {getTrips,addTrip,updateTrip,deleteTrip,} from '../storage/tripStorage';
import { getThemeFromTripName } from '../components/ThemeMapper';

/*COMPONENTS IMPORTS -----------------------------------------------------------------------------*/

/*import Banner from '../components/Banner';*/
import TripSelectorCard from '../components/TripSelector';
import ReusableFab from '../components/ReusableFab';
import Background from '../components/Background';


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
  const [menuVisible, setMenuVisible] = useState(false);

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

    Alert.alert('Delete Trip', 'Are you sure?', [
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
    ]);
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
              {/* Banner */}
              {/* {selectedTrip && <Banner theme={selectedTrip.theme} />} */}

              <ScrollView>
                {/* Trip selector */}
                {/* <TripSelector /> */}

                {/* Trip actions (commented out) */}
                {/* {selectedTrip && (
                  <View style={styles.tripActionsRow}>
                    <Button
                      mode="outlined"
                      icon="pencil"
                      onPress={() => openModalForEdit(selectedTrip)}
                      style={styles.tripButtonMarginRight}
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
                )} */}

                


                {trips.length === 0 ? (
                  <View style={styles.noTripsContainer}>
                    <Text style={styles.noTripsText}>
                      No trips yet! Add a new trip to get started.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.navButtonContainer}>
                    <TripSelectorCard onEdit={(trip) => openModalForEdit(trip)} />
                    <Button
                      mode="contained"
                      style={styles.navButton}
                      disabled={!selectedTripId}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Itinerary' }],
                        });
                      }}
                    >
                      Itinerary
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
                      onChangeText={setTripName}
                      mode="outlined"
                      style={styles.modalTextInput}
                    />

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
                      style={styles.button}
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
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  container: { flex: 1, padding: 16 },
  navButton: {
    marginVertical: 10,
    borderRadius: 10,
    paddingVertical: 8,
    backgroundColor: '#263041',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 20,
  },
  dateButton: { marginVertical: 8 },
  button: { marginVertical: 10 },
  tripActionsRow: { flexDirection: 'row', marginTop: 10 },
  background: { flex: 1, resizeMode: 'cover' },
  tripCard: {
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
  tripCardContent: { flexDirection: 'row', alignItems: 'center', padding: 16, position: 'relative' },
  tripSelectorContainer: { flex: 1, marginRight: 50 },
  iconActions: { position: 'absolute', right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center' },
  cardHeader: { width: '100%', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  tripSelectorCentered: { paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },

  // EXTRACTED INLINE STYLES
  menuSpacer: { flex: 1 },
  tripButtonMarginRight: { marginRight: 10 },
  menuDeleteTitle: { color: 'red' },
  noTripsContainer: { marginTop: 40, alignItems: 'center' },
  noTripsText: { fontSize: 18, opacity: 0.7 },
  navButtonContainer: { marginTop: 20 },
  modalTextInput: { marginBottom: 12 },
});
