import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Building2, Users, Shield } from 'lucide-react';

const Navigation: React.FC = () => {
    return (
        <nav className="fixed top-4 left-4 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="flex flex-col space-y-2">
                    <Link
                        to="/"
                        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                    >
                        <Home className="h-4 w-4" />
                        <span className="text-sm font-medium">Home</span>
                    </Link>

                    <Link
                        to="/login"
                        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition duration-200"
                    >
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">Participant Login</span>
                    </Link>

                    <Link
                        to="/exhibitor"
                        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition duration-200"
                    >
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Exhibitor Portal</span>
                    </Link>

                    <Link
                        to="/admin/login"
                        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                    >
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Admin Panel</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;