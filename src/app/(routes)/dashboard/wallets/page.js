'use client';
import DashboardLayout from '../../../../components/DashboardLayout';

export default function Wallets() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-semibold text-gray-900">My Wallets</h1>
                    <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center">
                        Add New Wallet
                    </button>
                </div>

                {/* Wallets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Empty State */}
                    <div className="col-span-full bg-white rounded-lg shadow">
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No wallets found</h3>
                            <p className="text-sm text-gray-500 mb-4">Create your first wallet to get started!</p>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Create Wallet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
