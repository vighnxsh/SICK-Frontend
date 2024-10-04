// contexts/OktoContext.tsx
import React, { createContext, useContext } from 'react';
import { useOkto, type OktoContextType } from 'okto-sdk-react';

interface OktoProviderContextType {
  showWidgetModal: () => void;
  closeModal: () => void;
  authenticate: (idToken: string, callback: (response: any, error: any) => void) => void;
}

const OktoProviderContext = createContext<OktoProviderContextType | null>(null);

export const CustomOktoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const okto = useOkto() as OktoContextType;

  const value = {
    showWidgetModal: okto.showWidgetModal,
    closeModal: okto.closeModal,
    authenticate: okto.authenticate
  };

  return (
    <OktoProviderContext.Provider value={value}>
      {children}
    </OktoProviderContext.Provider>
  );
};

export const useOktoProvider = () => {
  const context = useContext(OktoProviderContext);
  if (!context) {
    throw new Error('useOktoProvider must be used within an OktoProvider');
  }
  return context;
};