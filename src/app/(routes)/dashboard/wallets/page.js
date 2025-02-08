"use client";
import { useState, Fragment, useRef, useEffect } from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { useAccount } from "@/context/AccountContext";

// Ethereum networks and other EVM-compatible chains
const NETWORKS = [
	// { id: "ethereum", name: "Ethereum (ETH)", chainId: 1 },
	// { id: "polygon", name: "Polygon (MATIC)", chainId: 137 },
	// { id: "bsc", name: "Binance Smart Chain (BSC)", chainId: 56 },
	// { id: "avalanche", name: "Avalanche (AVAX)", chainId: 43114 },
	// { id: "fantom", name: "Fantom (FTM)", chainId: 250 },
	// { id: "arbitrum", name: "Arbitrum One", chainId: 42161 },
	// { id: "optimism", name: "Optimism", chainId: 10 },
	// Testnets
	{ id: "holesky", name: "Holesky (ETH Testnet)", chainId: 17000 },
	{ id: "sepolia", name: "Sepolia (ETH Testnet)", chainId: 11155111 },
	{ id: "mumbai", name: "Mumbai (Polygon Testnet)", chainId: 80001 },
	{ id: "bsc_testnet", name: "BSC Testnet", chainId: 97 },
];

export default function Wallets() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [walletName, setWalletName] = useState("");
	const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0].id);
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState("");
	const [importError, setImportError] = useState("");
	const [mnemonicWords, setMnemonicWords] = useState(Array(12).fill(""));
	const [wallets, setWallets] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [copiedAddress, setCopiedAddress] = useState("");
	const [refreshingBalances, setRefreshingBalances] = useState({});
	const { selectedAccount } = useAccount();
	const inputRefs = useRef(
		Array(12)
			.fill(null)
			.map(() => useRef())
	);

	const fetchWallets = async () => {
		if (!selectedAccount?.id) {
			setWallets([]);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetch(
				"/api/user/wallets?accountId=" + selectedAccount.id
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch wallets");
			}

			setWallets(data.wallets || []);
			setError("");
		} catch (error) {
			console.error("Error fetching wallets:", error);
			setError(error.message);
			setWallets([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		setWallets([]);
		setError("");
		fetchWallets();
	}, [selectedAccount]);

	const pageTitle = selectedAccount
		? `${selectedAccount.name} - Wallets`
		: "Select an Account";

	const handleCreateWallet = async (e) => {
		e.preventDefault();
		setError("");
		setIsCreating(true);

		if (!selectedAccount) {
			setError("No account selected");
			setIsCreating(false);
			return;
		}

		try {
			const response = await fetch("/api/user/wallets/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: walletName,
					network: selectedNetwork,
					accountId: selectedAccount.id,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create wallet");
			}

			// Close modal and reset form
			setIsModalOpen(false);
			setWalletName("");
			setSelectedNetwork(NETWORKS[0].id);

			// Refresh wallets list
			fetchWallets();
		} catch (error) {
			setError(error.message);
		} finally {
			setIsCreating(false);
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
		const words = pastedText.trim().split(/\s+/);

		// Only process if we have exactly 12 words
		if (words.length === 12) {
			setMnemonicWords(words.map((word) => word.toLowerCase()));
		}
	};

	const handleImportWallet = async (e) => {
		e.preventDefault();
		setImportError("");
		setIsCreating(true);

		const mnemonic = mnemonicWords.join(" ");
		if (mnemonicWords.some((word) => !word)) {
			setImportError("Please fill in all words of the mnemonic phrase");
			setIsCreating(false);
			return;
		}

		try {
			const response = await fetch("/api/user/wallets/import", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					mnemonic,
					name: walletName,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to import wallet");
			}

			// Close modal and reset form
			setIsImportModalOpen(false);
			setWalletName("");
			setMnemonicWords(Array(12).fill(""));

			// Refresh wallets list
			fetchWallets();
		} catch (error) {
			setImportError(error.message);
		} finally {
			setIsCreating(false);
		}
	};

	const handleCopyAddress = (address) => {
		navigator.clipboard.writeText(address);
		setCopiedAddress(address);
		setTimeout(() => setCopiedAddress(""), 2000);
	};

	const handleRefreshBalance = async (wallet) => {
		try {
			setRefreshingBalances((prev) => ({ ...prev, [wallet.address]: true }));
			const response = await fetch("/api/user/wallets/balance", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					walletAddress: wallet.address,
					network: wallet.network,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to refresh balance");
			}

			// Update the wallet balance in the local state
			setWallets((prevWallets) =>
				prevWallets.map((w) =>
					w.address === wallet.address ? { ...w, balance: data.balance } : w
				)
			);
		} catch (error) {
			console.error("Error refreshing balance:", error);
		} finally {
			setRefreshingBalances((prev) => ({ ...prev, [wallet.address]: false }));
		}
	};

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
					<div className="flex justify-end space-x-4">
						<button
							onClick={() => setIsImportModalOpen(true)}
							className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
						>
							Import Wallet
						</button>
						<button
							onClick={() => setIsModalOpen(true)}
							className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
						>
							New Wallet
						</button>
					</div>
				</div>

				{/* Wallets Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{isLoading ? (
						<div className="col-span-full flex justify-center items-center p-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						</div>
					) : wallets.length === 0 ? (
						<div className="col-span-full bg-white rounded-lg shadow">
							<div className="flex flex-col items-center justify-center p-6 text-center">
								<div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
									<svg
										className="w-8 h-8 text-blue-600"
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
								</div>
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									No wallets found
								</h3>
								<p className="text-sm text-gray-500 mb-4">
									Create your first wallet to get started!
								</p>
								<button
									onClick={() => setIsModalOpen(true)}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									Create Wallet
								</button>
							</div>
						</div>
					) : (
						wallets.map((wallet) => (
							<div
								key={wallet.id}
								className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
							>
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-2">
										<h3 className="text-lg font-medium text-gray-900">
											{wallet.name}
										</h3>
										<button
											onClick={() => handleRefreshBalance(wallet)}
											className="p-1 hover:bg-gray-100 rounded-full transition-colors"
											title="Refresh balance"
											disabled={refreshingBalances[wallet.address]}
										>
											<svg
												className={`w-4 h-4 ${
													refreshingBalances[wallet.address]
														? "animate-spin text-blue-500"
														: "text-gray-500 hover:text-gray-700"
												}`}
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
												/>
											</svg>
										</button>
									</div>
									{wallet.network && (
										<span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
											{NETWORKS.find((n) => n.id === wallet.network)?.name ||
												wallet.network}{" "}
										</span>
									)}
								</div>
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-gray-500">Address</span>
										<div className="flex items-center space-x-2">
											<span className="ml-1 font-mono text-gray-900 break-all">
												{wallet.address}
											</span>
											<button
												onClick={() => handleCopyAddress(wallet.address)}
												className="p-1 hover:bg-gray-100 rounded-full transition-colors"
												title="Copy address"
											>
												{copiedAddress === wallet.address ? (
													<svg
														className="w-4 h-4 text-green-500"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M5 13l4 4L19 7"
														/>
													</svg>
												) : (
													<svg
														className="w-4 h-4 text-gray-500 hover:text-gray-700"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
														/>
													</svg>
												)}
											</button>
										</div>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-gray-500">Balance</span>
										<span className="text-gray-900">
											{parseFloat(wallet.balance).toFixed(4)} ETH
										</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-gray-500">Created</span>
										<span className="text-gray-900">
											{new Date(wallet.createdAt).toLocaleDateString()}
										</span>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* Import Wallet Modal */}
				{isImportModalOpen && (
					<Fragment>
						<div
							className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
							onClick={() => setIsImportModalOpen(false)}
						/>
						<div className="fixed inset-0 z-50 overflow-y-auto">
							<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
								<div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
									<div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
										<button
											type="button"
											className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
											onClick={() => setIsImportModalOpen(false)}
										>
											<span className="sr-only">Close</span>
											<svg
												className="h-6 w-6"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="1.5"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>

									<div className="sm:flex sm:items-start">
										<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
											<h3 className="text-lg font-semibold leading-6 text-gray-900">
												Import Wallet
											</h3>

											{importError && (
												<div className="mt-2 rounded-md bg-red-50 p-4">
													<div className="flex">
														<div className="ml-3">
															<h3 className="text-sm font-medium text-red-800">
																{importError}
															</h3>
														</div>
													</div>
												</div>
											)}

											<form
												onSubmit={handleImportWallet}
												className="mt-5 space-y-4"
											>
												<div>
													<label
														htmlFor="importWalletName"
														className="block text-sm font-medium text-gray-700"
													>
														Wallet Name
													</label>
													<input
														type="text"
														name="importWalletName"
														id="importWalletName"
														value={walletName}
														onChange={(e) => setWalletName(e.target.value)}
														className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
														placeholder="My Imported Wallet"
														required
													/>
												</div>

												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Recovery Phrase
													</label>
													<p className="text-sm text-gray-500 mb-4">
														Enter your 12-word recovery phrase or paste it
														directly
													</p>
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
																	onPaste={
																		index === 0 ? handlePaste : undefined
																	}
																	className="block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
																	placeholder={`Word ${index + 1}`}
																	required
																	autoComplete="off"
																	spellCheck="false"
																/>
																<span className="absolute -top-2 left-2 text-xs text-gray-500 bg-white px-1">
																	{index + 1}
																</span>
															</div>
														))}
													</div>
												</div>

												<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
													<button
														type="submit"
														disabled={isCreating}
														className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
													>
														{isCreating ? "Importing..." : "Import Wallet"}
													</button>
													<button
														type="button"
														className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
														onClick={() => setIsImportModalOpen(false)}
													>
														Cancel
													</button>
												</div>
											</form>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Fragment>
				)}

				{/* Create Wallet Modal */}
				{isModalOpen && (
					<Fragment>
						<div
							className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
							onClick={() => setIsModalOpen(false)}
						/>
						<div className="fixed inset-0 z-50 overflow-y-auto">
							<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
								<div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
									<div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
										<button
											type="button"
											className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
											onClick={() => setIsModalOpen(false)}
										>
											<span className="sr-only">Close</span>
											<svg
												className="h-6 w-6"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="1.5"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>

									<div className="sm:flex sm:items-start">
										<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
											<h3 className="text-lg font-semibold leading-6 text-gray-900">
												Create New Wallet
											</h3>

											{error && (
												<div className="mt-2 rounded-md bg-red-50 p-4">
													<div className="flex">
														<div className="ml-3">
															<h3 className="text-sm font-medium text-red-800">
																{error}
															</h3>
														</div>
													</div>
												</div>
											)}

											<form
												onSubmit={handleCreateWallet}
												className="mt-5 space-y-4"
											>
												<div>
													<label
														htmlFor="walletName"
														className="block text-sm font-medium text-gray-700"
													>
														Wallet Name
													</label>
													<input
														type="text"
														name="walletName"
														id="walletName"
														value={walletName}
														onChange={(e) => setWalletName(e.target.value)}
														className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
														placeholder="My Wallet"
														required
													/>
												</div>

												<div>
													<label
														htmlFor="network"
														className="block text-sm font-medium text-gray-700"
													>
														Network
													</label>
													<select
														id="network"
														name="network"
														value={selectedNetwork}
														onChange={(e) => setSelectedNetwork(e.target.value)}
														className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
													>
														{NETWORKS.map((network) => (
															<option key={network.id} value={network.id}>
																{network.name}
															</option>
														))}
													</select>
												</div>

												<div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
													<button
														type="submit"
														disabled={isCreating}
														className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
													>
														{isCreating ? "Creating..." : "Create Wallet"}
													</button>
													<button
														type="button"
														className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
														onClick={() => setIsModalOpen(false)}
													>
														Cancel
													</button>
												</div>
											</form>
										</div>
									</div>
								</div>
							</div>
						</div>
					</Fragment>
				)}
			</div>
		</DashboardLayout>
	);
}
