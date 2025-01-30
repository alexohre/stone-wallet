"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";

export default function SignUp() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		name: "",
	});
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			if (formData.password !== formData.confirmPassword) {
				throw new Error("Passwords do not match");
			}

			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: formData.email,
					password: formData.password,
					name: formData.name,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create account");
			}

			// Successful registration
			router.push("/signin?registered=true");
		} catch (err) {
			setError(err.message || "Failed to create account. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />

			<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md space-y-8">
					<div>
						<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
							Create your account
						</h2>
						<p className="mt-2 text-center text-sm text-gray-600">
							Already have an account?{" "}
							<a
								href="/signin"
								className="font-medium text-blue-600 hover:text-blue-500"
							>
								Sign in
							</a>
						</p>
					</div>

					<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
						{error && (
							<div className="text-red-600 text-sm text-center">{error}</div>
						)}

						<div className="space-y-4 rounded-md shadow-sm">
							<div>
								<label htmlFor="name" className="sr-only">
									Full Name
								</label>
								<input
									id="name"
									name="name"
									type="text"
									required
									className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
									placeholder="Full Name"
									value={formData.name}
									onChange={handleChange}
								/>
							</div>

							<div>
								<label htmlFor="email" className="sr-only">
									Email address
								</label>
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
									placeholder="Email address"
									value={formData.email}
									onChange={handleChange}
								/>
							</div>

							<div>
								<label htmlFor="password" className="sr-only">
									Password
								</label>
								<input
									id="password"
									name="password"
									type="password"
									required
									className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
									placeholder="Password"
									value={formData.password}
									onChange={handleChange}
								/>
							</div>

							<div>
								<label htmlFor="confirmPassword" className="sr-only">
									Confirm Password
								</label>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									required
									className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
									placeholder="Confirm Password"
									value={formData.confirmPassword}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								className="group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
							>
								Create Account
							</button>
						</div>
					</form>
				</div>
			</div>

			<Footer />
		</div>
	);
}
