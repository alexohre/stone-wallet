"use client";
import DashboardLayout from "../../../../components/DashboardLayout";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SecretsPage() {
	const [secrets, setSecrets] = useState(null);
	const [error, setError] = useState("");
	const { user } = useAuth();

	useEffect(() => {
		const fetchSecrets = async () => {
			try {
				const response = await fetch("/api/user/secrets");
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Failed to fetch secrets");
				}

				setSecrets(data);
			} catch (error) {
				setError(error.message);
			}
		};

		if (user) {
			fetchSecrets();
		}
	}, [user]);

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
					<h1 className="text-2xl font-bold text-gray-900">Wallet Secrets</h1>
					<p className="mt-2 text-sm text-gray-600">
						View and manage your sensitive wallet information
					</p>
				</div>

				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-700">{error}</p>
					</div>
				)}

				{secrets && (
					<div className="space-y-6">
						<div className="bg-white shadow rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Active Wallet
							</h3>
							<div className="bg-gray-50 p-4 rounded-lg space-y-3">
								<div>
									<span className="text-sm font-medium text-gray-500">
										Wallet Address
									</span>
									<p className="mt-1 font-mono text-sm text-gray-900 text-bold break-all">
										{secrets.wallet.address}
									</p>
								</div>
								{/* <div>
									<span className="text-sm font-medium text-gray-500">
										Private Key
									</span>
									<p className="mt-1 font-mono text-sm break-all">
										{secrets.wallet.privateKey}
									</p>
								</div> */}
							</div>
						</div>

						<div className="bg-white shadow rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Recovery Phrase
							</h3>
							<div className="bg-gray-50 p-4 rounded-lg break-all text-gray-500 font-mono text-sm">
								{secrets.mnemonic}
							</div>
						</div>

						<div className="bg-white shadow rounded-lg p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Accounts Keys
							</h3>
							<div className="space-y-4">
								{secrets.accounts.map((account, index) => (
									<div
										key={index}
										className="bg-gray-50 p-4 rounded-lg space-y-3"
									>
										<div>
											<span className="text-sm font-medium text-gray-500">
												Public Key
											</span>
											<p className="mt-1 font-mono text-sm text-gray-500 break-all">
												{account.publicKey}
											</p>
										</div>
										<div>
											<span className="text-sm font-medium text-gray-500">
												Private Key
											</span>
											<p className="mt-1 font-mono text-sm break-all">
												{account.privateKey}
											</p>
										</div>
									</div>
								))}
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
				)}
			</div>
		</DashboardLayout>
	);
}
