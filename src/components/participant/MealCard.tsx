import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Clock, CheckCircle, XCircle, Star, Gift, X, Check, Lock, Timer, CalendarClock, AlertCircle } from 'lucide-react';
import { MealCardProps } from '../../types';
import { getMealTimeStatus } from '../../utils/timeUtils';

export const MealCard: React.FC<MealCardProps> = memo(({
  mealSlot,
  coupon,
  onClaim,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Debug: Log when coupon prop changes
  useEffect(() => {
    console.log("MealCard received coupon update:", {
      mealSlotId: mealSlot.id,
      status: coupon.status,
      couponedAt: coupon.couponedAt,
      expiresAt: coupon.expiresAt
    });
  }, [coupon.status, coupon.couponedAt, coupon.expiresAt, mealSlot.id]);

  // Start a countdown timer
  const startTimer = useCallback((expiresAt: number) => {
    // Safety check for valid timestamp
    if (isNaN(expiresAt)) {
      console.error("Invalid timestamp passed to startTimer:", expiresAt);
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const id = setInterval(() => {
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeRemaining(0);
        clearInterval(id);
        intervalRef.current = null;
      } else {
        const remainingSeconds = Math.floor(diff / 1000);
        if (isNaN(remainingSeconds)) {
          console.error("Calculated remaining seconds is NaN");
          setTimeRemaining(0);
          clearInterval(id);
          intervalRef.current = null;
        } else {
          setTimeRemaining(remainingSeconds);
        }
      }
    }, 1000);

    intervalRef.current = id;
  }, []);

  // Initialize timer when coupon becomes active
  useEffect(() => {
    if (coupon.status === 'active' && coupon.expiresAt) {
      // Use the coupon's actual expiresAt timestamp
      const expiresAt = new Date(coupon.expiresAt).getTime();

      // Safety check for invalid dates
      if (isNaN(expiresAt)) {
        console.error("Invalid expiresAt timestamp:", coupon.expiresAt);
        setTimeRemaining(null);
        return;
      }

      const now = Date.now();
      const diff = expiresAt - now;

      console.log("Restoring timer for coupon using expiresAt:", coupon.expiresAt, "Remaining time:", Math.floor(diff / 1000), "seconds");

      if (diff > 0) {
        const remainingSeconds = Math.floor(diff / 1000);
        // Additional safety check
        if (isNaN(remainingSeconds)) {
          console.error("Calculated remaining time is NaN");
          setTimeRemaining(null);
          return;
        }
        setTimeRemaining(remainingSeconds);
        startTimer(expiresAt);
      } else {
        // Timer expired
        setTimeRemaining(0);
        console.log("Coupon has expired based on expiresAt timestamp");
      }
    } else if (coupon.status !== 'active') {
      // Clear timer if coupon is not active
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeRemaining(null);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [coupon.status, coupon.expiresAt, startTimer]);

  // Get the card state based on the time status and claimed state
  const getCardState = () => {
    // Check the meal time status
    const timeStatus = getMealTimeStatus(mealSlot);
    const isClaimed = coupon.status === 'active' || coupon.status === 'used';

    if (isClaimed) {
      return coupon.status; // Keep the actual status if claimed
    }

    // If not claimed, check time status
    if (timeStatus === 'past') {
      return 'locked-past';
    } else if (timeStatus === 'upcoming') {
      return 'locked-upcoming';
    }

    // If the meal is active and not claimed, return available
    return 'available';
  };

  const getCardStyles = () => {
    const state = getCardState();
    const baseStyles = "relative w-full h-52 rounded-lg p-0 transition-all duration-300 shadow-xl overflow-hidden";

    switch (state) {
      case 'available':
        return `${baseStyles} bg-gradient-to-br from-primary-400 via-primary-600 to-primary-800 hover:from-primary-500 hover:via-primary-600 hover:to-primary-700 cursor-pointer hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105`;
      case 'active':
        return `${baseStyles} bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-xl shadow-green-100 animate-pulse-slow border-2 border-green-300`;
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
        return <Gift className={`${iconSize} text-white drop-shadow-lg`} />;
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
        return 'Tap to Claim';
      case 'active':
        if (timeRemaining !== null && timeRemaining > 0) {
          const minutes = Math.floor(timeRemaining / 60);
          const seconds = timeRemaining % 60;
          return `VALID FOR ${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else if (timeRemaining === 0) {
          return 'TIME EXPIRED';
        }
        return 'COUPON CLAIMED';
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
    setShowConfirmation(false);

    // Call the parent component's onClaim handler
    // This will trigger the updateCoupon function which will set proper timestamps
    onClaim();
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
                ISGCON 2025 •
              </p>
              <p className="text-xs text-white opacity-80 mt-1 drop-shadow">
                {mealSlot.startTime} - {mealSlot.endTime}
              </p>
            </div>
            <div className={`rounded-full p-2 ${coupon.status === 'active' ? 'bg-white text-green-500' : 'bg-white bg-opacity-20'}`}>
              {getIcon()}
            </div>
          </div>

          <div className="flex flex-col items-start mt-4">
            {coupon.status === 'active' ? (
              <div className={`bg-white ${timeRemaining === 0 ? 'bg-opacity-60' : 'bg-opacity-80'} rounded-lg px-3 py-1 mb-2 w-auto`}>
                <p className={`text-sm font-bold ${timeRemaining === 0 ? 'text-red-600' : 'text-green-600'} flex items-center`}>
                  {timeRemaining === 0 ?
                    <AlertCircle className="w-4 h-4 mr-1" /> :
                    <CheckCircle className="w-4 h-4 mr-1" />
                  }
                  {getStatusText()}
                </p>
              </div>
            ) : (
              <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 mb-2">
                <p className={`text-sm font-bold ${getStatusTextColor()}`}>
                  {getStatusText()}
                </p>
              </div>
            )}

            {/* Add active border indication */}
            {coupon.status === 'active' && timeRemaining !== 0 && (
              <div className="absolute inset-0 border-4 border-white opacity-40 rounded-lg animate-pulse-slow pointer-events-none"></div>
            )}

            {/* Add timer indicator */}
            {coupon.status === 'active' && timeRemaining !== null && timeRemaining > 0 && !isNaN(timeRemaining) && (
              <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center">
                <Timer className="w-4 h-4 mr-1 text-green-600" />
                <span className="text-xs font-bold text-green-600">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
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
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only re-render if these specific properties change
  return (
    prevProps.mealSlot.id === nextProps.mealSlot.id &&
    prevProps.coupon.status === nextProps.coupon.status &&
    prevProps.coupon.couponedAt === nextProps.coupon.couponedAt &&
    prevProps.coupon.expiresAt === nextProps.coupon.expiresAt &&
    prevProps.coupon.mealSlotId === nextProps.coupon.mealSlotId
  );
});
