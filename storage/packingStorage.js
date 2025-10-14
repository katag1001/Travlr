// storage/packingStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PACKING = 'PACKING_LISTS';

// returns all packing lists (for all trips)
export const getPackingLists = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY_PACKING);
  return json ? JSON.parse(json) : [];
};

// get lists for a specific trip
export const getPackingListsForTrip = async (tripId) => {
  const all = await getPackingLists();
  return all.filter(pl => pl.tripId === tripId);
};

// add new list (type) for a trip
export const addPackingList = async (packingList) => {
  const all = await getPackingLists();
  const updated = [...all, packingList];
  await AsyncStorage.setItem(STORAGE_KEY_PACKING, JSON.stringify(updated));
};

// update an existing list (e.g. add/remove items, check/uncheck)
export const updatePackingList = async (packingList) => {
  const all = await getPackingLists();
  const newAll = all.map(pl => pl.id === packingList.id ? packingList : pl);
  await AsyncStorage.setItem(STORAGE_KEY_PACKING, JSON.stringify(newAll));
};

// delete a full list (type) by its id
export const deletePackingList = async (listId) => {
  const all = await getPackingLists();
  const filtered = all.filter(pl => pl.id !== listId);
  await AsyncStorage.setItem(STORAGE_KEY_PACKING, JSON.stringify(filtered));
};
