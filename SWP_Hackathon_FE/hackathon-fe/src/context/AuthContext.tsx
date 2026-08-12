import React, { createContext, useEffect, useState } from 'react'
import type { AuthContextType, UserProfile } from '../types/account/Account'

export const AuthContext = createContext<AuthContextType | null>(null);
type AuthProviderProps = {
    children: React.ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<UserProfile | null>(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch (e) {
                return null;
            }
        }
        return null;
    });

    useEffect(() => {
    }, []);
    const login = React.useCallback((user: UserProfile, token: string, refresshToken: string) => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refresshToken)
    }, []);
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = '/login';
    };

    const updateUser = (updatedFields: Partial<UserProfile>) => {
        setUser((prev) => {
            if (!prev) return prev;
            const newUser = { ...prev, ...updatedFields };
            localStorage.setItem("user", JSON.stringify(newUser));
            return newUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }} >
            {children}
        </AuthContext.Provider>
    )
}
