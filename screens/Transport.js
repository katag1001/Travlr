/* REACT IMPORTS ----------------------------------------------------------------------------- */
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ImageBackground, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Portal, Modal, IconButton, Menu } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import styles, { modalButtonText, modalDateButtonText } from './Stylesheet';

/* FUNCTION IMPORTS ----------------------------------------------------------------------------- */
import { getTransportForTrip, addTransport, updateTransport, deleteTransport } from '../storage/transportStorage';

/* COMPONENTS IMPORTS ----------------------------------------------------------------------------- */
import { useTrip } from '../components/TripContext';
import ViewCard from '../components/ViewCard';
import ReusableFab from '../components/ReusableFab';
import BackgroundImage from '../assets/images/backgrounds/general2.jpg';
import TextInputBox from '../components/TextInputBox';

/* MAIN FUNCTION ----------------------------------------------------------------------------- */
export default function Transport({ navigation }) {
  const { selectedTripId, selectedTrip } = useTrip();

  const [transports, setTransports] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    id: null,
    type: '',
    from: '',
    to: '',
    transportNo: '',
    cost: '',
    startDate: '',
    time: '',
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const isEditing = !!form.id;

  useEffect(() => {
    if (selectedTripId) loadTransports();
  }, [selectedTripId]);

  const loadTransports = async () => {
    const t = await getTransportForTrip(selectedTripId);
    const sorted = t.sort(
      (a, b) => new Date(parseDate(a.startDate)) - new Date(parseDate(b.startDate))
    );
    setTransports(sorted);
  };

  const resetForm = () => {
    setForm({
      id: null,
      type: '',
      from: '',
      to: '',
      transportNo: '',
      cost: '',
      startDate: '',
      time: '',
    });
    setShowForm(false);
    setShowTypeMenu(false);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setForm({ ...form, startDate: formatDate(selectedDate) });
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setForm({ ...form, time: `${hours}:${minutes}` });
    }
  };

  const handleSubmit = async () => {
    const { type, to, startDate } = form;
    if (!type || !to || !startDate) {
      Alert.alert('Type, To, and Date are required.');
      return;
    }

    const newTransport = {
      ...form,
      id: isEditing ? form.id : Date.now().toString(),
      tripId: selectedTripId,
      cost: parseFloat(form.cost) || 0,
    };

    try {
      if (isEditing) {
        await updateTransport(newTransport);
      } else {
        await addTransport(newTransport);
      }
      resetForm();
      loadTransports();
    } catch (err) {
      console.error('💥 Failed to save transport:', err);
      Alert.alert('Error', 'Failed to save transport. Check console for details.');
    }
  };

  const handleEdit = (t) => {
    setForm({ ...t, cost: t.cost?.toString() || '' });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Transport', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteTransport(id);
        loadTransports();
      }}
    ]);
  };

  return (
    <ImageBackground source={BackgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoiding}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <View style={styles.backRow}>
                <IconButton icon="arrow-left" size={26} onPress={() => navigation.goBack()} />
              </View>

              <Text style={styles.pageSubtitle}>Your Transport</Text>

              <ScrollView style={styles.scrollArea}>
                {transports.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No transport yet. Tap + to add one!</Text>
                  </View>
                ) : (
                  <ViewCard
                    data={transports}
                    onPressItem={handleEdit}
                    getIcon={() => null}
                    getTitle={(t) => `${t.type} to ${t.to}`}
                    getSubtitle={(t) => `${t.from} → ${t.to}`}
                    getDetail={(t) => `${t.startDate} ${t.time ? `· ${t.time}` : ''}`}
                    getRight={(t) => (t.cost ? `£${t.cost}` : '')}
                    deleteItem={(t) => handleDelete(t.id)}
                  />
                )}
              </ScrollView>

              {selectedTripId && <ReusableFab icon="plus" onPress={() => setShowForm(true)} />}

              {/* Modal Form */}
<Portal>
  <Modal visible={showForm} onDismiss={resetForm} contentContainerStyle={styles.modalContainer}>
    <ScrollView>
      <Text style={styles.modalHeading}>{isEditing ? 'Edit Transport' : 'New Transport'}</Text>

      {/* Type Dropdown */}
<View style={{ marginBottom: 10 }}>
  <Button
    mode="contained"
    style={styles.modalButton}
    textColor={modalButtonText}
    onPress={() => setShowTypeMenu(true)}
  >
    {form.type ? `${form.type}` : 'Select Type'}
  </Button>

  {/* Mini modal acting as dropdown */}
<Portal>
  <Modal
    visible={showTypeMenu}
    onDismiss={() => setShowTypeMenu(false)}
    contentContainerStyle={styles.typeModalContainer}
  >
    {['Flight', 'Train', 'Boat', 'Bus', 'Taxi', 'Other'].map((t) => (
      <Button
        key={t}
        mode="text"
        onPress={() => {
          setForm({ ...form, type: t });
          setShowTypeMenu(false);
        }}
        style={styles.typeModalButton}
        textColor={modalButtonText}
      >
        {t.charAt(0).toUpperCase() + t.slice(1)}
      </Button>
    ))}
  </Modal>
</Portal>

</View>


      {/* Other Inputs */}
      <TextInputBox
        label="From"
        value={form.from}
        onChangeText={(t) => setForm({ ...form, from: t })}
        mode="outlined"
        style={styles.modalTextInput}
      />
      <TextInputBox
        label="To"
        value={form.to}
        onChangeText={(t) => setForm({ ...form, to: t })}
        mode="outlined"
        style={styles.modalTextInput}
      />
      <TextInputBox
        label="Transport No. (optional)"
        value={form.transportNo}
        onChangeText={(t) => setForm({ ...form, transportNo: t })}
        mode="outlined"
        style={styles.modalTextInput}
      />
      <TextInputBox
        label="Cost"
        keyboardType="numeric"
        value={form.cost}
        onChangeText={(t) => setForm({ ...form, cost: t })}
        mode="outlined"
        style={styles.modalTextInput}
      />

      {/* Date Picker */}
      <Button
        mode="contained"
        icon="calendar"
        style={styles.dateButton}
        textColor={modalDateButtonText}
        onPress={() => setShowStartPicker(true)}
      >
        {form.startDate ? `Start: ${form.startDate}` : 'Select Start Date'}
      </Button>
      {showStartPicker && selectedTrip && (
        <DateTimePicker
          value={form.startDate ? parseDate(form.startDate) : parseDate(selectedTrip.startDate)}
          mode="date"
          minimumDate={parseDate(selectedTrip.startDate)}
          maximumDate={parseDate(selectedTrip.endDate)}
          onChange={onStartDateChange}
        />
      )}

      {/* Time Picker */}
      <Button
        mode="contained"
        icon="clock-outline"
        style={styles.dateButton}
        textColor={modalDateButtonText}
        onPress={() => setShowTimePicker(true)}
      >
        {form.time ? `Time: ${form.time}` : 'Select Time (optional)'}
      </Button>
      {showTimePicker && (
        <DateTimePicker
          mode="time"
          is24Hour={true}
          value={form.time ? new Date(`2000-01-01T${form.time}:00`) : new Date()}
          onChange={onTimeChange}
        />
      )}

      {/* Submit / Cancel Buttons */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.modalButton}
        textColor={modalButtonText}
      >
        {isEditing ? 'Update Transport' : 'Save Transport'}
      </Button>

      <Button
        mode="contained"
        onPress={resetForm}
        style={styles.modalButton}
        textColor={modalButtonText}
      >
        Cancel
      </Button>
    </ScrollView>
  </Modal>
</Portal>


            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}
