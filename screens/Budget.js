/* REACT IMPORTS ----------------------------------------------------------------------------- */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, TextInput, Dialog, Portal, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

/* FUNCTION IMPORTS ----------------------------------------------------------------------------- */

import {
  getBudgets,
  createBudget,
  saveBudgets,
  deleteBudget as removeBudget
} from '../storage/budgetStorage';

import SpendView from './Spend';

/* COMPONENT IMPORTS ----------------------------------------------------------------------------- */

import { useTrip } from '../components/TripContext';
import BudgetCard from '../components/BudgetCard';
import ReusableFab from '../components/ReusableFab';

import BackgroundImage from '../assets/images/backgrounds/general.png';

/* MAIN FUNCTION ----------------------------------------------------------------------------- */

export default function Budget({ navigation }) {
  const [budgets, setBudgets] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeBudget, setActiveBudget] = useState(null);

  const { selectedTripId } = useTrip();


  const PROTECTED_BUDGET_NAMES = ['Flights', 'Accommodation'];

  const isProtectedBudget = (budget) =>
  PROTECTED_BUDGET_NAMES.includes(budget?.budgetName);


  const loadBudgets = async () => {
    const all = await getBudgets();
    const filtered = selectedTripId
      ? all.filter(b => b.tripId === selectedTripId)
      : [];
    setBudgets(filtered);
  };

  useFocusEffect(
    useCallback(() => {
      if (selectedTripId) {
        loadBudgets();
      }
    }, [selectedTripId])
  );

  
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

  /* SAVE / DELETE ----------------------------------------------------------------------------- */

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
    const updated = budgets.map(b => {
      if (b.id !== editingBudget.id) return b;

      // 🔒 Protect name for Flights & Accommodation
      if (isProtectedBudget(b)) {
        return { ...b, total };
      }

      return { ...b, budgetName, total };
    });

    await saveBudgets(updated);
  } else {
    const newBudget = createBudget(budgetName, total, selectedTripId);
    await saveBudgets([...budgets, newBudget]);
  }

  hideDialog();
  loadBudgets();
};


  const handleDeleteBudget = async (id) => {
  const budget = budgets.find(b => b.id === id);

  if (isProtectedBudget(budget)) {
    return;
  }

  await removeBudget(id);
  loadBudgets();
};


  /* SPEND VIEW ----------------------------------------------------------------------------- */

if (activeBudget) {
  return (
    <SpendView
      budget={activeBudget}
      onBack={() => {
        setActiveBudget(null);
        loadBudgets(); // 
      }}
    />
  );
}

  /* Main view ----------------------------------------------------------------------------- */

  return (
    <ImageBackground
      source={BackgroundImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          {/* HEADER */}
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
                {/* TOTAL CARD */}
                <BudgetCard
                  budget={{
                    total: budgets.reduce((sum, b) => sum + b.total, 0),
                    spent: budgets.reduce((sum, b) => sum + (b.spent || 0), 0),
                  }}
                  isTotal
                />

                {/* BUDGET LIST */}
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

          {/* FAB */}
          {selectedTripId && (
            <ReusableFab
              icon="plus"
              label="Add Budget"
              onPress={() => showDialog()}
            />
          )}

          {/* DIALOG */}
          <Portal>
            <Dialog visible={dialogVisible} onDismiss={hideDialog}>
              <Dialog.Title>
                {editingBudget ? 'Edit Budget' : 'New Budget'}
              </Dialog.Title>
              <Dialog.Content>
                <TextInput
                  label="Budget Name"
                  value={budgetName}
                  onChangeText={setBudgetName}
                  disabled={editingBudget && isProtectedBudget(editingBudget)}
                />
                <TextInput
                  label="Total Amount"
                  value={budgetTotal}
                  onChangeText={setBudgetTotal}
                  keyboardType="numeric"
                />
                {errorMsg ? (
                  <Text style={styles.errorText}>{errorMsg}</Text>
                ) : null}
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={hideDialog}>Cancel</Button>
                <Button onPress={handleSaveBudget}>Save</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* STYLES ----------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
  scrollArea: { flex: 1 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 8 },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  backgroundImage: { flex: 1 },
  errorText: { color: 'red' }
});
