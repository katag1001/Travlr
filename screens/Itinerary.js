import React, { useEffect, useState } from 'react';
import {View,StyleSheet,FlatList,TextInput,KeyboardAvoidingView,Platform,Keyboard,TouchableWithoutFeedback,} from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { getItineraryForTrip, updateItineraryEntry } from '../storage/itineraryStorage';
import TripSelector from '../components/TripSelector';

export default function Itinerary() {
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [entries, setEntries] = useState([]);

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
  };

  const handleUpdateEntry = async (entryId, field, value) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    const updated = { ...entry, [field]: value };
    await updateItineraryEntry(updated);

    setEntries((prev) =>
      prev.map(e => (e.id === entryId ? updated : e))
    );
  };

  const renderEntry = ({ item }) => {
    const dateObj = new Date(item.date);
    const dayNum = dateObj.getDate().toString().padStart(2, '0');
    const monthNum = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const displayDate = `${dayNum}/${monthNum}/${year}`;

    return (
      <Card style={styles.entryCard}>
        <View style={styles.row}>
          <View style={styles.dateBox}>
            <Text>{displayDate}</Text>
          </View>
          <TextInput
            style={styles.textBox}
            placeholder="Day plan"
            value={item.day}
            onChangeText={(text) => handleUpdateEntry(item.id, 'day', text)}
          />
          <TextInput
            style={styles.textBox}
            placeholder="Night plan"
            value={item.night}
            onChangeText={(text) => handleUpdateEntry(item.id, 'night', text)}
          />
        </View>
      </Card>
    );
  };

  return (
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
            <Text style={{ marginTop: 20 }}>Select a trip to view itinerary</Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 12 },
  entryCard: {
    marginBottom: 12,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    width: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 4,
    padding: 8,
  },
});
