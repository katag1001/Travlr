/* REACT IMPORTS ----------------------------------------------------------------------------- */
import React, { useEffect, useState } from 'react';
import { View, ScrollView, FlatList, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Portal, Modal, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

/* STYLE IMPORTS ----------------------------------------------------------------------------- */
import styles, { modalButtonText, backButtonText, modalDateButtonText } from './Stylesheet';

/* FUNCTION IMPORTS ----------------------------------------------------------------------------- */
import { getSpendsForBudget, addSpend, updateSpend, deleteSpend, createSpend, getBudgets, saveBudgets } from '../storage/budgetStorage';

/* COMPONENT IMPORTS ----------------------------------------------------------------------------- */
import ViewCard from '../components/ViewCard';
import TotalBudgetCard from '../components/TotalBudgetCard';
import ReusableFab from '../components/ReusableFab';
import TextInputBox from '../components/TextInputBox';
import BackgroundImage from '../assets/images/backgrounds/general2.jpg';

/* MAIN FUNCTION ----------------------------------------------------------------------------- */
export default function Spend({ budget, onBack }) {
  const navigation = useNavigation();
  const { id: budgetId, tripId } = budget;

  const PROTECTED_BUDGET_NAMES = ['Flights', 'Accommodation'];
  const isProtectedBudget = (b) => PROTECTED_BUDGET_NAMES.includes(b.budgetName);

  const [currentBudget, setCurrentBudget] = useState({ ...budget });
  const [spends, setSpends] = useState([]);

  const [spendDialogVisible, setSpendDialogVisible] = useState(false);
  const [editingSpend, setEditingSpend] = useState(null);
  const [spendName, setSpendName] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [spendDate, setSpendDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [budgetDialogVisible, setBudgetDialogVisible] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  /* --- Load Spends --- */
  const loadSpends = async () => {
    const loaded = await getSpendsForBudget(budgetId);
    setSpends(loaded);
  };

  useEffect(() => {
    loadSpends();
  }, []);

  const totalSpent = spends.reduce((sum, s) => sum + (s.spend || 0), 0);

  /* --- SPEND MODAL --- */
  const showSpendDialog = (spend = null) => {
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
    setSpendDialogVisible(true);
  };

  const hideSpendDialog = () => {
    setSpendDialogVisible(false);
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
      const updated = { ...editingSpend, spendName, spend: amount, date: dateValue };
      await updateSpend(updated);
    } else {
      const newSpend = createSpend(budgetId, spendName, dateValue, amount, tripId, null);

      await addSpend(newSpend);
    }

    hideSpendDialog();
    loadSpends();
  };

  const handleDeleteSpend = async (id) => {
    await deleteSpend(id);
    loadSpends();
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setSpendDate(selectedDate);
  };

  const showBudgetDialog = () => {
    setEditingBudget(currentBudget);
    setBudgetName(currentBudget.budgetName);
    setBudgetTotal(String(currentBudget.total));
    setErrorMsg('');
    setBudgetDialogVisible(true);
  };

  const hideBudgetDialog = () => {
    setBudgetDialogVisible(false);
    setEditingBudget(null);
    setBudgetName('');
    setBudgetTotal('');
    setErrorMsg('');
  };

  const handleSaveBudgetFromSpend = async () => {
    const total = parseFloat(budgetTotal);
    if (!budgetName.trim()) {
      setErrorMsg('Budget name is required.');
      return;
    }
    if (isNaN(total) || total <= 0) {
      setErrorMsg('Total amount must be positive.');
      return;
    }

    const allBudgets = await getBudgets();
    const updatedBudgets = allBudgets.map((b) => {
      if (b.id !== currentBudget.id) return b;
      if (isProtectedBudget(b)) return { ...b, total };
      return { ...b, budgetName, total };
    });

    await saveBudgets(updatedBudgets);
    setCurrentBudget({ ...currentBudget, budgetName, total });
    hideBudgetDialog();
  };

  return (
    <ImageBackground source={BackgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          {/* MAIN BACK BUTTON */}
          <View style={styles.backRow}>
  <IconButton
    icon="arrow-left"
    size={26}
    onPress={onBack} // go back to budgets
  />
  <Text style={styles.backTitle}>Back to budgets</Text>
</View>


       
          <Text style={styles.pageSubtitle}>Spends for {currentBudget.budgetName}</Text>

          {/* TOTAL BUDGET CARD (clickable) */}
          <TouchableOpacity onPress={showBudgetDialog}>
            <TotalBudgetCard
              title={`${currentBudget.budgetName} Budget`}
              total={currentBudget.total}
              spent={totalSpent}
            />
          </TouchableOpacity>

          {/* SPENDS LIST */}
          <ScrollView style={styles.scrollArea}>
            {spends.length > 0 ? (
              <ViewCard
                data={spends}
                onPressItem={showSpendDialog}
                getTitle={s => s.spendName}
                getSubtitle={s => new Date(s.date).toLocaleDateString()}
                getRight={s => `£${s.spend.toFixed(2)}`}
                deleteItem={(s) => handleDeleteSpend(s.id)} // delete icon on card
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No spends yet. Tap + to add one!</Text>
              </View>
            )}
          </ScrollView>

          {/* ADD SPEND BUTTON */}
          <ReusableFab icon="plus" onPress={() => showSpendDialog()} />

          {/* --- SPEND MODAL --- */}
          <Portal>
            <Modal visible={spendDialogVisible} onDismiss={hideSpendDialog} contentContainerStyle={styles.modalContainer}>
              <ScrollView>
                <Text style={styles.modalHeading}>{editingSpend ? 'Edit Spend' : 'New Spend'}</Text>

                <TextInputBox label="Spend Name" value={spendName} onChangeText={setSpendName} mode="outlined" style={styles.modalTextInput} />
                <TextInputBox label="Amount" value={spendAmount} onChangeText={setSpendAmount} keyboardType="numeric" mode="outlined" style={styles.modalTextInput} />

                <Button icon="calendar" mode="contained" style={styles.dateButton} textColor={modalDateButtonText} onPress={() => setShowDatePicker(true)}>
                  {spendDate.toLocaleDateString()}
                </Button>

                {showDatePicker && (
                  <DateTimePicker value={spendDate} mode="date" display="default" onChange={onDateChange} />
                )}

                <Button mode="contained" onPress={handleSaveSpend} style={styles.modalButton} textColor={modalButtonText}>
                  {editingSpend ? 'Update Spend' : 'Save Spend'}
                </Button>

                <Button mode="contained" onPress={hideSpendDialog} style={styles.modalButton} textColor={modalButtonText}>
                  Cancel
                </Button>
              </ScrollView>
            </Modal>
          </Portal>

          {/* --- BUDGET MODAL --- */}
          <Portal>
            <Modal visible={budgetDialogVisible} onDismiss={hideBudgetDialog} contentContainerStyle={styles.modalContainer}>
              <ScrollView>
                <Text style={styles.modalHeading}>{editingBudget ? 'Edit Budget' : 'New Budget'}</Text>

                <TextInputBox
                  label="Budget Name"
                  value={budgetName}
                  onChangeText={setBudgetName}
                  style={styles.modalTextInput}
                  disabled={editingBudget && isProtectedBudget(editingBudget)}
                />

                <TextInputBox
                  label="Total Amount"
                  value={budgetTotal}
                  onChangeText={setBudgetTotal}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.modalTextInput}
                />

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                <Button mode="contained" onPress={handleSaveBudgetFromSpend} style={styles.modalButton} textColor={modalButtonText}>
                  {editingBudget ? 'Update Budget' : 'Save Budget'}
                </Button>

                <Button mode="contained" onPress={hideBudgetDialog} style={styles.modalButton} textColor={modalButtonText}>
                  Cancel
                </Button>
              </ScrollView>
            </Modal>
          </Portal>

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
