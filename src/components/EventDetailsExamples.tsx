import React from 'react';
import { EventDetails } from './ui';
import { CalendarClock } from 'lucide-react';

export const EventDetailsExamples: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Event Details Component Examples</h1>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Default Style (Conference Style)</h2>
                <EventDetails
                    title="Conference Details"
                    details={[
                        { label: "Date", value: "October 4-5, 2025" },
                        { label: "Venue", value: "Hayatt Residency Hotel" },
                        { label: "Location", value: "Thiruvananthapuram" },
                        { label: "Duration", value: "2 Days" }
                    ]}
                />
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Single Column Layout</h2>
                <EventDetails
                    title="Workshop Information"
                    details={[
                        { label: "Topic", value: "Advanced Surgical Techniques" },
                        { label: "Presenter", value: "Dr. Sarah Johnson" },
                        { label: "Time", value: "9:00 AM - 12:00 PM" },
                        { label: "Location", value: "Room 301" }
                    ]}
                    columns={1}
                    gradientFrom="from-blue-600"
                    gradientTo="to-blue-800"
                />
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Three Column Layout</h2>
                <EventDetails
                    title="Event Schedule"
                    details={[
                        { label: "Day 1", value: "Registration & Keynote" },
                        { label: "Day 2", value: "Workshops & Panels" },
                        { label: "Day 3", value: "Networking & Closing" },
                        { label: "Morning", value: "9:00 AM - 12:00 PM" },
                        { label: "Afternoon", value: "1:00 PM - 4:00 PM" },
                        { label: "Evening", value: "5:00 PM - 8:00 PM" }
                    ]}
                    columns={3}
                    gradientFrom="from-teal-600"
                    gradientTo="to-teal-700"
                />
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Custom Colors</h2>
                <EventDetails
                    title="Special Gala Dinner"
                    details={[
                        { label: "Date", value: "October 5, 2025" },
                        { label: "Time", value: "7:00 PM - 10:00 PM" },
                        { label: "Venue", value: "Grand Ballroom" },
                        { label: "Dress Code", value: "Formal Attire" }
                    ]}
                    gradientFrom="from-purple-600"
                    gradientTo="to-indigo-700"
                    labelColor="text-purple-200"
                />
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">With Footer Content</h2>
                <EventDetails
                    title="Opening Ceremony"
                    details={[
                        { label: "Date", value: "October 4, 2025" },
                        { label: "Time", value: "10:00 AM" },
                        { label: "Location", value: "Main Auditorium" }
                    ]}
                    gradientFrom="from-amber-500"
                    gradientTo="to-orange-600"
                    footer={
                        <div className="flex items-center justify-center gap-2 text-white text-xs border-t border-white/20 pt-2">
                            <CalendarClock size={14} />
                            <span>Add to your calendar</span>
                        </div>
                    }
                />
            </section>
        </div>
    );
};