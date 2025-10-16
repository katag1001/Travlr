import React, { useEffect, useState } from 'react'; 
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button, TextInput, Dialog, Portal } from 'react-native-paper';
import PieChart from 'react-native-pie-chart';

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

  // Render total combined budget as a full-width card
  // Inside renderFullBudget function:
const renderFullBudget = () => {
  const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
  const totalBudget = budgets.reduce((acc, b) => acc + (b.total || 0), 0);

  const widthAndHeight = 100; // same as small cards

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
    ? `£${totalSpent - totalBudget} over budget`
    : `£${totalSpent} of £${totalBudget}`;

  return (
    <Card style={[styles.card, styles.fullWidthCard]}>
      <Card.Title title="Total Budget" titleStyle={styles.cardTitle} />
      <Card.Content style={{ alignItems: 'center' }}>
        <View style={styles.chartWrapper}>
          <PieChart widthAndHeight={widthAndHeight} series={series} cover={0.8} />
          <View style={styles.centeredTextWrapper}>
            <Text style={styles.centeredText}>{centerText}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};


  const renderBudget = ({ item }) => {
    const widthAndHeight = 100;

    const noSpend = item.spent == null || item.spent == 0;
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
        ? `£${item.spent - item.total} over budget`
        : `£${item.spent} of £${item.total}`;

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
        <Card.Title title={item.budgetName} titleStyle={styles.cardTitle} />
        <Card.Content>
          <View style={styles.chartWrapper}>
            <PieChart widthAndHeight={widthAndHeight} series={series} cover={0.8} />
            <View style={styles.centeredTextWrapper}>
              <Text style={styles.centeredText}>{centerText}</Text>
            </View>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <View style={styles.buttonContainer}>
            <Button compact onPress={() => showDialog(item)} style={styles.actionButton}>
              Edit
            </Button>
            {item.budgetName !== 'Accomodation' && item.budgetName !== 'Flights' && (
              <Button
                compact
                icon="delete"
                onPress={() => handleDeleteBudget(item.id)}
                textColor="black"
                style={styles.actionButton}
              />
            )}
          </View>
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

        {budgets.length > 0 && renderFullBudget()}

        <FlatList
          data={budgets}
          keyExtractor={item => item.id}
          renderItem={renderBudget}
          numColumns={2}
          key={2} 
          columnWrapperStyle={styles.row}
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

const screenWidth = Dimensions.get('window').width;
const cardMargin = 10;
const cardWidth = (screenWidth / 2) - (cardMargin * 2);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'pink',
  },
  container: {
    flex: 1,
    padding: 16,
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
  flex: 0,
},
  cardTitle: {
    textAlign: 'center',
    fontSize: 16,
  },
  cardActions: {
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',   
    justifyContent: 'center', 
    gap: 10,                    
  },
  actionButton: {
    minWidth: 80,             
    marginHorizontal: 5,      
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginVertical: 8,
    backgroundColor: 'purple',
  },
 chartWrapper: {
  width: 100,
  height: 100,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  alignSelf: 'center',
},
  centeredTextWrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      { translateX: -40 },
      { translateY: -40 },
    ],
  },
  centeredText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
