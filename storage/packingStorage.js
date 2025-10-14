import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PACKING = 'PACKING_LISTS';

export const getPackingLists = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY_PACKING);
  return json ? JSON.parse(json) : [];
};

export const getPackingListsForTrip = async (tripId) => {
  const all = await getPackingLists();
  return all.filter(pl => pl.tripId === tripId);
};

export const addPackingList = async (packingList) => {
  const all = await getPackingLists();
  const updated = [...all, packingList];
  await AsyncStorage.setItem(STORAGE_KEY_PACKING, JSON.stringify(updated));
};

export const updatePackingList = async (packingList) => {
  const all = await getPackingLists();
  const newAll = all.map(pl => pl.id === packingList.id ? packingList : pl);
  await AsyncStorage.setItem(STORAGE_KEY_PACKING, JSON.stringify(newAll));
};

export const deletePackingList = async (listId) => {
  const all = await getPackingLists();
  const filtered = all.filter(pl => pl.id !== listId);
  await AsyncStorage.setItem(STORAGE_KEY_PACKING, JSON.stringify(filtered));
};
