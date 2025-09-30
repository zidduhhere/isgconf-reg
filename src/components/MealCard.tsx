import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Star, Gift, X, Check } from 'lucide-react';
import { MealCardProps } from '../types';
import { formatTimeRemaining } from '../utils/timeUtils';

export const MealCard: React.FC<MealCardProps> = ({
  mealSlot,
  claim,
  onClaim,
  timeRemaining,
  familyMemberIndex,
  familyMemberName
}) => {
  const [localTimeRemaining, setLocalTimeRemaining] = useState(timeRemaining || 0);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
    const baseStyles = "relative w-full h-52 rounded-lg p-0 transition-all duration-300 shadow-xl overflow-hidden";

    switch (state) {
      case 'available':
        return `${baseStyles} bg-gradient-to-br from-primary-200 via-primary-500 to-primary-600 hover:from-primary-500 hover:via-primary-600 hover:to-primary-700 cursor-pointer hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105`;
      case 'active':
        return `${baseStyles} bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-green-300 animate-pulse`;
      case 'used':
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
        return <Gift className={`${iconSize} text-white drop-shadow-lg`} />;
      case 'active':
        return <CheckCircle className={`${iconSize} text-white drop-shadow-lg`} />;
      case 'used':
        return <XCircle className={`${iconSize} text-white drop-shadow-lg`} />;
      default:
        return <Clock className={`${iconSize} text-white drop-shadow-lg`} />;
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
        return 'text-white drop-shadow-lg';
      case 'active':
        return 'text-white font-bold drop-shadow-lg';
      case 'used':
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
    onClaim(mealSlot.id, familyMemberIndex);
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
        {/* Coupon Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-2">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-2 right-2">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div className="absolute bottom-2 left-2">
            <Star className="w-4 h-4 text-white" />
          </div>
          <div className="absolute bottom-2 right-2">
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
              <h3 className="font-bold text-2xl text-white leading-tight drop-shadow-lg">
                {mealSlot.name}
              </h3>
              <p className="text-sm text-white opacity-90 mt-1 drop-shadow">
                ISGCON 2025 • {familyMemberName}
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

            {claim.status === 'active' && localTimeRemaining > 0 && (
              <div className="w-full">
                <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mb-1">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${(localTimeRemaining / 900) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white opacity-90">Time remaining</p>
              </div>
            )}
          </div>

          {/* Coupon Number */}
          {/* <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-white bg-opacity-20 rounded-full px-2 py-1">
              <p className="text-xs text-white font-mono">#{mealSlot.id.slice(0, 6)}</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Confirmation Overlay */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl transform animate-scale-in">
            <div className="text-center">
              {/* Icon */}
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-blue-600" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Claim Meal Coupon?
              </h3>

              {/* Meal Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-1">{mealSlot.name}</h4>
                <p className="text-sm text-gray-600">ISGCON 2025</p>
                <p className="text-sm text-gray-600">Valid for 15 minutes once claimed</p>
              </div>

              {/* Warning */}
              <p className="text-sm text-gray-600 mb-6">
                Once claimed, you'll have 15 minutes to use this coupon. This action cannot be undone.
              </p>

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
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Claim Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};