import React, { useEffect, useState } from 'react';
import {View,StyleSheet,FlatList,Keyboard,TouchableWithoutFeedback,KeyboardAvoidingView,Platform,} from 'react-native';
import {Text,Button,Card,TextInput,Checkbox,IconButton,Divider,Dialog,Portal,} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {getPackingListsForTrip,addPackingList,updatePackingList,deletePackingList,} from '../storage/packingStorage';

import { v4 as uuidv4 } from 'uuid';
import TripSelector from '../components/TripSelector';
import { useTrip } from '../components/TripContext';

export default function Packing() {
  const { selectedTripId } = useTrip();
  const [packingLists, setPackingLists] = useState([]);
  const [activeList, setActiveList] = useState(null);

  const [newTypeName, setNewTypeName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedTripId) {
      loadPackingLists(selectedTripId);
    }
  }, [selectedTripId]);

  const loadPackingLists = async (tripId) => {
    const lists = await getPackingListsForTrip(tripId);
    setPackingLists(lists);
  };


  const handleCreateList = async () => {
    const trimmed = newTypeName.trim();
    if (!trimmed || !selectedTripId) {
      setErrorMsg('List name is required.');
      return;
    }

    const newList = {
      id: uuidv4(),
      tripId: selectedTripId,
      type: trimmed,
      items: [],
    };
    await addPackingList(newList);
    setNewTypeName('');
    setErrorMsg('');
    hideDialog();
    await loadPackingLists(selectedTripId);
  };

  const handleDeleteList = async (listId) => {
    await deletePackingList(listId);
    if (activeList?.id === listId) setActiveList(null);
    await loadPackingLists(selectedTripId);
  };

  const handleAddItemToActive = async () => {
    if (!activeList || !newItemName.trim()) return;

    const updated = {
      ...activeList,
      items: [...activeList.items, { id: uuidv4(), item: newItemName.trim(), checked: false }],
    };
    await updatePackingList(updated);
    setNewItemName('');
    setActiveList(updated);
    await loadPackingLists(selectedTripId);
  };

  const toggleItemChecked = async (itemId) => {
    const updatedItems = activeList.items.map(it =>
      it.id === itemId ? { ...it, checked: !it.checked } : it
    );
    const updatedList = { ...activeList, items: updatedItems };
    await updatePackingList(updatedList);
    setActiveList(updatedList);
    await loadPackingLists(selectedTripId);
  };

  const handleDeleteItem = async (itemId) => {
    const updatedItems = activeList.items.filter(it => it.id !== itemId);
    const updatedList = { ...activeList, items: updatedItems };
    await updatePackingList(updatedList);
    setActiveList(updatedList);
    await loadPackingLists(selectedTripId);
  };

  const showDialog = () => {
    setNewTypeName('');
    setErrorMsg('');
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setNewTypeName('');
    setErrorMsg('');
  };

  const renderListType = ({ item }) => (
    <TouchableWithoutFeedback onPress={() => setActiveList(item)}>
      <Card style={styles.typeCard}>
        <Card.Title
          title={item.type}
          right={(props) => (
            <IconButton {...props} icon="delete" onPress={() => handleDeleteList(item.id)} />
          )}
        />
      </Card>
    </TouchableWithoutFeedback>
  );

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Checkbox
        status={item.checked ? 'checked' : 'unchecked'}
        onPress={() => toggleItemChecked(item.id)}
      />
      <Text style={styles.itemText}>{item.item}</Text>
      <IconButton icon="delete" onPress={() => handleDeleteItem(item.id)} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <TripSelector />

            <Button
              icon="plus"
              onPress={showDialog}
              disabled={!selectedTripId}
              style={styles.button}
            >
              New List
            </Button>

            <Divider style={{ marginVertical: 10 }} />

            {!activeList ? (
              <FlatList
                data={packingLists}
                keyExtractor={pl => pl.id}
                renderItem={renderListType}
                ListEmptyComponent={<Text>No packing lists yet.</Text>}
              />
            ) : (
              <View style={{ flex: 1 }}>
                <Card style={styles.activeListHeader}>
                  <Card.Title
                    title={`List: ${activeList.type}`}
                    right={() => <Button onPress={() => setActiveList(null)}>Back</Button>}
                  />
                </Card>
                <FlatList
                  data={activeList.items}
                  keyExtractor={it => it.id}
                  renderItem={renderItem}
                  ListEmptyComponent={<Text>No items yet.</Text>}
                />
                <TextInput
                  label="New Item"
                  value={newItemName}
                  onChangeText={setNewItemName}
                  mode="outlined"
                  style={styles.input}
                />
                <Button mode="contained" onPress={handleAddItemToActive}>
                  Add Item
                </Button>
              </View>
            )}

            {/* Dialog for creating new list */}
            <Portal>
              <Dialog visible={dialogVisible} onDismiss={hideDialog}>
                <Dialog.Title>New Packing List</Dialog.Title>
                <Dialog.Content>
                  <TextInput
                    label="List Name (Type)"
                    value={newTypeName}
                    onChangeText={setNewTypeName}
                    mode="outlined"
                    style={styles.input}
                  />
                  {errorMsg ? (
                    <Text style={{ color: 'red', marginBottom: 10 }}>{errorMsg}</Text>
                  ) : null}
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={hideDialog}>Cancel</Button>
                  <Button onPress={handleCreateList}>Save</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    marginVertical: 10,
  },
  button: {
    marginVertical: 8,
    backgroundColor: 'purple',
    color: 'white',
  },
  typeCard: {
    marginBottom: 10,
  },
  activeListHeader: {
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
});
