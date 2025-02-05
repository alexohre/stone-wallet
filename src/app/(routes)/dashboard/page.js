"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAccount } from "@/context/AccountContext";
import DashboardLayout from "../../../components/DashboardLayout";

export default function Dashboard() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [accountName, setAccountName] = useState("");
	const [mnemonicWords, setMnemonicWords] = useState(Array(12).fill(""));
	const [isLoading, setIsLoading] = useState(false);
	const [importError, setImportError] = useState("");
	const router = useRouter();
	const { user, loading, createAccount, refreshUserData } = useAuth();
	const { selectedAccount } = useAccount();
	const [walletData, setWalletData] = useState({
		totalBalance: 0,
		activeWallets: 0,
		wallets: [],
	});
	const [error, setError] = useState("");
	const inputRefs = useRef(
		Array(12)
			.fill(null)
			.map(() => useRef())
	);

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

	const handleMnemonicInput = (index, value) => {
		const newWords = [...mnemonicWords];
		newWords[index] = value.toLowerCase().trim();
		setMnemonicWords(newWords);
	};

	const handleKeyDown = (index, e) => {
		// Handle backspace
		if (e.key === "Backspace" && !mnemonicWords[index] && index > 0) {
			inputRefs.current[index - 1].current.focus();
		}
		// Handle arrow keys
		if (e.key === "ArrowLeft" && index > 0) {
			inputRefs.current[index - 1].current.focus();
		}
		if (e.key === "ArrowRight" && index < 11) {
			inputRefs.current[index + 1].current.focus();
		}
	};

	const handlePaste = (e) => {
		e.preventDefault();
		const pastedText = e.clipboardData.getData("text");
		// Split by any whitespace and filter out empty strings
		const words = pastedText.trim().split(/\s+/).filter(word => word);

		// Only process if we have exactly 12 words
		if (words.length === 12) {
			setMnemonicWords(words.map((word) => word.toLowerCase().trim()));
		}
	};

	const handleImportAccount = async (e) => {
		e.preventDefault();
		setImportError("");
		setIsLoading(true);

		// Filter out any empty strings and join with single spaces
		const mnemonic = mnemonicWords.filter(word => word.trim()).join(" ");
		if (mnemonicWords.some((word) => !word.trim())) {
			setImportError("Please fill in all words of the mnemonic phrase");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/user/accounts/import", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					mnemonic,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to import account");
			}

			// Refresh user data to get the new account
			await refreshUserData();
			setIsImportModalOpen(false);
			setMnemonicWords(Array(12).fill(""));
		} catch (error) {
			setImportError(error.message);
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
				const response = await fetch(
					"/api/user/wallets?accountId=" + selectedAccount.id
				);
				if (!response.ok) {
					const data = await response.json();
					if (response.status === 404) {
						await refreshUserData();
						return;
					}
					throw new Error(data.error || "Failed to fetch wallet data");
				}

				const data = await response.json();
				setWalletData(data);
				setError("");
			} catch (error) {
				console.error("Error fetching wallet data:", error);
				setError(error.message);
			}
		}

		fetchWalletData();
	}, [selectedAccount, refreshUserData]);

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
						{selectedAccount
							? selectedAccount.name + " Dashboard"
							: "Select an Account"}
					</h1>
					<div className="flex items-center space-x-4">
						<button
							onClick={() => setIsImportModalOpen(true)}
							className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
						>
							Import Account
						</button>
						<button
							onClick={() => setIsModalOpen(true)}
							className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
						>
							New Account
						</button>
					</div>
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

				{/* Import Account Modal */}
				{isImportModalOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
							<div className="p-6">
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-xl font-semibold text-gray-900">
										Import Account
									</h2>
									<button
										onClick={() => setIsImportModalOpen(false)}
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
								<form onSubmit={handleImportAccount}>
									<div className="mb-4">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Recovery Phrase
										</label>
										<div className="grid grid-cols-3 gap-2">
											{mnemonicWords.map((word, index) => (
												<div key={index} className="relative">
													<input
														ref={inputRefs.current[index]}
														type="text"
														value={word}
														onChange={(e) =>
															handleMnemonicInput(index, e.target.value)
														}
														onKeyDown={(e) => handleKeyDown(index, e)}
														onPaste={index === 0 ? handlePaste : undefined}
														className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														placeholder={`Word ${index + 1}`}
														required
													/>
													<span className="absolute top-2 right-2 text-xs text-gray-400">
														{index + 1}
													</span>
												</div>
											))}
										</div>
										{importError && (
											<p className="mt-2 text-sm text-red-600">{importError}</p>
										)}
									</div>
									<div className="flex justify-end gap-3">
										<button
											type="button"
											onClick={() => setIsImportModalOpen(false)}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
										>
											Cancel
										</button>
										<button
											type="submit"
											disabled={isLoading}
											className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
										>
											{isLoading ? "Importing..." : "Import Account"}
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
												d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
											/>
										</svg>
									</span>
								</div>
								<p className="mt-2 text-3xl font-semibold text-gray-900">
									{walletData.activeWallets}
								</p>
							</div>

							<div className="bg-white p-6 rounded-lg shadow">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-medium text-gray-900">
										Last Activity
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
								<p className="mt-2 text-sm text-gray-500">
									{walletData.lastActivity
										? new Date(walletData.lastActivity).toLocaleString()
										: "No activity yet"}
								</p>
							</div>
						</div>

						{/* Recent Activity */}
						<div className="bg-white rounded-lg shadow overflow-hidden">
							<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
								<h3 className="text-lg font-medium text-gray-900">
									Recent Activity
								</h3>
							</div>
							<div className="px-4 py-5 sm:p-6">
								{walletData.recentActivity?.length > 0 ? (
									<div className="flow-root">
										<ul className="-my-5 divide-y divide-gray-200">
											{walletData.recentActivity.map((activity) => (
												<li key={activity.id} className="py-5">
													<div className="flex items-center space-x-4">
														<div className="flex-1 min-w-0">
															<p className="text-sm font-medium text-gray-900 truncate">
																{activity.type}
															</p>
															<p className="text-sm text-gray-500">
																{new Date(activity.timestamp).toLocaleString()}
															</p>
														</div>
														<div>
															<span
																className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
																	activity.status === "completed"
																		? "bg-green-100 text-green-800"
																		: "bg-yellow-100 text-yellow-800"
																}`}
															>
																{activity.status}
															</span>
														</div>
													</div>
												</li>
											))}
										</ul>
									</div>
								) : (
									<p className="text-sm text-gray-500 text-center py-4">
										No recent activity
									</p>
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
