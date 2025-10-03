import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Utensils, Users, ImageIcon, UserSquare2, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ImagePlaceholder, Instructions } from '../ui';
import { MealCard } from './MealCard';
import { FamilyCouponCard } from './FamilyCouponCard';
import { MEAL_SLOTS as mealSlots } from '../../data/mockData';
import { useCoupon } from '../../contexts/CouponContext';


export const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { coupons, getRemainingTime, isLoading, getClaimForSlot, updateCoupon } = useCoupon();

  if (!currentUser) {
    return null; // This shouldn't happen, but just in case

  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading || !coupons) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meal coupons...</p>
        </div>
      </div>
    );
  }

  return (
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
            <p className="text-gray-600">Tap a card to coupon your meal</p>
          </div>



          {/* Meal Cards Grid */}
          <div className="grid grid-cols-1 gap-4 ">
            {mealSlots.map((slot) => {
              const coupon = getClaimForSlot(slot.id);
              if (!coupon) {
                console.warn(`No coupon found for mealSlotId: ${slot.id}`);
                return null;
              }
              return (
                <MealCard
                  key={slot.id}
                  mealSlot={slot}
                  coupon={coupon}
                  onClaim={async () => {
                    try {
                      console.log(`Claiming coupon for meal slot: ${slot.id}`);
                      await updateCoupon(slot.id, 'active', 0);
                      console.log(`Successfully claimed coupon for meal slot: ${slot.id}`);
                    } catch (error) {
                      console.error(`Error claiming meal for slot ${slot.id}:`, error);
                    }
                  }}
                />
              );
            })}
          </div>


          {/* Family Coupons Section - Only show if participant has family */}
          {currentUser.isFam && (
            <div className="mt-8">
              <div className="text-center mb-6">
                <div className="bg-white/80 backdrop-blur-lg w-16 h-16 rounded-full shadow-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Family Coupons</h2>
                <p className="text-gray-600">Meal coupons for your family members</p>
                <p className="text-sm text-gray-500 mt-1">Family size: {currentUser.familySize || 1} members</p>
              </div>

              {/* Family Meal Cards Grid */}
              <div className="space-y-6">
                {Array.from({ length: (currentUser.familySize || 1) - 1 }, (_, familyIndex) => {
                  const familyMemberIndex = familyIndex + 1; // Start from 1 (0 is the main participant)

                  return (
                    <div key={`family-member-${familyMemberIndex}`} className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 text-center">
                        Family Member {familyMemberIndex}
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {mealSlots.map((slot) => {
                          const familyCoupon = getClaimForSlot(slot.id, familyMemberIndex);
                          const familyTimeRemaining = getRemainingTime(`${slot.id}-family-${familyMemberIndex}`, familyMemberIndex);
                          console.log(`Family Member ${familyMemberIndex}, Meal Slot ${slot.id}, Coupon:`, familyCoupon);
                          return (
                            <FamilyCouponCard
                              key={`family-${familyMemberIndex}-${slot.id}`}
                              mealSlot={slot}
                              coupon={familyCoupon || {
                                id: `family-${familyMemberIndex}-${slot.id}`,
                                uniqueId: `family-${familyMemberIndex}-${slot.id}-${currentUser.id}`,
                                mealSlotId: slot.id,
                                familyMemberIndex: familyMemberIndex,
                                status: 'available'
                              }}
                              onClaim={(mealSlotId) => {
                                updateCoupon(mealSlotId, 'active', familyMemberIndex);
                              }}
                              timeRemaining={familyTimeRemaining}
                              participant={currentUser}
                            />
                          );
                        })}
                      </div>
                    </div>
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
              <ImagePlaceholder
                gradientFrom="from-blue-100"
                gradientTo="to-blue-200"
                borderColor="border-blue-300"
                iconBgColor="bg-blue-300"
                iconColor="text-blue-600"
                title="Conference Highlights"
                subtitle="Photos coming soon..."
                icon={<ImageIcon />}
              />

              {/* Image Placeholder 2 */}
              <ImagePlaceholder
                gradientFrom="from-purple-100"
                gradientTo="to-purple-200"
                borderColor="border-purple-300"
                iconBgColor="bg-purple-300"
                iconColor="text-purple-600"
                title="Speaker Sessions"
                subtitle="Expert presentations"
                titleColor="text-purple-700"
                subtitleColor="text-purple-600"
                icon={<UserSquare2 />}
              />

              {/* Image Placeholder 3 */}
              <ImagePlaceholder
                gradientFrom="from-orange-100"
                gradientTo="to-orange-200"
                borderColor="border-orange-300"
                iconBgColor="bg-orange-300"
                iconColor="text-orange-600"
                title="Venue & Facilities"
                subtitle="Hayatt Residency Hotel"
                titleColor="text-orange-700"
                subtitleColor="text-orange-600"
                icon={<Building />}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8">
            <Instructions
              title="How it works:"
              items={[
                { text: "All meal cards are available anytime" },
                { text: "Tap to coupon your meal voucher" },
                { text: "Show the GREEN card to food servers" },
                { text: "Each meal can only be couponed once" },
                { text: "Claims expire after 15 minutes" },
                ...(currentUser.isFam ? [
                  { text: "Family coupons are for all family members together", isHighlighted: true },
                  { text: "Ensure all family members are present when couponing", isHighlighted: true }
                ] : [])
              ]}
            />
          </div>

          {/* Developer Section */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="rounded-md bg-gray-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Building className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-800">Developer Resources</h3>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Check out the UI component library for this project:</p>
                      <a
                        href="/ui-components"
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        View Component Library
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};