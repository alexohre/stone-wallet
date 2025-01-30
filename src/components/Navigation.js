'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
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
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-8">
                            <Link
                                href="/"
                                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Home
                            </Link>
                            <Link
                                href="/about"
                                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                About
                            </Link>
                            <Link
                                href="/features"
                                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Features
                            </Link>
                        </div>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/signin"
                                className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Sign Up
                            </Link>
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
                        <Link
                            href="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                        >
                            Home
                        </Link>
                        <Link
                            href="/about"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                        >
                            About
                        </Link>
                        <Link
                            href="/features"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                        >
                            Features
                        </Link>
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="flex items-center px-2 space-x-2">
                            <Link
                                href="/signin"
                                className="w-full px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
