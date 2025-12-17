/*REACT IMPORTS -----------------------------------------------------------------------------*/

import React, { useState, useEffect, useCallback } from 'react';
import {View, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback,Keyboard,ScrollView,Alert, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Portal, Modal, Button, IconButton } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';

import styles, { backButtonText } from './Stylesheet';

/*fUNCTION IMPORTS -----------------------------------------------------------------------------*/

import { getItineraryForTrip, deleteItineraryEntry } from '../storage/itineraryStorage';

/*COMPONENTS IMPORTS -----------------------------------------------------------------------------*/

import { useTrip } from '../components/TripContext';
import ViewCard from '../components/ViewCard';
import ItineraryEntryForm from './ItineraryEntry';
import ReusableFab from '../components/ReusableFab';
import BackgroundImage from '../assets/images/backgrounds/general.png';

/*MAIN FUNCTION -----------------------------------------------------------------------------*/

export default function Itinerary({ navigation }) {
  const { selectedTripId, selectedTrip } = useTrip();

  const [modalVisible, setModalVisible] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); 
  const [editingItem, setEditingItem] = useState(null);

  const formatCalendarDate = (dateStr) => {
  const date = parseDate(dateStr);
  return date ? date.toISOString().split('T')[0] : undefined;
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

  const handleDeleteItinerary = (item) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItineraryEntry(item.id);
            loadItinerary();
          } catch (err) {
            console.error('Failed to delete:', err);
          }
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
              <Text style={styles.pageTitle}>Itinerary</Text>
            </View>



            {/* CALENDAR VIEW */}
            {viewMode === 'calendar' && (
  <View>

  <Text 
    style={styles.pageSubtitle}>
    Select a date to view or add itinerary items.
  </Text>
  
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
    style={styles.calendar}
    theme={{
      backgroundColor: 'white',
      calendarBackground: 'white',
      todayTextColor: '#222',
      dayTextColor: '#222',
      textDisabledColor: '#999',
      arrowColor: 'black',
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

                {filteredItinerary.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No entries for this day.
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
                      getSubtitle={(i) => `${i.date}${i.time ? ` ${i.time}` : ''}`}
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
    label="Add Item"
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
                  tripStartDate={selectedTrip ? parseDate(selectedTrip.startDate) : null}
                  tripEndDate={selectedTrip ? parseDate(selectedTrip.endDate) : null}
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


