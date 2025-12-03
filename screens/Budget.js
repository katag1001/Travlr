import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, Dialog, Portal,IconButton } from 'react-native-paper';

import Banner from '../components/Banner';
import { useTrip } from '../components/TripContext';
import BudgetCard from '../components/BudgetCard';
import ReusableFab from '../components/ReusableFab';
import SpendView from './Spend';

import { getBudgets, createBudget, saveBudgets, deleteBudget as removeBudget } from '../storage/budgetStorage';

export default function Budget({ navigation }) {
  const [budgets, setBudgets] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeBudget, setActiveBudget] = useState(null);

  const { selectedTripId, selectedTrip } = useTrip();

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
      setErrorMsg('Total amount must be positive.');
      return;
    }

    if (editingBudget) {
      const updated = budgets.map(b => b.id === editingBudget.id ? { ...b, budgetName, total } : b);
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

        {/*{selectedTrip && <Banner theme={selectedTrip.theme} />}*/}

        <View style={styles.backRow}>
              <IconButton
                icon="arrow-left"
                size={26}
                onPress={() => navigation.goBack()}
              />
              <Text style={styles.pageTitle}>Budget</Text>
            </View>

        <ScrollView style={styles.scrollArea}>
          {budgets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No budgets yet — tap "+" to add one!
              </Text>
            </View>
          ) : (
            <>
              <BudgetCard
                budget={{
                  total: budgets.reduce((sum, b) => sum + b.total, 0),
                  spent: budgets.reduce((sum, b) => sum + (b.spent || 0), 0),
                }}
                isTotal
              />
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
                scrollEnabled={false}
              />
            </>
          )}
        </ScrollView>

        {selectedTripId && (
          <ReusableFab icon="plus" label="Add Budget" onPress={() => showDialog()} />
        )}

        <Portal>
          <Dialog visible={dialogVisible} onDismiss={hideDialog}>
            <Dialog.Title>{editingBudget ? 'Edit Budget' : 'New Budget'}</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Budget Name" value={budgetName} onChangeText={setBudgetName} />
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
  safeArea: { flex: 1, backgroundColor: 'pink' },
  container: { flex: 1, padding: 16 },
  scrollArea: { flex: 1 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  emptyContainer: { marginTop: 50, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
});
