import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Text, Card, Button, TextInput, Dialog, Portal, FAB, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    loadSpends();
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // keep open on iOS, close on Android
    if (selectedDate) {
      setSpendDate(selectedDate);
    }
  };

  const renderSpend = ({ item }) => (
    <Card style={styles.card}>
      <TouchableOpacity onPress={() => showDialog(item)} activeOpacity={0.7}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.leftContent}>
            <Text style={styles.spendName}>{item.spendName || 'Unnamed Spend'}</Text>
            <Text style={styles.spendDate}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.rightContent}>
            <Text style={styles.spendAmount}>£{item.spend.toFixed(2)}</Text>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteSpend(item.id)}
              style={styles.deleteButton}
              accessibilityLabel="Delete spend"
            />
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <Text style={styles.header}>Spending for {budgetName}</Text>
      <FlatList
        data={spends}
        keyExtractor={(item) => item.id}
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
  header: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 10,
    padding: 10,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  spendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  spendDate: {
    fontSize: 12,
    color: 'gray',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spendAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  deleteButton: {
    margin: 0,
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
