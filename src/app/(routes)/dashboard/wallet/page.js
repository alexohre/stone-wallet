"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAccount } from "@/context/AccountContext";
import DashboardLayout from "../../../../components/DashboardLayout";

export default function WalletPage() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [walletName, setWalletName] = useState("");
	const [network, setNetwork] = useState("ethereum");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { user, loading } = useAuth();
	const { selectedAccount } = useAccount();
	const [wallets, setWallets] = useState([]);
	const [totalBalance, setTotalBalance] = useState(0);
	const [error, setError] = useState("");

	const handleCreateWallet = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const response = await fetch("/api/user/wallets/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: walletName,
					network,
					accountId: selectedAccount.id,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create wallet");
			}

			// Refresh wallet list
			fetchWallets();
			setIsModalOpen(false);
			setWalletName("");
			setNetwork("ethereum");
		} catch (error) {
			console.error("Error creating wallet:", error);
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchWallets = async () => {
		if (!selectedAccount?.id) {
			setWallets([]);
			setTotalBalance(0);
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
			setTotalBalance(data.totalBalance || 0);
			setError("");
		} catch (error) {
			console.error("Error fetching wallets:", error);
			setError(error.message);
			setWallets([]);
			setTotalBalance(0);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		setWallets([]);
		setTotalBalance(0);
		setError("");
		fetchWallets();
	}, [selectedAccount]);

	useEffect(() => {
		const handleAccountChange = () => {
			console.log("Wallet page - Account changed, fetching wallets");
			setWallets([]);
			setTotalBalance(0);
			fetchWallets();
		};

		window.addEventListener('accountChanged', handleAccountChange);
		return () => window.removeEventListener('accountChanged', handleAccountChange);
	}, []);

	useEffect(() => {
		if (!loading && !user) {
			router.replace("/signin");
		}
	}, [user, loading, router]);

	if (!user) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center min-h-[80vh]">
					<div className="text-gray-500">Please sign in to view this page.</div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-2xl font-semibold text-gray-900">
							{selectedAccount
								? `${selectedAccount.name} - Wallets`
								: "Select an Account"}
						</h1>
						{selectedAccount && (
							<p className="mt-2 text-sm text-gray-600">
								Manage your wallets and view balances
							</p>
						)}
					</div>
					{selectedAccount && (
						<button
							onClick={() => setIsModalOpen(true)}
							className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
						>
							New Wallet
						</button>
					)}
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-700">{error}</p>
					</div>
				)}

				{selectedAccount ? (
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<div className="px-4 sm:px-6 py-4 border-b border-gray-200">
							<h2 className="text-lg font-medium text-gray-900">Your Wallets</h2>
						</div>
						<div className="divide-y divide-gray-200">
							{isLoading ? (
								<div className="p-4 sm:p-6">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
								</div>
							) : wallets.length > 0 ? (
								wallets.map((wallet) => (
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
													${(parseFloat(wallet.balance) || 0).toFixed(2)}
												</p>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="p-4 sm:p-6">
									<div className="text-center text-gray-500 py-4">
										No wallets in this account
									</div>
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow p-6">
						<p className="text-gray-500 text-center">
							Please select an account from the sidebar to view its wallets
						</p>
					</div>
				)}

				{/* Create Wallet Modal */}
				{isModalOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-xl w-full max-w-md">
							<div className="p-6">
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-xl font-semibold text-gray-900">
										Create New Wallet
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
								<form onSubmit={handleCreateWallet}>
									<div className="space-y-4">
										<div>
											<label
												htmlFor="walletName"
												className="block text-sm font-medium text-gray-700 mb-1"
											>
												Wallet Name
											</label>
											<input
												type="text"
												id="walletName"
												value={walletName}
												onChange={(e) => setWalletName(e.target.value)}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												required
											/>
										</div>
										<div>
											<label
												htmlFor="network"
												className="block text-sm font-medium text-gray-700 mb-1"
											>
												Network
											</label>
											<select
												id="network"
												value={network}
												onChange={(e) => setNetwork(e.target.value)}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											>
												<option value="ethereum">Ethereum</option>
												<option value="bitcoin">Bitcoin</option>
												<option value="polygon">Polygon</option>
											</select>
										</div>
									</div>
									<div className="mt-6 flex justify-end gap-3">
										<button
											type="button"
											onClick={() => setIsModalOpen(false)}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
										>
											Cancel
										</button>
										<button
											type="submit"
											className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
											disabled={isLoading}
										>
											{isLoading ? "Creating..." : "Create Wallet"}
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
