"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const AccountContext = createContext();

export function AccountProvider({ children }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    if (user?.accounts) {
      setAccounts(user.accounts);
      // If there's no selected account or the selected account is not in the new accounts list
      if (!selectedAccount || !user.accounts.find(a => a.id === selectedAccount.id)) {
        setSelectedAccount(user.accounts[0]);
      }
    } else {
      setAccounts([]);
      setSelectedAccount(null);
    }
  }, [user, user?.accounts]); // Add user.accounts to dependency array

  const value = {
    accounts,
    selectedAccount,
    setSelectedAccount,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
