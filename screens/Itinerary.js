import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Text, Portal, Modal, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';

import {
  getItineraryForTrip,
  deleteItineraryEntry,
} from '../storage/itineraryStorage';

import TripSelector from '../components/TripSelector';
import { useTrip } from '../components/TripContext';
import Banner from '../components/Banner';
import ViewCard from '../components/ViewCard';
import ItineraryEntryForm from './ItineraryEntry';
import ReusableFab from '../components/ReusableFab'; // ← NEW SHARED FAB

export default function Itinerary() {
  const { selectedTripId, selectedTrip } = useTrip();

  const [modalVisible, setModalVisible] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('calendar');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (selectedTripId) loadItinerary();
    else setItinerary([]);
  }, [selectedTripId]);

  const loadItinerary = async () => {
    const items = await getItineraryForTrip(selectedTripId);

    const sorted = [...items].sort((a, b) => {
      const aDate = a.date.split('/').reverse().join('-');
      const bDate = b.date.split('/').reverse().join('-');
      const aTime = a.time || '23:59';
      const bTime = b.time || '23:59';
      return new Date(`${aDate}T${aTime}`) - new Date(`${bDate}T${bTime}`);
    });

    setItinerary(sorted);
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const handleDaySelect = (day) => {
    const formatted = day.dateString.split('-').reverse().join('/');
    setSelectedDate(formatted);
    setViewMode('day');
  };

  const handleBackToCalendar = () => {
    setSelectedDate('');
    setViewMode('calendar');
  };

  const filteredItinerary = selectedDate
    ? itinerary.filter((i) => i.date === selectedDate)
    : [];

  const getMarkedDates = (startDate, endDate) => {
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
          },
        },
      };

      date.setDate(date.getDate() + 1);
    }

    return dates;
  };

  const handleDeleteItinerary = (item) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (item.spendId) await deleteItineraryEntry(item.spendId);
            await deleteItineraryEntry(item.id);
            loadItinerary();
          } catch (err) {
            console.error('Error deleting itinerary:', err);
            Alert.alert('Error', 'Failed to delete itinerary entry.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {selectedTrip && <Banner theme={selectedTrip.theme} />}
            <TripSelector />

            {/* ——————————— CALENDAR VIEW ——————————— */}
            {selectedTripId && viewMode === 'calendar' && (
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={handleDaySelect}
                  minDate={
                    selectedTrip
                      ? parseDate(selectedTrip.startDate)
                          ?.toISOString()
                          .split('T')[0]
                      : undefined
                  }
                  maxDate={
                    selectedTrip
                      ? parseDate(selectedTrip.endDate)
                          ?.toISOString()
                          .split('T')[0]
                      : undefined
                  }
                  style={styles.calendar}
                  hideExtraDays={true}
                  disableMonthChange={true}
                  enableSwipeMonths={true}
                  theme={{
                    backgroundColor: 'pink',
                    calendarBackground: 'pink',
                    todayTextColor: '#222',
                    dayTextColor: '#222',
                    textDisabledColor: '#999',
                    arrowColor: 'black',
                    textDayFontSize: 16,
                    textMonthFontSize: 30,
                    textDayHeaderFontSize: 16,
                  }}
                  markedDates={getMarkedDates(
                    parseDate(selectedTrip?.startDate),
                    parseDate(selectedTrip?.endDate)
                  )}
                  markingType="custom"
                />
              </View>
            )}

            {/* ——————————— DAY VIEW ——————————— */}
            {selectedTripId && viewMode === 'day' && (
              <>
                <Button onPress={handleBackToCalendar} style={{ marginBottom: 10 }}>
                  Back to Calendar
                </Button>

                <Text style={styles.dayHeader}>
                  Itinerary for {selectedDate}
                </Text>

                <ScrollView style={styles.scrollArea}>
                  <ViewCard
                    data={filteredItinerary}
                    onPressItem={(item) => {
                      setEditingItem(item);
                      setModalVisible(true);
                    }}
                    getTitle={(i) => i.title}
                    getSubtitle={(i) => `${i.date}${i.time ? ` ${i.time}` : ''}`}
                    getDetail={(i) => i.notes || ''}
                    getRight={(i) => (i.cost ? `£${i.cost}` : '')}
                    getIcon={() => null}
                    deleteItem={handleDeleteItinerary}
                  />
                </ScrollView>

                {/* FAB — Add Itinerary Item */}
                <ReusableFab
                  icon="plus"
                  label="Add Item"
                  onPress={() => {
                    setEditingItem(null);
                    setModalVisible(true);
                  }}
                />
              </>
            )}

            {/* ——————————— MODAL ——————————— */}
            <Portal>
              <Modal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                contentContainerStyle={styles.modalContainer}
              >
                <ItineraryEntryForm
                  tripId={selectedTripId}
                  tripStartDate={
                    selectedTrip ? parseDate(selectedTrip.startDate) : null
                  }
                  tripEndDate={
                    selectedTrip ? parseDate(selectedTrip.endDate) : null
                  }
                  selectedDate={selectedDate}
                  initialData={editingItem}
                  onSaved={() => {
                    loadItinerary();
                    setModalVisible(false);
                  }}
                  onCancel={() => setModalVisible(false)}
                />
              </Modal>
            </Portal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  scrollArea: {
    flex: 1,
    marginBottom: 0,
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  calendarContainer: {
    alignItems: 'center',
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
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});
