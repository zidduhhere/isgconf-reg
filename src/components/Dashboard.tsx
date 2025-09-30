import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Utensils, Users } from 'lucide-react';
import { MealCard } from './MealCard';
import { FamilyCouponCard } from './FamilyCouponCard';
import { useAuth } from '../contexts/AuthContext';
import { useCoupon } from '../contexts/CouponContext';

export const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { mealSlots, getClaimForSlot, getTimeRemaining, claimMeal, claimFamilyMeal } = useCoupon();
  const navigate = useNavigate();

  if (!currentUser) {
    return null; // This shouldn't happen, but just in case
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  }; return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with Blur Gradients */}
      <div className="absolute inset-0 ">
        {/* Floating blur orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-20 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content Layer */}
      <div className="relative bg-transparent z-10">
        {/* Header */}
        <div className="backdrop-blur-lg shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{currentUser.name}</h2>
                  <p className="text-sm text-gray-500">{currentUser.phoneNumber}</p>
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
          <div className="grid grid-cols-1 gap-4 ">
            {mealSlots.map((slot) => {
              const claim = getClaimForSlot(slot.id, 0);
              const timeRemaining = getTimeRemaining(slot.id);

              return (
                <MealCard
                  key={slot.id}
                  mealSlot={slot}
                  claim={claim || {
                    id: '',
                    participantId: currentUser.id,
                    mealSlotId: slot.id,
                    familyMemberIndex: 0,
                    status: 'available'
                  }}
                  onClaim={claimMeal}
                  timeRemaining={timeRemaining}
                  familyMemberIndex={0}
                  familyMemberName={currentUser.name}
                />
              );
            })}
          </div>

          {/* Family Coupons Section - Only show if participant has family */}
          {currentUser.isFamily && (
            <div className="mt-8">
              <div className="text-center mb-6">
                <div className="bg-white/80 backdrop-blur-lg w-16 h-16 rounded-full shadow-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Family Coupons</h2>
                <p className="text-gray-600">For you and your family members</p>
              </div>

              {/* Family Meal Cards Grid */}
              <div className="grid grid-cols-1 gap-4">
                {mealSlots.map((slot) => {
                  const familyClaim = getClaimForSlot(slot.id, 0);
                  const familyTimeRemaining = getTimeRemaining(`family-${slot.id}`);

                  return (
                    <FamilyCouponCard
                      key={`family-${slot.id}`}
                      mealSlot={slot}
                      claim={familyClaim || {
                        id: `family-${slot.id}`,
                        participantId: currentUser.id,
                        mealSlotId: slot.id,
                        familyMemberIndex: 0,
                        status: 'available'
                      }}
                      onClaim={claimFamilyMeal}
                      timeRemaining={familyTimeRemaining}
                      participant={currentUser}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Image Placeholders Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Event Gallery</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Image Placeholder 1 */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl h-48 flex items-center justify-center border-2 border-dashed border-blue-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-blue-700 font-medium">Conference Highlights</p>
                  <p className="text-blue-600 text-sm mt-1">Photos coming soon...</p>
                </div>
              </div>

              {/* Image Placeholder 2 */}
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl h-48 flex items-center justify-center border-2 border-dashed border-purple-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-purple-700 font-medium">Speaker Sessions</p>
                  <p className="text-purple-600 text-sm mt-1">Expert presentations</p>
                </div>
              </div>

              {/* Image Placeholder 3 */}
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl h-48 flex items-center justify-center border-2 border-dashed border-orange-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-orange-700 font-medium">Venue & Facilities</p>
                  <p className="text-orange-600 text-sm mt-1">Hayatt Residency Hotel</p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-sm border border-white/20">
            <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All meal cards are available anytime</li>
              <li>• Tap to claim your meal voucher</li>
              <li>• Show the GREEN card to food servers</li>
              <li>• Each meal can only be claimed once</li>
              <li>• Claims expire after 15 minutes</li>
              {currentUser.isFamily && (
                <>
                  <li className="text-purple-600 font-medium">• Family coupons are for all family members together</li>
                  <li className="text-purple-600">• Ensure all family members are present when claiming</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};