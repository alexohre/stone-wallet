'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [accounts, setAccounts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [lastUpdate, setLastUpdate] = useState(Date.now());
	const router = useRouter();

	// Define state management functions first
	const resetAllState = useCallback(() => {
		console.log('Resetting all auth state');
		setUser(null);
		setAccounts([]);
		setLoading(false);
		setLastUpdate(Date.now());
	}, []);

	const updateState = useCallback((userData) => {
		if (!userData) {
			console.log('Clearing user state');
			resetAllState();
			return;
		}

		console.log('Updating state with user data:', userData);
		
		// Ensure accounts is always an array
		const userAccounts = Array.isArray(userData.accounts) ? userData.accounts : [];
		console.log('Setting accounts:', userAccounts);
		
		// Create a single state update to ensure consistency
		const timestamp = Date.now();
		const newState = {
			user: { ...userData, accounts: userAccounts },
			accounts: userAccounts,
			timestamp
		};

		// Update all state atomically
		setUser(newState.user);
		setAccounts(newState.accounts);
		setLastUpdate(newState.timestamp);
		setLoading(false);

		// Debug log current state after update
		console.log('AuthContext - Updated state:', {
			accountsCount: userAccounts.length,
			accounts: userAccounts,
			timestamp: new Date(timestamp).toISOString()
		});
	}, [resetAllState]);

	// Initialize auth state
	useEffect(() => {
		const initAuth = async () => {
			console.log('Initializing auth state...');
			setLoading(true);
			try {
				const userData = await fetchUserData();
				if (userData) {
					updateState(userData);
				} else {
					resetAllState();
				}
			} catch (error) {
				console.error('Failed to initialize auth:', error);
				resetAllState();
			}
		};

		initAuth();
	}, []);  

	const fetchUserData = useCallback(async () => {
		try {
			const response = await fetch("/api/auth/me");
			if (!response.ok) {
				// If unauthorized or not found, clear state and return null
				if (response.status === 401 || response.status === 404) {
					console.log('User not authenticated, clearing state');
					resetAllState();
					return null;
				}
				throw new Error("Failed to fetch user data");
			}

			const userData = await response.json();
			console.log("Fetched user data:", userData);
			return userData;
		} catch (error) {
			console.error('Error fetching user data:', error);
			// Only throw if it's not an auth error
			if (error.message !== "Failed to fetch user data") {
				throw error;
			}
			return null;
		}
	}, [resetAllState]);

	const refreshUserData = useCallback(async () => {
		console.log("Refreshing user data...");
		try {
			const userData = await fetchUserData();
			if (userData) {
				console.log("Refresh successful, updating state with:", userData);
				updateState(userData);
			}
			return { success: true };
		} catch (error) {
			console.error('Failed to refresh user data:', error);
			return { success: false, error: error.message };
		}
	}, [fetchUserData, updateState]);

	const login = useCallback(async (email, password) => {
		const toastId = toast.loading("Signing in...");
		setLoading(true);
		try {
			const signInResponse = await fetch("/api/auth/signin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const signInData = await signInResponse.json();
			if (!signInResponse.ok) {
				throw new Error(signInData.error || "Failed to sign in");
			}

			console.log("Sign in successful, initial data:", signInData);
			
			// Update state with sign-in data first
			updateState(signInData.user);
			
			// Then get fresh user data to ensure we have the latest
			const userData = await fetchUserData();
			if (userData) {
				console.log("Fresh user data after login:", userData);
				updateState(userData);
			}
			
			router.push("/dashboard");
			toast.success("Signed in successfully", { id: toastId });
			return { success: true };
		} catch (error) {
			console.error("Login error:", error);
			resetAllState();
			toast.error(error.message || "Failed to sign in", { id: toastId });
			return { success: false, error: error.message };
		}
	}, [router, fetchUserData, updateState, resetAllState]);

	const logout = useCallback(async () => {
		const toastId = toast.loading("Signing out...");
		try {
			const response = await fetch("/api/auth/signout", {
				method: "POST",
				headers: {
					'Cache-Control': 'no-cache',
					'Pragma': 'no-cache'
				},
			});

			if (!response.ok) {
				throw new Error("Failed to sign out");
			}

			// Reset all state first
			resetAllState();
			
			// Then redirect
			router.replace("/signin");
			toast.success("Signed out successfully", { id: toastId });
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("Failed to sign out", { id: toastId });
		}
	}, [router, resetAllState]);

	const createAccount = useCallback(async (name) => {
		const toastId = toast.loading("Creating new account...");
		try {
			const createResponse = await fetch("/api/user/accounts/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name }),
			});

			const createData = await createResponse.json();
			if (!createResponse.ok) {
				throw new Error(createData.error || "Failed to create account");
			}

			// Get fresh user data
			const userData = await fetchUserData();
			console.log("Fresh user data after account creation:", userData);
			
			updateState(userData);

			toast.success("Account created successfully!", { id: toastId });
			const userAccounts = Array.isArray(userData.accounts) ? userData.accounts : [];
			const newAccount = userAccounts[userAccounts.length - 1];
			return { success: true, account: newAccount };
		} catch (error) {
			console.error("Create account error:", error);
			toast.error(error.message || "Failed to create account", { id: toastId });
			return { success: false, error: error.message };
		}
	}, [fetchUserData, updateState]);

	const refresh = useCallback(async () => {
		const toastId = toast.loading("Refreshing accounts...");
		try {
			const userData = await fetchUserData();
			console.log("Fresh user data after refresh:", userData);
			
			updateState(userData);
			toast.success("Accounts refreshed", { id: toastId });
		} catch (error) {
			console.error("Refresh error:", error);
			toast.error("Failed to refresh accounts", { id: toastId });
		}
	}, [fetchUserData, updateState]);

	// Log state changes
	useEffect(() => {
		console.log('AuthContext - State updated:', {
			userAccounts: user?.accounts?.length,
			contextAccounts: accounts.length,
			lastUpdate: new Date(lastUpdate).toISOString()
		});
	}, [user, accounts, lastUpdate]);

	const value = useMemo(() => ({
		user,
		accounts,
		loading,
		lastUpdate,
		login,
		logout,
		refreshUserData,
		createAccount,
		updateState,
		resetAllState,
		refresh
	}), [user, accounts, loading, lastUpdate, login, logout, refreshUserData, createAccount, updateState, resetAllState, refresh]);

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
