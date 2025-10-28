import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_ITINERARY = 'ITINERARIES';

export const getItineraries = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY_ITINERARY);
  return json ? JSON.parse(json) : [];
};

export const getItineraryForTrip = async (tripId) => {
  const all = await getItineraries();
  return all
    .filter(entry => entry.tripId === tripId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const addItineraryEntry = async (itineraryItem) => {
  const all = await getItineraries();
  const updated = [...all, itineraryItem];
  await AsyncStorage.setItem(STORAGE_KEY_ITINERARY, JSON.stringify(updated));
};

export const updateItineraryEntry = async (entry) => {
  const all = await getItineraries();
  const newAll = all.map(e => (e.id === entry.id ? entry : e));
  await AsyncStorage.setItem(STORAGE_KEY_ITINERARY, JSON.stringify(newAll));
};

// ✅ NEW: Delete an itinerary entry by ID
export const deleteItineraryEntry = async (id) => {
  const all = await getItineraries();
  const filtered = all.filter(entry => entry.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY_ITINERARY, JSON.stringify(filtered));
};
