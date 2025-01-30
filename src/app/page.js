"use client";
import React, { useState } from "react";
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function Home() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
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

			<Footer />
		</div>
	);
}
