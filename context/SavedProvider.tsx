import React, { createContext, useContext, useState } from "react";

const SavedContext = createContext<any>(null);

export const useSaved = () => useContext(SavedContext);

export const SavedProvider = ({ children }: any) => {
  const [savedIds, setSavedIds] = useState<number[]>([]);

  const addSaved = (movieId: number) => {
    setSavedIds(prev => [...prev, movieId]);
  };

  const removeSaved = (movieId: number) => {
    setSavedIds(prev => prev.filter(id => id !== movieId));
  };

  return (
    <SavedContext.Provider
      value={{ savedIds, addSaved, removeSaved }}
    >
      {children}
    </SavedContext.Provider>
  );
};
