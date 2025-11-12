import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Menu, Divider } from 'react-native-paper';

import {
  addItineraryEntry,
  updateItineraryEntry,
  deleteItineraryEntry,
} from '../storage/itineraryStorage';

import {
  getBudgets,
  createSpend,
  addSpend,
  updateSpend,
  deleteSpend,
} from '../storage/budgetStorage';

export default function ItineraryEntry({
  visible,
  onClose,
  tripId,
  tripStartDate,
  tripEndDate,
  selectedDate,
  initialData = {},
  onSaved,
}) {
  const [form, setForm] = useState({
    id: null,
    title: '',
    date: '',  // Date is set automatically
    notes: '',
    cost: '',
    spendId: null,
  });

  const [budgets, setBudgets] = useState([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState('');
  const [showBudgetMenu, setShowBudgetMenu] = useState(false);

  const isEditing = !!form.id;


  // Whenever modal opens
useEffect(() => {
  if (visible) {
    setShowBudgetMenu(false); // always start closed
  }
}, [visible]);


  useEffect(() => {
    if (tripId) {
      (async () => {
        const all = await getBudgets();
        const filtered = all.filter(b => b.tripId === tripId);
        setBudgets(filtered);
      })();
    }
  }, [tripId]);


  useEffect(() => {
    if (initialData && initialData.id) {
      setForm({
        id: initialData.id,
        title: initialData.title || '',
        date: initialData.date || selectedDate || '',  // Automatically set date from selectedDate
        notes: initialData.notes || '',
        cost: initialData.cost?.toString() || '',
        spendId: initialData.spendId || null,
      });
      setSelectedBudgetId(initialData.budgetId || '');
    } else if (selectedDate) {
      // New entry with preselected date
      setForm(f => ({ ...f, date: selectedDate }));
    }
  }, [initialData, selectedDate]);

  const resetForm = () => {
    setForm({
      id: null,
      title: '',
      date: '',  // Reset date automatically
      notes: '',
      cost: '',
      spendId: null,
    });
    setSelectedBudgetId('');
    onClose();
  };

  // ✅ Save itinerary entry and optional linked spend
  const handleSave = async () => {
    const { id, title, date, notes, cost, spendId } = form;
    const parsedCost = parseFloat(cost) || 0;

    if (!title.trim() || !date.trim()) {
      Alert.alert('Missing info', 'Please enter a title (and ensure a date is set).');
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
      budgetId: selectedBudgetId || null,
      spendId: spendId || null,
    };

    try {
      // --- Handle Spend logic ---
      if (selectedBudgetId && parsedCost > 0) {
        if (newItem.spendId) {
          // Update existing spend
          const updatedSpend = {
            id: newItem.spendId,
            tripId,
            budgetId: selectedBudgetId,
            spendName: newItem.title,
            date: newItem.date.split('/').reverse().join('-'),
            spend: parsedCost,
          };
          await updateSpend(updatedSpend);
        } else {
          // Create new spend
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
        // Remove spend if budget removed or cost 0
        await deleteSpend(newItem.spendId);
        newItem.spendId = null;
      }

      // --- Save itinerary entry ---
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

  // ✅ Delete itinerary and linked spend
  const handleDelete = async () => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (form.spendId) await deleteSpend(form.spendId);
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
            onChangeText={text => setForm({ ...form, title: text })}
            style={styles.input}
          />


          {/* Budget Selector ----------------------------------------------------------------*/}
          
<View>
  <Menu
    visible={showBudgetMenu}
    onDismiss={() => setShowBudgetMenu(false)}
    anchor={
      <Button
        mode="outlined"
        onPress={() => setShowBudgetMenu(true)}
      >
        {selectedBudgetId
          ? `Budget: ${budgets.find(b => b.id === selectedBudgetId)?.budgetName}`
          : 'Select Budget (optional)'}
      </Button>
    }
  >
    {budgets.map((b) => (
      <Menu.Item
  key={b.id}
  onPress={() => {
    setShowBudgetMenu(false); // close menu first
    setTimeout(() => setSelectedBudgetId(b.id), 100); // then set budget
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


          <TextInput
            label="Cost (optional)"
            mode="outlined"
            placeholder="e.g. 50"
            value={form.cost}
            onChangeText={text => setForm({ ...form, cost: text })}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Notes (optional)"
            mode="outlined"
            placeholder="Notes..."
            value={form.notes}
            onChangeText={text => setForm({ ...form, notes: text })}
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
