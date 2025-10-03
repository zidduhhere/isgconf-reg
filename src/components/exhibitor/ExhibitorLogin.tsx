import React, { useState } from 'react';
import { Building2, LogIn } from 'lucide-react';
import { useExhibitor } from '../../contexts/ExhibitorContext';

const ExhibitorLogin: React.FC = () => {
    const [companyId, setCompanyId] = useState('');
    const [isLogging, setIsLogging] = useState(false);
    const [error, setError] = useState('');

    const { login } = useExhibitor();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!companyId.trim()) {
            setError('Please enter Company ID');
            return;
        }

        setIsLogging(true);
        setError('');

        try {
            const success = await login(companyId.trim());

            if (!success) {
                setError('Invalid Company ID');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Login failed. Please try again.');
        } finally {
            setIsLogging(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Exhibitor Portal
                    </h1>
                    <p className="text-gray-600">
                        Sign in to manage your company's meal allocations
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="companyId" className="block text-sm font-medium text-gray-700 mb-2">
                            Company ID
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                id="companyId"
                                type="text"
                                value={companyId}
                                onChange={(e) => setCompanyId(e.target.value)}
                                placeholder="Enter your Company ID (e.g., EXH001)"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLogging}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLogging}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                    >
                        {isLogging ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <>
                                <LogIn className="h-5 w-5" />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Login Information:</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Company ID:</strong> EXH001, EXH002, EXH003, EXH004</p>
                        <p><strong>Note:</strong> Company ID is converted to email format (e.g., exh001@isgcon.com)</p>
                        <p><strong>Authentication:</strong> Uses default password automatically</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExhibitorLogin;