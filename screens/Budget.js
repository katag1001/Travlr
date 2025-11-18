import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button, TextInput, Dialog, Portal } from 'react-native-paper';
import PieChart from 'react-native-pie-chart';

import Banner from '../components/Banner';
import TripSelector from '../components/TripSelector';
import { useTrip } from '../components/TripContext';

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

  // -------------------------------------------------------
  // SPEND VIEW (internal navigation)
  // -------------------------------------------------------
  if (activeBudget) {
    return (
      <SpendView
        budget={activeBudget}
        onBack={() => setActiveBudget(null)}
      />
    );
  }

  // -------------------------------------------------------
  // TOTAL BUDGET CARD (RESTORED)
  // -------------------------------------------------------

  const renderFullBudget = () => {
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const totalBudget = budgets.reduce((sum, b) => sum + (b.total || 0), 0);

    const widthAndHeight = 120;

    const isEmpty = totalSpent === 0 && totalBudget === 0;
    const isOverspent = totalSpent > totalBudget;
    const noSpend = totalSpent === 0;

    let series;

    if (isEmpty) {
      series = [{ value: 1, color: '#cccccc' }];
    } else if (isOverspent) {
      series = [{ value: 1, color: 'red' }];
    } else if (noSpend) {
      series = [{ value: 1, color: 'green' }];
    } else {
      series = [
        { value: totalBudget - totalSpent, color: '#2fff00ff' },
        { value: totalSpent, color: '#00d9ffff' },
      ];
    }

    const centerText = isEmpty
      ? '£0'
      : isOverspent
      ? `£${totalSpent - totalBudget} over`
      : `£${totalSpent} of £${totalBudget}`;

    return (
      <Card style={[styles.card, styles.fullWidthCard]}>
        <Card.Title title="Total Budget" titleStyle={styles.cardTitle} />
        <Card.Content style={{ alignItems: 'center' }}>
          <View style={styles.chartWrapper}>
            <PieChart widthAndHeight={widthAndHeight} series={series} cover={0.8} />
            <View style={styles.centerTextWrapper}>
              <Text style={styles.centerText}>{centerText}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // -------------------------------------------------------
  // INDIVIDUAL BUDGET CARDS
  // -------------------------------------------------------

  const renderBudget = ({ item }) => {
    const widthAndHeight = 100;

    const noSpend = !item.spent || item.spent === 0;
    const isOverspent = item.spent > item.total;

    let series;

    if (noSpend) {
      series = [{ value: 1, color: 'green' }];
    } else if (isOverspent) {
      series = [{ value: 1, color: 'red' }];
    } else {
      series = [
        { value: item.total - item.spent, color: '#2fff00ff' },
        { value: item.spent, color: '#00d9ffff' },
      ];
    }

    return (
      <Card style={styles.card} onPress={() => setActiveBudget(item)}>
        <Card.Title title={item.budgetName} titleStyle={styles.cardTitle} />
        <Card.Content>
          <View style={styles.chartWrapper}>
            <PieChart widthAndHeight={widthAndHeight} series={series} cover={0.8} />
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button compact onPress={() => showDialog(item)}>Edit</Button>
          {item.budgetName !== 'Accomodation' && item.budgetName !== 'Flights' && (
            <Button compact icon="delete" onPress={() => handleDeleteBudget(item.id)} />
          )}
        </Card.Actions>
      </Card>
    );
  };

  // -------------------------------------------------------
  // MAIN RENDER
  // -------------------------------------------------------

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

        {budgets.length > 0 && renderFullBudget()}

        <FlatList
          data={budgets}
          keyExtractor={item => item.id}
          renderItem={renderBudget}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />

        {/* Budget form dialog */}
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

const screenWidth = Dimensions.get('window').width;

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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    maxWidth: '48%',
  },
  fullWidthCard: {
    maxWidth: '100%',
    marginBottom: 16,
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: 16,
  },
  cardActions: {
    justifyContent: 'center',
  },
  chartWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerTextWrapper: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
