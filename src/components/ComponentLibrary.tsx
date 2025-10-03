import React from 'react';
import { Link } from 'react-router-dom';
import { FeatureGridExamples } from './FeatureGridExamples';
import { EventDetailsExamples } from './EventDetailsExamples';
import { UIExamples } from './UIExamples';

const ComponentLibrary: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">ISGCONF UI Component Library</h1>
                    <Link to="/" className="text-primary-600 hover:text-primary-800 font-medium">
                        Back to Home
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-10 pb-5 border-b border-gray-200">
                        <h2 className="text-3xl font-extrabold text-gray-900">Components</h2>
                        <p className="mt-2 text-gray-600">
                            A collection of reusable UI components built for the ISGCONF site.
                        </p>
                    </div>

                    {/* Navigation for component sections */}
                    <div className="mb-10">
                        <nav className="flex flex-wrap gap-4">
                            <a href="#feature-grid" className="text-primary-600 hover:text-primary-900 font-medium">
                                Feature Cards
                            </a>
                            <a href="#event-details" className="text-primary-600 hover:text-primary-900 font-medium">
                                Event Details
                            </a>
                            <a href="#instructions" className="text-primary-600 hover:text-primary-900 font-medium">
                                Instructions
                            </a>
                            <a href="#image-placeholder" className="text-primary-600 hover:text-primary-900 font-medium">
                                Image Placeholder
                            </a>
                        </nav>
                    </div>

                    {/* Feature Grid Examples */}
                    <section id="feature-grid" className="mb-16 bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Feature Cards</h3>
                            <FeatureGridExamples />
                        </div>
                    </section>

                    {/* Event Details Examples */}
                    <section id="event-details" className="mb-16 bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Event Details</h3>
                            <EventDetailsExamples />
                        </div>
                    </section>

                    {/* Other UI Examples */}
                    <section id="instructions" className="mb-16 bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Other UI Components</h3>
                            <UIExamples />
                        </div>
                    </section>
                </div>
            </main>

            <footer className="bg-white mt-12 py-6 border-t">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                    <p>ISGCONF UI Component Library &copy; {new Date().getFullYear()}</p>
                </div>
            </footer>
        </div>
    );
};

export default ComponentLibrary;