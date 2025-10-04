import React, { useState, useEffect } from 'react';
import {
    Building2,
    UtensilsCrossed,
    Clock,
    LogOut,
    Crown,
    Award,
    Star,
    Circle,
    Users
} from 'lucide-react';
import { useExhibitor } from '../../contexts/ExhibitorContext';
import ExhibitorMealCard from './ExhibitorMealCard';

const MEAL_SLOTS = [
    { id: 'lunch_1', name: 'Lunch Day 1', type: 'lunch' as const, time: '12:00 PM - 2:00 PM' },
    { id: 'lunch_2', name: 'Lunch Day 2', type: 'lunch' as const, time: '12:00 PM - 2:00 PM' },
    { id: 'gala_1', name: 'Gala Dinner', type: 'dinner' as const, time: '7:00 PM - 10:00 PM' },
];

const getPlanIcon = (plan: string) => {
    switch (plan) {
        case 'Diamond':
            return <Crown className="h-5 w-5 text-purple-600" />;
        case 'Platinum':
            return <Award className="h-5 w-5 text-blue-600" />;
        case 'Gold':
            return <Star className="h-5 w-5 text-yellow-600" />;
        case 'Silver':
            return <Circle className="h-5 w-5 text-gray-600" />;
        default:
            return <Circle className="h-5 w-5 text-gray-400" />;
    }
};

const getPlanColor = (plan: string) => {
    switch (plan) {
        case 'Diamond':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'Platinum':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Gold':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Silver':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const ExhibitorDashboard: React.FC = () => {
    const {
        currentCompany,
        employees,
        logout,
        claimMealBulk,
        getAvailableAllocations,
        getSlotAvailability,
        getClaimedMeal,
        refreshData
    } = useExhibitor();

    const [isClaimingMeal, setIsClaimingMeal] = useState<string | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

    const allocations = getAvailableAllocations();

    useEffect(() => {
        if (currentCompany) {
            console.log('ExhibitorDashboard: Loading data for company:', currentCompany);
            refreshData();
        }
    }, [currentCompany?.id, refreshData]); // Only depend on company ID, not the entire company object

    // Set default employee if there's only one employee
    useEffect(() => {
        if (employees.length === 1 && !selectedEmployeeId) {
            setSelectedEmployeeId(employees[0].id);
        }
    }, [employees, selectedEmployeeId]);

    const handleClaimMeal = async (mealSlotId: string, mealType: 'lunch' | 'dinner', quantity: number) => {
        if (!currentCompany || isClaimingMeal || !selectedEmployeeId) {
            if (!selectedEmployeeId) {
                alert('Please select an employee first.');
            }
            return;
        }

        // Check slot-specific availability
        const slotAvailability = getSlotAvailability(mealSlotId, mealType);
        if (!slotAvailability.isAvailable) {
            alert(`This ${mealType} slot has already been claimed by your company or is no longer available.`);
            return;
        }

        if (quantity > slotAvailability.maxQuantity) {
            alert(`Not enough ${mealType} allocation remaining. You have ${slotAvailability.maxQuantity} ${mealType}(s) left in your plan.`);
            return;
        }

        const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
        if (!selectedEmployee) {
            alert('Selected employee not found. Please refresh and try again.');
            return;
        }

        setIsClaimingMeal(mealSlotId);

        try {
            const success = await claimMealBulk(mealSlotId, mealType, quantity, selectedEmployeeId);

            if (success) {
                await refreshData(); // Refresh to get updated counts
                alert(`Successfully claimed ${quantity} ${mealType}(s) for ${selectedEmployee.employeeName} - ${mealSlotId.replace('_', ' ')}`);
            } else {
                alert('Failed to claim meal. This slot may have already been claimed by your company or you may have exceeded your allocation limit.');
            }
        } catch (error) {
            console.error('Error claiming meal:', error);
            alert('An error occurred while claiming the meal.');
        } finally {
            setIsClaimingMeal(null);
        }
    };

    if (!currentCompany) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Building2 className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{currentCompany.companyName}</h1>
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPlanColor(currentCompany.plan)}`}>
                                        {getPlanIcon(currentCompany.plan)}
                                        <span className="ml-1">{currentCompany.plan} Plan</span>
                                    </span>
                                    <span className="text-sm text-gray-500">ID: {currentCompany.companyId}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition duration-200"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Lunch Slots Available</p>
                                <p className="text-2xl font-bold text-green-600">{allocations?.lunch || 0}</p>
                            </div>
                            <UtensilsCrossed className="h-8 w-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Dinner Slots Available</p>
                                <p className="text-2xl font-bold text-purple-600">{allocations?.dinner || 0}</p>
                            </div>
                            <Clock className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Allocation</p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {(currentCompany?.lunchAllocation || 0) + (currentCompany?.dinnerAllocation || 0)}
                                </p>
                            </div>
                            <Award className="h-8 w-8 text-indigo-600" />
                        </div>
                    </div>
                </div>

                {/* Employee Selection */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Employee Selection</h2>
                        <p className="text-sm text-gray-500">Select the employee for whom you want to claim meals</p>
                    </div>
                    <div className="p-6">
                        {employees.length === 0 ? (
                            <div className="text-center py-4">
                                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">No employees found. Please add employees first.</p>
                            </div>
                        ) : (
                            <div className="max-w-md">
                                <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Employee
                                </label>
                                <select
                                    id="employee-select"
                                    value={selectedEmployeeId}
                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Choose an employee...</option>
                                    {employees.map((employee) => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.employeeName} {employee.employeePhone && `(${employee.employeePhone})`}
                                        </option>
                                    ))}
                                </select>
                                {!selectedEmployeeId && employees.length > 0 && (
                                    <p className="mt-2 text-sm text-amber-600">
                                        Please select an employee to claim meals
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Meal Claiming Section */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Meal Claiming</h2>
                        <p className="text-sm text-gray-500">Click on a meal slot to claim meals for the selected employee</p>
                    </div>

                    <div className="p-6 space-y-6">
                        {selectedEmployeeId ? (
                            MEAL_SLOTS.map((slot) => {
                                const slotAvailability = getSlotAvailability(slot.id, slot.type);
                                const claimedMealData = getClaimedMeal(slot.id);
                                const isClaiming = isClaimingMeal === slot.id;

                                return (
                                    <ExhibitorMealCard
                                        key={slot.id}
                                        mealSlot={slot}
                                        isAvailable={slotAvailability.isAvailable}
                                        maxQuantity={slotAvailability.maxQuantity}
                                        isClaimed={claimedMealData.isClaimed}
                                        claimedQuantity={claimedMealData.claimedQuantity}
                                        onClaim={(quantity: number) => handleClaimMeal(slot.id, slot.type, quantity)}
                                        isLoading={isClaiming}
                                    />
                                );
                            })
                        ) : (
                            <div className="text-center py-8">
                                <UtensilsCrossed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Please select an employee to start claiming meals</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExhibitorDashboard;