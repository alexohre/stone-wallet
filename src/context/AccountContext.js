"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";

const AccountContext = createContext();

export function AccountProvider({ children }) {
	const { user, accounts: authAccounts } = useAuth();
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [localAccounts, setLocalAccounts] = useState([]);

	// Sync with auth accounts
	useEffect(() => {
		console.log("AccountContext - Auth state changed:", {
			userId: user?.id,
			authAccounts: authAccounts,
			localAccounts: localAccounts,
			selectedAccount: selectedAccount?.id
		});

		if (Array.isArray(authAccounts)) {
			setLocalAccounts(authAccounts);
			
			// Select first account if none selected or current selection invalid
			if (authAccounts.length > 0) {
				const currentIsValid = selectedAccount && authAccounts.find(a => a.id === selectedAccount.id);
				if (!currentIsValid) {
					console.log("AccountContext - Setting initial account:", authAccounts[0]);
					setSelectedAccount(authAccounts[0]);
				}
			} else {
				setSelectedAccount(null);
			}
		}
	}, [user, authAccounts, localAccounts]);

	// Handle selection changes
	useEffect(() => {
		if (Array.isArray(authAccounts) && authAccounts.length > 0 && !selectedAccount) {
			setSelectedAccount(authAccounts[0]);
		}
	}, [authAccounts, selectedAccount]);

	// Trigger an event when selected account changes
	useEffect(() => {
		if (selectedAccount) {
			window.dispatchEvent(new CustomEvent('accountChanged', { 
				detail: { accountId: selectedAccount.id } 
			}));
		}
	}, [selectedAccount]);

	// Debug logging
	useEffect(() => {
		console.log("AccountContext - State updated:", {
			accountCount: localAccounts.length,
			accounts: localAccounts,
			selectedId: selectedAccount?.id
		});
	}, [localAccounts, selectedAccount]);

	const value = useMemo(() => ({
		accounts: localAccounts,
		selectedAccount,
		setSelectedAccount
	}), [localAccounts, selectedAccount]);

	return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
	const context = useContext(AccountContext);
	if (!context) {
		throw new Error("useAccount must be used within an AccountProvider");
	}
	return context;
}
