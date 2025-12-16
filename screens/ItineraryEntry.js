/*REACT IMPORTS -----------------------------------------------------------------------------*/

import React, { useState, useEffect } from 'react';
import { View, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Menu, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import styles from './Stylesheet';

/*FUNCTION IMPORTS -----------------------------------------------------------------------------*/

import {addItineraryEntry,updateItineraryEntry} from '../storage/itineraryStorage';
import {getBudgets,createSpend,addSpend,updateSpend,deleteSpend,} from '../storage/budgetStorage';

/*MAIN FUNCTION -----------------------------------------------------------------------------*/

export default function ItineraryEntryForm({
  tripId,
  tripStartDate,
  tripEndDate,
  selectedDate,
  initialData = {},
  onSaved,
  onCancel,
}) {
  const [form, setForm] = useState({
    id: null,
    title: '',
    date: selectedDate || '',
    time: '',
    notes: '',
    cost: '',
    spendId: null,
  });

  const [budgets, setBudgets] = useState([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState('');
  const [showBudgetMenu, setShowBudgetMenu] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const isEditing = !!form.id;

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setForm({ ...form, time: `${hours}:${minutes}` });
    }
  };

  useEffect(() => {
    if (tripId) {
      (async () => {
        const all = await getBudgets();
        setBudgets(all.filter(b => b.tripId === tripId));
      })();
    }
  }, [tripId]);

  useEffect(() => {
    if (initialData && initialData.id) {
      setForm({
        id: initialData.id,
        title: initialData.title || '',
        date: initialData.date || selectedDate || '',
        time: initialData.time || '',
        notes: initialData.notes || '',
        cost: initialData.cost?.toString() || '',
        spendId: initialData.spendId || null,
      });
      setSelectedBudgetId(initialData.budgetId || '');
    } else if (selectedDate) {
      setForm(f => ({ ...f, date: selectedDate }));
    }
  }, [initialData, selectedDate]);

  const resetForm = () => {
    setForm({
      id: null,
      title: '',
      date: selectedDate || '',
      time: '',
      notes: '',
      cost: '',
      spendId: null,
    });
    setSelectedBudgetId('');
    onCancel();
  };

  const handleSave = async () => {
    const { id, title, date, time, notes, cost, spendId } = form;
    const parsedCost = parseFloat(cost) || 0;

    if (!title.trim() || !date.trim()) {
      Alert.alert('Missing info', 'Please enter a title (and ensure a date is set).');
      return;
    }

    const newItem = {
      id: id || Date.now().toString(),
      tripId,
      title: title.trim(),
      date: date.trim(),
      time: time.trim(),
      notes: notes.trim(),
      cost: cost.trim(),
      budgetId: selectedBudgetId || null,
      spendId: spendId || null,
    };

    try {
      if (selectedBudgetId && parsedCost > 0) {
        if (newItem.spendId) {
          await updateSpend({
            id: newItem.spendId,
            tripId,
            budgetId: selectedBudgetId,
            spendName: newItem.title,
            date: newItem.date.split('/').reverse().join('-'),
            spend: parsedCost,
          });
        } else {
          const spend = createSpend(
            selectedBudgetId,
            newItem.title,
            newItem.date.split('/').reverse().join('-'),
            parsedCost,
            tripId
          );
          await addSpend(spend);
          newItem.spendId = spend.id;
        }
      } else if (newItem.spendId) {
        await deleteSpend(newItem.spendId);
        newItem.spendId = null;
      }

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

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalHeading}>
        {isEditing ? 'Edit Itinerary Entry' : 'New Itinerary Entry'}
      </Text>

      {/* Title */}
      <TextInput
        label="Title"
        mode="outlined"
        placeholder="Title (e.g. Visit Eiffel Tower)"
        value={form.title}
        onChangeText={text => setForm({ ...form, title: text })}
        style={styles.modalTextInput}
      />

      {/* Budget Selector */}
      <View>
        <Menu
          visible={showBudgetMenu}
          onDismiss={() => setShowBudgetMenu(false)}
          anchor={
            <Button mode="outlined" onPress={() => setShowBudgetMenu(true)} style={styles.input}>
              {selectedBudgetId
                ? `Budget: ${budgets.find(b => b.id === selectedBudgetId)?.budgetName}`
                : 'Select Budget (optional)'}
            </Button>
          }
        >
          {budgets.map(b => (
            <Menu.Item
              key={b.id}
              onPress={() => {
                setShowBudgetMenu(false);
                setTimeout(() => setSelectedBudgetId(b.id), 100);
              }}
              title={b.budgetName}
            />
          ))}
          <Divider />
          <Menu.Item
            onPress={() => {
              setShowBudgetMenu(false);
              setTimeout(() => setSelectedBudgetId(''), 100);
            }}
            title="No Budget"
          />
        </Menu>
      </View>

      {/* Time Picker */}
      <TouchableOpacity onPress={() => setShowTimePicker(true)}>
        <TextInput
          label="Time (optional)"
          mode="outlined"
          placeholder="Select time"
          value={form.time}
          editable={false}
          pointerEvents="none"
          style={styles.input}
        />
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          mode="time"
          is24Hour={true}
          value={form.time ? new Date(`2000-01-01T${form.time}:00`) : new Date()}
          onChange={handleTimeChange}
        />
      )}

      {/* Cost */}
      <TextInput
        label="Cost (optional)"
        mode="outlined"
        placeholder="e.g. 50"
        value={form.cost}
        onChangeText={text => setForm({ ...form, cost: text })}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* Notes */}
      <TextInput
        label="Notes (optional)"
        mode="outlined"
        placeholder="Notes..."
        value={form.notes}
        onChangeText={text => setForm({ ...form, notes: text })}
        multiline
        numberOfLines={3}
        style={styles.modalNotes}
      />

      <Button 
      mode="contained" 
      onPress={handleSave} 
      style={styles.modalButton}>
        {isEditing ? 'Update Itinerary' : 'Save Itinerary'}
      </Button>

      <Button 
      mode="contained" 
      onPress={resetForm} style={styles.modalButton}>
        Cancel
      </Button>
    </View>
  );
}


