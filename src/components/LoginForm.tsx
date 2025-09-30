import React, { useState } from 'react';
import { Smartphone, ArrowRight, Stethoscope, Shield, Users, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const { login, setCurrentView, loginError, isLoading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      login(phoneNumber.trim());
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
  };

  const handleNavigateToLanding = () => {
    setCurrentView('landing');
  };

  return (
    <div className="h-screen bg-gradient-to-br font-isans from-neutral-50 via-white to-primary-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-accent-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-6xl mx-auto h-full flex items-center justify-center overflow-y-auto">
        {/* Centered Layout */}
        <div className="w-full flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 lg:items-center py-2 sm:py-4">

          {/* Mobile Header - Always visible */}
          <div className="text-center mb-4 lg:hidden animate-slide-down">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-600">ISGCON 2025</h1>
                <p className="text-xs text-primary-500 font-medium">Annual Kerala Medical Conference</p>
              </div>
            </div>
          </div>

          {/* Desktop Welcome Content */}
          <div className="hidden lg:block text-left animate-slide-down">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-primary-600">ISGCON 2025</h1>
                <p className="text-sm text-primary-500 font-medium">Annual Kerala Medical Conference</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-neutral-900 mb-3">
              Welcome to Your Medical Conference Portal
            </h2>
            <p className="text-base text-neutral-600 mb-6 max-w-lg">
              Access your personalized dashboard for sessions, networking, and exclusive medical content.
            </p>

            {/* Feature Cards - Desktop Only */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-scale-in">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-primary-600" />
                  <div className="text-left">
                    <h4 className="font-medium text-neutral-900 text-sm">Medical Sessions</h4>
                    <p className="text-xs text-neutral-600">Expert-led workshops</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary-600" />
                  <div className="text-left">
                    <h4 className="font-medium text-neutral-900 text-sm">Networking</h4>
                    <p className="text-xs text-neutral-600">Connect with peers</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary-600" />
                  <div className="text-left">
                    <h4 className="font-medium text-neutral-900 text-sm">CME Credits</h4>
                    <p className="text-xs text-neutral-600">Earn certifications</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20 animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary-600" />
                  <div className="text-left">
                    <h4 className="font-medium text-neutral-900 text-sm">Secure Access</h4>
                    <p className="text-xs text-neutral-600">Protected portal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details - Desktop Only */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 text-white animate-slide-up">
              <h3 className="text-base font-semibold mb-2">Conference Details</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-primary-200">Date</p>
                  <p className="font-medium">October 4-5, 2025</p>
                </div>
                <div>
                  <p className="text-primary-200">Venue</p>
                  <p className="font-medium">Hayatt Residency Hotel</p>
                </div>
                <div>
                  <p className="text-primary-200">Location</p>
                  <p className="font-medium">Thiruvananthapuram</p>
                </div>
                <div>
                  <p className="text-primary-200">Duration</p>
                  <p className="font-medium">2 Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile & Desktop Login Form */}
          <div className="w-full max-w-md mx-auto animate-scale-in">
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl border border-white/20 p-4 sm:p-6 backdrop-blur-sm animate-slide-up">

              {/* Form Header */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg sm:rounded-xl mb-2 sm:mb-3">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1 sm:mb-2">Access Your Portal</h3>
                <p className="text-xs sm:text-sm text-neutral-600">Enter your registered mobile number to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="relative">
                  <label htmlFor="mobilenumber" className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1 sm:mb-2">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="mobilenumber"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="+91 9876543210"
                      className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    />
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 animate-slide-up">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-red-700 text-xs sm:text-sm font-medium">{loginError}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-3 sm:my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 sm:px-3 bg-white text-neutral-500">or</span>
                </div>
              </div>

              {/* Navigation Button */}
              <button
                onClick={handleNavigateToLanding}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium py-2.5 px-3 sm:px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <span>← Back to Event Information</span>
              </button>

              {/* Security Badge */}
              <div className="mt-3 sm:mt-4 text-center">
                <div className="inline-flex items-center gap-1 sm:gap-2 text-xs text-neutral-500">
                  <Shield className="w-3 h-3" />
                  <span>Secure & Protected Access</span>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-xs text-neutral-600">
                Need help? Contact us at{' '}
                <a href="mailto:support@isgcon2025.com" className="text-primary-600 hover:text-primary-700 font-medium">
                  support@isgcon2025.com
                </a>
              </p>
            </div>

            {/* Mobile Event Info */}
            <div className="mt-4 lg:hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-3 text-white text-center">
                <h4 className="text-sm font-semibold mb-1">ISGCON 2025</h4>
                <p className="text-xs text-primary-200">October 4-5 • Thiruvananthapuram</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};