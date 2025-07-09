import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context type
interface RefreshContextType {
  refreshTimestamp: number;
  triggerRefresh: () => void;
}

// Create the context with default values
const RefreshContext = createContext<RefreshContextType>({
  refreshTimestamp: 0,
  triggerRefresh: () => {},
});

// Create a provider component
export const RefreshProvider = ({ children }: { children: ReactNode }) => {
  const [refreshTimestamp, setRefreshTimestamp] = useState<number>(0);

  const triggerRefresh = () => {
    setRefreshTimestamp(Date.now());
  };

  return (
    <RefreshContext.Provider value={{ refreshTimestamp, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

// Create a custom hook to use the refresh context
export const useRefresh = () => useContext(RefreshContext);
