import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Star, X, Check, Users, Lock, Timer, CalendarClock } from 'lucide-react';
import { MealSlot, Coupon, Participant } from '../../types';
import { formatTimeRemaining, getMealTimeStatus } from '../../utils/timeUtils';

interface FamilyCouponCardProps {
    mealSlot: MealSlot;
    coupon: Coupon;
    onClaim: (mealSlotId: string) => void;
    timeRemaining?: number;
    participant: Participant;
}

export const FamilyCouponCard: React.FC<FamilyCouponCardProps> = ({
    mealSlot,
    coupon,
    onClaim,
    timeRemaining,
    participant
}) => {
    const [localTimeRemaining, setLocalTimeRemaining] = useState(timeRemaining || 0);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        setLocalTimeRemaining(timeRemaining || 0);
    }, [timeRemaining]);

    useEffect(() => {
        if (coupon.status === 'active' && localTimeRemaining > 0) {
            const interval = setInterval(() => {
                setLocalTimeRemaining((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [coupon.status, localTimeRemaining]);

    const getCardState = () => {
        // Check the meal time status
        const timeStatus = getMealTimeStatus(mealSlot);

        // If the meal is in the past or upcoming (not active), it should be locked
        if (timeStatus === 'past') {
            return 'locked-past';
        } else if (timeStatus === 'upcoming') {
            return 'locked-upcoming';
        }

        // If the meal is active, return the actual coupon status
        return coupon.status;
    };

    const getCardStyles = () => {
        const state = getCardState();
        const baseStyles = "relative w-full h-56 rounded-lg p-0 transition-all duration-300 shadow-xl overflow-hidden";

        switch (state) {
            case 'available':
                return `${baseStyles} bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 cursor-pointer hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105`;
            case 'active':
                return `${baseStyles} bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-green-300 animate-pulse`;
            case 'used':
                return `${baseStyles} bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600`;
            case 'locked-upcoming':
                return `${baseStyles} bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600`;
            case 'locked-past':
                return `${baseStyles} bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 opacity-80`;
            case 'locked':
                return `${baseStyles} bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600`;
            default:
                return baseStyles;
        }
    };

    const getIcon = () => {
        const iconSize = "w-8 h-8";
        const state = getCardState();

        switch (state) {
            case 'available':
                return <Users className={`${iconSize} text-white drop-shadow-lg`} />;
            case 'active':
                return <CheckCircle className={`${iconSize} text-white drop-shadow-lg`} />;
            case 'used':
                return <XCircle className={`${iconSize} text-white drop-shadow-lg`} />;
            case 'locked-upcoming':
                return <Timer className={`${iconSize} text-white drop-shadow-lg`} />;
            case 'locked-past':
                return <CalendarClock className={`${iconSize} text-white drop-shadow-lg`} />;
            case 'locked':
                return <Lock className={`${iconSize} text-white drop-shadow-lg`} />;
            default:
                return <Clock className={`${iconSize} text-white drop-shadow-lg`} />;
        }
    };

    const getStatusText = () => {
        const state = getCardState();

        switch (state) {
            case 'available':
                return 'Tap to Claim for Family';
            case 'active':
                return `VALID - ${formatTimeRemaining(localTimeRemaining)}`;
            case 'used':
                return 'ALREADY USED';
            case 'locked-upcoming':
                return `Available at ${mealSlot.startTime}`;
            case 'locked-past':
                return 'Time Expired';
            case 'locked':
                return 'Not Available';
            default:
                return 'Unknown Status';
        }
    };

    const getStatusTextColor = () => {
        const state = getCardState();

        switch (state) {
            case 'available':
                return 'text-white drop-shadow-lg';
            case 'active':
                return 'text-white font-bold drop-shadow-lg';
            case 'used':
                return 'text-white font-bold drop-shadow-lg';
            case 'locked-upcoming':
                return 'text-white font-bold drop-shadow-lg';
            case 'locked-past':
                return 'text-white font-bold drop-shadow-lg';
            case 'locked':
                return 'text-white font-bold drop-shadow-lg';
            default:
                return 'text-white drop-shadow-lg';
        }
    };

    const handleClick = () => {
        const state = getCardState();
        if (state === 'available') {
            setShowConfirmation(true);
        }
    };

    const handleConfirmClaim = () => {
        onClaim(mealSlot.id);
        setShowConfirmation(false);
    };

    const handleCancelClaim = () => {
        setShowConfirmation(false);
    };

    return (
        <>
            <div
                className={getCardStyles()}
                onClick={handleClick}
            >
                {/* Family Count Badge */}
                <div className="absolute bottom-4 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 z-20">
                    <span className="text-purple-700 font-bold text-lg">x{participant.familySize - 1}</span>
                </div>

                {/* Coupon Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-2 left-2">
                        <Star className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute top-2 right-12">
                        <Star className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute bottom-2 left-2">
                        <Star className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-12">
                        <Star className="w-4 h-4 text-white" />
                    </div>
                </div>

                {/* Perforated Edge Effect */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full -ml-3"></div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full -mr-3"></div>

                {/* Dotted Border */}
                <div className="absolute inset-2 border-2 border-dashed border-white opacity-30 rounded-lg"></div>

                {/* Main Content */}
                <div className="relative z-10 h-full p-4 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-bold text-xl text-white leading-tight drop-shadow-lg">
                                {mealSlot.name}
                            </h3>
                            <p className="text-sm text-white opacity-90 mt-1 drop-shadow">
                                ISGCON 2025 • Family Coupon
                            </p>
                            <p className="text-xs text-white opacity-80 mt-1 drop-shadow">
                                For {participant.familySize - 1} people
                            </p>
                            <p className="text-xs text-white opacity-80 mt-1 drop-shadow">
                                {mealSlot.startTime} - {mealSlot.endTime}
                            </p>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-2">
                            {getIcon()}
                        </div>
                    </div>

                    <div className="flex flex-col items-start mt-4">
                        <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 mb-2">
                            <p className={`text-sm font-bold ${getStatusTextColor()}`}>
                                {getStatusText()}
                            </p>
                        </div>

                        {coupon.status === 'active' && localTimeRemaining > 0 && (
                            <div className="w-full">
                                <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mb-2">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-1000 shadow-sm ${localTimeRemaining < 300 ? 'bg-red-400 animate-pulse' : 'bg-white'
                                            }`}
                                        style={{ width: `${Math.max(0, (localTimeRemaining / 900) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-xs font-medium ${localTimeRemaining < 300 ? 'text-red-100 animate-pulse' : 'text-white opacity-90'
                                        }`}>
                                        {localTimeRemaining < 300 ? '⚠️ EXPIRES SOON!' : 'Valid for 15 minutes'}
                                    </p>
                                    <p className="text-xs text-white font-bold">
                                        {formatTimeRemaining(localTimeRemaining)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>



                </div>
            </div>

            {/* Family Confirmation Overlay */}
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform animate-scale-in">
                        <div className="text-center">
                            {/* Icon */}
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Claim Family Coupon?
                            </h3>

                            {/* Meal Details */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-gray-900 mb-1">{mealSlot.name}</h4>
                                <p className="text-sm text-gray-600">ISGCON 2025 • Family Coupon</p>
                                <p className="text-sm text-purple-600 font-medium">Valid for {participant.familySize - 1} people</p>
                                <p className="text-sm text-gray-600">Valid for 15 minutes once couponed</p>
                            </div>

                            {/* Family Requirements */}
                            <div className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-200">
                                <h5 className="font-semibold text-purple-900 mb-2">Family Requirements:</h5>
                                <ul className="text-sm text-purple-700 text-left space-y-1">
                                    <li>• All {participant.familySize - 1} family members must be present</li>
                                    <li>• <strong>Coupon expires automatically after 15 minutes</strong></li>
                                    <li>• Show this coupon to the food counter staff</li>
                                    <li>• Meals will be served for all family members together</li>
                                </ul>
                            </div>

                            {/* Warning */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-amber-800 font-medium">
                                    ⏰ <strong>Important:</strong> This coupon will be valid for exactly <strong>15 minutes</strong> once claimed.
                                    Please ensure all family members are ready before claiming.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelClaim}
                                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmClaim}
                                    className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Confirm & Claim
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};