'use client';
import DashboardLayout from '../../../../components/DashboardLayout';

export default function Settings() {
    const inputClasses = "mt-1 block w-full h-12 px-4 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";
    const buttonClasses = "px-6 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors";

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

                {/* Settings Sections */}
                <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                    {/* Profile Section */}
                    <div className="p-4 sm:p-6">
                        <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage your account settings and preferences.
                        </p>
                        <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        className={inputClasses}
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className={inputClasses}
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button className={buttonClasses}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="p-4 sm:p-6">
                        <h2 className="text-lg font-medium text-gray-900">Security</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Update your password and security preferences.
                        </p>
                        <div className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        className={inputClasses}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        className={inputClasses}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button className={buttonClasses}>
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="p-4 sm:p-6">
                        <h2 className="text-lg font-medium text-gray-900">Preferences</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Customize your wallet experience.
                        </p>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center py-2">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label className="ml-3 block text-sm text-gray-900">
                                    Enable email notifications
                                </label>
                            </div>
                            <div className="flex items-center py-2">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label className="ml-3 block text-sm text-gray-900">
                                    Enable two-factor authentication
                                </label>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button className={buttonClasses}>
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
