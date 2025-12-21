/* REACT IMPORTS -----------------------------------------------------------------------------*/

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Portal, Modal, Button, IconButton } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';

import styles, { backButtonText } from './Stylesheet';

/* FUNCTION IMPORTS -----------------------------------------------------------------------------*/

import {getItineraryForTrip,deleteItineraryEntry,} from '../storage/itineraryStorage';

/* COMPONENTS IMPORTS -----------------------------------------------------------------------------*/

import { useTrip } from '../components/TripContext';
import ViewCard from '../components/ViewCard';
import ItineraryEntryForm from './ItineraryEntry';
import ReusableFab from '../components/ReusableFab';
import BackgroundImage from '../assets/images/backgrounds/general2.jpg';

/* MAIN FUNCTION -----------------------------------------------------------------------------*/

export default function Itinerary({ navigation }) {
  const { selectedTripId, selectedTrip } = useTrip();

  const [modalVisible, setModalVisible] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('calendar');
  const [editingItem, setEditingItem] = useState(null);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const formatCalendarDate = (dateStr) => {
    const date = parseDate(dateStr);
    return date ? date.toISOString().split('T')[0] : undefined;
  };

  const formatItineraryDate = (dateString) => {
  const [day, month, year] = dateString.split("/");

  const date = new Date(year, month - 1, day);

  const weekday = date.toLocaleString("en-US", { weekday: "long" });
  const monthName = date.toLocaleString("en-US", { month: "short" });

  const getOrdinal = (n) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${weekday}, ${monthName} ${day}${getOrdinal(Number(day))}`;
};



  const getMarkedRange = (startDate, endDate) => {
    const marked = {};
    let current = new Date(startDate);
    const last = new Date(endDate);

    while (current <= last) {
      const dateString = current.toISOString().split('T')[0];
      marked[dateString] = {
        color: '#ccdffeff',
        textColor: 'white',
      };
      current.setDate(current.getDate() + 1);
    }

    marked[startDate] = {
      startingDay: true,
      color: '#ccdffeff',
      textColor: 'white',
    };

    marked[endDate] = {
      endingDay: true,
      color: '#ccdffeff',
      textColor: 'white',
    };

    return marked;
  };

  useFocusEffect(
    useCallback(() => {
      setSelectedDate('');
      setViewMode('calendar');
      setEditingItem(null);
    }, [])
  );

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

  const handleDeleteItinerary = (item) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteItineraryEntry(item.id);
          loadItinerary();
        },
      },
    ]);
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
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              {/* Back row */}
              <View style={styles.backRow}>
                <IconButton
                  icon="arrow-left"
                  size={26}
                  onPress={() => navigation.navigate('Home')}
                />
              </View>

              {/* CALENDAR VIEW */}
              {viewMode === 'calendar' && (
                <View>
                  <Text style={styles.pageSubtitle}>Your Itinerary</Text>

                  <Calendar
                    current={
                      selectedTrip
                        ? formatCalendarDate(selectedTrip.startDate)
                        : undefined
                    }
                    onDayPress={handleDaySelect}
                    minDate={
                      selectedTrip
                        ? formatCalendarDate(selectedTrip.startDate)
                        : undefined
                    }
                    maxDate={
                      selectedTrip
                        ? formatCalendarDate(selectedTrip.endDate)
                        : undefined
                    }

                    markingType="period"
                    markedDates={
                      selectedTrip
                        ? getMarkedRange(
                            formatCalendarDate(selectedTrip.startDate),
                            formatCalendarDate(selectedTrip.endDate)
                          )
                        : {}
                    }

                    style={styles.calendar}
                    theme={{
                      backgroundColor: 'white',
                      calendarBackground: 'white',
                      todayTextColor: '#ccdffeff',
                      dayTextColor: '#ccdffeff',
                      textDisabledColor: '#263041',
                      arrowColor: '#263041',
                      textDayFontSize: 16,
                      textMonthFontSize: 22,
                      textDayHeaderFontSize: 14,
                    }}
                  />
                </View>
              )}

              {/* DAY VIEW */}
              {viewMode === 'day' && (
                <>
                  <Button
                    onPress={handleBackToCalendar}
                    mode="contained"
                    style={styles.internalBack}
                    textColor={backButtonText}
                  >
                    Back to calendar
                  </Button>

                  <Text style={styles.pageSubtitle}>
                    Itinerary for {formatItineraryDate(selectedDate)}
                  </Text>

                  {filteredItinerary.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        No entries for this day. Tap + to add one!
                      </Text>
                    </View>
                  ) : (
                    <ScrollView style={styles.scrollArea}>
                      <ViewCard
                        data={filteredItinerary}
                        onPressItem={(item) => {
                          setEditingItem(item);
                          setModalVisible(true);
                        }}
                        getTitle={(i) => i.title}
                        getSubtitle={(i) =>
                          `${i.date}${i.time ? ` ${i.time}` : ''}`
                        }
                        getDetail={(i) => i.notes || ''}
                        getRight={(i) => (i.cost ? `£${i.cost}` : '')}
                        getIcon={() => null}
                        deleteItem={handleDeleteItinerary}
                      />
                    </ScrollView>
                  )}
                </>
              )}

              {/* FAB */}
              {selectedTripId && viewMode === 'day' && (
                <ReusableFab
                  icon="plus"
                  onPress={() => {
                    setEditingItem(null);
                    setModalVisible(true);
                  }}
                />
              )}

              {/* MODAL */}
              <Portal>
                <Modal
                  visible={modalVisible}
                  onDismiss={() => setModalVisible(false)}
                >
                  <ItineraryEntryForm
                    tripId={selectedTripId}
                    tripStartDate={
                      selectedTrip
                        ? parseDate(selectedTrip.startDate)
                        : null
                    }
                    tripEndDate={
                      selectedTrip
                        ? parseDate(selectedTrip.endDate)
                        : null
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
    </ImageBackground>
  );
}
