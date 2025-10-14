// Budget.js

import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Dialog,
  Portal,
  FAB,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import {
  getBudgets,
  createBudget,
  saveBudgets,
  deleteBudget as removeBudget,
} from '../storage/budgetStorage';

export default function Budget() {
  const navigation = useNavigation();

  const [budgets, setBudgets] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const loadBudgets = async () => {
    const loaded = await getBudgets();
    setBudgets(loaded);
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadBudgets();
    }, [])
  );

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
    setBudgetName('');
    setBudgetTotal('');
    setEditingBudget(null);
    setErrorMsg('');
  };

  const handleSaveBudget = async () => {
    console.log('Save button pressed');
    try {
      const total = parseFloat(budgetTotal);
      if (!budgetName.trim()) {
        console.log('Validation failed: empty budget name');
        setErrorMsg('Budget name is required.');
        return;
      }
      if (isNaN(total) || total <= 0) {
        console.log('Validation failed: invalid total');
        setErrorMsg('Total amount must be a positive number.');
        return;
      }
      if (editingBudget) {
        // update
        const updated = budgets.map(b =>
          b.id === editingBudget.id
            ? { ...b, budgetName, total }
            : b
        );
        await saveBudgets(updated);
        console.log('Updated budgets:', updated);
      } else {
        // create new
        const newBudget = createBudget(budgetName, total);
        const updated = [...budgets, newBudget];
        await saveBudgets(updated);
        console.log('New budget added:', newBudget);
        console.log('Budgets after add:', updated);
      }
      hideDialog();
      loadBudgets();
    } catch (err) {
      console.log('Error in handleSaveBudget:', err);
      setErrorMsg('An error occurred while saving.');
    }
  };

  const handleDeleteBudget = async (id) => {
    await removeBudget(id);
    loadBudgets();
  };

  const renderBudget = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate('Spends', {
          budgetId: item.id,
          budgetName: item.budgetName,
        })
      }
    >
      <Card.Title title={item.budgetName} />
      <Card.Content>
        <Text>Spent: {item.spent}</Text>
        <Text>Total: {item.total}</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => showDialog(item)}>Edit</Button>
        <Button onPress={() => handleDeleteBudget(item.id)} textColor="red">
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Budgets</Text>

      <FlatList
        data={budgets}
        keyExtractor={item => item.id}
        renderItem={renderBudget}
        ListEmptyComponent={<Text>No budgets found.</Text>}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => showDialog()}
        label="Add Budget"
      />

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
              style={styles.input}
            />
            <TextInput
              label="Total Amount"
              value={budgetTotal}
              onChangeText={setBudgetTotal}
              keyboardType="numeric"
              style={styles.input}
            />
            {errorMsg ? (
              <Text style={{ color: 'red', marginBottom: 10 }}>{errorMsg}</Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleSaveBudget}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  card: {
    marginBottom: 15,
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
