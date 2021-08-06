import { createContext } from 'react';

const LocalizationContext = createContext('');

const LocalizationProvider = ({ culture, children }) => {
  return (
    <LocalizationContext.Provider value={culture || 'en'}>
      {children}
    </LocalizationContext.Provider>
  );
};

export { LocalizationContext, LocalizationProvider };
