import React, { useState, useEffect } from 'react';
import { LogOut, User, Utensils } from 'lucide-react';
import { MealCard } from './MealCard';
import { Participant, MealSlot, MealClaim } from '../types';
import {
  getMealSlots,
  getUserClaims,
  updateMealClaim,
  clearCurrentUser
} from '../services/storageService';

interface DashboardProps {
  participant: Participant;
}

export const Dashboard: React.FC<DashboardProps> = ({ participant }) => {
  const [mealSlots] = useState<MealSlot[]>(getMealSlots());
  const [claims, setClaims] = useState<MealClaim[]>([]);
  const [countdowns, setCountdowns] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadClaims();
  }, [participant.id]);

  useEffect(() => {
    // Set up intervals for active claims
    const intervals: { [key: string]: NodeJS.Timeout } = {};

    claims.forEach(claim => {
      if (claim.status === 'active' && claim.expiresAt) {
        const expiryTime = new Date(claim.expiresAt).getTime();
        const now = Date.now();
        const timeRemaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

        if (timeRemaining > 0) {
          setCountdowns(prev => ({ ...prev, [claim.mealSlotId]: timeRemaining }));

          intervals[claim.id] = setInterval(() => {
            const currentTime = Date.now();
            const remaining = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));

            if (remaining <= 0) {
              // Auto-expire the claim
              handleClaimExpiry(claim.id);
              clearInterval(intervals[claim.id]);
            } else {
              setCountdowns(prev => ({ ...prev, [claim.mealSlotId]: remaining }));
            }
          }, 1000);
        }
      }
    });

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [claims]);

  const loadClaims = () => {
    const userClaims = getUserClaims(participant.id);
    setClaims(userClaims);
  };

  const handleClaimExpiry = (claimId: string) => {
    updateMealClaim(claimId, {
      status: 'used'
    });
    loadClaims();

    // Clear countdown
    const claim = claims.find(c => c.id === claimId);
    if (claim) {
      setCountdowns(prev => {
        const newCountdowns = { ...prev };
        delete newCountdowns[claim.mealSlotId];
        return newCountdowns;
      });
    }
  };

  const handleMealClaim = (mealSlotId: string) => {
    const claim = claims.find(c => c.mealSlotId === mealSlotId);

    if (claim && claim.status === 'available') {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now

      updateMealClaim(claim.id, {
        status: 'active',
        claimedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      });

      loadClaims();
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{participant.name}</h2>
                <p className="text-sm text-gray-500">{participant.phoneNumber}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 p-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="bg-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center mx-auto mb-3">
            <Utensils className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Meal Pass</h1>
          <p className="text-gray-600">Tap a card to claim your meal</p>
        </div>

        {/* Meal Cards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {mealSlots.map((slot) => {
            const claim = claims.find(c => c.mealSlotId === slot.id);
            const timeRemaining = countdowns[slot.id];

            return (
              <MealCard
                key={slot.id}
                mealSlot={slot}
                claim={claim || {
                  id: '',
                  participantId: participant.id,
                  mealSlotId: slot.id,
                  status: 'available'
                }}
                onClaim={handleMealClaim}
                timeRemaining={timeRemaining}
              />
            );
          })}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• All meal cards are available anytime</li>
            <li>• Tap to claim your meal voucher</li>
            <li>• Show the GREEN card to food servers</li>
            <li>• Each meal can only be claimed once</li>
            <li>• Claims expire after 5 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};