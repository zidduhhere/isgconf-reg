import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { ParticipantManager } from './ParticipantManager';
import {
    Users,
    Utensils,
    BarChart3,
    Settings,
    LogOut,
    Calendar,
    UserCheck,
    Clock,
    CheckCircle
} from 'lucide-react';

type TabType = 'overview' | 'participants' | 'coupons' | 'settings';

export const AdminDashboard: React.FC = () => {
    const {
        participants,
        mealSlots,
        allClaims,
        isLoading,
        logout,
        getParticipantStats,
        refreshData
    } = useAdmin();

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const stats = getParticipantStats();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const tabs = [
        { id: 'overview' as TabType, name: 'Overview', icon: BarChart3 },
        { id: 'participants' as TabType, name: 'Participants', icon: Users },
        { id: 'coupons' as TabType, name: 'Coupons', icon: Utensils },
        { id: 'settings' as TabType, name: 'Settings', icon: Settings },
    ];

    const handleRefresh = () => {
        refreshData();
    };

    const getCouponStatusCounts = () => {
        const available = allClaims.filter(c => c.status === 'available').length;
        const active = allClaims.filter(c => c.status === 'active').length;
        const used = allClaims.filter(c => c.status === 'used').length;

        return { available, active, used, total: allClaims.length };
    };

    const couponStats = getCouponStatusCounts();

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Total Participants
                                </dt>
                                <dd className="text-2xl font-semibold text-gray-900">
                                    {stats.total}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <UserCheck className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    With Families
                                </dt>
                                <dd className="text-2xl font-semibold text-gray-900">
                                    {stats.withFamily}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Clock className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Active Coupons
                                </dt>
                                <dd className="text-2xl font-semibold text-gray-900">
                                    {stats.activeCoupons}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckCircle className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Used Coupons
                                </dt>
                                <dd className="text-2xl font-semibold text-gray-900">
                                    {stats.usedCoupons}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupon Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Coupon Status Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{couponStats.available}</div>
                        <div className="text-sm text-gray-500">Available</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{couponStats.active}</div>
                        <div className="text-sm text-gray-500">Active</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{couponStats.used}</div>
                        <div className="text-sm text-gray-500">Used</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{couponStats.total}</div>
                        <div className="text-sm text-gray-500">Total</div>
                    </div>
                </div>
            </div>

            {/* Meal Slots */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Slots</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mealSlots.map((slot) => (
                        <div key={slot.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{slot.name}</h4>
                                <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600">
                                Day {slot.day} • {slot.startTime} - {slot.endTime}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {slot.eventDate}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderCoupons = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Coupon Management</h3>
                <p className="text-gray-600">Coupon management features coming soon...</p>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
                <div className="space-y-4">
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Refresh Data
                    </button>
                    <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Data Management</h4>
                        <p className="text-sm text-gray-600">
                            Total Storage Items: {participants.length + mealSlots.length + allClaims.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'participants':
                return <ParticipantManager />;
            case 'coupons':
                return renderCoupons();
            case 'settings':
                return renderSettings();
            default:
                return renderOverview();
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background with Blur Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100">
                {/* Floating blur orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
                <div className="absolute top-40 right-10 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-20 left-20 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-18 animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Content Layer */}
            <div className="relative z-10">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-gray-600">ISGCON 2025 Management Portal</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                                    ? 'border-red-500 text-red-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-500'
                                                }`} />
                                            {tab.name}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            <span className="ml-2 text-gray-600">Loading...</span>
                        </div>
                    ) : (
                        renderContent()
                    )}
                </div>
            </div>
        </div>
    );
};