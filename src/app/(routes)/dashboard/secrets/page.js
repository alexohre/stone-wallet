"use client";
import DashboardLayout from "../../../../components/DashboardLayout";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAccount } from "@/context/AccountContext";

export default function SecretsPage() {
	const [secrets, setSecrets] = useState(null);
	const [error, setError] = useState("");
	const { user } = useAuth();
	const { selectedAccount } = useAccount();

	useEffect(() => {
		const fetchSecrets = async () => {
			if (!selectedAccount) return;
			
			try {
				const response = await fetch("/api/user/secrets?accountId=" + selectedAccount.id);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Failed to fetch secrets");
				}

				setSecrets(data);
			} catch (error) {
				setError(error.message);
			}
		};

		fetchSecrets();
	}, [selectedAccount]);

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
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900">
						{selectedAccount ? `${selectedAccount.name} - Secrets` : "Select an Account"}
					</h1>
					<p className="mt-2 text-sm text-gray-600">
						View sensitive information for this account
					</p>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-700">{error}</p>
					</div>
				)}

				{!selectedAccount ? (
					<div className="bg-white rounded-lg shadow p-6">
						<p className="text-gray-500 text-center">
							Please select an account from the sidebar to view its secrets
						</p>
					</div>
				) : secrets ? (
					<div className="space-y-6">
						{/* Account Information */}
						<div className="bg-white shadow rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Account Information
							</h3>
							<div className="bg-gray-50 p-4 rounded-lg space-y-3">
								<div>
									<span className="text-sm font-medium text-gray-500">
										Public Key
									</span>
									<p className="mt-1 font-mono text-sm text-gray-900 break-all">
										{selectedAccount.publicKey}
									</p>
								</div>
								<div>
									<span className="text-sm font-medium text-gray-500">
										Private Key
									</span>
									<p className="mt-1 font-mono text-sm text-gray-500 break-all">
										{selectedAccount.privateKey}
									</p>
								</div>
								<div>
									<span className="text-sm font-medium text-gray-500">
										Recovery Phrase
									</span>
									<p className="mt-1 font-mono text-sm text-gray-500 break-all">
										{selectedAccount.mnemonic}
									</p>
								</div>
							</div>
						</div>

						{/* Wallets */}
						<div className="bg-white shadow rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Wallet Keys
							</h3>
							<div className="space-y-4">
								{secrets.wallets.map((wallet) => (
									<div
										key={wallet.id}
										className="bg-gray-50 p-4 rounded-lg space-y-3"
									>
										<div>
											<span className="text-sm font-medium text-gray-500">
												Name
											</span>
											<p className="mt-1 font-mono text-sm text-gray-900">
												{wallet.name}
											</p>
										</div>
										<div>
											<span className="text-sm font-medium text-gray-500">
												Network
											</span>
											<p className="mt-1 font-mono text-sm text-gray-900">
												{wallet.network}
											</p>
										</div>
										<div>
											<span className="text-sm font-medium text-gray-500">
												Address
											</span>
											<p className="mt-1 font-mono text-sm text-gray-500 break-all">
												{wallet.address}
											</p>
										</div>
										<div>
											<span className="text-sm font-medium text-gray-500">
												Private Key
											</span>
											<p className="mt-1 font-mono text-sm text-gray-500 break-all">
												{wallet.privateKey}
											</p>
										</div>
									</div>
								))}
								{secrets.wallets.length === 0 && (
									<div className="text-center text-gray-500 py-4">
										No wallets in this account
									</div>
								)}
							</div>
						</div>

						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-yellow-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<h3 className="text-sm font-medium text-yellow-800">
										Security Notice
									</h3>
									<div className="mt-2 text-sm text-yellow-700">
										<p>
											Never share your recovery phrase or private keys with
											anyone. Store them in a secure location. Anyone with
											access to these can control your funds.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="flex justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
