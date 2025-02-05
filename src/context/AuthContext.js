"use client";
import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useMemo,
} from "react";
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
		console.log("Resetting all auth state");
		setUser(null);
		setAccounts([]);
		setLoading(false);
		setLastUpdate(Date.now());
	}, []);

	const updateState = useCallback((userData) => {
		if (!userData) {
			console.log("Clearing user state");
			setUser(null);
			setAccounts([]);
			setLoading(false);
			setLastUpdate(Date.now());
			return;
		}

		console.log("Updating state with user data:", userData);

		// Ensure accounts is always an array
		const userAccounts = Array.isArray(userData.accounts)
			? userData.accounts
			: [];
		console.log("Setting accounts:", userAccounts);

		// Create a single state update to ensure consistency
		const timestamp = Date.now();

		// Update all state atomically
		setUser({ ...userData, accounts: userAccounts });
		setAccounts(userAccounts);
		setLastUpdate(timestamp);
		setLoading(false);

		// Debug log current state after update
		console.log("AuthContext - Updated state:", {
			accountsCount: userAccounts.length,
			accounts: userAccounts,
			timestamp: new Date(timestamp).toISOString(),
		});
	}, []);

	const fetchUserData = useCallback(async () => {
		try {
			const response = await fetch("/api/auth/me");
			const data = await response.json();

			if (!response.ok) {
				if (response.status === 401) {
					console.log("User not authenticated, clearing state");
					updateState(null);
					return null;
				}
				throw new Error(data.error || "Failed to fetch user data");
			}

			// Ensure accounts is always an array
			data.accounts = Array.isArray(data.accounts) ? data.accounts : [];

			// If no accounts, create a default one
			if (data.accounts.length === 0) {
				console.log("No accounts found, creating default account");
				const createResponse = await fetch("/api/user/accounts/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ name: "Main Account" }),
				});

				const createData = await createResponse.json();
				if (!createResponse.ok) {
					throw new Error(
						createData.error || "Failed to create default account"
					);
				}

				// Fetch updated user data with the new account
				const updatedResponse = await fetch("/api/auth/me");
				const updatedData = await updatedResponse.json();
				if (!updatedResponse.ok) {
					throw new Error(
						updatedData.error || "Failed to fetch updated user data"
					);
				}
				return updatedData;
			}

			return data;
		} catch (error) {
			console.error("Error fetching user data:", error);
			if (error.message === "User not authenticated") {
				updateState(null);
				return null;
			}
			throw error;
		}
	}, [updateState]);

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
			console.error("Failed to refresh user data:", error);
			return { success: false, error: error.message };
		}
	}, [fetchUserData, updateState]);

	const login = useCallback(
		async (email, password) => {
			const toastId = toast.loading("Signing in...");
			setLoading(true);
			try {
				// First sign in
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

				// Initial state update with sign in data
				if (signInData.user) {
					console.log("Initial sign in data:", signInData.user);
					updateState(signInData.user);
				}

				// Then fetch complete user data
				const userResponse = await fetch("/api/auth/me");
				const userData = await userResponse.json();
				if (!userResponse.ok) {
					throw new Error(userData.error || "Failed to fetch user data");
				}

				console.log("Complete user data:", userData);
				updateState(userData);
				
				router.push("/dashboard");
				toast.success("Signed in successfully", { id: toastId });
				return { success: true };
			} catch (error) {
				console.error("Login error:", error);
				updateState(null);
				toast.error(error.message || "Failed to sign in", { id: toastId });
				return { success: false, error: error.message };
			} finally {
				setLoading(false);
			}
		},
		[router, updateState]
	);

	const logout = useCallback(async () => {
		const toastId = toast.loading("Signing out...");
		try {
			const response = await fetch("/api/auth/signout", {
				method: "POST",
				headers: {
					"Cache-Control": "no-cache",
					Pragma: "no-cache",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to sign out");
			}

			// Reset all state first
			updateState(null);

			// Then redirect
			router.replace("/signin");
			toast.success("Signed out successfully", { id: toastId });
		} catch (error) {
			console.error("Logout error:", error);
			toast.error("Failed to sign out", { id: toastId });
		}
	}, [router, updateState]);

	const createAccount = useCallback(
		async (name) => {
			const toastId = toast.loading("Creating new account...");
			try {
				// Create the account
				const createResponse = await fetch("/api/user/accounts/create", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name }),
				});
				const createData = await createResponse.json();
				if (!createResponse.ok)
					throw new Error(createData.error || "Failed to create account");

				// Get fresh user data
				const userData = await fetchUserData();
				console.log("Fresh user data after account creation:", userData);

				// Update state with a timestamp for tracking updates
				const timestamp = Date.now();
				setLastUpdate(timestamp);
				updateState({ ...userData, _timestamp: timestamp });

				// Ensure AccountContext re-renders
				setTimeout(() => {
					window.dispatchEvent(new Event("accountsUpdated"));
				}, 100);

				toast.success("Account created successfully!", { id: toastId });

				const newAccount = userData.accounts[userData.accounts.length - 1];
				return { success: true, account: newAccount };
			} catch (error) {
				console.error("Create account error:", error);
				toast.error(error.message || "Failed to create account", {
					id: toastId,
				});
				return { success: false, error: error.message };
			}
		},
		[fetchUserData, updateState]
	);

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

	// Add initial data fetch on mount
	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const userResponse = await fetch("/api/auth/me");
				const userData = await userResponse.json();
				
				if (userResponse.ok) {
					// Ensure accounts array exists
					userData.accounts = Array.isArray(userData.accounts) ? userData.accounts : [];
					console.log("Initial auth check successful:", userData);
					updateState(userData);
				} else {
					console.log("No active session found");
					updateState(null);
				}
			} catch (error) {
				console.error("Error initializing auth:", error);
				updateState(null);
			} finally {
				setLoading(false);
			}
		};

		initializeAuth();
	}, [updateState]);

	// Log state changes
	useEffect(() => {
		console.log("AuthContext - State updated:", {
			userAccounts: user?.accounts?.length,
			contextAccounts: accounts.length,
			lastUpdate: new Date(lastUpdate).toISOString(),
		});
	}, [user, accounts, lastUpdate]);

	const value = useMemo(
		() => ({
			user,
			accounts,
			loading,
			lastUpdate,
			login,
			logout,
			refreshUserData,
			fetchUserData,
		}),
		[user, accounts, loading, lastUpdate, login, logout, refreshUserData, fetchUserData]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
