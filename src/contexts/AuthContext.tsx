import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Participant } from '../types';

import { getParticipantDetails, supabase } from '../services/supabase';

interface AuthContextType {
    // State
    currentUser: Participant | null;
    loginError: string | null;
    isLoading: boolean;


    // Actions
    login: (phoneNumber: string) => Promise<void>;
    logout: () => void;
    clearLoginError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [currentUser, setCurrentUserState] = useState<Participant | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const session = await supabase.auth.getSession();
                if (session.data.session) {
                    const participant = await getParticipantDetails(session.data.session.user.id);
                    if (participant) {
                        setCurrentUserState(participant);
                    } else {
                        console.log("No participant found for user ID:", session.data.session.user.id);
                        // Optionally sign out if no participant found
                        await supabase.auth.signOut();
                    }
                }
            } catch (error) {
                console.error("Error fetching session on mount:", error);
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);

            if (event === 'SIGNED_IN' && session) {
                const participant = await getParticipantDetails(session.user.id);
                if (participant) {
                    setCurrentUserState(participant);
                }
            } else if (event === 'SIGNED_OUT') {
                setCurrentUserState(null);
                localStorage.clear(); // Clear localStorage on sign out
            }
        });

        return () => subscription.unsubscribe();
    }, []); // Remove currentUser dependency to prevent infinite loop


    const login = async (phoneNumber: string): Promise<void> => {
        setIsLoading(true);
        setLoginError(null);

        try {
            const { data } = await supabase.auth.signInWithPassword({
                email: `${phoneNumber}@isgcon.com`,
                password: '123456789'
            })


            if (!data.session) {
                setLoginError('Invalid phone number. Please check your number or contact event support.');
                return;
            }
            //Get participant details fromt the supabase table
            const participant = await getParticipantDetails(data.user.id);

            if (participant) {
                setCurrentUserState(participant);
            } else {
                setLoginError('Phone number not found. Please check your number or contact event support.');
            }
        } catch (error) {
            setLoginError('An error occurred during login. Please try again.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            setIsLoading(true);
            await supabase.auth.signOut();
            setCurrentUserState(null);
            setLoginError(null);

            // Clear all localStorage data on logout
            localStorage.clear();
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails, clear the user state
            setCurrentUserState(null);
            setLoginError(null);
            localStorage.clear();
        } finally {
            setIsLoading(false);
        }
    };

    const clearLoginError = (): void => {
        setLoginError(null);
    };

    const value: AuthContextType = {
        // State
        currentUser,
        loginError,
        isLoading,        // Placeholder for potential future use

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