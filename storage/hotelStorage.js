import AsyncStorage from '@react-native-async-storage/async-storage';
import {createSpend, addSpend, getBudgetIdByName} from './budgetStorage';
import { parse } from 'date-fns';
import { addItineraryEntry, getItineraries } from './itineraryStorage';

const STORAGE_KEY_HOTEL = 'HOTELS';

export const getHotels = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY_HOTEL);
  return json ? JSON.parse(json) : [];
};

export const getHotelsForTrip = async (tripId) => {
  const all = await getHotels();
  return all.filter(pl => pl.tripId === tripId);
};

//Helper function because of the god damn date argghghhghgh
const fixDate = (ddmmyyyy) => {
  try {
    const parsed = parse(ddmmyyyy, 'dd/MM/yyyy', new Date());
    return parsed.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

export const addHotel = async (Hotel) => {

  
  try {

    const all = await getHotels();
  
  
    const exists = all.some(h => h.id === Hotel.id);
  if (exists) {
    console.warn('Hotel already exists, refusing to add:', Hotel.id);
    return;
  }

    const updated = [...all, Hotel];
    await AsyncStorage.setItem(STORAGE_KEY_HOTEL, JSON.stringify(updated));

    const budgetId = await getBudgetIdByName('Accommodation', Hotel.tripId);
    
    if (budgetId) {
      const isoDate = fixDate(Hotel.startDate);
      const hotelTitle = `Accomodation: ${Hotel.hotelName}`;
      const newSpend = createSpend(
        budgetId,
        hotelTitle,
        isoDate,
        Hotel.cost,
        Hotel.tripId
      );
      await addSpend(newSpend);
      console.log('✅ Added spend for hotel:', newSpend);
    }


    // Add itinerary entries for each night -----------------------------------------------------

    const start = fixDate(Hotel.startDate);
    const end = fixDate(Hotel.endDate);
    const costPerNight = getCostPerNight(Hotel.cost, start, end);
    const dates = getDatesBetween(start, end);

    for (const date of dates) {
      const itineraryItem = {
        id: Date.now().toString() + Math.random(),
        tripId: Hotel.tripId,
        title: `Accommodation: ${Hotel.hotelName}`,
        date, 
        time: '',
        notes: '',
        cost: costPerNight.toFixed(2),
        budgetId: budgetId || null,
        spendId: null,
      };

      await addItineraryEntry(itineraryItem);
      console.log('✅ Added itinerary item:', itineraryItem);
      getItineraries();
    }

  } catch (error) {
    console.error('💥 Error in addHotel():', error);
  }
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



/* Helper to calculate dates between start and end and cost per night */

export const getDatesBetween = (start, end) => {
  const dates = [];
  let current = new Date(start);
  const last = new Date(end);

  while (current < last) { // endDate - 1
    const day = String(current.getDate()).padStart(2, '0');
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const year = current.getFullYear();
    dates.push(`${day}/${month}/${year}`);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const getCostPerNight = (totalCost, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const nights = Math.max(Math.round((end - start) / (1000 * 60 * 60 * 24)), 1);
  return totalCost / nights;
};

