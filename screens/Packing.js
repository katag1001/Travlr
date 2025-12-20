/*REACT IMPORTS -----------------------------------------------------------------------------*/
import React, { useEffect, useState } from 'react';
import {View,StyleSheet,Keyboard,TouchableWithoutFeedback,KeyboardAvoidingView,Platform,ScrollView,ImageBackground,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Text,Button,Card,TextInput,Checkbox,IconButton,Portal,Modal,} from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';

import styles, { modalButtonText, backButtonText } from './Stylesheet';

/*FUNCTION IMPORTS -----------------------------------------------------------------------------*/
import {getPackingListsForTrip,addPackingList,updatePackingList,deletePackingList,} from '../storage/packingStorage';

/*COMPONENTS IMPORTS -----------------------------------------------------------------------------*/
import BackgroundImage from '../assets/images/backgrounds/general.png';
import { useTrip } from '../components/TripContext';
import ViewCard from '../components/ViewCard';
import ReusableFab from '../components/ReusableFab';
import TextInputBox from '../components/TextInputBox';


/*MAIN FUNCTION -----------------------------------------------------------------------------*/
export default function Packing({ navigation }) {
  const { selectedTripId, selectedTrip } = useTrip();

  const [packingLists, setPackingLists] = useState([]);
  const [activeList, setActiveList] = useState(null);

  const [newTypeName, setNewTypeName] = useState('');
  const [newItemName, setNewItemName] = useState('');

  const [dialogVisible, setDialogVisible] = useState(false);
  const [renameDialogVisible, setRenameDialogVisible] = useState(false);
  const [newItemDialogVisible, setNewItemDialogVisible] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedTripId) loadPackingLists(selectedTripId);
  }, [selectedTripId]);

  const loadPackingLists = async (tripId) => {
    const lists = await getPackingListsForTrip(tripId);
    setPackingLists(lists);
  };

  /*----------------------------------- List Handlers -----------------------------------*/
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

  /*----------------------------------- Item Handlers -----------------------------------*/
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
    hideNewItemDialog();
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

  /*----------------------------------- Dialog Helpers -----------------------------------*/
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

  const showNewItemDialog = () => {
    setNewItemName('');
    setErrorMsg('');
    setNewItemDialogVisible(true);
  };

  const hideNewItemDialog = () => {
    setNewItemDialogVisible(false);
    setNewItemName('');
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
              {/* Back Row with Page Title */}
              <View style={styles.backRow}>
                <IconButton
                  icon="arrow-left"
                  size={26}
                  onPress={() => navigation.goBack()}
                />
              </View>

              <Text style={styles.pageSubtitle}>Your Packing</Text>

              <ScrollView style={styles.scrollArea}>

                {/* EMPTY STATE */}
                {packingLists.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No lists yet — tap to add one!
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
                    {/* Back Button above the Card */}
                    <View>
                      <Button 
                      mode="contained" 
                      style={styles.internalBack}
                      textColor={backButtonText}
                      onPress={() => setActiveList(null)}>
                        Back to lists
                      </Button>
                    </View>

                    {/* Active List using ViewCard */}
                    <ViewCard
                      data={[activeList]}
                      onPressItem={() => {}}
                      getIcon={() => 'briefcase'}
                      getTitle={(pl) => pl.type}
                      getSubtitle={() => ''}
                      getDetail={(pl) => `${pl.items.length} items`}
                      getRight={() => ''}
                      deleteItem={() => {}}
                    />

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
                  </View>
                )}
              </ScrollView>

              {/* Shared FAB */}
              {selectedTripId && !activeList && (
                <ReusableFab
                  icon="plus"
                  mode="contained"
                  onPress={showDialog}
                />
              )}

              {selectedTripId && activeList && (
                <ReusableFab
                  icon="plus"
                  mode="contained"
                  onPress={showNewItemDialog}
                />
              )}

              {/* Dialogs */}
              <Portal>
                {/* New Packing List Modal */}
                <Modal
                  visible={dialogVisible}
                  onDismiss={hideDialog}
                  contentContainerStyle={styles.modalContainer}
                >
                  <ScrollView>
                    <Text style={styles.modalHeading}>New Packing List</Text>

                    <TextInputBox
                      label="List Name"
                      value={newTypeName}
                      onChangeText={setNewTypeName}
                      mode="outlined"
                      style={styles.modalTextInput}
                  
                    />

                    {errorMsg ? (
                      <Text style={styles.errorText}>{errorMsg}</Text>
                    ) : null}

                    <Button
                      mode="contained"
                      onPress={handleCreateList}
                      style={styles.modalButton}
                      textColor={modalButtonText}
                    >
                      Save
                    </Button>

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

                {/* Rename List Modal */}
                <Modal
                  visible={renameDialogVisible}
                  onDismiss={hideRenameDialog}
                  contentContainerStyle={styles.modalContainer}
                >
                  <ScrollView>
                    <Text style={styles.modalHeading}>Rename List</Text>

                    <TextInputBox
                      label="List Name"
                      value={newTypeName}
                      onChangeText={setNewTypeName}
                      mode="outlined"
                      style={styles.modalTextInput}
                    />

                    {errorMsg ? (
                      <Text style={styles.errorText}>{errorMsg}</Text>
                    ) : null}

                    <Button
                      mode="contained"
                      onPress={handleRenameList}
                      style={styles.modalButton}
                      textColor={modalButtonText}
                    >
                      Save
                    </Button>

                    <Button
                      mode="contained"
                      onPress={hideRenameDialog}
                      style={styles.modalButton}
                      textColor={modalButtonText}
                    >
                      Cancel
                    </Button>
                  </ScrollView>
                </Modal>

                {/* New Item Modal */}
                <Modal
                  visible={newItemDialogVisible}
                  onDismiss={hideNewItemDialog}
                  contentContainerStyle={styles.modalContainer}
                >
                  <ScrollView>
                    <Text style={styles.modalHeading}>New Item</Text>

                    <TextInputBox
                      label="Item Name"
                      value={newItemName}
                      onChangeText={setNewItemName}
                      mode="outlined"
                      style={styles.modalTextInput}
                    />

                    {errorMsg ? (
                      <Text style={styles.errorText}>{errorMsg}</Text>
                    ) : null}

                    <Button
                      mode="contained"
                      onPress={handleAddItemToActive}
                      style={styles.modalButton}
                      textColor={modalButtonText}
                    >
                      Save
                    </Button>

                    <Button
                      mode="contained"
                      onPress={hideNewItemDialog}
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
