'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/DashboardLayout';

export default function Dashboard() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [walletData, setWalletData] = useState({
        totalBalance: 0,
        activeWallets: 0,
        wallets: []
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/signin');
        }
    }, [user, loading, router]);

    useEffect(() => {
        async function fetchWalletData() {
            try {
                const response = await fetch('/api/user/wallets');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch wallet data');
                }

                setWalletData(data);
            } catch (error) {
                console.error('Error fetching wallet data:', error);
                setError(error.message);
            }
        }

        if (user) {
            fetchWalletData();
        }
    }, [user]);

    // Show nothing while loading or if no user
    if (loading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
                    <button 
                        onClick={() => router.push('/dashboard/wallets')}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
                    >
                        Add New Wallet
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900">Total Balance</h2>
                            <span className="p-2 bg-green-100 text-green-800 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                        </div>
                        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
                            ${walletData.totalBalance.toFixed(2)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">Total balance across all wallets</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900">Active Wallets</h2>
                            <span className="p-2 bg-blue-100 text-blue-800 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </span>
                        </div>
                        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
                            {walletData.activeWallets}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">Across all currencies</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
                            <span className="p-2 bg-purple-100 text-purple-800 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </span>
                        </div>
                        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">0</p>
                        <p className="mt-1 text-sm text-gray-500">In the last 30 days</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {walletData.wallets.length > 0 ? (
                            walletData.wallets.map((wallet) => (
                                <div key={wallet.id} className="p-4 sm:p-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{wallet.name}</p>
                                            <p className="text-sm text-gray-500">{wallet.address}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            ${parseFloat(wallet.balance).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 sm:p-6">
                                <div className="text-center text-gray-500 py-4">
                                    No recent activity
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
