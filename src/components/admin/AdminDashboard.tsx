import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { getMealSlots } from '../../services/storageService';
import {
    Users,
    Building2,
    Ticket,
    UtensilsCrossed,
    BarChart3,
    LogOut,
    UserPlus,
    Trash2,
    RefreshCw,
    Search,
    RotateCcw,
    Crown,
    Award,
    Star,
    Circle,
    AlertCircle,
    Shield
} from 'lucide-react';
import { ParticipantAdmin, ExhibitorAdmin, ExhibitorEmployeeAdmin, CouponAdmin, MealClaimAdmin } from '../../types/admin';

type TabType = 'overview' | 'participants' | 'exhibitors' | 'employees' | 'coupons' | 'claims' | 'analytics';

export const AdminDashboardNew: React.FC = () => {
    const {
        currentAdmin,
        stats,
        logout,
        refreshStats,
        getParticipants,
        addParticipant,
        deleteParticipant,
        getExhibitors,
        addExhibitor,
        deleteExhibitor,
        getExhibitorEmployees,
        getCoupons,
        resetCoupon,
        resetAllCoupons,
        resetParticipantCoupons,
        getMealClaims,
        resetMealClaim,
        claimExhibitorMeal
    } = useAdmin();

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [participants, setParticipants] = useState<ParticipantAdmin[]>([]);
    const [exhibitors, setExhibitors] = useState<ExhibitorAdmin[]>([]);
    const [employees, setEmployees] = useState<ExhibitorEmployeeAdmin[]>([]);
    const [coupons, setCoupons] = useState<CouponAdmin[]>([]);
    const [mealClaims, setMealClaims] = useState<MealClaimAdmin[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Modal states
    const [showAddParticipant, setShowAddParticipant] = useState(false);
    const [showAddExhibitor, setShowAddExhibitor] = useState(false);

    // Form states
    const [participantForm, setParticipantForm] = useState({
        phoneNumber: '',
        name: '',
        familySize: 1
    });
    const [exhibitorForm, setExhibitorForm] = useState({
        companyId: '',
        companyName: '',
        phoneNumber: '',
        plan: 'Silver' as 'Diamond' | 'Platinum' | 'Gold' | 'Silver'
    });

    // Manual claim form state
    const [manualClaimForm, setManualClaimForm] = useState({
        companyId: '',
        mealSlotId: '',
        mealType: '',
        employeeId: '',
        quantity: 1
    });

    // Data for dropdowns
    const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
    const [mealSlots, setMealSlots] = useState<{ id: string; name: string; meal_type: string }[]>([]);
    const [companyEmployees, setCompanyEmployees] = useState<{ id: string; name: string; phone: string }[]>([]);

    useEffect(() => {
        if (!currentAdmin) {
            navigate('/admin/login');
        } else {
            loadData();
        }
    }, [currentAdmin, navigate]);

    const loadData = async () => {
        setIsRefreshing(true);
        try {
            const [participantsData, exhibitorsData, employeesData, couponsData, claimsData] = await Promise.all([
                getParticipants(),
                getExhibitors(),
                getExhibitorEmployees(),
                getCoupons(),
                getMealClaims()
            ]);

            setParticipants(participantsData);
            setExhibitors(exhibitorsData);
            setEmployees(employeesData);
            setCoupons(couponsData);
            setMealClaims(claimsData);

            // Load data for manual claim form
            const companiesData = exhibitorsData.map(e => ({
                id: e.companyId,
                name: e.companyName
            }));
            setCompanies(companiesData);

            const mealSlotsData = getMealSlots().map(slot => ({
                id: slot.id,
                name: slot.name,
                meal_type: slot.type
            }));
            console.log('Meal slots loaded:', mealSlotsData);
            setMealSlots(mealSlotsData);

            await refreshStats();
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const tabs = [
        { id: 'overview' as TabType, name: 'Overview', icon: BarChart3, count: null },
        { id: 'participants' as TabType, name: 'Participants', icon: Users, count: stats?.totalParticipants },
        { id: 'exhibitors' as TabType, name: 'Exhibitors', icon: Building2, count: stats?.totalExhibitors },
        { id: 'employees' as TabType, name: 'Employees', icon: UserPlus, count: employees.length },
        { id: 'coupons' as TabType, name: 'Coupons', icon: Ticket, count: stats?.totalCoupons },
        { id: 'claims' as TabType, name: 'Meal Claims', icon: UtensilsCrossed, count: stats?.totalMealClaims },
        { id: 'analytics' as TabType, name: 'Analytics', icon: BarChart3, count: null },
    ];

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'Diamond': return <Crown className="h-4 w-4 text-purple-600" />;
            case 'Platinum': return <Award className="h-4 w-4 text-blue-600" />;
            case 'Gold': return <Star className="h-4 w-4 text-yellow-600" />;
            case 'Silver': return <Circle className="h-4 w-4 text-gray-600" />;
            default: return <Circle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'Diamond': return 'bg-purple-100 text-purple-800';
            case 'Platinum': return 'bg-blue-100 text-blue-800';
            case 'Gold': return 'bg-yellow-100 text-yellow-800';
            case 'Silver': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAddParticipant = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addParticipant(participantForm);
        if (success) {
            setShowAddParticipant(false);
            setParticipantForm({ phoneNumber: '', name: '', familySize: 1 });
            loadData();
        }
    };

    const handleAddExhibitor = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addExhibitor(exhibitorForm);
        if (success) {
            setShowAddExhibitor(false);
            setExhibitorForm({ companyId: '', companyName: '', phoneNumber: '', plan: 'Silver' });
            loadData();
        }
    };

    const handleDeleteParticipant = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this participant?\n\nThis will permanently remove:\n• Participant record from database\n• All associated coupons\n\nNote: Authentication account will remain but become inactive.\nThis action cannot be undone.')) {
            const success = await deleteParticipant(id);
            if (success) {
                loadData();
            }
        }
    };

    const handleDeleteExhibitor = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this exhibitor? This will also delete all their meal claims.')) {
            const success = await deleteExhibitor(id);
            if (success) {
                loadData();
            }
        }
    };

    const handleResetAllCoupons = async () => {
        if (window.confirm('Are you sure you want to reset ALL coupons? This action cannot be undone.')) {
            const success = await resetAllCoupons();
            if (success) {
                loadData();
            }
        }
    };

    const handleManualClaim = async () => {
        if (!manualClaimForm.companyId || !manualClaimForm.employeeId || !manualClaimForm.mealSlotId || !manualClaimForm.mealType || manualClaimForm.quantity < 1) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const success = await claimExhibitorMeal(
                manualClaimForm.companyId,
                manualClaimForm.mealSlotId,
                manualClaimForm.mealType as 'lunch' | 'dinner',
                manualClaimForm.employeeId,
                manualClaimForm.quantity
            );

            if (success) {
                // Reset form
                setManualClaimForm({
                    companyId: '',
                    mealSlotId: '',
                    mealType: '',
                    employeeId: '',
                    quantity: 1
                });
                setCompanyEmployees([]);
                // Reload data to show updated claims
                loadData();
                alert('Meal claimed successfully!');
            } else {
                alert('Failed to claim meal. Please try again.');
            }
        } catch (error) {
            console.error('Error claiming meal:', error);
            alert('Error claiming meal. Please try again.');
        }
    };

    const loadEmployeesForCompany = async (companyId: string) => {
        if (!companyId) {
            setCompanyEmployees([]);
            return;
        }

        try {
            // Find the company UUID from the company_id
            const company = companies.find(c => c.id === companyId);
            if (!company) return;

            // Get the exhibitor record to find the UUID
            const exhibitor = exhibitors.find(e => e.companyId === companyId);
            if (!exhibitor) return;

            // Load employees for this company using the exhibitor id (which is the UUID)
            const companyEmployees = employees.filter(emp => emp.companyId === exhibitor.id);

            setCompanyEmployees(companyEmployees.map(emp => ({
                id: emp.id,
                name: emp.employeeName,
                phone: emp.phoneNumber || ''
            })));
        } catch (error) {
            console.error('Error loading employees:', error);
            setCompanyEmployees([]);
        }
    };

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
                                    {stats?.totalParticipants || 0}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Building2 className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Total Exhibitors
                                </dt>
                                <dd className="text-2xl font-semibold text-gray-900">
                                    {stats?.totalExhibitors || 0}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Ticket className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Active Coupons
                                </dt>
                                <dd className="text-2xl font-semibold text-gray-900">
                                    {stats?.activeCoupons || 0}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <UtensilsCrossed className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Meal Claims
                                </dt>
                                <dd className="text-2xl font-semibold text-gray-900">
                                    {stats?.totalMealClaims || 0}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setShowAddParticipant(true)}
                        className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <UserPlus className="h-5 w-5 mr-2" />
                        Add Participant
                    </button>
                    <button
                        onClick={() => setShowAddExhibitor(true)}
                        className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Building2 className="h-5 w-5 mr-2" />
                        Add Exhibitor
                    </button>
                    <button
                        onClick={handleResetAllCoupons}
                        className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Reset All Coupons
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Coupon Status</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Available</span>
                                <span className="text-sm font-medium text-green-600">{stats?.activeCoupons || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Claimed</span>
                                <span className="text-sm font-medium text-orange-600">{stats?.claimedCoupons || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Expired</span>
                                <span className="text-sm font-medium text-red-600">{stats?.expiredCoupons || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Meal Claims</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Lunch Claims</span>
                                <span className="text-sm font-medium text-blue-600">{stats?.lunchClaims || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Dinner Claims</span>
                                <span className="text-sm font-medium text-purple-600">{stats?.dinnerClaims || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderParticipants = () => (
        <div className="space-y-6">
            {/* Participants Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Participants Management</h2>
                    <p className="text-sm text-gray-600">Manage conference participants and their information</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        onClick={() => setShowAddParticipant(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Participant
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Participants Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Participant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phone Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Family Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Faculty
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Coupons
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {participants
                                .filter(p =>
                                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    p.phoneNumber.includes(searchTerm)
                                )
                                .map((participant) => (
                                    <tr key={participant.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {participant.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {participant.id.slice(0, 8)}...
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {participant.phoneNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${participant.isFam ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {participant.familySize} {participant.isFam ? 'Family' : 'Individual'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${participant.isFaculty ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {participant.isFaculty ? 'Faculty' : 'Student'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-green-600">{participant.activeCouponsCount} Active</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-600">{participant.couponsCount} Total</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => resetParticipantCoupons(participant.id)}
                                                    className="text-orange-600 hover:text-orange-900"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteParticipant(participant.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderExhibitors = () => (
        <div className="space-y-6">
            {/* Exhibitors Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Exhibitors Management</h2>
                    <p className="text-sm text-gray-600">Manage exhibitor companies and their meal allocations</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        onClick={() => setShowAddExhibitor(true)}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Building2 className="h-4 w-4 mr-2" />
                        Add Exhibitor
                    </button>
                </div>
            </div>

            {/* Exhibitors Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lunch Allocation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dinner Allocation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {exhibitors.map((exhibitor) => (
                                <tr key={exhibitor.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {exhibitor.companyName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {exhibitor.companyId} • {exhibitor.phoneNumber}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(exhibitor.plan)}`}>
                                            {getPlanIcon(exhibitor.plan)}
                                            <span className="ml-1">{exhibitor.plan}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-green-600">{exhibitor.lunchUsed}</span>
                                            <span className="text-gray-400">/</span>
                                            <span className="text-gray-900">{exhibitor.lunchAllocation}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-purple-600">{exhibitor.dinnerUsed}</span>
                                            <span className="text-gray-400">/</span>
                                            <span className="text-gray-900">{exhibitor.dinnerAllocation}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleDeleteExhibitor(exhibitor.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderEmployees = () => (
        <div className="space-y-6">
            {/* Employees Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Exhibitor Employees</h2>
                    <p className="text-sm text-gray-600">View all exhibitor company employees</p>
                </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mobile Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <UserPlus className="h-5 w-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{employee.employeeName}</div>
                                                <div className="text-sm text-gray-500">ID: {employee.employeeId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{employee.companyName}</div>
                                        <div className="text-sm text-gray-500">{employee.companyId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{employee.phoneNumber || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {employee.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderCoupons = () => {
        // Filter coupons based on search term
        const filteredCoupons = coupons.filter(coupon =>
            (coupon.participantName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (coupon.participantPhone?.includes(searchTerm) || false) ||
            (coupon.mealSlotName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            coupon.status.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Coupons Management</h2>
                        <p className="text-sm text-gray-600">View and manage participant meal coupons ({filteredCoupons.length} of {coupons.length} coupons)</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                        <button
                            onClick={handleResetAllCoupons}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset All Coupons
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by participant name, phone, meal slot, or status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Coupons Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-sm font-medium text-gray-500">Total Coupons</div>
                        <div className="text-2xl font-semibold text-gray-900">{stats?.totalCoupons || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-sm font-medium text-gray-500">Available</div>
                        <div className="text-2xl font-semibold text-green-600">{stats?.activeCoupons || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-sm font-medium text-gray-500">Claimed</div>
                        <div className="text-2xl font-semibold text-orange-600">{stats?.claimedCoupons || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-sm font-medium text-gray-500">Expired</div>
                        <div className="text-2xl font-semibold text-red-600">{stats?.expiredCoupons || 0}</div>
                    </div>
                </div>

                {/* Coupons Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Participant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Meal Slot
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Family Member
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCoupons.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            {searchTerm ? 'No coupons found matching your search.' : 'No coupons available.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCoupons.map((coupon) => (
                                        <tr key={coupon.uniqueId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {coupon.participantName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {coupon.participantPhone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {coupon.mealSlotName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {coupon.familyMemberIndex === 0 ? 'Main' : `Family ${coupon.familyMemberIndex}`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${coupon.status === 'available' ? 'bg-green-100 text-green-800' :
                                                    coupon.status === 'used' ? 'bg-red-100 text-red-800' :
                                                        coupon.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {coupon.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => resetCoupon(coupon.uniqueId)}
                                                    className="text-orange-600 hover:text-orange-900 mr-3"
                                                    title="Reset coupon to available"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderMealClaims = () => (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Meal Claims Management</h2>
                    <p className="text-sm text-gray-600">View and manage exhibitor meal claims</p>
                </div>
            </div>

            {/* Manual Claim Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Claim Entry</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company
                        </label>
                        <select
                            value={manualClaimForm.companyId || ''}
                            onChange={(e) => {
                                setManualClaimForm(prev => ({ ...prev, companyId: e.target.value, employeeId: '' }));
                                loadEmployeesForCompany(e.target.value);
                            }}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Company</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employee
                        </label>
                        <select
                            value={manualClaimForm.employeeId || ''}
                            onChange={(e) => setManualClaimForm(prev => ({ ...prev, employeeId: e.target.value }))}
                            disabled={!manualClaimForm.companyId || companyEmployees.length === 0}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">Select Employee</option>
                            {companyEmployees.map(employee => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.name} {employee.phone && `(${employee.phone})`}
                                </option>
                            ))}
                        </select>
                        {manualClaimForm.companyId && companyEmployees.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">No employees found for this company</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meal Slot
                        </label>
                        <select
                            value={manualClaimForm.mealSlotId || ''}
                            onChange={(e) => setManualClaimForm(prev => ({ ...prev, mealSlotId: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Meal Slot</option>
                            {mealSlots.map(slot => (
                                <option key={slot.id} value={slot.id}>
                                    {slot.name} - {slot.meal_type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meal Type
                        </label>
                        <select
                            value={manualClaimForm.mealType || ''}
                            onChange={(e) => setManualClaimForm(prev => ({ ...prev, mealType: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Type</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={manualClaimForm.quantity}
                            onChange={(e) => setManualClaimForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleManualClaim}
                            disabled={!manualClaimForm.companyId || !manualClaimForm.employeeId || !manualClaimForm.mealSlotId || !manualClaimForm.mealType || manualClaimForm.quantity < 1}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Claim Meal
                        </button>
                    </div>
                </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Meal Slot
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Claimed At
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mealClaims.map((claim) => (
                                <tr key={claim.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {claim.companyName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {claim.mealSlotName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${claim.mealType === 'lunch' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                            {claim.mealType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {claim.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {claim.claimedAt ? new Date(claim.claimedAt).toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => resetMealClaim(claim.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
                <p className="text-sm text-gray-600">System analytics and insights</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Meal Claims Chart Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Meal Claims Overview</h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                            <p>Analytics charts coming soon</p>
                        </div>
                    </div>
                </div>

                {/* Participants Growth Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Registration Trends</h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <Users className="h-12 w-12 mx-auto mb-2" />
                            <p>Registration analytics coming soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!currentAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Please log in to access the admin dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-red-600 mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-sm text-gray-500">ISGCON 2025 Management Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={loadData}
                                disabled={isRefreshing}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <div className="text-sm text-gray-500">
                                {currentAdmin.email}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <tab.icon className="h-5 w-5 mr-2" />
                                {tab.name}
                                {tab.count !== null && tab.count !== undefined && (
                                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'participants' && renderParticipants()}
                {activeTab === 'exhibitors' && renderExhibitors()}
                {activeTab === 'employees' && renderEmployees()}
                {activeTab === 'coupons' && renderCoupons()}
                {activeTab === 'claims' && renderMealClaims()}
                {activeTab === 'analytics' && renderAnalytics()}
            </div>

            {/* Add Participant Modal */}
            {showAddParticipant && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Participant</h3>
                            <form onSubmit={handleAddParticipant} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={participantForm.name}
                                        onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={participantForm.phoneNumber}
                                        onChange={(e) => setParticipantForm({ ...participantForm, phoneNumber: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Family Size</label>
                                    <select
                                        value={participantForm.familySize}
                                        onChange={(e) => setParticipantForm({ ...participantForm, familySize: parseInt(e.target.value) })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={1}>1 (Individual)</option>
                                        <option value={2}>2 (Family)</option>
                                        <option value={3}>3 (Family)</option>
                                        <option value={4}>4 (Family)</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddParticipant(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                    >
                                        Add Participant
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Exhibitor Modal */}
            {showAddExhibitor && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Exhibitor</h3>
                            <form onSubmit={handleAddExhibitor} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company ID</label>
                                    <input
                                        type="text"
                                        required
                                        value={exhibitorForm.companyId}
                                        onChange={(e) => setExhibitorForm({ ...exhibitorForm, companyId: e.target.value })}
                                        placeholder="EXH001"
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={exhibitorForm.companyName}
                                        onChange={(e) => setExhibitorForm({ ...exhibitorForm, companyName: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={exhibitorForm.phoneNumber}
                                        onChange={(e) => setExhibitorForm({ ...exhibitorForm, phoneNumber: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Plan</label>
                                    <select
                                        value={exhibitorForm.plan}
                                        onChange={(e) => setExhibitorForm({ ...exhibitorForm, plan: e.target.value as any })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="Diamond">Diamond (5L, 4D)</option>
                                        <option value="Platinum">Platinum (3L, 2D)</option>
                                        <option value="Gold">Gold (2L, 0D)</option>
                                        <option value="Silver">Silver (1L, 0D)</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddExhibitor(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                                    >
                                        Add Exhibitor
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardNew;