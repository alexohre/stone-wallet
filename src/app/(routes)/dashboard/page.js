"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAccount } from "@/context/AccountContext";
import DashboardLayout from "../../../components/DashboardLayout";

export default function Dashboard() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [accountName, setAccountName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { user, loading, createAccount, refreshUserData } = useAuth();
	const { selectedAccount } = useAccount();
	const [walletData, setWalletData] = useState({
		totalBalance: 0,
		activeWallets: 0,
		wallets: [],
	});
	const [error, setError] = useState("");

	const handleCreateAccount = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const result = await createAccount(accountName);
			if (!result.success) {
				throw new Error(result.error || "Failed to create account");
			}
			// Refresh user data to get the new account
			await refreshUserData();
			setIsModalOpen(false);
			setAccountName("");
		} catch (error) {
			console.error("Error creating account:", error);
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!loading && !user) {
			router.replace("/signin");
		}
	}, [user, loading, router]);

	useEffect(() => {
		async function fetchWalletData() {
			if (!selectedAccount || !selectedAccount.id) {
				setWalletData({
					totalBalance: 0,
					activeWallets: 0,
					wallets: [],
				});
				return;
			}

			try {
				const response = await fetch("/api/user/wallets?accountId=" + selectedAccount.id);
				if (!response.ok) {
					const data = await response.json();
					if (response.status === 404) {
						// If account not found, trigger a refresh of user data
						await refreshUserData();
						return;
					}
					throw new Error(data.error || "Failed to fetch wallet data");
				}

				const data = await response.json();
				setWalletData(data);
				setError(""); // Clear any previous errors
			} catch (error) {
				console.error("Error fetching wallet data:", error);
				setError(error.message);
			}
		}

		fetchWalletData();
	}, [selectedAccount, refreshUserData]);

	// Show nothing while loading or if no user
	if (loading || !user) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h1 className="text-2xl font-semibold text-gray-900">
						{selectedAccount ? selectedAccount.name + " Dashboard" : "Select an Account"}
					</h1>
					<button
						onClick={() => setIsModalOpen(true)}
						className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
					>
						New Account
					</button>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-700">{error}</p>
					</div>
				)}

				{/* Create Account Modal */}
				{isModalOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-xl w-full max-w-md">
							<div className="p-6">
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-xl font-semibold text-gray-900">
										Create New Account
									</h2>
									<button
										onClick={() => setIsModalOpen(false)}
										className="text-gray-400 hover:text-gray-500"
									>
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
								<form onSubmit={handleCreateAccount}>
									<div className="mb-4">
										<label
											htmlFor="accountName"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											Account Name
										</label>
										<input
											type="text"
											id="accountName"
											value={accountName}
											onChange={(e) => setAccountName(e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											placeholder="Enter account name"
											required
										/>
									</div>
									<div className="flex justify-end gap-3">
										<button
											type="button"
											onClick={() => setIsModalOpen(false)}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
										>
											Cancel
										</button>
										<button
											type="submit"
											disabled={isLoading}
											className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
										>
											{isLoading ? "Creating..." : "Create Account"}
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}

				{selectedAccount ? (
					<>
						{/* Stats Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
							<div className="bg-white p-6 rounded-lg shadow">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-medium text-gray-900">
										Total Balance
									</h2>
									<span className="p-2 bg-green-100 text-green-800 rounded-full">
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</span>
								</div>
								<p className="mt-2 text-3xl font-semibold text-gray-900">
									${walletData.totalBalance.toFixed(2)}
								</p>
								<p className="text-sm text-gray-500">Total balance across all wallets</p>
							</div>

							<div className="bg-white p-6 rounded-lg shadow">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-medium text-gray-900">
										Active Wallets
									</h2>
									<span className="p-2 bg-blue-100 text-blue-800 rounded-full">
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
											/>
										</svg>
									</span>
								</div>
								<p className="mt-2 text-3xl font-semibold text-gray-900">
									{walletData.activeWallets}
								</p>
								<p className="text-sm text-gray-500">Number of active wallets</p>
							</div>

							<div className="bg-white p-6 rounded-lg shadow">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-medium text-gray-900">
										Recent Activity
									</h2>
									<span className="p-2 bg-purple-100 text-purple-800 rounded-full">
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</span>
								</div>
								<p className="mt-2 text-3xl font-semibold text-gray-900">0</p>
								<p className="text-sm text-gray-500">Transactions this week</p>
							</div>
						</div>

						{/* Recent Wallets */}
						<div className="bg-white rounded-lg shadow overflow-hidden">
							<div className="px-4 sm:px-6 py-4 border-b border-gray-200">
								<h2 className="text-lg font-medium text-gray-900">Recent Wallets</h2>
							</div>
							<div className="divide-y divide-gray-200">
								{walletData.wallets.length > 0 ? (
									walletData.wallets.map((wallet) => (
										<div key={wallet.id} className="p-4 sm:p-6">
											<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
												<div>
													<p className="text-sm font-medium text-gray-900">
														{wallet.name}
													</p>
													<p className="text-sm text-gray-500">{wallet.network}</p>
													<p className="text-xs font-mono text-gray-500 mt-1">
														{wallet.address}
													</p>
												</div>
												<div className="flex items-center gap-2">
													<p className="text-sm font-medium text-gray-900">
														${parseFloat(wallet.balance).toFixed(2)}
													</p>
												</div>
											</div>
										</div>
									))
								) : (
									<div className="p-4 sm:p-6">
										<div className="text-center text-gray-500">
											No wallets in this account yet
										</div>
									</div>
								)}
							</div>
						</div>
					</>
				) : (
					<div className="bg-white rounded-lg shadow p-6">
						<p className="text-gray-500 text-center">
							Please select an account from the sidebar to view its dashboard
						</p>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
