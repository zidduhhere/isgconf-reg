import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Calendar,
    MapPin,
    Users,
    Star,
    Menu,
    X,
    Phone,
    Mail,
    Globe,
    Stethoscope,
    Award,
    BookOpen,
    Camera,
    ChevronRight,
    Settings,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const menuItems = [
        { label: 'Home', href: '#home' },
        { label: 'About Event', href: '#event' },
        { label: 'Schedule', href: '#schedule' },
        { label: 'Gallery', href: '#gallery' },
        { label: 'Contact', href: '#contact' },
    ];

    const eventHighlights = [
        {
            icon: <Stethoscope className="w-6 h-6 text-primary-600" />,
            title: "Latest Medical Advances",
            description: "Explore cutting-edge research and breakthrough treatments"
        },
        {
            icon: <Award className="w-6 h-6 text-primary-600" />,
            title: "CME Accredited",
            description: "Earn continuing medical education credits"
        },
        {
            icon: <BookOpen className="w-6 h-6 text-primary-600" />,
            title: "Expert Workshops",
            description: "Hands-on learning with medical specialists"
        },
        {
            icon: <Users className="w-6 h-6 text-primary-600" />,
            title: "Networking",
            description: "Connect with healthcare professionals"
        }
    ];

    const galleryImages = [
        { src: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400', alt: 'Medical Conference 2024' },
        { src: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400', alt: 'Expert Speakers' },
        { src: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', alt: 'Workshop Sessions' },
        { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', alt: 'Networking Event' },
        { src: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400', alt: 'Awards Ceremony' },
        { src: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=400', alt: 'Medical Exhibition' }
    ];

    const scheduleData = [
        { time: '8:00 AM', event: 'Registration & Welcome Coffee', day: 'Day 1' },
        { time: '9:00 AM', event: 'Opening Ceremony', day: 'Day 1' },
        { time: '10:00 AM', event: 'Keynote: Future of Medicine', day: 'Day 1' },
        { time: '11:30 AM', event: 'Panel Discussion: Healthcare Innovation', day: 'Day 1' },
        { time: '1:00 PM', event: 'Lunch Break', day: 'Day 1' },
        { time: '2:30 PM', event: 'Workshop Sessions', day: 'Day 1' },
        { time: '9:00 AM', event: 'Research Presentations', day: 'Day 2' },
        { time: '11:00 AM', event: 'Medical Technology Showcase', day: 'Day 2' },
        { time: '2:00 PM', event: 'Closing Ceremony', day: 'Day 2' },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 font-isans">
            {/* Header with Navigation */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-neutral-900">ISGCON</span>
                        </div>

                        {/* Desktop Menu */}
                        <nav className="hidden md:flex space-x-8">
                            {menuItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="text-neutral-600 hover:text-primary-600 transition-colors font-medium"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="md:hidden p-2 text-neutral-600 hover:text-primary-600"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsDrawerOpen(false)} />
                    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                    <Stethoscope className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-neutral-900">ISGCON</span>
                            </div>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 text-neutral-600 hover:text-primary-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="p-6">
                            {menuItems.map((item, index) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center justify-between py-4 text-lg text-neutral-700 hover:text-primary-600 transition-colors border-b border-neutral-100 last:border-0"
                                    onClick={() => setIsDrawerOpen(false)}
                                >
                                    {item.label}
                                    <ChevronRight className="w-5 h-5" />
                                </a>
                            ))}
                            <Link
                                to="/login"
                                onClick={() => setIsDrawerOpen(false)}
                                className="w-full mt-8 bg-primary-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary-700 transition-colors text-center block"
                            >
                                Access Portal
                            </Link>
                        </nav>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section id="home" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white to-neutral-100">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8 animate-fade-in">
                        <Star className="w-4 h-4" />
                        What's New: Announcing Medical Innovation Features
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-8 animate-slide-down leading-tight">
                        Transform Your
                        <br />
                        <span className="text-primary-600">Medical Practice</span>
                        <br />
                        with ISGCON 2025
                    </h1>

                    <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-3xl mx-auto animate-slide-up leading-relaxed">
                        ISGCON simplifies and optimizes medical practice management, offering real-time insights,
                        smart diagnostic tools, and seamless patient care tracking.
                    </p>

                    <Link
                        to="/login"
                        className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center gap-3 animate-scale-in mb-16"
                    >
                        Let's Access the portal <ArrowRight className="w-5 h-5" />
                    </Link>

                    {/* Dashboard Preview Placeholder */}
                    <div className="relative max-w-2xl mx-auto animate-scale-in">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 border">
                            <div className="bg-neutral-100 rounded-xl h-64 flex items-center justify-center">
                                <div className="text-center">
                                    <Stethoscope className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">Conference Dashboard</h3>
                                    <p className="text-neutral-600">Interactive session management and networking tools</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badge */}
                    <p className="text-sm text-neutral-500 mt-8 animate-fade-in">
                        Trusted by Leading Medical Institutions Around Kerala
                    </p>
                </div>
            </section>

            {/* Event Information Section */}
            <section id="event" className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6">
                            About ISGCON 2025
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
                            Join Kerala's most prestigious medical conference featuring world-class speakers,
                            cutting-edge research presentations, and unparalleled networking opportunities.
                        </p>
                    </div>

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        <div className="bg-neutral-50 rounded-2xl p-8 text-center">
                            <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 mb-2">October 4-5, 2025</h3>
                            <p className="text-neutral-600">Two intensive days of medical excellence</p>
                        </div>
                        <div className="bg-neutral-50 rounded-2xl p-8 text-center">
                            <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Hayatt Residency Hotel</h3>
                            <p className="text-neutral-600">Thiruvananthapuram, Kerala</p>
                        </div>
                        <div className="bg-neutral-50 rounded-2xl p-8 text-center">
                            <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 mb-2">200+ Medical Professionals</h3>
                            <p className="text-neutral-600">Leading healthcare experts from across India</p>
                        </div>
                    </div>

                    {/* Event Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {eventHighlights.map((highlight, index) => (
                            <div key={index} className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                                <div className="mb-4">{highlight.icon}</div>
                                <h4 className="text-lg font-semibold text-neutral-900 mb-2">{highlight.title}</h4>
                                <p className="text-neutral-600 text-sm">{highlight.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Schedule Section */}
            <section id="schedule" className="py-20 bg-neutral-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6">
                            Conference Schedule
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            A comprehensive agenda designed to maximize learning and networking opportunities
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Day 1 */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h3 className="text-2xl font-bold text-primary-600 mb-6">Day 1 - October 4</h3>
                            <div className="space-y-4">
                                {scheduleData.filter(item => item.day === 'Day 1').map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
                                        <div className="text-primary-600 font-semibold text-sm min-w-[70px]">{item.time}</div>
                                        <div className="text-neutral-900 font-medium">{item.event}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Day 2 */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h3 className="text-2xl font-bold text-primary-600 mb-6">Day 2 - October 5</h3>
                            <div className="space-y-4">
                                {scheduleData.filter(item => item.day === 'Day 2').map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
                                        <div className="text-primary-600 font-semibold text-sm min-w-[70px]">{item.time}</div>
                                        <div className="text-neutral-900 font-medium">{item.event}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 text-primary-600 mb-4">
                            <Camera className="w-6 h-6" />
                            <span className="text-sm font-medium uppercase tracking-wide">Gallery</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6">
                            Previous Conferences
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            Take a look at the memorable moments from our previous medical conferences and exhibitions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {galleryImages.map((image, index) => (
                            <div key={index} className="group relative overflow-hidden rounded-2xl bg-neutral-100 aspect-[4/3]">
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                                    <div className="p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                        <h4 className="font-semibold">{image.alt}</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-neutral-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6">
                            Contact Us
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            Have questions about ISGCON 2025? Get in touch with our organizing committee
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                            <Phone className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Phone</h3>
                            <p className="text-neutral-600">+91 9876543210</p>
                            <p className="text-neutral-600">+91 8765432109</p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                            <Mail className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Email</h3>
                            <p className="text-neutral-600">info@isgcon2025.com</p>
                            <p className="text-neutral-600">support@isgcon2025.com</p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                            <Globe className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Website</h3>
                            <p className="text-neutral-600">www.isgcon2025.com</p>
                            <p className="text-neutral-600">Follow us on social media</p>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center mt-16">
                        <Link
                            to="/login"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center gap-3"
                        >
                            Register Now <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-primary-900 text-white py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                    <Stethoscope className="w-6 h-6 text-primary-600" />
                                </div>
                                <span className="text-xl font-bold">ISGCON 2025</span>
                            </div>
                            <p className="text-primary-200 max-w-md">
                                Kerala's premier medical conference bringing together healthcare professionals
                                for learning, networking, and innovation.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <div className="space-y-2 text-primary-200">
                                <a href="#home" className="block hover:text-white transition-colors">Home</a>
                                <a href="#event" className="block hover:text-white transition-colors">About Event</a>
                                <a href="#schedule" className="block hover:text-white transition-colors">Schedule</a>
                                <a href="#gallery" className="block hover:text-white transition-colors">Gallery</a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <div className="space-y-2 text-primary-200">
                                <p>Thiruvananthapuram, Kerala</p>
                                <p>+91 9876543210</p>
                                <p>info@isgcon2025.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-primary-800 pt-8 text-center">
                        <p className="text-primary-200">
                            © 2025 ISGCON Kerala Chapter. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};