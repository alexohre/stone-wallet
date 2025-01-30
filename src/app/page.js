"use client";
import React, { useState } from "react";

export default function Home() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Navigation */}
			<nav className="bg-white shadow-sm border-b sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<div className="flex-shrink-0">
							<div className="flex items-center">
								<svg
									className="h-8 w-8 text-blue-600"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M4 7c0-1.1.9-2 2-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
								</svg>
								<span className="ml-2 text-xl font-bold text-gray-900">
									Stone Wallet
								</span>
							</div>
						</div>

						{/* Navigation Links */}
						<div className="hidden md:block">
							<div className="flex items-center space-x-8">
								<a
									href="#"
									className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
								>
									Home
								</a>
								<a
									href="#"
									className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
								>
									About
								</a>
								<a
									href="#"
									className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
								>
									Features
								</a>
							</div>
						</div>

						{/* Auth Buttons */}
						<div className="hidden md:block">
							<div className="flex items-center space-x-4">
								<button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
									Sign In
								</button>
								<button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
									Sign Up
								</button>
							</div>
						</div>

						{/* Mobile menu button */}
						<div className="md:hidden">
							<button
								onClick={toggleMobileMenu}
								className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
							>
								<svg
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									style={{
										transform: isMobileMenuOpen
											? "rotate(90deg)"
											: "rotate(0deg)",
										transition: "transform 0.2s",
									}}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							</button>
						</div>
					</div>

					{/* Mobile menu */}
					<div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
						<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
							<a
								href="#"
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
							>
								Home
							</a>
							<a
								href="#"
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
							>
								About
							</a>
							<a
								href="#"
								className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
							>
								Features
							</a>
						</div>
						<div className="pt-4 pb-3 border-t border-gray-200">
							<div className="flex items-center px-2 space-x-2">
								<button className="w-full px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
									Sign In
								</button>
								<button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
									Sign Up
								</button>
							</div>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<div className="relative bg-white overflow-hidden">
				<div className="max-w-7xl mx-auto">
					<div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
						<main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8">
							<div className="text-center">
								<h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
									<span className="block">Secure Your Digital Assets</span>
									<span className="block text-blue-600">with Stone Wallet</span>
								</h1>
								<p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
									Experience the next generation of digital asset management.
									Stone Wallet provides military-grade security with an
									intuitive interface, making it easier than ever to manage your
									digital wealth.
								</p>
								<div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
									<div className="rounded-md shadow">
										<button className="w-full px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
											Get Started
										</button>
									</div>
									<div className="mt-3 sm:mt-0 sm:ml-3">
										<button className="w-full px-8 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 md:py-4 md:text-lg md:px-10">
											Learn More
										</button>
									</div>
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
			{/* Second Hero Section */}
			<div className="bg-blue-600 py-16 sm:py-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
						<div>
							<h2 className="text-3xl font-extrabold text-white sm:text-4xl">
								Advanced Security Features
							</h2>
							<p className="mt-3 max-w-3xl text-lg text-blue-200">
								Our wallet combines cutting-edge encryption with user-friendly
								features to keep your assets safe and accessible.
							</p>
							<div className="mt-10 space-y-4">
								{/* Feature list */}
								<div className="flex items-start">
									<div className="flex-shrink-0">
										<svg
											className="h-6 w-6 text-blue-200"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
									<p className="ml-3 text-lg text-white">
										Multi-factor authentication
									</p>
								</div>
								<div className="flex items-start">
									<div className="flex-shrink-0">
										<svg
											className="h-6 w-6 text-blue-200"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
									<p className="ml-3 text-lg text-white">
										Biometric security options
									</p>
								</div>
								<div className="flex items-start">
									<div className="flex-shrink-0">
										<svg
											className="h-6 w-6 text-blue-200"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
									<p className="ml-3 text-lg text-white">
										24/7 fraud monitoring
									</p>
								</div>
							</div>
						</div>
						<div className="mt-10 lg:mt-0">
							<div className="bg-white rounded-lg shadow-xl p-6">
								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center">
											<svg
												className="h-10 w-10 text-blue-600"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
											</svg>
											<div className="ml-4">
												<p className="text-lg font-medium text-gray-900">
													Bank-Grade Security
												</p>
												<p className="text-base text-gray-500">
													Protected by advanced encryption
												</p>
											</div>
										</div>
									</div>
									{/* Add more security features here */}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="bg-gray-900 text-gray-400">
				<div className="max-w-7xl mx-auto px-6 py-12 md:flex md:justify-between">
					{/* Left Section - Logo & Description */}
					<div className="mb-8 md:mb-0 md:w-1/3">
						<div className="flex items-center space-x-2">
							<svg
								className="h-8 w-8 text-blue-500"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M4 7c0-1.1.9-2 2-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
							</svg>
							<span className="text-xl font-bold text-white">Stone Wallet</span>
						</div>
						<p className="mt-3 text-gray-400">
							Securing your digital assets with next-generation technology.
						</p>
						{/* Social Links */}
						<div className="flex space-x-4 mt-4">
							<a href="#" className="text-gray-400 hover:text-white transition">
								<svg
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
								</svg>
							</a>
							<a href="#" className="text-gray-400 hover:text-white transition">
								<svg
									className="h-6 w-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										fillRule="evenodd"
										d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688"
									/>
								</svg>
							</a>
						</div>
					</div>

					{/* Middle Section - Quick Links */}
					<div className="mb-8 md:mb-0 md:w-1/3">
						<h3 className="text-lg font-semibold text-white">Quick Links</h3>
						<ul className="mt-4 space-y-2">
							<li>
								<a href="#" className="hover:text-white transition">
									About Us
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition">
									Security
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition">
									Support
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition">
									Privacy Policy
								</a>
							</li>
						</ul>
					</div>

					{/* Right Section - Newsletter */}
					<div className="md:w-1/3">
						<h3 className="text-lg font-semibold text-white">
							Subscribe to Our Newsletter
						</h3>
						<p className="mt-2 text-gray-400">
							Stay updated with our latest features and security tips.
						</p>
						<div className="mt-4 flex">
							<input
								type="email"
								placeholder="Enter your email"
								className="w-full px-3 py-2 rounded-l-md bg-gray-800 border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
							/>
							<button className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition">
								Subscribe
							</button>
						</div>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="border-t border-gray-800 mt-8 py-4 text-center text-gray-500 text-sm">
					&copy; {new Date().getFullYear()} Stone Wallet. All rights reserved.
				</div>
			</footer>
		</div>
	);
}
