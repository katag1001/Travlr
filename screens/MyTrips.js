// NOT IN USE ------------------
//////////////////////////////////////////////
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Portal,
  Modal,
  Button,
  TextInput,
  IconButton,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';

import Banner from '../components/Banner';
import ViewCard from '../components/ViewCard';
import ReusableFab from '../components/ReusableFab';
import { getTrips, addTrip, updateTrip, deleteTrip } from '../storage/tripStorage';

const themes = [
  'North America',
  'South America',
  'Indian Subcontinent',
  'Southeast Asia',
  'East Asia',
  'Oceania',
  'Africa',
  'Middle East',
  'Russia',
  'Europe',
  'Central Asia',
];

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);

  const [tripName, setTripName] = useState('');
  const [theme, setTheme] = useState(themes[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const loadTrips = useCallback(async () => {
    const data = await getTrips();
    setTrips(data);
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const resetForm = () => {
    setTripName('');
    setTheme(themes[0]);
    setStartDate('');
    setEndDate('');
    setShowStartPicker(false);
    setShowEndPicker(false);
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

  const handleDelete = (tripId) => {
    Alert.alert('Delete Trip', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTrip(tripId);
          loadTrips();
        },
      },
    ]);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setStartDate(formatDate(selectedDate));
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setEndDate(formatDate(selectedDate));
  };

  const handleSaveTrip = async () => {
    if (!tripName || !startDate || !endDate) {
      Alert.alert('All fields are required.');
      return;
    }

    const tripData = {
      id: editingTrip?.id || uuidv4(),
      tripName,
      theme,
      startDate,
      endDate,
    };

    if (editingTrip) await updateTrip(tripData);
    else await addTrip(tripData);

    loadTrips();
    setModalVisible(false);
    resetForm();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <Banner theme="default" />

            <ScrollView style={styles.scrollArea}>
              <ViewCard
                data={trips}
                onPressItem={openModalForEdit}
                getTitle={(t) => t.tripName}
                getSubtitle={(t) => `${t.startDate} → ${t.endDate}`}
                getDetail={(t) => t.theme}
                deleteItem={(t) => handleDelete(t.id)}
                getIcon={() => 'airplane'}
              />
            </ScrollView>

            {/* FAB for new trip */}
            <ReusableFab
              icon="plus"
              label="New Trip"
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
            />

            {/* Modal */}
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
                    style={{ marginBottom: 12 }}
                  />

                  <Text style={{ marginBottom: 4 }}>Theme</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={theme}
                      onValueChange={(val) => setTheme(val)}
                      style={styles.picker}
                    >
                      {themes.map((t) => (
                        <Picker.Item key={t} label={t} value={t} />
                      ))}
                    </Picker>
                  </View>

                  <Button
                    icon="calendar"
                    mode="outlined"
                    onPress={() => setShowStartPicker(true)}
                    style={styles.dateButton}
                  >
                    {startDate ? `Start: ${startDate}` : 'Select Start Date'}
                  </Button>
                  {showStartPicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="date"
                      display="default"
                      onChange={handleStartDateChange}
                    />
                  )}

                  <Button
                    icon="calendar"
                    mode="outlined"
                    onPress={() => setShowEndPicker(true)}
                    style={styles.dateButton}
                  >
                    {endDate ? `End: ${endDate}` : 'Select End Date'}
                  </Button>
                  {showEndPicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="date"
                      display="default"
                      onChange={handleEndDateChange}
                    />
                  )}

                  <Button mode="contained" onPress={handleSaveTrip} style={styles.button}>
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
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'pink' },
  container: { flex: 1, padding: 16 },
  scrollArea: { flex: 1 },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: { height: 50, width: '100%' },
  dateButton: { marginBottom: 10, justifyContent: 'flex-start' },
  button: { marginVertical: 10 },
});
