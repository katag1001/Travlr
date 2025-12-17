/*REACT IMPORTS -----------------------------------------------------------------------------*/

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, ImageBackground, ScrollView} from 'react-native';
import { Text, Button, TextInput, Portal, FAB, Modal, IconButton} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import styles, { modalButtonText, modalDateButtonText, fabButtonText, navButtonText} from './Stylesheet';

/*fUNCTION IMPORTS -----------------------------------------------------------------------------*/

import { getSpendsForBudget, addSpend, updateSpend,deleteSpend, createSpend} from '../storage/budgetStorage';


/*COMPONENTS IMPORTS -----------------------------------------------------------------------------*/

import ViewCard from '../components/ViewCard';
import BackgroundImage from '../assets/images/backgrounds/general.png';
import TextInputBox from '../components/TextInputBox';

/*MAIN FUNCTION -----------------------------------------------------------------------------*/

export default function Spend({ budget, onBack }) {
  const navigation = useNavigation();
  
  const { id: budgetId, budgetName, tripId } = budget;

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
      const updated = { ...editingSpend, spendName, spend: amount, date: dateValue };
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
    hideDialog();
    loadSpends();
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setSpendDate(selectedDate);
  };

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
            onPress={() => navigation.navigate('Home')}
          />
          <Text style={styles.pageTitle}>Budget</Text>
        </View>


      <Button onPress={onBack} 
      mode="contained" 
      style={styles.internalBack}>
        Back to budgets
      </Button>

      <Text style={styles.pageSubtitle}>Spends for {budgetName}</Text>

      {spends.length > 0 ? (
        <ViewCard
          data={spends}
          onPressItem={showDialog}
          getTitle={s => s.spendName}
          getSubtitle={s => new Date(s.date).toLocaleDateString()}
          getRight={s => `£${s.spend.toFixed(2)}`}
        />
      ) : (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No spends yet.</Text>
      </View>
      )}

      <FAB icon="plus" style={styles.fab} onPress={() => showDialog()} label="Add Spend" />

      <Portal>
  <Modal
    visible={dialogVisible}
    onDismiss={hideDialog}
    contentContainerStyle={styles.modalContainer}
  >
    <ScrollView>
      <Text style={styles.modalHeading}>
        {editingSpend ? 'Edit Spend' : 'New Spend'}
      </Text>

      <TextInputBox
        label="Spend Name"
        value={spendName}
        onChangeText={setSpendName}
        mode="outlined"
        style={styles.modalTextInput}
      />

      <TextInputBox
        label="Amount"
        value={spendAmount}
        onChangeText={setSpendAmount}
        keyboardType="numeric"
        mode="outlined"
        style={styles.modalTextInput}
      />

      <Button
        icon="calendar"
        mode="contained"
        style={styles.dateButton}
        textColor={modalDateButtonText} 
        onPress={() => setShowDatePicker(true)}
      >
        {spendDate.toLocaleDateString()}
      </Button>

      {showDatePicker && (
        <DateTimePicker
          value={spendDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Buttons */}
      <Button
        mode="contained"
        onPress={handleSaveSpend}
        style={styles.modalButton}
        textColor={modalButtonText}
      >
        {editingSpend ? 'Update Spend' : 'Save Spend'}
      </Button>

      {editingSpend && (
        <Button
          mode="contained"
          onPress={() => handleDeleteSpend(editingSpend.id)}
          style={styles.modalButton}
          textColor={modalButtonText}
        >
          Delete
        </Button>
      )}

      <Button
        mode="contained"
        onPress={hideDialog}
        style={styles.modalButton}
        textColor={modalButtonText}
      >
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
