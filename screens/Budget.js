import React, { useEffect, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, StyleSheet, FlatList, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button, TextInput, Dialog, Portal, FAB } from 'react-native-paper';
import PieChart from 'react-native-pie-chart'


import TripSelector from '../components/TripSelector';
import { getBudgets, createBudget, saveBudgets, deleteBudget as removeBudget } from '../storage/budgetStorage';

export default function Budget() {
  const navigation = useNavigation();

  const [budgets, setBudgets] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTripId, setSelectedTripId] = useState(null);

  const loadBudgets = async () => {
    const all = await getBudgets();
    const filtered = selectedTripId ? all.filter(b => b.tripId === selectedTripId) : [];
    setBudgets(filtered);
  };

  useEffect(() => {
    if (selectedTripId) {
      loadBudgets();
    }
  }, [selectedTripId]);

  useFocusEffect(
    React.useCallback(() => {
      if (selectedTripId) {
        loadBudgets();
      }
    }, [selectedTripId])
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
    try {
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
        const updated = [...budgets, newBudget];
        await saveBudgets(updated);
      }

      hideDialog();
      loadBudgets();
    } catch (err) {
      setErrorMsg('An error occurred while saving.');
    }
  };

  const handleDeleteBudget = async (id) => {
    await removeBudget(id);
    loadBudgets();
  };

 const renderBudget = ({ item }) => {
  const widthAndHeight = 150;

  const noSpend = item.spent == null || item.spent == 0 ;
  const isEmpty = (item.spent + item.total) === 0;
  const isOverspent = item.spent > item.total;

  let series;

if (isEmpty) {
  series = [{ value: 1, color: '#cccccc' }];
} else if (isOverspent) {
  series = [{ value: 1, color: 'red' }];
} else if (noSpend) {
  series = [{ value: 1, color: 'green' }];
} else {
  series = [
    { value: item.total - item.spent, color: '#2fff00ff' },
    { value: item.spent, color: '#00d9ffff' },
    
  ];
}

  const centerText = isEmpty
  ? '£0'
  : isOverspent
    ? `£${item.spent -item.total} over budget`
    : `£${item.spent} out of £${item.total}`;
  return (
    <Card
      style={styles.card}
      onPress={() =>
        navigation.navigate('Spends', {
          budgetId: item.id,
          budgetName: item.budgetName,
          tripId: selectedTripId,
        })
      }
    >
      <Card.Title title={item.budgetName} />
      <Card.Content>
        <View style={styles.container}>
          <View style={styles.chartWrapper}>
            <PieChart widthAndHeight={widthAndHeight} series={series} cover={0.8} />
            <View style={styles.centeredTextWrapper}>
              <Text style={styles.centeredText}>{centerText}</Text>
            </View>
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => showDialog(item)}>Edit</Button>
        <Button onPress={() => handleDeleteBudget(item.id)} textColor="red">
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );
};



  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
    <TripSelector selectedTripId={selectedTripId} onSelectTrip={setSelectedTripId} /> 
        <Button 
        mode="contained" 
        onPress={() => showDialog()} 
        disabled={!selectedTripId}
        style={styles.button}>
          + Add Budget
        </Button>

      <FlatList
        data={budgets}
        keyExtractor={item => item.id}
        renderItem={renderBudget}
        ListEmptyComponent={<Text>No budgets found.</Text>}
      />

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>{editingBudget ? 'Edit Budget' : 'New Budget'}</Dialog.Title>
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
    padding: 16
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    marginBottom: 15,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginVertical: 8,
    backgroundColor: 'purple',
  },
chartWrapper: {
  width: 150,
  height: 150,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative', // Important for absolute positioning of child
},

centeredTextWrapper: {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 80,  // Smaller than chart
  height: 80,
  alignItems: 'center',
  justifyContent: 'center',
  transform: [
    { translateX: -40 }, // -width/2
    { translateY: -40 }, // -height/2
  ],
},

centeredText: {
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
},


});
