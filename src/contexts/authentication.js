import { createContext } from 'react';

const AuthenticationContext = createContext(null);

const AuthenticationProvider = ({ user, setUser, children }) => {
  return (
    <AuthenticationContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export { AuthenticationContext, AuthenticationProvider };
