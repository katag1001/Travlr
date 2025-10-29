import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Alert,Modal,Platform,} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';

import {getItineraryForTrip,addItineraryEntry,updateItineraryEntry,deleteItineraryEntry,} from '../storage/itineraryStorage';
import TripSelector from '../components/TripSelector';
import { useTrip } from '../components/TripContext';
import Banner from '../components/Banner';
import ViewCard from '../components/ViewCard';

export default function Itinerary() {
  const { selectedTripId, selectedTrip } = useTrip();

  const [modalVisible, setModalVisible] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('calendar');

  const [form, setForm] = useState({
    id: null,
    title: '',
    date: '',
    notes: '',
    cost: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const isEditing = !!form.id;

  useEffect(() => {
    if (selectedTripId) {
      loadItinerary();
    } else {
      setItinerary([]);
    }
  }, [selectedTripId]);

  const loadItinerary = async () => {
    const items = await getItineraryForTrip(selectedTripId);
    const sorted = items.sort((a, b) => new Date(a.date) - new Date(b.date));
    setItinerary(sorted);
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formatted = formatDate(selectedDate);
      setForm({ ...form, date: formatted });
      setSelectedDate(formatted);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      title: '',
      date: '',
      notes: '',
      cost: '',
    });
    setModalVisible(false);
  };

  const handleSave = async () => {
    const { id, title, date, notes, cost } = form;

    if (!title.trim() || !date.trim()) {
      Alert.alert('Missing info', 'Please enter a title and date.');
      return;
    }

    if (!selectedTripId) {
      Alert.alert('No Trip Selected', 'Please select a trip first.');
      return;
    }

    const newItem = {
      id: id || Date.now().toString(),
      tripId: selectedTripId,
      title: title.trim(),
      date: date.trim(),
      notes: notes.trim(),
      cost: cost.trim(),
    };

    try {
      if (isEditing) {
        await updateItineraryEntry(newItem);
      } else {
        await addItineraryEntry(newItem);
      }

      resetForm();
      loadItinerary();
    } catch (err) {
      console.error('Error saving itinerary:', err);
      Alert.alert('Error', 'Failed to save itinerary entry.');
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title,
      date: item.date,
      notes: item.notes,
      cost: item.cost?.toString() || '',
    });
    setSelectedDate(item.date);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItineraryEntry(id);
            await loadItinerary();
            resetForm();
          } catch (err) {
            console.error('Error deleting itinerary:', err);
            Alert.alert('Error', 'Failed to delete itinerary entry.');
          }
        },
      },
    ]);
  };

  const tripStartDate = selectedTrip ? parseDate(selectedTrip.startDate) : null;
  const tripEndDate = selectedTrip ? parseDate(selectedTrip.endDate) : null;


  const filteredItinerary = selectedDate
    ? itinerary.filter((i) => i.date === selectedDate)
    : [];

  const handleDaySelect = (day) => {
    const formatted = day.dateString.split('-').reverse().join('/');
    setSelectedDate(formatted);
    setViewMode('day');
  };

  const handleBackToCalendar = () => {
    setSelectedDate('');
    setViewMode('calendar');
  };

const getMarkedDates = (startDate, endDate, selectedDate = null) => {
  if (!startDate || !endDate) return {};

  const dates = {};
  const date = new Date(startDate);

  while (date <= endDate) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateString = `${yyyy}-${mm}-${dd}`;

  dates[dateString] = {
    customStyles: {
      container: {
        backgroundColor: 'green', 
        borderRadius: 10,               
        alignItems: 'center', 
        justifyContent: 'center', 
      },
      text: {
        color: 'white',        
        fontWeight: 'bold', 
        textAlign: 'center', 
      },
    },
  };

  date.setDate(date.getDate() + 1);
}


  return dates;
};


  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {selectedTrip && <Banner theme={selectedTrip.theme} />}
        <TripSelector />

        {selectedTripId && viewMode === 'calendar' && (
  <View style={styles.calendarContainer}>
    <Calendar
  onDayPress={handleDaySelect}
  minDate={tripStartDate?.toISOString().split('T')[0]}
  maxDate={tripEndDate?.toISOString().split('T')[0]}
  style={styles.calendar}
  hideExtraDays={true}
  disableMonthChange={true}
  enableSwipeMonths={true}
    


  
  theme={{
    backgroundColor: 'pink',
    calendarBackground: 'pink',
    textSectionTitleColor: '#000',
    todayTextColor: '#222',
    dayTextColor: '#222',
    textDisabledColor: '#999',
    arrowColor: 'black',
    textDayFontSize: 16,
    textMonthFontSize: 30,
    textDayHeaderFontSize: 16

  }}
  markedDates={getMarkedDates(tripStartDate, tripEndDate, selectedDate)}
  markingType="custom"
/>

  </View>
)}


        {selectedTripId && viewMode === 'day' && (
          <>
            <Button onPress={handleBackToCalendar} style={{ marginBottom: 10 }}>
            Back to Calendar
            </Button>

            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
              Itinerary for {selectedDate}
            </Text>

            <Button
              icon="plus"
              mode="contained"
              onPress={() => {
                setForm({ ...form, date: selectedDate });
                setModalVisible(true);
              }}
              style={styles.addButton}
            >
              Add Itinerary Item
            </Button>

            {filteredItinerary.length === 0 ? (
              <Text>No itinerary items for this date.</Text>
            ) : (
              <ViewCard
                data={filteredItinerary}
                onPressItem={handleEdit}
                getTitle={(i) => i.title}
                getSubtitle={(i) => i.date}
                getDetail={(i) => (i.notes ? i.notes : '')}
                getRight={(i) => (i.cost ? `£${i.cost}` : '')}
                getIcon={(i) => null}
              />
            )}
          </>
        )}

        {/*ADDING AND EDITING ITINERARY ITEMS*/}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={resetForm}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Itinerary Entry' : 'New Itinerary Entry'}
              </Text>

              <TextInput
                label="Title"
                mode="outlined"
                placeholder="Title (e.g. Visit Eiffel Tower)"
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
                style={styles.input}
              />

              <Button
                icon="calendar"
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                {form.date ? `Date: ${form.date}` : 'Select Date'}
              </Button>

              {showDatePicker && (
                <DateTimePicker
                  value={parseDate(form.date) || tripStartDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={tripStartDate}
                  maximumDate={tripEndDate}
                />
              )}

              <TextInput
                label="Cost (optional)"
                mode="outlined"
                placeholder="e.g. 50"
                value={form.cost}
                onChangeText={(text) => setForm({ ...form, cost: text })}
                keyboardType="numeric"
                style={styles.input}
              />

              <TextInput
                label="Notes (optional)"
                mode="outlined"
                placeholder="Notes..."
                value={form.notes}
                onChangeText={(text) => setForm({ ...form, notes: text })}
                multiline
                numberOfLines={3}
                style={[styles.input, { height: 80 }]}
              />

              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveButton}
              >
                {isEditing ? 'Update Itinerary' : 'Save Itinerary'}
              </Button>

              {isEditing && (
                <Button
                  icon="delete"
                  mode="outlined"
                  onPress={() => handleDelete(form.id)}
                  style={[styles.deleteButton, { borderColor: 'red' }]}
                  textColor="red"
                >
                  Delete Itinerary
                </Button>
              )}

              <Button onPress={resetForm} style={styles.cancelButton}>
                Cancel
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'green',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    marginBottom: 10,
  },
  dateButton: {
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  saveButton: {
    marginTop: 10,
  },
  deleteButton: {
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 10,
  },
calendarContainer: {
  flex: 0, // Prevents stretching
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'blue',
  paddingVertical: 10,
},
calendar: {
  width: 355,
  height: 420,
  backgroundColor: 'pink',
  borderRadius: 10,
  elevation: 2,
},


});
