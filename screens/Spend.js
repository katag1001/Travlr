import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, TextInput, Dialog, Portal, FAB } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

import ViewCard from '../components/ViewCard';
import { getSpendsForBudget, addSpend, updateSpend, deleteSpend, createSpend } from '../storage/budgetStorage';

export default function SpendScreen({ route, navigation }) {
  const { budgetId, budgetName, tripId } = route.params;

  const [spends, setSpends] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingSpend, setEditingSpend] = useState(null);

  const [spendName, setSpendName] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [spendDate, setSpendDate] = useState(new Date());

  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadSpends = async () => {
    const loaded = await getSpendsForBudget(budgetId);
    setSpends(loaded);
  };

  useEffect(() => {
    loadSpends();
  }, []);

  const showDialog = (spend = null) => {
    setEditingSpend(spend);
    if (spend) {
      setSpendName(spend.spendName);
      setSpendAmount(String(spend.spend));
      setSpendDate(new Date(spend.date));
    } else {
      setSpendName('');
      setSpendAmount('');
      setSpendDate(new Date());
    }
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setEditingSpend(null);
    setSpendName('');
    setSpendAmount('');
    setSpendDate(new Date());
    setShowDatePicker(false);
  };

  const handleSaveSpend = async () => {
    const amount = parseFloat(spendAmount) || 0;
    const dateValue = spendDate.toISOString().split('T')[0];

    if (editingSpend) {
      const updated = {
        ...editingSpend,
        spendName,
        spend: amount,
        date: dateValue,
      };
      await updateSpend(updated);
    } else {
      const newSpend = createSpend(budgetId, spendName, dateValue, amount, tripId);
      await addSpend(newSpend);
    }

    hideDialog();
    loadSpends();
  };

  const handleDeleteSpend = async (id) => {
    await deleteSpend(id);
    hideDialog();
    loadSpends();
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
      setSpendDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {spends.length > 0 ? (
          <ViewCard
            data={spends}
            onPressItem={showDialog}
            getTitle={(s) => s.spendName || 'Unnamed Spend'}
            getSubtitle={(s) => new Date(s.date).toLocaleDateString()}
            getRight={(s) => `£${s.spend.toFixed(2)}`}
          />
        ) : (
          <Text>No spends added yet.</Text>
        )}

        <FAB icon="plus" style={styles.fab} onPress={() => showDialog()} label="Add Spend" />

        <Portal>
          <Dialog visible={dialogVisible} onDismiss={hideDialog}>
            <Dialog.Title>{editingSpend ? 'Edit Spend' : 'New Spend'}</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Spend Name"
                value={spendName}
                onChangeText={setSpendName}
                style={styles.input}
              />
              <TextInput
                label="Amount"
                value={spendAmount}
                onChangeText={setSpendAmount}
                keyboardType="numeric"
                style={styles.input}
              />

              <Button
                icon="calendar"
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={{ marginBottom: 10 }}
              >
                {spendDate ? spendDate.toLocaleDateString() : 'Select Date'}
              </Button>

              {showDatePicker && (
                <DateTimePicker
                  value={spendDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Cancel</Button>
              {editingSpend && (
                <Button onPress={() => handleDeleteSpend(editingSpend.id)} color="red">
                  Delete
                </Button>
              )}
              <Button onPress={handleSaveSpend}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
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
    paddingHorizontal: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  input: {
    marginBottom: 10,
  },
});
