import useIsLoginContext from '@/lib/hooks/useIsLoginContext';
import { ReactNode, createContext } from 'react';

interface IUserContextProviderProps {
  children: ReactNode;
}

export const UserContext = createContext({} as ReturnType<typeof useIsLoginContext>);

const UserContextProvider = ({ children }: IUserContextProviderProps) => {
  return <UserContext.Provider value={useIsLoginContext()}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
