/*REACT IMPORTS -----------------------------------------------------------------------------*/

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ScrollView, Alert, ImageBackground,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Modal,Portal,IconButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import styles from './Stylesheet';

/*fUNCTION IMPORTS -----------------------------------------------------------------------------*/

import { getHotelsForTrip, addHotel, updateHotel, deleteHotel, } from '../storage/hotelStorage';

/*COMPONENTS IMPORTS -----------------------------------------------------------------------------*/

import { useTrip } from '../components/TripContext';
/* import Banner from '../components/Banner';*/
import ViewCard from '../components/ViewCard';
import ReusableFab from '../components/ReusableFab';
import BackgroundImage from '../assets/images/backgrounds/general.png';

/*MAIN FUNCTION -----------------------------------------------------------------------------*/

export default function Hotels({ navigation }) {
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
    if (selectedTripId) loadHotels();
  }, [selectedTripId]);

  const loadHotels = async () => {
    const h = await getHotelsForTrip(selectedTripId);
    const sorted = h.sort(
      (a, b) =>
        new Date(parseDate(a.startDate)) - new Date(parseDate(b.startDate))
    );
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
    return `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1
    ).padStart(2, '0')}/${d.getFullYear()}`;
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
    const { hotelName, startDate, endDate, cost } = form;


    if (!hotelName || !startDate || !endDate) {
      Alert.alert('Hotel name and dates are required.');
      return;
    }

    const newHotel = {
  ...form,
  id: isEditing ? form.id : Date.now().toString(),
  tripId: selectedTripId,
  cost: parseFloat(cost) || 0,
};

console.log(
  isEditing ? '✏️ Updating hotel' : '➕ Adding hotel',
  newHotel.id
);

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

  const handleDelete = (id) => {
    Alert.alert('Delete Hotel', 'Are you sure?', [
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

  const tripStart = selectedTrip ? parseDate(selectedTrip.startDate) : null;
  const tripEnd = selectedTrip ? parseDate(selectedTrip.endDate) : null;

  const formatStayDetail = (start, end) => {
    const s = parseDate(start);
    const e = parseDate(end);
    if (!s || !e) return '';

    const nights = Math.max(
      Math.round((e - s) / (1000 * 60 * 60 * 24)),
      0
    );

    const fmt = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return `${fmt.format(s)}–${fmt.format(e)} · ${nights} ${nights === 1 ? 'Night' : 'Nights'}`;
  };

  return (
    <ImageBackground
            source={BackgroundImage} 
            style={styles.backgroundImage}
            resizeMode="cover"
          > 

    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.keyboardAvoiding}
>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>

            {/* Banner 
            {selectedTrip && <Banner theme={selectedTrip.theme} />}*/}

           
            <View style={styles.backRow}>
              <IconButton
                icon="arrow-left"
                size={26}
                onPress={() => navigation.goBack()}
              />
              <Text style={styles.pageTitle}>Hotels</Text>
            </View>

            <ScrollView style={styles.scrollArea}>
              
              {hotels.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No hotels yet — tap to add one!
                  </Text>
                </View>
              ) : (
                <ViewCard
                  data={hotels}
                  onPressItem={handleEdit}
                  getIcon={() => 'bed'}
                  getTitle={(h) => h.hotelName || 'Unnamed Hotel'}
                  getSubtitle={(h) => h.hotelPlace}
                  getDetail={(h) => formatStayDetail(h.startDate, h.endDate)}
                  getRight={(h) => (h.cost ? `£${h.cost}` : '')}
                  deleteItem={(h) => handleDelete(h.id)}
                />
              )}
            </ScrollView>

            {/* FAB */}
            {selectedTripId && (
              <ReusableFab
                icon="plus"
                label="Add Hotel"
                onPress={() => setShowForm(true)}
              />
            )}

            {/* Modal Form */}
            <Portal>
              <Modal
                visible={showForm}
                onDismiss={resetForm}
                contentContainerStyle={styles.modalContainer}
              >
                <Text style={styles.modalTitle}>
                  {isEditing ? 'Edit Hotel' : 'Add Hotel'}
                </Text>

                <TextInput
                  label="Hotel Name"
                  value={form.hotelName}
                  onChangeText={(t) => setForm({ ...form, hotelName: t })}
                  style={styles.input}
                />

                <TextInput
                  label="Hotel Place"
                  value={form.hotelPlace}
                  onChangeText={(t) => setForm({ ...form, hotelPlace: t })}
                  style={styles.input}
                />

                <TextInput
                  label="Hotel Address"
                  value={form.hotelAddress}
                  onChangeText={(t) => setForm({ ...form, hotelAddress: t })}
                  style={styles.input}
                />

                <TextInput
                  label="Cost"
                  keyboardType="numeric"
                  value={form.cost}
                  onChangeText={(t) => setForm({ ...form, cost: t })}
                  style={styles.input}
                />

                <Button
                  mode="outlined"
                  onPress={() => setShowStartPicker(true)}
                  style={styles.dateButton}
                >
                  {form.startDate
                    ? `Start: ${form.startDate}`
                    : 'Select Start Date'}
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => setShowEndPicker(true)}
                  style={styles.dateButton}
                >
                  {form.endDate ? `End: ${form.endDate}` : 'Select End Date'}
                </Button>

                {showStartPicker && (
                  <DateTimePicker
                    value={tripStart || new Date()}
                    mode="date"
                    onChange={onStartDateChange}
                    minimumDate={tripStart}
                    maximumDate={tripEnd}
                  />
                )}

                {showEndPicker && (
                  <DateTimePicker
                    value={tripEnd || new Date()}
                    mode="date"
                    onChange={onEndDateChange}
                    minimumDate={tripStart}
                    maximumDate={tripEnd}
                  />
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                >
                  {isEditing ? 'Update Hotel' : 'Save Hotel'}
                </Button>

                <Button onPress={resetForm}>Cancel</Button>
              </Modal>
            </Portal>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </ImageBackground>
  );
}


