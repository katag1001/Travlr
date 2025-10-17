import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getItineraryForTrip, updateItineraryEntry } from '../storage/itineraryStorage';
import TripSelector from '../components/TripSelector';
import { useTrip } from '../components/TripContext';

export default function Itinerary() {
  const { selectedTripId } = useTrip();
  const [entries, setEntries] = useState([]);
  const [localEdits, setLocalEdits] = useState({});

  useEffect(() => {
    if (selectedTripId) {
      loadEntries(selectedTripId);
    } else {
      setEntries([]);
    }
  }, [selectedTripId]);

  const loadEntries = async (tripId) => {
    const arr = await getItineraryForTrip(tripId);
    setEntries(arr);

    const initialEdits = {};
    arr.forEach((entry) => {
      initialEdits[entry.id] = {
        day: entry.day || '',
        night: entry.night || '',
      };
    });
    setLocalEdits(initialEdits);
  };

  const handleUpdateEntry = async (entryId, field, value) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    const updated = { ...entry, [field]: value };
    await updateItineraryEntry(updated);

    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? updated : e))
    );
  };

  const handleLocalChange = (entryId, field, value) => {
    setLocalEdits((prev) => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        [field]: value,
      },
    }));
  };

  const renderEntry = ({ item }) => {
    const dateObj = new Date(item.date);
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. Fri
    const dayNum = dateObj.getDate().toString().padStart(2, '0');
    const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' }); // e.g. Oct
    const yearShort = dateObj.getFullYear().toString().slice(-2);
    const displayDate = `${dayNum}-${monthShort}-${yearShort}`;

    const local = localEdits[item.id] || { day: '', night: '' };

    return (
      <Card style={styles.entryCard}>
        <View style={styles.row}>
          <View style={styles.dateBox}>
            <Text style={styles.weekdayText}>{weekday}</Text>
            <Text style={styles.dateText}>{displayDate}</Text>
          </View>

          <View style={styles.planColumn}>
            <View style={styles.dayPlan}>
              <TextInput
                style={styles.dayTextInput}
                placeholder="Day plan"
                placeholderTextColor="#666"
                value={local.day}
                onChangeText={(text) =>
                  handleLocalChange(item.id, 'day', text)
                }
                onBlur={() =>
                  handleUpdateEntry(item.id, 'day', local.day)
                }
                multiline
              />
            </View>

            <View style={styles.nightPlan}>
              <TextInput
                style={styles.nightTextInput}
                placeholder="Night plan"
                placeholderTextColor="#ccc"
                value={local.night}
                onChangeText={(text) =>
                  handleLocalChange(item.id, 'night', text)
                }
                onBlur={() =>
                  handleUpdateEntry(item.id, 'night', local.night)
                }
                multiline
              />
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TripSelector
                selectedTripId={selectedTripId}
                onSelectTrip={(tripId) => {
                  setSelectedTripId(tripId);
                }}
              />
            </View>

            {selectedTripId ? (
              <FlatList
                data={entries}
                keyExtractor={(item) => item.id}
                renderItem={renderEntry}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <Text style={{ marginTop: 20 }}>
                Select a trip to view itinerary
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'pink',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  entryCard: {
    marginBottom: 12,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch', // ensures equal height
  },
  dateBox: {
    width: 90,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    fontSize: 16,
  },
  planColumn: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  dayPlan: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  dayTextInput: {
    flex: 1,
    color: 'black',
    fontSize: 16,
    paddingVertical: 6,
  },
  nightPlan: {
    flex: 1,
    backgroundColor: 'black',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  nightTextInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 6,
  },
});
