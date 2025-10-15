import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_FLIGHT = 'FLIGHTS';

export const getFlights = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY_FLIGHT);
  return json ? JSON.parse(json) : [];
};

export const getFlightsForTrip = async (tripId) => {
  const all = await getFlights();
  return all.filter(pl => pl.tripId === tripId);
};

export const addFlight = async (Flight) => {
  const all = await getFlights();
  const updated = [...all, Flight];
  await AsyncStorage.setItem(STORAGE_KEY_FLIGHT, JSON.stringify(updated));
};

export const updateFlight = async (Flight) => {
  const all = await getFlights();
  const newAll = all.map(pl => pl.id === Flight.id ? Flight : pl);
  await AsyncStorage.setItem(STORAGE_KEY_FLIGHT, JSON.stringify(newAll));
};

export const deleteFlight = async (listId) => {
  const all = await getFlights();
  const filtered = all.filter(pl => pl.id !== listId);
  await AsyncStorage.setItem(STORAGE_KEY_FLIGHT, JSON.stringify(filtered));
};