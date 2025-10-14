// storage/itineraryStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_ITINERARY = 'ITINERARIES';

// Get all itinerary entries
export const getItineraries = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY_ITINERARY);
  return json ? JSON.parse(json) : [];
};

// Get itinerary entries for a given trip
export const getItineraryForTrip = async (tripId) => {
  const all = await getItineraries();
  return all
    .filter(entry => entry.tripId === tripId)
    // optional: sort by date
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Add many entries (used when creating a trip)
export const addItineraryEntries = async (entries) => {
  const all = await getItineraries();
  const updated = [...all, ...entries];
  await AsyncStorage.setItem(STORAGE_KEY_ITINERARY, JSON.stringify(updated));
};

// Update one entry (edit day or night)
export const updateItineraryEntry = async (entry) => {
  const all = await getItineraries();
  const newAll = all.map(e => (e.id === entry.id ? entry : e));
  await AsyncStorage.setItem(STORAGE_KEY_ITINERARY, JSON.stringify(newAll));
};
