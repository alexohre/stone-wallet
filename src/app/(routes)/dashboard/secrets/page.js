"use client";
import DashboardLayout from "../../../../components/DashboardLayout";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAccount } from "@/context/AccountContext";

export default function SecretsPage() {
	const [secrets, setSecrets] = useState(null);
	const [error, setError] = useState("");
	const [showPrivateKey, setShowPrivateKey] = useState(false);
	const [showMnemonic, setShowMnemonic] = useState(false);
	const [copiedKey, setCopiedKey] = useState("");
	const { user } = useAuth();
	const { selectedAccount } = useAccount();

	const handleCopy = (text, type) => {
		navigator.clipboard.writeText(text);
		setCopiedKey(type);
		setTimeout(() => setCopiedKey(""), 2000);
	};

	useEffect(() => {
		const fetchSecrets = async () => {
			if (!selectedAccount) return;

			try {
				const response = await fetch(
					"/api/user/secrets?accountId=" + selectedAccount.id
				);
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
						{selectedAccount
							? `${selectedAccount.name} - Secrets`
							: "Select an Account"}
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
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium text-gray-500">
											Public Key
										</span>
										<div className="flex space-x-2">
											<button
												onClick={() => handleCopy(selectedAccount.publicKey, "publicKey")}
												className="text-gray-400 hover:text-gray-600"
												title="Copy"
											>
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
														d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
													/>
												</svg>
											</button>
										</div>
									</div>
									<div className="relative">
										<p className="mt-1 font-mono text-sm text-gray-900 break-all">
											{selectedAccount.publicKey}
										</p>
										{copiedKey === "publicKey" && (
											<span className="absolute right-0 top-0 text-sm text-green-600">
												Copied!
											</span>
										)}
									</div>
								</div>
								<div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium text-gray-500">
											Private Key
										</span>
										<div className="flex space-x-2">
											<button
												onClick={() => setShowPrivateKey(!showPrivateKey)}
												className="text-gray-400 hover:text-gray-600"
												title={showPrivateKey ? "Hide" : "Show"}
											>
												<svg
													className="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													{showPrivateKey ? (
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
														/>
													) : (
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
														/>
													)}
												</svg>
											</button>
											<button
												onClick={() => handleCopy(selectedAccount.privateKey, "privateKey")}
												className="text-gray-400 hover:text-gray-600"
												title="Copy"
											>
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
														d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
													/>
												</svg>
											</button>
										</div>
									</div>
									<div className="relative">
										<p className={`mt-1 font-mono text-sm break-all ${showPrivateKey ? 'text-gray-900' : 'blur-sm select-none'}`}>
											{selectedAccount.privateKey}
										</p>
										{copiedKey === "privateKey" && (
											<span className="absolute right-0 top-0 text-sm text-green-600">
												Copied!
											</span>
										)}
									</div>
								</div>
								<div>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium text-gray-500">
											Recovery Phrase
										</span>
										<div className="flex space-x-2">
											<button
												onClick={() => setShowMnemonic(!showMnemonic)}
												className="text-gray-400 hover:text-gray-600"
												title={showMnemonic ? "Hide" : "Show"}
											>
												<svg
													className="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													{showMnemonic ? (
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
														/>
													) : (
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
														/>
													)}
												</svg>
											</button>
											<button
												onClick={() => handleCopy(selectedAccount.mnemonic, "mnemonic")}
												className="text-gray-400 hover:text-gray-600"
												title="Copy"
											>
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
														d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
													/>
												</svg>
											</button>
										</div>
									</div>
									<div className="relative">
										<p className={`mt-1 font-mono text-sm break-all ${showMnemonic ? 'text-gray-900' : 'blur-sm select-none'}`}>
											{selectedAccount.mnemonic}
										</p>
										{copiedKey === "mnemonic" && (
											<span className="absolute right-0 top-0 text-sm text-green-600">
												Copied!
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
						{/* Security Notice */}
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
