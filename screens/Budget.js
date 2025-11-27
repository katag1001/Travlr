import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, Dialog, Portal } from 'react-native-paper';

import Banner from '../components/Banner';
import TripSelector from '../components/TripSelector';
import { useTrip } from '../components/TripContext';
import BudgetCard from '../components/BudgetCard';

import SpendView from './Spend';

import {
  getBudgets,
  createBudget,
  saveBudgets,
  deleteBudget as removeBudget,
} from '../storage/budgetStorage';

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { selectedTripId, selectedTrip } = useTrip();
  const [activeBudget, setActiveBudget] = useState(null);

  const loadBudgets = async () => {
    const all = await getBudgets();
    const filtered = selectedTripId ? all.filter(b => b.tripId === selectedTripId) : [];
    setBudgets(filtered);
  };

  useEffect(() => {
    if (selectedTripId) loadBudgets();
  }, [selectedTripId]);

  const showDialog = (budget = null) => {
    setEditingBudget(budget);
    setErrorMsg('');
    if (budget) {
      setBudgetName(budget.budgetName);
      setBudgetTotal(String(budget.total));
    } else {
      setBudgetName('');
      setBudgetTotal('');
    }
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setEditingBudget(null);
    setBudgetName('');
    setBudgetTotal('');
    setErrorMsg('');
  };

  const handleSaveBudget = async () => {
    const total = parseFloat(budgetTotal);

    if (!budgetName.trim()) {
      setErrorMsg('Budget name is required.');
      return;
    }
    if (isNaN(total) || total <= 0) {
      setErrorMsg('Total amount must be a positive number.');
      return;
    }

    if (editingBudget) {
      const updated = budgets.map(b =>
        b.id === editingBudget.id ? { ...b, budgetName, total } : b
      );
      await saveBudgets(updated);
    } else {
      const newBudget = createBudget(budgetName, total, selectedTripId);
      await saveBudgets([...budgets, newBudget]);
    }

    hideDialog();
    loadBudgets();
  };

  const handleDeleteBudget = async (id) => {
    await removeBudget(id);
    loadBudgets();
  };

  if (activeBudget) {
    return <SpendView budget={activeBudget} onBack={() => setActiveBudget(null)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {selectedTrip && <Banner theme={selectedTrip.theme} />}
        <TripSelector />

        <Button
          mode="contained"
          onPress={() => showDialog()}
          disabled={!selectedTripId}
          style={styles.addButton}
        >
          + Add Budget
        </Button>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {budgets.length > 0 && (
            <BudgetCard 
              budget={{
                total: budgets.reduce((sum, b) => sum + b.total, 0),
                spent: budgets.reduce((sum, b) => sum + (b.spent || 0), 0),
              }} 
              isTotal
            />
          )}

          <FlatList
            data={budgets}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <BudgetCard
                budget={item}
                onEdit={() => showDialog(item)}
                onDelete={() => handleDeleteBudget(item.id)}
                onPress={() => setActiveBudget(item)}
              />
            )}
            numColumns={1}
            scrollEnabled={false}
          />
        </ScrollView>

        <Portal>
          <Dialog visible={dialogVisible} onDismiss={hideDialog}>
            <Dialog.Title>{editingBudget ? 'Edit Budget' : 'New Budget'}</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Budget Name"
                value={budgetName}
                onChangeText={setBudgetName}
              />
              <TextInput
                label="Total Amount"
                value={budgetTotal}
                onChangeText={setBudgetTotal}
                keyboardType="numeric"
              />
              {errorMsg ? <Text style={{ color: 'red' }}>{errorMsg}</Text> : null}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Cancel</Button>
              <Button onPress={handleSaveBudget}>Save</Button>
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
    padding: 16,
  },
  addButton: {
    marginVertical: 10,
    backgroundColor: 'purple',
  },
});
