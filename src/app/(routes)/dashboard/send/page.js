"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/context/AccountContext";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { web3Service } from "@/utils/web3";

export default function SendPage() {
	const router = useRouter();
	const { selectedAccount } = useAccount();
	const [isLoading, setIsLoading] = useState(false);
	const [isEstimating, setIsEstimating] = useState(false);
	const [wallets, setWallets] = useState([]);
	const [gasEstimate, setGasEstimate] = useState(null);
	const [formData, setFormData] = useState({
		fromWalletId: "",
		recipientAddress: "",
		amount: "",
	});

	// Fetch wallets for the selected account
	const fetchWallets = async () => {
		if (!selectedAccount?.id) return;

		try {
			const response = await fetch(
				`/api/user/wallets?accountId=${selectedAccount.id}`
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch wallets");
			}

			setWallets(data.wallets || []);
			// Set the first wallet as default if available
			if (data.wallets?.length > 0 && !formData.fromWalletId) {
				setFormData((prev) => ({
					...prev,
					fromWalletId: data.wallets[0].id,
				}));
			}
		} catch (error) {
			console.error("Error fetching wallets:", error);
			toast.error("Failed to fetch wallets");
		}
	};

	// Estimate gas
	const estimateGas = async () => {
		if (!formData.fromWalletId || !formData.recipientAddress || !formData.amount) {
			toast.error("Please fill in all fields");
			return;
		}

		setIsEstimating(true);
		const estimateToast = toast.loading("Estimating gas...");

		try {
			const selectedWallet = wallets.find(w => w.id === formData.fromWalletId);
			if (!selectedWallet) {
				throw new Error("Wallet not found");
			}

			const response = await fetch("/api/user/transactions/estimate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					fromAddress: selectedWallet.address,
					toAddress: formData.recipientAddress,
					amount: formData.amount,
					networkId: selectedWallet.network || selectedWallet.networkId
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to estimate gas");
			}

			setGasEstimate(data.gasEstimate);
			toast.success("Gas estimated successfully", { id: estimateToast });
		} catch (error) {
			console.error("Gas estimation error:", error);
			toast.error(error.message || "Failed to estimate gas", { id: estimateToast });
			setGasEstimate(null);
		} finally {
			setIsEstimating(false);
		}
	};

	useEffect(() => {
		fetchWallets();
	}, [selectedAccount?.id]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// If we don't have a gas estimate, run estimation
		if (!gasEstimate) {
			await estimateGas();
			return;
		}

		setIsLoading(true);
		try {
			// Find the selected wallet
			const selectedWallet = wallets.find(
				(w) => w.id === formData.fromWalletId
			);
			if (!selectedWallet) {
				throw new Error("Please select a wallet to send from");
			}

			const response = await fetch("/api/user/transactions/send", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					accountId: selectedAccount.id,
					fromWalletId: formData.fromWalletId,
					recipientAddress: formData.recipientAddress,
					amount: formData.amount,
					gasEstimate: gasEstimate
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to send transaction");
			}

			toast.success("Transaction sent successfully!");
			router.push("/dashboard/transactions");
		} catch (error) {
			console.error("Send transaction error:", error);
			toast.error(error.message || "Failed to send transaction");
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Reset gas estimate when form changes
		setGasEstimate(null);
	};

	const getButtonText = () => {
		if (isLoading) return "Sending...";
		if (isEstimating) return "Estimating Gas...";
		if (!gasEstimate) return "Proceed";
		return "Send";
	};

	const isButtonDisabled = isLoading || isEstimating || !formData.fromWalletId || !formData.recipientAddress || !formData.amount;

	return (
		<DashboardLayout>
			{!selectedAccount ? (
				<div className="p-6 bg-white rounded-lg shadow">
					<p className="text-gray-600">Please select an account to continue.</p>
				</div>
			) : (
				<div className="max-w-2xl mx-auto">
					<div className="bg-white rounded-lg shadow p-6">
						<h1 className="text-2xl font-bold text-gray-900 mb-6">
							Send Funds
						</h1>

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* From Wallet Selector */}
							<div>
								<label
									htmlFor="fromWalletId"
									className="block text-sm font-medium text-gray-700"
								>
									From Wallet
								</label>
								<select
									id="fromWalletId"
									name="fromWalletId"
									value={formData.fromWalletId}
									onChange={handleChange}
									className="mt-1 block w-full pl-3 pr-10 py-2 text-base border text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
									required
								>
									<option value="">Select a wallet</option>
									{wallets.map((wallet) => (
										<option key={wallet.id} value={wallet.id}>
											{wallet.name} - {wallet.address.slice(0, 6)}...
											{wallet.address.slice(-4)} ({wallet.balance})
										</option>
									))}
								</select>
							</div>

							<div>
								<label
									htmlFor="recipientAddress"
									className="block text-sm font-medium text-gray-700"
								>
									Recipient Address
								</label>
								<input
									type="text"
									id="recipientAddress"
									name="recipientAddress"
									value={formData.recipientAddress}
									onChange={handleChange}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
									placeholder="0x..."
									required
								/>
							</div>

							<div>
								<label
									htmlFor="amount"
									className="block text-sm font-medium text-gray-700"
								>
									Amount
								</label>
								<div className="mt-1 relative rounded-md shadow-sm">
									<input
										type="number"
										id="amount"
										name="amount"
										value={formData.amount}
										onChange={handleChange}
										className="block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										placeholder="0.0"
										step="any"
										min="0"
										required
									/>
								</div>
							</div>

							{gasEstimate && (
								<div className="text-sm text-gray-600">
									Estimated Gas: {gasEstimate} ETH
								</div>
							)}

							<button
								type="submit"
								disabled={isButtonDisabled}
								className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
									isButtonDisabled ? "opacity-75 cursor-not-allowed" : ""
								}`}
							>
								{getButtonText()}
							</button>
						</form>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
}
