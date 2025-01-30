'use client';
import DashboardLayout from '../../../../components/DashboardLayout';

export default function Transactions() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        New Transaction
                    </button>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <div className="text-center text-gray-500 py-4">
                            No transactions found. They will appear here once you start making transfers.
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
