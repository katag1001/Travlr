import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_HOTEL = 'HOTELS';

export const getHotels = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY_HOTEL);
  return json ? JSON.parse(json) : [];
};

export const getHotelsForTrip = async (tripId) => {
  const all = await getHotels();
  return all.filter(pl => pl.tripId === tripId);
};

export const addHotel = async (Hotel) => {
  const all = await getHotels();
  const updated = [...all, Hotel];
  await AsyncStorage.setItem(STORAGE_KEY_HOTEL, JSON.stringify(updated));
};

export const updateHotel = async (Hotel) => {
  const all = await getHotels();
  const newAll = all.map(pl => pl.id === Hotel.id ? Hotel : pl);
  await AsyncStorage.setItem(STORAGE_KEY_HOTEL, JSON.stringify(newAll));
};

export const deleteHotel = async (listId) => {
  const all = await getHotels();
  const filtered = all.filter(pl => pl.id !== listId);
  await AsyncStorage.setItem(STORAGE_KEY_HOTEL, JSON.stringify(filtered));
};