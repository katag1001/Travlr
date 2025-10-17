// contexts/TripContext.js
import React, { createContext, useContext, useState } from 'react';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [selectedTripId, setSelectedTripId] = useState(null);

  return (
    <TripContext.Provider value={{ selectedTripId, setSelectedTripId }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
