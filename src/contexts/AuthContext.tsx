import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Participant } from '../types';
import {
    initializeData,
    authenticateParticipant,
    getCurrentUser,
    setCurrentUser as setStorageCurrentUser,
    clearCurrentUser
} from '../services/storageService';

interface AuthContextType {
    // State
    currentUser: Participant | null;
    loginError: string | null;
    isLoading: boolean;
    isInitializing: boolean;

    // Actions
    login: (phoneNumber: string) => Promise<void>;
    logout: () => void;
    clearLoginError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUserState] = useState<Participant | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Initialize data and check for existing user session
        initializeData();
        const existingUser = getCurrentUser();
        if (existingUser) {
            setCurrentUserState(existingUser);
        }
        setIsInitializing(false);
    }, []);

    const login = async (phoneNumber: string): Promise<void> => {
        setIsLoading(true);
        setLoginError(null);

        try {
            // Simulate network delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            const participant = authenticateParticipant(phoneNumber);

            if (participant) {
                setStorageCurrentUser(participant);
                setCurrentUserState(participant);
            } else {
                setLoginError('Phone number not found. Please check your number or contact event support.');
            }
        } catch (error) {
            setLoginError('An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        clearCurrentUser();
        setCurrentUserState(null);
        setLoginError(null);
    };

    const clearLoginError = (): void => {
        setLoginError(null);
    };

    const value: AuthContextType = {
        // State
        currentUser,
        loginError,
        isLoading,
        isInitializing,

        // Actions
        login,
        logout,
        clearLoginError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};