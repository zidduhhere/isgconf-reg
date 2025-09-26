import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { MealCardProps } from '../types';
import { formatTimeRemaining } from '../utils/timeUtils';

export const MealCard: React.FC<MealCardProps> = ({
  mealSlot,
  claim,
  onClaim,
  timeRemaining
}) => {
  const [localTimeRemaining, setLocalTimeRemaining] = useState(timeRemaining || 0);

  useEffect(() => {
    setLocalTimeRemaining(timeRemaining || 0);
  }, [timeRemaining]);

  useEffect(() => {
    if (claim.status === 'active' && localTimeRemaining > 0) {
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
  }, [claim.status, localTimeRemaining]);

  const getCardState = () => {
    // Since time slots are always active, return the actual claim status
    return claim.status;
  };

  const getCardStyles = () => {
    const state = getCardState();
    const baseStyles = "w-full h-32 rounded-xl p-4 transition-all duration-300 border-2 shadow-lg";

    switch (state) {
      case 'available':
        return `${baseStyles} bg-blue-50 border-blue-300 hover:bg-blue-100 hover:border-blue-400 cursor-pointer hover:shadow-xl transform hover:-translate-y-1`;
      case 'active':
        return `${baseStyles} bg-green-100 border-green-400 shadow-green-200`;
      case 'used':
        return `${baseStyles} bg-red-50 border-red-300`;
      default:
        return baseStyles;
    }
  };

  const getIcon = () => {
    const iconSize = "w-6 h-6";
    const state = getCardState();

    switch (state) {
      case 'available':
        return <Clock className={`${iconSize} text-blue-600`} />;
      case 'active':
        return <CheckCircle className={`${iconSize} text-green-600`} />;
      case 'used':
        return <XCircle className={`${iconSize} text-red-600`} />;
      default:
        return <Clock className={`${iconSize} text-gray-500`} />;
    }
  };

  const getStatusText = () => {
    const state = getCardState();

    switch (state) {
      case 'available':
        return 'Tap to Claim';
      case 'active':
        return `VALID - ${formatTimeRemaining(localTimeRemaining)}`;
      case 'used':
        return 'ALREADY USED';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusTextColor = () => {
    const state = getCardState();

    switch (state) {
      case 'available':
        return 'text-blue-700';
      case 'active':
        return 'text-green-700 font-bold';
      case 'used':
        return 'text-red-700 font-bold';
      default:
        return 'text-gray-600';
    }
  };

  const handleClick = () => {
    const state = getCardState();
    if (state === 'available') {
      onClaim(mealSlot.id);
    }
  };

  return (
    <div
      className={getCardStyles()}
      onClick={handleClick}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg text-gray-900 leading-tight">
            {mealSlot.name}
          </h3>
          {getIcon()}
        </div>

        <div className="flex flex-col items-start">
          <p className={`text-sm font-semibold ${getStatusTextColor()}`}>
            {getStatusText()}
          </p>

          {claim.status === 'active' && localTimeRemaining > 0 && (
            <div className="w-full bg-green-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(localTimeRemaining / 300) * 100}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};