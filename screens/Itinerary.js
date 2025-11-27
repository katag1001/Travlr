import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';

import { getItineraryForTrip } from '../storage/itineraryStorage';
import TripSelector from '../components/TripSelector';
import { useTrip } from '../components/TripContext';
import Banner from '../components/Banner';
import ViewCard from '../components/ViewCard';
import ItineraryEntry from './ItineraryEntry';

export default function Itinerary() {
  const { selectedTripId, selectedTrip } = useTrip();

  const [modalVisible, setModalVisible] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('calendar');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (selectedTripId) {
      loadItinerary();
    } else {
      setItinerary([]);
    }
  }, [selectedTripId]);

  // ---------------------------------------------------------
  // LOAD + SORT BY DATE AND TIME
  // ---------------------------------------------------------
  const loadItinerary = async () => {
    const items = await getItineraryForTrip(selectedTripId);

    const sorted = [...items].sort((a, b) => {
      const aDate = a.date.split('/').reverse().join('-');
      const bDate = b.date.split('/').reverse().join('-');

      const aTime = a.time && a.time.length ? a.time : '23:59';
      const bTime = b.time && b.time.length ? b.time : '23:59';

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

  // FILTER ITINERARY BY SELECTED DATE
  const filteredItinerary = selectedDate
    ? itinerary.filter((i) => i.date === selectedDate)
    : [];

  // DATE RANGE MARKINGS
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

        {/* CALENDAR VIEW */}
        {selectedTripId && viewMode === 'calendar' && (
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={handleDaySelect}
              minDate={
                selectedTrip
                  ? parseDate(selectedTrip.startDate)?.toISOString().split('T')[0]
                  : undefined
              }
              maxDate={
                selectedTrip
                  ? parseDate(selectedTrip.endDate)?.toISOString().split('T')[0]
                  : undefined
              }
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
                textDayHeaderFontSize: 16,
              }}
              markedDates={getMarkedDates(
                parseDate(selectedTrip?.startDate),
                parseDate(selectedTrip?.endDate),
                selectedDate
              )}
              markingType="custom"
            />
          </View>
        )}

        {/* DAY VIEW */}
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
                setEditingItem(null);
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
                onPressItem={(item) => {
                  setEditingItem(item);
                  setModalVisible(true);
                }}
                getTitle={(i) => i.title}

                // 💡 Subtitle = date + time
                getSubtitle={(i) => `${i.date}${i.time ? ` ${i.time}` : ''}`}

                // 💡 Detail = notes
                getDetail={(i) => (i.notes ? i.notes : '')}

                getRight={(i) => (i.cost ? `£${i.cost}` : '')}
                getIcon={(i) => null}
              />
            )}
          </>
        )}

        {/* MODAL ENTRY FORM */}
        <ItineraryEntry
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          tripId={selectedTripId}
          tripStartDate={selectedTrip ? parseDate(selectedTrip.startDate) : null}
          tripEndDate={selectedTrip ? parseDate(selectedTrip.endDate) : null}
          selectedDate={selectedDate} // keep selected date
          initialData={editingItem}
          onSaved={loadItinerary}
        />
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
  calendarContainer: {
    flex: 0,
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
