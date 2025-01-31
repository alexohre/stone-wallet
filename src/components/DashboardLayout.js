"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";

export default function DashboardLayout({ children }) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const pathname = usePathname();
	const { user, logout } = useAuth();
	const router = useRouter();
	const { accounts, selectedAccount, setSelectedAccount } = useAccount();

	// Close sidebar on mobile when route changes
	useEffect(() => {
		setIsSidebarOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!user) {
			router.replace("/signin");
		}
	}, [user, router]);

	// Close sidebar when clicking outside on mobile
	useEffect(() => {
		function handleClickOutside(event) {
			if (isSidebarOpen && window.innerWidth < 1024) {
				const sidebar = document.getElementById("sidebar");
				const toggleButton = document.getElementById("sidebar-toggle");
				if (
					sidebar &&
					!sidebar.contains(event.target) &&
					toggleButton &&
					!toggleButton.contains(event.target)
				) {
					setIsSidebarOpen(false);
				}
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isSidebarOpen]);

	// Show loading state if user is not loaded
	if (!user) {
		return (
			<div className="min-h-screen bg-gray-100 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			{/* Mobile Header */}
			<div className="lg:hidden bg-white shadow-sm">
				<div className="flex items-center justify-between px-4 h-16">
					<Link href="/dashboard" className="flex items-center space-x-2">
						<svg
							className="w-8 h-8 text-blue-600"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M4 7c0-1.1.9-2 2-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
						</svg>
						<span className="text-xl font-bold">Stone Wallet</span>
					</Link>
					<button
						id="sidebar-toggle"
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
						className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
					>
						{isSidebarOpen ? (
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
						) : (
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
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						)}
					</button>
				</div>
			</div>

			{/* Sidebar */}
			<div
				id="sidebar"
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform lg:translate-x-0 transition-transform duration-300 ease-in-out ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{/* Desktop Logo */}
				<div className="hidden lg:flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
					<Link href="/dashboard" className="flex items-center space-x-2">
						<svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
							<path d="M4 7c0-1.1.9-2 2-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
						</svg>
						<span className="text-xl font-bold">Stone Wallet</span>
					</Link>
				</div>

				{/* User Info */}
				<div className="p-4 border-b border-gray-200">
					<div className="flex items-center space-x-3">
						<div className="flex-shrink-0">
							<div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
								{user?.name?.[0]?.toUpperCase() || "U"}
							</div>
						</div>

						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{user?.name || "User"}
							</p>
							<p className="text-xs text-gray-500 truncate">
								{user?.email || "Loading..."}
							</p>
						</div>
						<button
							onClick={logout}
							className="p-1 rounded-full hover:bg-gray-100"
							title="Sign out"
						>
							<svg
								className="w-5 h-5 text-gray-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
								/>
							</svg>
						</button>
					</div>
					{/* Account Selector */}
					<div className="mt-3">
						<select
							className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							value={selectedAccount?.id || ""}
							onChange={(e) => {
								const account = accounts.find((a) => a.id === e.target.value);
								setSelectedAccount(account);
							}}
						>
							{accounts.map((account) => (
								<option key={account.id} value={account.id}>
									{account.name}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Navigation */}
				<nav className="px-4 py-6">
					<div className="space-y-2">
						<Link
							href="/dashboard"
							className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${
								pathname === "/dashboard"
									? "bg-blue-50 text-blue-600"
									: "text-gray-700 hover:bg-gray-50"
							}`}
						>
							<svg
								className={`w-6 h-6 ${
									pathname === "/dashboard" ? "text-blue-600" : "text-gray-400"
								}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
								/>
							</svg>
							<span className="font-medium">Overview</span>
						</Link>

						<Link
							href="/dashboard/wallets"
							className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${
								pathname === "/dashboard/wallets"
									? "bg-blue-50 text-blue-600"
									: "text-gray-700 hover:bg-gray-50"
							}`}
						>
							<svg
								className={`w-6 h-6 ${
									pathname === "/dashboard/wallets"
										? "text-blue-600"
										: "text-gray-400"
								}`}
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
							<span className="font-medium">Wallets</span>
						</Link>

						<Link
							href="/dashboard/transactions"
							className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${
								pathname === "/dashboard/transactions"
									? "bg-blue-50 text-blue-600"
									: "text-gray-700 hover:bg-gray-50"
							}`}
						>
							<svg
								className={`w-6 h-6 ${
									pathname === "/dashboard/transactions"
										? "text-blue-600"
										: "text-gray-400"
								}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M8 7h12m0 0l-4 4m4-4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
								/>
							</svg>
							<span className="font-medium">Transactions</span>
						</Link>

						<Link
							href="/dashboard/secrets"
							className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${
								pathname === "/dashboard/admin/secrets"
									? "bg-blue-50 text-blue-600"
									: "text-gray-700 hover:bg-gray-50"
							}`}
						>
							<svg
								className={`w-6 h-6 ${
									pathname === "/dashboard/admin/secrets"
										? "text-blue-600"
										: "text-gray-400"
								}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-13V3a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 012 2z"
								/>
							</svg>
							<span className="font-medium">Wallet Secrets</span>
						</Link>

						<Link
							href="/dashboard/settings"
							className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${
								pathname === "/dashboard/settings"
									? "bg-blue-50 text-blue-600"
									: "text-gray-700 hover:bg-gray-50"
							}`}
						>
							<svg
								className={`w-6 h-6 ${
									pathname === "/dashboard/settings"
										? "text-blue-600"
										: "text-gray-400"
								}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							<span className="font-medium">Settings</span>
						</Link>

						
					</div>
				</nav>
			</div>

			{/* Main content */}
			<div className={`transition-all duration-300 lg:ml-64`}>
				<main className="p-4 lg:p-8">{children}</main>
			</div>

			{/* Overlay for mobile */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}
		</div>
	);
}
