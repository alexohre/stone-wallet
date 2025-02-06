"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/context/AccountContext";
import { web3Service } from "@/utils/web3.js";
import DashboardLayout from "@/components/DashboardLayout";
import toast from "react-hot-toast";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function Transactions() {
	const router = useRouter();
	const { selectedAccount } = useAccount();
	const [transactions, setTransactions] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [expandedTransactions, setExpandedTransactions] = useState(new Set());
	const [selectedNetwork, setSelectedNetwork] = useState("sepolia");

	const fetchTransactions = async () => {
		if (!selectedAccount?.id) {
			setTransactions([]);
			setIsLoading(false);
			return;
		}

		try {
			// Get transactions from database.txt through API
			const response = await fetch(
				`/api/user/transactions?accountId=${selectedAccount.id}`
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch transactions");
			}

			// Sort transactions by timestamp (newest first)
			const sortedTransactions = data.transactions.sort(
				(a, b) => new Date(b.timestamp) - new Date(a.timestamp)
			);

			setTransactions(sortedTransactions);
			setError("");
		} catch (error) {
			console.error("Error fetching transactions:", error);
			setError("Failed to fetch transactions. Please try again later.");
			toast.error("Failed to fetch transactions");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTransactions();
	}, [selectedAccount, selectedNetwork]);

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString();
	};

	const formatAddress = (address) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const toggleTransaction = (transactionId) => {
		setExpandedTransactions((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(transactionId)) {
				newSet.delete(transactionId);
			} else {
				newSet.add(transactionId);
			}
			return newSet;
		});
	};

	const TransactionRow = ({ transaction }) => {
		const isExpanded = expandedTransactions.has(transaction.hash || transaction.id);
		const isSent =
			transaction.fromAddress?.toLowerCase() ===
			selectedAccount?.address?.toLowerCase();

		return (
			<div className="border-b border-gray-200 last:border-b-0">
				{/* Collapsed View */}
				<div
					onClick={() => toggleTransaction(transaction.hash || transaction.id)}
					className="grid grid-cols-5 items-center px-6 py-4 cursor-pointer hover:bg-gray-50 gap-4"
				>
					<div className="flex items-center space-x-2">
						<div
							className={`w-2 h-2 rounded-full ${
								transaction.status === "completed"
									? "bg-green-500"
									: "bg-yellow-500"
							}`}
						/>
						<div className="text-sm font-medium text-gray-900">
							{formatDate(transaction.timestamp)}
						</div>
					</div>
					<div className="text-sm text-gray-500">
						{formatAddress(transaction.fromAddress)}
					</div>
					<div className="text-sm text-gray-500">
						{formatAddress(transaction.toAddress)}
					</div>
					<div className="text-sm font-medium text-gray-900">
						{isSent ? "-" : "+"}
						{transaction.value} ETH
					</div>
					<div className="flex items-center justify-end space-x-4">
						<span className="text-xs text-gray-500">
							Gas: {transaction.gasUsed} ETH
						</span>
						<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
							{transaction.status}
						</span>
						{isExpanded ? (
							<FiChevronUp className="ml-2 h-5 w-5 text-gray-500" />
						) : (
							<FiChevronDown className="ml-2 h-5 w-5 text-gray-500" />
						)}
					</div>
				</div>

				{/* Expanded View */}
				{isExpanded && (
					<div className="px-6 py-4 bg-gray-50">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<h4 className="text-sm font-medium text-gray-900">
									Transaction Details
								</h4>
								<dl className="mt-2 text-sm text-gray-500">
									<div className="mt-2">
										<dt className="inline">Transaction Hash: </dt>
										<dd className="inline font-mono">
											{transaction.hash}
											<button
												onClick={(e) => {
													e.stopPropagation();
													navigator.clipboard.writeText(transaction.hash);
													toast.success("Hash copied to clipboard");
												}}
												className="ml-2 text-blue-600 hover:text-blue-800"
											>
												Copy
											</button>
										</dd>
									</div>
									<div className="mt-2">
										<dt className="inline">From: </dt>
										<dd className="inline font-mono">
											{transaction.fromAddress}
											<button
												onClick={(e) => {
													e.stopPropagation();
													navigator.clipboard.writeText(transaction.fromAddress);
													toast.success("Address copied to clipboard");
												}}
												className="ml-2 text-blue-600 hover:text-blue-800"
											>
												Copy
											</button>
										</dd>
									</div>
									<div className="mt-2">
										<dt className="inline">To: </dt>
										<dd className="inline font-mono">
											{transaction.toAddress}
											<button
												onClick={(e) => {
													e.stopPropagation();
													navigator.clipboard.writeText(transaction.toAddress);
													toast.success("Address copied to clipboard");
												}}
												className="ml-2 text-blue-600 hover:text-blue-800"
											>
												Copy
											</button>
										</dd>
									</div>
									<div className="mt-2">
										<dt className="inline">Amount: </dt>
										<dd className="inline">{transaction.value} ETH</dd>
									</div>
									<div className="mt-2">
										<dt className="inline">Gas Used: </dt>
										<dd className="inline">{transaction.gasUsed} ETH</dd>
									</div>
									<div className="mt-2">
										<dt className="inline">Block Number: </dt>
										<dd className="inline">{transaction.blockNumber}</dd>
									</div>
									<div className="mt-2">
										<dt className="inline">Status: </dt>
										<dd className="inline">{transaction.status}</dd>
									</div>
									<div className="mt-2">
										<dt className="inline">Timestamp: </dt>
										<dd className="inline">
											{formatDate(transaction.timestamp)}
										</dd>
									</div>
									<div className="mt-4">
										<a
											href={transaction.explorerUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:text-blue-800"
											onClick={(e) => e.stopPropagation()}
										>
											View on Block Explorer →
										</a>
									</div>
								</dl>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
					<div className="flex items-center space-x-4">
						<button
							onClick={() => router.push("/dashboard/send")}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
						>
							New Transaction
						</button>
					</div>
				</div>

				{/* Transactions List */}
				<div className="bg-white rounded-lg shadow overflow-hidden">
					{isLoading ? (
						<div className="p-6 text-center text-gray-500">
							Loading transactions...
						</div>
					) : error ? (
						<div className="p-6 text-center text-red-500">{error}</div>
					) : transactions.length === 0 ? (
						<div className="p-6 text-center text-gray-500">
							No transactions found. They will appear here once you start making
							transfers.
						</div>
					) : (
						<div>
							{/* Table Headers */}
							<div className="grid grid-cols-5 items-center px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider gap-4">
								<div>Date</div>
								<div>From</div>
								<div>To</div>
								<div>Amount</div>
								<div className="text-right">Status</div>
							</div>
							<div className="divide-y divide-gray-200">
								{transactions.map((transaction) => (
									<TransactionRow
										key={transaction.hash || transaction.id}
										transaction={transaction}
									/>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
