
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addItineraryEntries, getItineraries, updateItineraryEntry } from './itineraryStorage';
import { getPackingLists, updatePackingList } from './packingStorage';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'TRIPS';

export const getTrips = async () => {
  const trips = await AsyncStorage.getItem(STORAGE_KEY);
  return trips ? JSON.parse(trips) : [];
};

export const saveTrips = async (trips) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
};

export const addTrip = async (trip) => {
  const trips = await getTrips();
  const updatedTrips = [...trips, trip];
  await saveTrips(updatedTrips);

  // 🆕 Generate and save itinerary entries
  const itineraryEntries = generateItinerary(trip);
  await addItineraryEntries(itineraryEntries);
};

export const updateTrip = async (updatedTrip) => {
  const trips = await getTrips();
  const newTrips = trips.map(t => t.id === updatedTrip.id ? updatedTrip : t);
  await saveTrips(newTrips);
};

export const deleteTrip = async (tripId) => {
  const trips = await getTrips();
  const filtered = trips.filter(t => t.id !== tripId);
  await saveTrips(filtered);

  // Delete associated itineraries
  const allItineraries = await getItineraries();
  const toDeleteItineraryIds = allItineraries.filter(e => e.tripId === tripId).map(e => e.id);
  const remainingItineraries = allItineraries.filter(e => e.tripId !== tripId);
  await AsyncStorage.setItem('ITINERARIES', JSON.stringify(remainingItineraries));

  // Delete associated packing lists and their items
  const allPacking = await getPackingLists();
  const remainingPacking = allPacking.filter(pl => pl.tripId !== tripId);
  await AsyncStorage.setItem('PACKING_LISTS', JSON.stringify(remainingPacking));
};

// Helper: generate itinerary between two dates
const generateItinerary = (trip) => {
  const { id: tripId, startDate, endDate } = trip;

  const [sd, sm, sy] = startDate.split('/').map(Number);
  const [ed, em, ey] = endDate.split('/').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  const entries = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    entries.push({
      id: uuidv4(),
      tripId,
      date: d.toISOString(), // store in ISO format
      day: '',
      night: '',
    });
  }
  return entries;
};
