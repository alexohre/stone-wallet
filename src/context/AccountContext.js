"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";

const AccountContext = createContext();

export function AccountProvider({ children }) {
	const { accounts: authAccounts, lastUpdate } = useAuth();
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [localAccounts, setLocalAccounts] = useState([]);

	// Memoize setSelectedAccount callback
	const handleSetSelectedAccount = useCallback((account) => {
		console.log("AccountContext - Setting selected account:", account?.id);
		setSelectedAccount(account);
	}, []);

	// Sync with auth accounts
	useEffect(() => {
		const authAccountsArray = Array.isArray(authAccounts) ? authAccounts : [];
		console.log("AccountContext - Auth accounts updated:", {
			authAccountsLength: authAccountsArray.length,
			localAccountsLength: localAccounts.length,
			selectedAccountId: selectedAccount?.id,
			lastUpdate: new Date(lastUpdate).toISOString()
		});

		// Always update local accounts to match auth accounts
		setLocalAccounts(authAccountsArray);

		// Handle selected account
		if (authAccountsArray.length === 0) {
			console.log("AccountContext - No accounts available, clearing selection");
			setSelectedAccount(null);
			return;
		}

		if (!selectedAccount) {
			console.log("AccountContext - No selected account, selecting first:", authAccountsArray[0].id);
			setSelectedAccount(authAccountsArray[0]);
			return;
		}

		// If selected account is not in auth accounts, select the first one
		const accountExists = authAccountsArray.find(a => a.id === selectedAccount.id);
		if (!accountExists) {
			console.log("AccountContext - Selected account not found, selecting first:", authAccountsArray[0].id);
			setSelectedAccount(authAccountsArray[0]);
			return;
		}

		// Update selected account data if it changed
		if (JSON.stringify(accountExists) !== JSON.stringify(selectedAccount)) {
			console.log("AccountContext - Updating selected account data:", accountExists.id);
			setSelectedAccount(accountExists);
		}
	}, [authAccounts, lastUpdate, selectedAccount]);

	// Handle external account updates
	useEffect(() => {
		const handleAccountsUpdated = () => {
			console.log("AccountContext - External accounts update received");
			const authAccountsArray = Array.isArray(authAccounts) ? authAccounts : [];
			
			// Always sync local accounts
			setLocalAccounts(authAccountsArray);

			if (authAccountsArray.length === 0) {
				setSelectedAccount(null);
				return;
			}

			// Keep current selection if it exists, otherwise select first account
			const currentAccount = authAccountsArray.find(a => a.id === selectedAccount?.id);
			setSelectedAccount(currentAccount || authAccountsArray[0]);
		};

		window.addEventListener("accountsUpdated", handleAccountsUpdated);
		return () => window.removeEventListener("accountsUpdated", handleAccountsUpdated);
	}, [authAccounts, selectedAccount?.id]);

	// Memoize the context value
	const value = useMemo(() => ({
		accounts: localAccounts,
		selectedAccount,
		setSelectedAccount: handleSetSelectedAccount
	}), [localAccounts, selectedAccount, handleSetSelectedAccount]);

	return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
	const context = useContext(AccountContext);
	if (!context) {
		throw new Error("useAccount must be used within an AccountProvider");
	}
	return context;
}
