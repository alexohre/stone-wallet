"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";

const AccountContext = createContext();

export function AccountProvider({ children }) {
	const { accounts: authAccounts, lastUpdate } = useAuth();
	const [selectedAccount, setSelectedAccount] = useState(null);
	const [localAccounts, setLocalAccounts] = useState([]);

	// Force immediate sync with auth accounts
	useEffect(() => {
		const syncAccounts = () => {
			console.log("AccountContext - Syncing with auth accounts:", {
				authAccountsCount: authAccounts?.length,
				localAccountsCount: localAccounts.length,
				lastUpdate: new Date(lastUpdate).toISOString(),
			});

			// Reset state if auth accounts is null or empty
			if (!Array.isArray(authAccounts) || authAccounts.length === 0) {
				console.log("AccountContext - Resetting all account state");
				setLocalAccounts([]);
				setSelectedAccount(null);
				return;
			}

			// Always update local accounts first
			setLocalAccounts([...authAccounts]);

			// Handle selected account
			if (!selectedAccount && authAccounts.length > 0) {
				console.log(
					"AccountContext - No account selected, selecting first account:",
					authAccounts[0].id
				);
				setSelectedAccount(authAccounts[0]);
				return;
			}

			if (selectedAccount) {
				const accountExists = authAccounts.find(
					(a) => a.id === selectedAccount.id
				);
				
				if (!accountExists && authAccounts.length > 0) {
					console.log(
						"AccountContext - Selected account no longer exists, selecting first account:",
						authAccounts[0].id
					);
					setSelectedAccount(authAccounts[0]);
					return;
				}

				// Update selected account data if it changed
				if (accountExists) {
					const updatedAccount = authAccounts.find(
						(a) => a.id === selectedAccount.id
					);
					if (
						JSON.stringify(updatedAccount) !== JSON.stringify(selectedAccount)
					) {
						console.log(
							"AccountContext - Updating selected account data:",
							updatedAccount.id
						);
						setSelectedAccount(updatedAccount);
					}
				}
			}
		};

		// Run sync immediately
		syncAccounts();
	}, [authAccounts, lastUpdate]);

	const value = useMemo(
		() => ({
			accounts: localAccounts,
			selectedAccount,
			setSelectedAccount: (account) => {
				console.log(
					"AccountContext - Manually selecting account:",
					account?.id
				);
				setSelectedAccount(account);
			},
		}),
		[localAccounts, selectedAccount]
	);

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
