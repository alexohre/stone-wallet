'use client';

import { AuthProvider } from '../../context/AuthContext';

export default function AppLayout({ children }) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
