import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { AccountProvider } from '@/context/AccountContext';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export const metadata = {
    title: "Stone Wallet",
    description: "A secure and user-friendly cryptocurrency wallet",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${inter.variable} antialiased`}
                suppressHydrationWarning
            >
                <AuthProvider>
                    <AccountProvider>
                        {children}
                    </AccountProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
