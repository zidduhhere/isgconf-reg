import React from 'react';
import { ExhibitorProvider, useExhibitor } from '../contexts/ExhibitorContext';
import ExhibitorLogin from './ExhibitorLogin';
import ExhibitorDashboard from './ExhibitorDashboard';
import Navigation from './Navigation';

const ExhibitorAppContent: React.FC = () => {
    const { currentCompany, isLoading } = useExhibitor();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return currentCompany ? (
        <ExhibitorDashboard />
    ) : (
        <>
            <Navigation />
            <ExhibitorLogin />
        </>
    );
};

const ExhibitorApp: React.FC = () => {
    return (
        <ExhibitorProvider>
            <ExhibitorAppContent />
        </ExhibitorProvider>
    );
};

export default ExhibitorApp;