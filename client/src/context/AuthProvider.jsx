import React, { createContext, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribed = auth.onIdTokenChanged((user) => {
      console.log('[user]',{ user });
      if(user?.uid) {
        setUser(user);
        if(user.accessToken !== localStorage.getItem('accessToken')) {
          localStorage.setItem('accessToken', user.accessToken);
          window.location.reload();
        }
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setUser({});
      localStorage.clear();
      navigate('/login');
    });
    return () => {
      unsubscribed();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {isLoading ? <CircularProgress /> : children }
    </AuthContext.Provider>
  );
}
