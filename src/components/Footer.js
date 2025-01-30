export default function Footer() {
    return (
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
    );
}
