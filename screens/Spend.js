import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, TextInput, Dialog, Portal, FAB } from 'react-native-paper';

import { getSpendsForBudget, addSpend, updateSpend, deleteSpend, createSpend } from '../storage/budgetStorage';

export default function SpendScreen({ route, navigation }) {
  const { budgetId, budgetName, tripId } = route.params;

  const [spends, setSpends] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingSpend, setEditingSpend] = useState(null);

  const [spendName, setSpendName] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [spendDate, setSpendDate] = useState('');

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
      setSpendDate(spend.date);
    } else {
      setSpendName('');
      setSpendAmount('');
      setSpendDate(new Date().toISOString().split('T')[0]);
    }
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setEditingSpend(null);
    setSpendName('');
    setSpendAmount('');
    setSpendDate('');
  };

  const handleSaveSpend = async () => {
    const amount = parseFloat(spendAmount) || 0;
    const dateValue = spendDate;

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
    loadSpends();
  };

  const renderSpend = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title title={item.spendName || 'Unnamed Spend'} />
      <Card.Content>
        <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
        <Text>Amount: {item.spend}</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => showDialog(item)}>Edit</Button>
        <Button onPress={() => handleDeleteSpend(item.id)} textColor="red">
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Spends for "{budgetName}"</Text>

      <FlatList
        data={spends}
        keyExtractor={item => item.id}
        renderItem={renderSpend}
        ListEmptyComponent={<Text>No spends added yet.</Text>}
      />

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
            <TextInput
              label="Date (YYYY-MM-DD)"
              value={spendDate}
              onChangeText={setSpendDate}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
            <Button onPress={handleSaveSpend}>Save</Button>
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
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 10,
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
