import React, { createContext, useContext, useState } from 'react';

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Helper for selecting trips consistently
  const selectTrip = (trip) => {
    setSelectedTripId(trip?.id ?? null);
    setSelectedTrip(trip ?? null);
  };

  return (
    <TripContext.Provider
      value={{
        selectedTripId,
        setSelectedTripId,
        selectedTrip,
        setSelectedTrip,
        selectTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
