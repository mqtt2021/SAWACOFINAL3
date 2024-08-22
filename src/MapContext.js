// src/context/MapContext.js
import React, { createContext, useState, useContext } from 'react';

// Tạo Context
const MapContext = createContext();

// Tạo Provider
export const MapProvider = ({ children }) => {
  const [center, setCenter] = useState({ lat: 10.780064402624358,lng: 106.64558796192786  });
  const [zoomLevel, setZoomLevel] = useState(18);
  const [percentBattery, setPercentBattery] = useState(0);
  const [getPositionUser, setGetPositionUser] = useState(false);

  return (
    <MapContext.Provider value={{ center, setCenter, zoomLevel, setZoomLevel, percentBattery, setPercentBattery, getPositionUser, setGetPositionUser }}>
            {children}
    </MapContext.Provider>
  );
};

// Hook để sử dụng Context
export const useMapContext = () => useContext(MapContext);
