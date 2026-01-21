import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSpend, addSpend, getBudgetIdByName } from './budgetStorage';
import { addItineraryEntry } from './itineraryStorage';
import { parse } from 'date-fns';
import { deleteItineraryEntryByTransportId } from './itineraryStorage';
import { updateItineraryEntryByTransportId } from './itineraryStorage';

const STORAGE_KEY_TRANSPORT = 'TRANSPORT';

export const getTransport = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY_TRANSPORT);
  return json ? JSON.parse(json) : [];
};

export const getTransportForTrip = async (tripId) => {
  const all = await getTransport();
  return all.filter(t => t.tripId === tripId);
};

const fixDate = (ddmmyyyy) => {
  try {
    const parsed = parse(ddmmyyyy, 'dd/MM/yyyy', new Date());
    return parsed.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

export const addTransport = async (transport) => {
  try {
    const all = await getTransport();
    
    const exists = all.some(t => t.id === transport.id);
    if (exists) {
      console.warn('Transport already exists, refusing to add:', transport.id);
      return;
    }

    const updated = [...all, transport];
    await AsyncStorage.setItem(STORAGE_KEY_TRANSPORT, JSON.stringify(updated));

    // Budget
    const budgetId = await getBudgetIdByName('Transport', transport.tripId);
    if (budgetId) {
      const isoDate = fixDate(transport.startDate);
      const spendTitle = `${transport.type} to ${transport.to}`;
      const newSpend = createSpend(
        budgetId,
        spendTitle,
        isoDate,
        transport.cost,
        transport.tripId
      );
      await addSpend(newSpend);
    }

    // Itinerary (single item)
const itineraryItem = {
  id: Date.now().toString() + Math.random(),
  tripId: transport.tripId,
  transportId: transport.id,    
  title: `${transport.type} to ${transport.to}`,
  date: transport.startDate,
  time: transport.time || '',
  notes: '',
  cost: transport.cost || 0,
  budgetId: budgetId || null,
  spendId: null,
};

    await addItineraryEntry(itineraryItem);

  } catch (error) {
    console.error('💥 Error in addTransport():', error);
  }
};

export const updateTransport = async (transport) => {
  const all = await getTransport();
  const newAll = all.map(t =>
    t.id === transport.id ? transport : t
  );

  await AsyncStorage.setItem(
    STORAGE_KEY_TRANSPORT,
    JSON.stringify(newAll)
  );

  await updateItineraryEntryByTransportId(transport);
};

export const deleteTransport = async (transportId) => {
  const all = await getTransport();
  const filtered = all.filter(t => t.id !== transportId);
  await AsyncStorage.setItem(
    STORAGE_KEY_TRANSPORT,
    JSON.stringify(filtered)
  );


  await deleteItineraryEntryByTransportId(transportId);
};
