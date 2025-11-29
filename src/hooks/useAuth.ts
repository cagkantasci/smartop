import { useContext } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { getAccessToken } from '../services/api';

export function useAuth() {
  const auth = useAuthContext();
  const token = getAccessToken();

  return {
    ...auth,
    token,
  };
}

export default useAuth;
