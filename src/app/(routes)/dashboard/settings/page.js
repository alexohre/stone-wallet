"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import DashboardLayout from "../../../../components/DashboardLayout";
import toast from "react-hot-toast";

export default function Settings() {
	const { user, updateState } = useAuth();
	const [name, setName] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [passwordLoading, setPasswordLoading] = useState(false);

	useEffect(() => {
		if (user) {
			setName(user.name || "");
		}
	}, [user]);

	const inputClasses =
		"mt-1 block w-full h-12 px-4 rounded-lg border-gray-300 shadow-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-blue-500";
	const buttonClasses =
		"px-6 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed";

	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error("Name is required");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch("/api/user/update", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name: name.trim() }),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to update profile");
			}

			updateState(data.user);
			toast.success("Profile updated successfully");
		} catch (error) {
			console.error("Update profile error:", error);
			toast.error(error.message || "Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	const handleUpdatePassword = async (e) => {
		e.preventDefault();
		if (!currentPassword || !newPassword) {
			toast.error("Both current and new passwords are required");
			return;
		}

		if (newPassword.length < 6) {
			toast.error("New password must be at least 6 characters long");
			return;
		}

		setPasswordLoading(true);
		try {
			const response = await fetch("/api/user/password", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ currentPassword, newPassword }),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to update password");
			}

			// Clear password fields
			setCurrentPassword("");
			setNewPassword("");
			toast.success("Password updated successfully");
		} catch (error) {
			console.error("Update password error:", error);
			toast.error(error.message || "Failed to update password");
		} finally {
			setPasswordLoading(false);
		}
	};

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

				{/* Settings Sections */}
				<div className="bg-white rounded-lg shadow divide-y divide-gray-200">
					{/* Profile Section */}
					<form onSubmit={handleUpdateProfile} className="p-4 sm:p-6">
						<h2 className="text-lg font-medium text-gray-900">
							Profile Settings
						</h2>
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
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Email
									</label>
									<input
										type="email"
										className={`${inputClasses} bg-gray-50`}
										value={user?.email || ""}
										disabled
									/>
								</div>
							</div>
							<div className="flex justify-end pt-2">
								<button
									type="submit"
									className={buttonClasses}
									disabled={loading}
								>
									{loading ? "Saving..." : "Save Changes"}
								</button>
							</div>
						</div>
					</form>

					{/* Security Section */}
					<form onSubmit={handleUpdatePassword} className="p-4 sm:p-6">
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
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										required
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
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
									/>
								</div>
							</div>
							<div className="flex justify-end pt-2">
								<button
									type="submit"
									className={buttonClasses}
									disabled={passwordLoading}
								>
									{passwordLoading ? "Updating..." : "Change Password"}
								</button>
							</div>
						</div>
					</form>

					{/* Preferences Section */}
					<div className="p-4 sm:p-6">
						<h2 className="text-lg font-medium text-gray-900">Preferences</h2>
						<p className="mt-1 text-sm text-gray-500">
							Customize your wallet experience.
						</p>
						<div className="mt-6 space-y-4">
							{/* Add preferences options here */}
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
