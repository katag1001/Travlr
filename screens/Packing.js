/*REACT IMPORTS -----------------------------------------------------------------------------*/

import React, { useEffect, useState } from 'react';
import {View,StyleSheet,Keyboard,TouchableWithoutFeedback,KeyboardAvoidingView,Platform,ScrollView, ImageBackground,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card,TextInput,Checkbox,IconButton,Divider,Dialog,Portal,} from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';

import styles from './Stylesheet';

/*fUNCTION IMPORTS -----------------------------------------------------------------------------*/

import { getPackingListsForTrip, addPackingList, updatePackingList, deletePackingList,} from '../storage/packingStorage';

/*COMPONENTS IMPORTS -----------------------------------------------------------------------------*/

import { useTrip } from '../components/TripContext';
/* import Banner from '../components/Banner';*/
import ViewCard from '../components/ViewCard';
import ReusableFab from '../components/ReusableFab';

import BackgroundImage from '../assets/images/backgrounds/general.png';


/*MAIN FUNCTION -----------------------------------------------------------------------------*/
export default function Packing({ navigation }) {
  const { selectedTripId, selectedTrip } = useTrip();

  const [packingLists, setPackingLists] = useState([]);
  const [activeList, setActiveList] = useState(null);

  const [newTypeName, setNewTypeName] = useState('');
  const [newItemName, setNewItemName] = useState('');

  const [dialogVisible, setDialogVisible] = useState(false);
  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedTripId) loadPackingLists(selectedTripId);
  }, [selectedTripId]);

  const loadPackingLists = async (tripId) => {
    const lists = await getPackingListsForTrip(tripId);
    setPackingLists(lists);
  };

  const handleCreateList = async () => {
    const trimmed = newTypeName.trim();
    if (!trimmed) {
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
    hideDialog();
    loadPackingLists(selectedTripId);
  };

  const handleRenameList = async () => {
    const trimmed = newTypeName.trim();
    if (!trimmed) {
      setErrorMsg('List name is required.');
      return;
    }

    const updatedList = { ...activeList, type: trimmed };
    await updatePackingList(updatedList);

    hideRenameDialog();
    setActiveList(updatedList);
    loadPackingLists(selectedTripId);
  };

  const handleDeleteList = async (listId) => {
    await deletePackingList(listId);
    if (activeList?.id === listId) setActiveList(null);
    loadPackingLists(selectedTripId);
  };

  const handleAddItemToActive = async () => {
    if (!activeList || !newItemName.trim()) return;

    const updatedList = {
      ...activeList,
      items: [
        ...activeList.items,
        { id: uuidv4(), item: newItemName.trim(), checked: false },
      ],
    };

    await updatePackingList(updatedList);
    setActiveList(updatedList);
    setNewItemName('');
    loadPackingLists(selectedTripId);
  };

  const toggleItemChecked = async (itemId) => {
    const updatedItems = activeList.items.map((it) =>
      it.id === itemId ? { ...it, checked: !it.checked } : it
    );

    const updatedList = { ...activeList, items: updatedItems };
    await updatePackingList(updatedList);

    setActiveList(updatedList);
    loadPackingLists(selectedTripId);
  };

  const handleDeleteItem = async (itemId) => {
    const updatedList = {
      ...activeList,
      items: activeList.items.filter((it) => it.id !== itemId),
    };

    await updatePackingList(updatedList);
    setActiveList(updatedList);
    loadPackingLists(selectedTripId);
  };

  // ————— Dialog Helpers —————
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

  const showRenameDialog = () => {
    if (!activeList) return;
    setNewTypeName(activeList.type);
    setErrorMsg('');
    setRenameDialogVisible(true);
  };

  const hideRenameDialog = () => {
    setRenameDialogVisible(false);
    setNewTypeName('');
    setErrorMsg('');
  };

  return (
    <ImageBackground
        source={BackgroundImage} 
        style={styles.backgroundImage}
        resizeMode="cover"
      > 

      
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.keyboardContainer}
>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>

            {/*{selectedTrip && <Banner theme={selectedTrip.theme} />}*/}

            
            <View style={styles.backRow}>
              <IconButton
                icon="arrow-left"
                size={26}
                onPress={() => navigation.goBack()}
              />
              <Text style={styles.pageTitle}>Packing</Text>
            </View>

            <ScrollView style={styles.scrollArea}>
              <Divider style={styles.divider} />


              {/* EMPTY STATE */}
              {packingLists.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No lists yet — tap "+" to add one!
                  </Text>
                </View>
              ) : !activeList ? (
                <ViewCard
                  data={packingLists}
                  onPressItem={(item) => setActiveList(item)}
                  getIcon={() => 'briefcase'}
                  getTitle={(pl) => pl.type}
                  getSubtitle={() => ''}
                  getDetail={(pl) => `${pl.items.length} items`}
                  getRight={() => ''}
                  deleteItem={(pl) => handleDeleteList(pl.id)}
                />
              ) : (
                <View style={styles.activeListContainer}>

                  <Card
                    style={styles.activeListHeader}
                    onPress={showRenameDialog}
                  >
                    <Card.Title
                      title={`${activeList.type}`}
                      right={() => (
                        <Button onPress={() => setActiveList(null)}>Back</Button>
                      )}
                    />
                  </Card>

                  {activeList.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Checkbox
                        status={item.checked ? 'checked' : 'unchecked'}
                        onPress={() => toggleItemChecked(item.id)}
                      />
                      <Text style={styles.itemText}>{item.item}</Text>
                      <IconButton
                        icon="delete"
                        onPress={() => handleDeleteItem(item.id)}
                      />
                    </View>
                  ))}

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
            </ScrollView>

            {/* Shared FAB */}
            {selectedTripId && (
              <ReusableFab
                icon="plus"
                label="New List"
                onPress={showDialog}
              />
            )}

            {/* Dialogs */}
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
                    <Text style={styles.error}>{errorMsg}</Text>
                  ) : null}
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={hideDialog}>Cancel</Button>
                  <Button onPress={handleCreateList}>Save</Button>
                </Dialog.Actions>
              </Dialog>

              <Dialog visible={renameDialogVisible} onDismiss={hideRenameDialog}>
                <Dialog.Title>Rename List</Dialog.Title>
                <Dialog.Content>
                  <TextInput
                    label="List Name"
                    value={newTypeName}
                    onChangeText={setNewTypeName}
                    mode="outlined"
                    style={styles.input}
                  />
                  {errorMsg ? (
                    <Text style={styles.error}>{errorMsg}</Text>
                  ) : null}
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={hideRenameDialog}>Cancel</Button>
                  <Button onPress={handleRenameList}>Save</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>

    </ImageBackground>
  );
}


