import React, { useState } from 'react';
import { Clock, UtensilsCrossed, MinusCircle, PlusCircle } from 'lucide-react';

interface MealSlot {
    id: string;
    name: string;
    type: 'lunch' | 'dinner';
    time: string;
}

interface ExhibitorMealCardProps {
    mealSlot: MealSlot;
    isAvailable: boolean;
    maxQuantity: number;
    onClaim: (quantity: number) => void;
    isLoading: boolean;
    isClaimed?: boolean;
    claimedQuantity?: number;
}

const ExhibitorMealCard: React.FC<ExhibitorMealCardProps> = ({
    mealSlot,
    isAvailable,
    maxQuantity,
    onClaim,
    isLoading,
    isClaimed = false,
    claimedQuantity = 0
}) => {
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const handleQuantityChange = (delta: number) => {
        const newQuantity = selectedQuantity + delta;
        if (newQuantity >= 1 && newQuantity <= maxQuantity) {
            setSelectedQuantity(newQuantity);
        }
    };

    const handleClaim = () => {
        onClaim(selectedQuantity);
    };

    return (
        <div className={`border border-gray-200 rounded-lg p-6 ${isClaimed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isClaimed
                            ? 'bg-green-100'
                            : (mealSlot.type === 'lunch' ? 'bg-green-100' : 'bg-purple-100')
                        }`}>
                        <UtensilsCrossed className={`h-5 w-5 ${isClaimed
                                ? 'text-green-600'
                                : (mealSlot.type === 'lunch' ? 'text-green-600' : 'text-purple-600')
                            }`} />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">{mealSlot.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {mealSlot.time}
                        </div>
                        {isClaimed && (
                            <div className="flex items-center text-sm text-green-600 mt-1">
                                <span className="font-medium">✓ Claimed ({claimedQuantity} meal{claimedQuantity !== 1 ? 's' : ''})</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-sm text-gray-600">
                        {isClaimed ? 'Claimed' : 'Available'}
                    </p>
                    <p className={`text-lg font-bold ${isClaimed ? 'text-green-600' : (isAvailable ? 'text-green-600' : 'text-red-600')
                        }`}>
                        {isClaimed ? claimedQuantity : maxQuantity}
                    </p>
                </div>
            </div>

            {isClaimed ? (
                <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-medium">
                        ✓ This meal slot has been claimed
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                        {claimedQuantity} meal{claimedQuantity !== 1 ? 's' : ''} claimed for your company
                    </p>
                </div>
            ) : isAvailable && maxQuantity > 0 ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700">Quantity:</span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleQuantityChange(-1)}
                                disabled={selectedQuantity <= 1}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                                <MinusCircle className="h-5 w-5" />
                            </button>
                            <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                                {selectedQuantity}
                            </span>
                            <button
                                onClick={() => handleQuantityChange(1)}
                                disabled={selectedQuantity >= maxQuantity}
                                className="p-1 rounded-full text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                                <PlusCircle className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleClaim}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Claiming...' : `Claim ${selectedQuantity}`}
                    </button>
                </div>
            ) : (
                <div className="text-center py-4">
                    <p className="text-gray-500">
                        {maxQuantity === 0 ? 'No allocation remaining' : 'Not available'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ExhibitorMealCard;