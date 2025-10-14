// screens/Packing.js
import React, { useEffect, useState } from 'react';
import {View,StyleSheet,FlatList,Alert,Keyboard,TouchableWithoutFeedback,} from 'react-native';
import {Text,Button,Card,TextInput,Checkbox,IconButton,Divider,} from 'react-native-paper';
import {getPackingListsForTrip,addPackingList,updatePackingList,deletePackingList,} from '../storage/packingStorage';

import { v4 as uuidv4 } from 'uuid';
import TripSelector from '../components/TripSelector';

export default function Packing() {
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [packingLists, setPackingLists] = useState([]);
  const [activeList, setActiveList] = useState(null);

  const [newTypeName, setNewTypeName] = useState('');
  const [newItemName, setNewItemName] = useState('');

  useEffect(() => {
    if (selectedTripId) {
      loadPackingLists(selectedTripId);
    }
  }, [selectedTripId]);

  const loadPackingLists = async (tripId) => {
    const lists = await getPackingListsForTrip(tripId);
    setPackingLists(lists);
  };

  const handleTripChange = (tripId) => {
    setSelectedTripId(tripId);
    setActiveList(null);
  };

  const handleCreateList = async () => {
    if (!newTypeName.trim() || !selectedTripId) return;

    const newList = {
      id: uuidv4(),
      tripId: selectedTripId,
      type: newTypeName.trim(),
      items: [],
    };
    await addPackingList(newList);
    setNewTypeName('');
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

  const renderListType = ({ item }) => (
    <Card style={styles.typeCard}>
      <Card.Title
        title={item.type}
        right={(props) => (
          <IconButton {...props} icon="delete" onPress={() => handleDeleteList(item.id)} />
        )}
      />
      <Card.Actions>
        <Button onPress={() => setActiveList(item)}>Open</Button>
      </Card.Actions>
    </Card>
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TripSelector
            selectedTripId={selectedTripId}
            onSelectTrip={handleTripChange}
          />
          <Button icon="plus" onPress={handleCreateList} style={styles.addButton}>
            New List
          </Button>
        </View>

        <TextInput
          label="New List Name (Type)"
          value={newTypeName}
          onChangeText={setNewTypeName}
          mode="outlined"
          style={styles.input}
        />

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
                right={() => (
                  <Button onPress={() => setActiveList(null)}>Back</Button>
                )}
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
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    marginVertical: 10,
  },
  addButton: {
    marginLeft: 10,
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
