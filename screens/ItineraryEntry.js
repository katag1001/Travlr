import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import { addItineraryEntry, updateItineraryEntry, deleteItineraryEntry } from '../storage/itineraryStorage';

export default function ItineraryEntry({
  visible,
  onClose,
  tripId,
  tripStartDate,
  tripEndDate,
  initialData = {},
  onSaved,
}) {
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
    if (initialData) {
      setForm({
        id: initialData.id || null,
        title: initialData.title || '',
        date: initialData.date || '',
        notes: initialData.notes || '',
        cost: initialData.cost?.toString() || '',
      });
    }
  }, [initialData]);

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
    onClose();
  };

  const handleSave = async () => {
    const { id, title, date, notes, cost } = form;

    if (!title.trim() || !date.trim()) {
      Alert.alert('Missing info', 'Please enter a title and date.');
      return;
    }

    if (!tripId) {
      Alert.alert('No Trip Selected', 'Please select a trip first.');
      return;
    }

    const newItem = {
      id: id || Date.now().toString(),
      tripId,
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
      if (onSaved) onSaved();
    } catch (err) {
      console.error('Error saving itinerary:', err);
      Alert.alert('Error', 'Failed to save itinerary entry.');
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItineraryEntry(form.id);
            resetForm();
            if (onSaved) onSaved();
          } catch (err) {
            console.error('Error deleting itinerary:', err);
            Alert.alert('Error', 'Failed to delete itinerary entry.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.modalOverlay} pointerEvents={visible ? 'auto' : 'none'}>
      {visible && (
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

          <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
            {isEditing ? 'Update Itinerary' : 'Save Itinerary'}
          </Button>

          {isEditing && (
            <Button
              icon="delete"
              mode="outlined"
              onPress={handleDelete}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
