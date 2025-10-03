import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import {
    ExhibitorCompany,
    ExhibitorEmployee,
    ExhibitorMealClaim,
    ExhibitorContextType,
    PLAN_ALLOCATIONS
} from '../types/exhibitor';
import {
    saveExhibitorSession,
    getExhibitorSession,
    clearExhibitorSession,
    saveEmployees,
    getEmployees,
    claimExhibitorMeal,
    getExhibitorClaimData,
    checkAndExpireExhibitorCoupons
} from '../services/exhibitorStorageService';

const ExhibitorContext = createContext<ExhibitorContextType | undefined>(undefined);

export const ExhibitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentCompany, setCurrentCompany] = useState<ExhibitorCompany | null>(null);
    const [employees, setEmployees] = useState<ExhibitorEmployee[]>([]);
    const [mealClaims, setMealClaims] = useState<ExhibitorMealClaim[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Helper function to transform company data from snake_case to camelCase
    const transformCompanyData = (dbCompany: any): ExhibitorCompany => ({
        id: dbCompany.id,
        companyId: dbCompany.company_id,
        companyName: dbCompany.company_name,
        phoneNumber: dbCompany.phone_number,
        plan: dbCompany.plan,
        password: dbCompany.password || '',
        lunchAllocation: dbCompany.lunch_allocation || 0,
        dinnerAllocation: dbCompany.dinner_allocation || 0,
        lunchUsed: dbCompany.lunch_used || 0,
        dinnerUsed: dbCompany.dinner_used || 0,
        createdAt: dbCompany.created_at,
        updatedAt: dbCompany.updated_at
    });

    // Helper function to transform employee data from snake_case to camelCase
    const transformEmployeeData = (dbEmployee: any): ExhibitorEmployee => ({
        id: dbEmployee.id,
        companyId: dbEmployee.company_id,
        employeeName: dbEmployee.employee_name,
        employeePhone: dbEmployee.employee_phone,
        isActive: dbEmployee.is_active,
        createdAt: dbEmployee.created_at,
        updatedAt: dbEmployee.updated_at
    });

    // Initialize session on component mount
    useEffect(() => {
        const initializeSession = async () => {
            try {
                // Check if user is already authenticated with Supabase
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Fetch company data using auth.uid
                    const { data: company, error } = await supabase
                        .from('exhibitor_companies')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error || !company) {
                        await supabase.auth.signOut();
                        clearExhibitorSession();
                        setIsLoading(false);
                        return;
                    }

                    const transformedCompany = transformCompanyData(company);
                    setCurrentCompany(transformedCompany);

                    // Load employees and meal claims using company_id string
                    // Note: refreshData() will fetch from Supabase and update employees
                    setEmployees([]); // Start with empty array, will be populated by refreshData()

                    // Clean up expired claims
                    checkAndExpireExhibitorCoupons(transformedCompany.companyId);

                    await refreshData();
                } else {
                    // Fallback: check localStorage session
                    const session = getExhibitorSession();
                    if (session) {
                        // Clear invalid session since user is not authenticated
                        clearExhibitorSession();
                    }
                }
            } catch (error) {
                console.error('Failed to initialize exhibitor session:', error);
                clearExhibitorSession();
            } finally {
                setIsLoading(false);
            }
        };

        initializeSession();
    }, []);

    const login = useCallback(async (companyId: string): Promise<boolean> => {
        try {
            setIsLoading(true);

            // Format company ID as email: convert to lowercase and add @isgcon.com
            const email = `${companyId.toLowerCase()}@isgcon.com`;

            // Use default password
            const authPassword = 'participanthere';

            // Authenticate with Supabase using signInWithPassword
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: authPassword
            });

            if (authError || !authData.user) {
                console.error('Authentication failed:', authError);
                return false;
            }

            // Fetch company data from database using auth.uid as primary key
            const { data: company, error: companyError } = await supabase
                .from('exhibitor_companies')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (companyError || !company) {
                console.error('Company lookup failed:', companyError);
                // Sign out if company not found
                await supabase.auth.signOut();
                return false;
            }

            const transformedCompany = transformCompanyData(company);

            // Save session using the company_id from the database record
            saveExhibitorSession(transformedCompany.companyId);
            setCurrentCompany(transformedCompany);

            // Load employees - refreshData() will fetch from Supabase
            setEmployees([]); // Start with empty array, will be populated by refreshData()

            // Clean up expired claims
            checkAndExpireExhibitorCoupons(transformedCompany.companyId);

            await refreshData();
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            // Sign out from Supabase
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }

        clearExhibitorSession();
        setCurrentCompany(null);
        setEmployees([]);
        setMealClaims([]);
    }, []);

    const getEmployeesFromSupabase = useCallback(async (): Promise<ExhibitorEmployee[]> => {
        if (!currentCompany) return [];

        try {
            const { data, error } = await supabase
                .from('exhibitor_employees')
                .select('*')
                .eq('company_id', currentCompany.id)
                .eq('is_active', true)
                .order('employee_name');

            if (error) {
                console.error('Failed to fetch employees:', error);
                return getEmployees(currentCompany.companyId);
            }

            // Transform the data from snake_case to camelCase
            const transformedEmployees = (data || []).map(transformEmployeeData);

            console.log('Raw employee data from Supabase:', data);
            console.log('Transformed employee data:', transformedEmployees);

            // Save transformed data to localStorage
            saveEmployees(currentCompany.companyId, transformedEmployees);
            return transformedEmployees;
        } catch (error) {
            console.error('Error fetching employees:', error);
            return getEmployees(currentCompany.companyId);
        }
    }, [currentCompany]);

    const addEmployee = useCallback(async (employeeName: string, employeePhone?: string): Promise<boolean> => {
        if (!currentCompany) return false;

        try {
            const { data, error } = await supabase
                .from('exhibitor_employees')
                .insert({
                    company_id: currentCompany.id,
                    employee_name: employeeName,
                    employee_phone: employeePhone,
                    is_active: true
                })
                .select()
                .single();

            if (error) {
                console.error('Failed to add employee:', error);
                return false;
            }

            // Transform the new employee data and update local state
            const transformedEmployee = transformEmployeeData(data);
            const updatedEmployees = [...employees, transformedEmployee];
            setEmployees(updatedEmployees);
            saveEmployees(currentCompany.companyId, updatedEmployees);

            return true;
        } catch (error) {
            console.error('Error adding employee:', error);
            return false;
        }
    }, [currentCompany, employees]);

    const updateEmployee = useCallback(async (employeeId: string, updates: Partial<ExhibitorEmployee>): Promise<boolean> => {
        if (!currentCompany) return false;

        try {
            const { error } = await supabase
                .from('exhibitor_employees')
                .update(updates)
                .eq('id', employeeId);

            if (error) {
                console.error('Failed to update employee:', error);
                return false;
            }

            // Update local state
            const updatedEmployees = employees.map(emp =>
                emp.id === employeeId ? { ...emp, ...updates } : emp
            );
            setEmployees(updatedEmployees);
            saveEmployees(currentCompany.companyId, updatedEmployees);

            return true;
        } catch (error) {
            console.error('Error updating employee:', error);
            return false;
        }
    }, [currentCompany, employees]);

    const removeEmployee = useCallback(async (employeeId: string): Promise<boolean> => {
        if (!currentCompany) return false;

        try {
            const { error } = await supabase
                .from('exhibitor_employees')
                .update({ is_active: false })
                .eq('id', employeeId);

            if (error) {
                console.error('Failed to remove employee:', error);
                return false;
            }

            // Update local state
            const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
            setEmployees(updatedEmployees);
            saveEmployees(currentCompany.companyId, updatedEmployees);

            return true;
        } catch (error) {
            console.error('Error removing employee:', error);
            return false;
        }
    }, [currentCompany, employees]);

    const claimMeal = useCallback(async (
        employeeId: string,
        mealSlotId: string,
        mealType: 'lunch' | 'dinner'
    ): Promise<boolean> => {
        if (!currentCompany) return false;

        try {
            const employee = employees.find(emp => emp.id === employeeId);
            if (!employee) {
                console.error('Employee not found');
                return false;
            }

            // Check allocation limits
            const allocations = getAvailableAllocations();
            const currentClaims = getExhibitorClaimData(currentCompany.companyId);
            const mealTypeClaims = Object.values(currentClaims).filter(claim => claim.mealType === mealType);

            if (mealType === 'lunch' && mealTypeClaims.length >= allocations.lunch) {
                alert('Lunch allocation limit reached for your company');
                return false;
            }

            if (mealType === 'dinner' && mealTypeClaims.length >= allocations.dinner) {
                alert('Dinner allocation limit reached for your company');
                return false;
            }

            // Claim in localStorage
            const claimSuccess = claimExhibitorMeal(
                currentCompany.companyId,
                employeeId,
                employee.employeeName,
                mealSlotId,
                mealType
            );

            if (!claimSuccess) {
                return false;
            }

            // Update Supabase
            const { error } = await supabase
                .from('exhibitor_meal_claims')
                .upsert({
                    company_id: currentCompany.id,
                    employee_id: employeeId,
                    meal_slot_id: mealSlotId,
                    meal_type: mealType,
                    status: false, // false = claimed
                    claimed_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
                });

            if (error) {
                console.error('Failed to update Supabase:', error);
                // Don't return false here as localStorage claim succeeded
            }

            await refreshData();
            return true;
        } catch (error) {
            console.error('Error claiming meal:', error);
            return false;
        }
    }, [currentCompany]);

    // Helper function to transform meal claim data from snake_case to camelCase
    const transformMealClaimData = (dbClaim: any): ExhibitorMealClaim => ({
        id: dbClaim.id,
        companyId: dbClaim.company_id,
        employeeId: dbClaim.employee_id,
        mealSlotId: dbClaim.meal_slot_id,
        mealType: dbClaim.meal_type,
        quantity: 1, // Each record represents 1 meal
        status: dbClaim.status,
        claimedAt: dbClaim.claimed_at,
        expiresAt: dbClaim.expires_at,
        createdAt: dbClaim.created_at,
        updatedAt: dbClaim.updated_at
    });

    const getMealClaimsFromSupabase = useCallback(async (): Promise<ExhibitorMealClaim[]> => {
        if (!currentCompany) return [];

        try {
            // Check if user is properly authenticated
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.warn('User not authenticated, cannot fetch meal claims');
                return [];
            }

            const { data, error } = await supabase
                .from('exhibitor_meal_claims')
                .select('*')
                .eq('company_id', currentCompany.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Failed to fetch meal claims:', error);
                // If RLS policy error or table access denied, return empty array gracefully
                if (error.code === 'PGRST116' || error.message.includes('permission denied')) {
                    console.warn('Permission denied for meal claims table, using localStorage fallback');
                    return [];
                }
                return [];
            }

            // Transform the data to camelCase
            const transformedClaims = (data || []).map(transformMealClaimData);
            console.log('getMealClaimsFromSupabase: Fetched and transformed claims:', transformedClaims);

            return transformedClaims;
        } catch (error) {
            console.error('Error fetching meal claims:', error);
            return [];
        }
    }, [currentCompany]);

    const getAvailableAllocations = useCallback(() => {
        if (!currentCompany) return { lunch: 0, dinner: 0 };

        const planAllocation = PLAN_ALLOCATIONS[currentCompany.plan as keyof typeof PLAN_ALLOCATIONS];
        if (!planAllocation) {
            console.warn('Unknown plan:', currentCompany.plan);
            return { lunch: 0, dinner: 0 };
        }

        // Count actual claims from the meal claims data instead of relying on usage counters
        const lunchClaims = mealClaims.filter(claim =>
            claim.mealType === 'lunch' && claim.status === false
        ).length;

        const dinnerClaims = mealClaims.filter(claim =>
            claim.mealType === 'dinner' && claim.status === false
        ).length;

        console.log('Available allocations calculation:', {
            plan: currentCompany.plan,
            planAllocation,
            lunchClaims,
            dinnerClaims,
            availableLunch: Math.max(0, planAllocation.lunch - lunchClaims),
            availableDinner: Math.max(0, planAllocation.dinner - dinnerClaims)
        });

        return {
            lunch: Math.max(0, planAllocation.lunch - lunchClaims),
            dinner: Math.max(0, planAllocation.dinner - dinnerClaims)
        };
    }, [currentCompany, mealClaims]);    // New bulk claiming function for company-level meal claiming without specific employees
    const claimMealBulk = useCallback(async (
        mealSlotId: string,
        mealType: 'lunch' | 'dinner',
        quantity: number
    ): Promise<boolean> => {
        if (!currentCompany) return false;

        try {
            // Check allocation limits
            const allocations = getAvailableAllocations();
            const available = mealType === 'lunch' ? allocations.lunch : allocations.dinner;

            console.log('claimMealBulk: Starting claim process', {
                mealSlotId,
                mealType,
                quantity,
                available,
                allocations
            });

            if (quantity > available) {
                console.error(`Not enough ${mealType} allocation. Requested: ${quantity}, Available: ${available}`);
                return false;
            }

            // Check if bulk claim already exists for this meal slot
            let existingClaims: any[] = [];
            try {
                const { data } = await supabase
                    .from('exhibitor_meal_claims')
                    .select('id')
                    .eq('company_id', currentCompany.id)
                    .eq('meal_slot_id', mealSlotId)
                    .is('employee_id', 'null');

                existingClaims = data || [];
            } catch (error) {
                console.warn('Could not check for existing claims, proceeding with new claim');
                existingClaims = [];
            }

            const currentClaimCount = existingClaims.length;

            if (quantity > currentClaimCount) {
                // Need to create additional claims
                const claimsToCreate = quantity - currentClaimCount;

                try {
                    // Create multiple individual records instead of one with quantity
                    const claimsData = Array.from({ length: claimsToCreate }, () => ({
                        company_id: currentCompany.id,
                        employee_id: null, // NULL for bulk claims (no specific employee)
                        meal_slot_id: mealSlotId,
                        meal_type: mealType,
                        status: false, // false = claimed
                        claimed_at: new Date().toISOString(),
                        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours for bulk claims
                    }));

                    const { error } = await supabase
                        .from('exhibitor_meal_claims')
                        .insert(claimsData);

                    if (error) {
                        console.error('Failed to create new claims:', error);
                        console.warn('Proceeding with localStorage-only operation');
                    }
                } catch (error) {
                    console.error('Database operation failed, using localStorage only:', error);
                }
            } else if (quantity < currentClaimCount) {
                // Need to remove some claims
                const claimsToRemove = currentClaimCount - quantity;

                try {
                    // Remove excess claims
                    const claimsToDelete = existingClaims.slice(0, claimsToRemove);
                    for (const claim of claimsToDelete) {
                        await supabase
                            .from('exhibitor_meal_claims')
                            .delete()
                            .eq('id', claim.id);
                    }
                } catch (error) {
                    console.error('Database operation failed, using localStorage only:', error);
                }
            } else {
                // Same quantity, just update timestamps
                try {
                    for (const claim of existingClaims) {
                        await supabase
                            .from('exhibitor_meal_claims')
                            .update({
                                claimed_at: new Date().toISOString(),
                                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                            })
                            .eq('id', claim.id);
                    }
                } catch (error) {
                    console.error('Database operation failed, using localStorage only:', error);
                }
            }

            console.log('claimMealBulk: Successfully claimed, refreshing data...');
            await refreshData();
            console.log('claimMealBulk: Data refresh completed');
            return true;
        } catch (error) {
            console.error('Error claiming meal in bulk:', error);
            return false;
        }
    }, [currentCompany, getAvailableAllocations]);

    const refreshData = useCallback(async (): Promise<void> => {
        if (!currentCompany) return;

        console.log('refreshData: Starting refresh for company:', currentCompany.companyId);

        try {
            // Refresh employees
            const employeeData = await getEmployeesFromSupabase();
            console.log('refreshData: Fetched employee data:', employeeData);
            setEmployees(employeeData);

            // Refresh meal claims
            const claimsData = await getMealClaimsFromSupabase();
            setMealClaims(claimsData);

            // Clean up expired claims
            checkAndExpireExhibitorCoupons(currentCompany.companyId);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }, [currentCompany, getEmployeesFromSupabase, getMealClaimsFromSupabase]);

    const value: ExhibitorContextType = {
        currentCompany,
        employees,
        mealClaims,
        isLoading,
        login,
        logout,
        getEmployees: getEmployeesFromSupabase,
        addEmployee,
        updateEmployee,
        removeEmployee,
        claimMeal,
        claimMealBulk,
        getMealClaims: getMealClaimsFromSupabase,
        getAvailableAllocations,
        refreshData
    };

    return (
        <ExhibitorContext.Provider value={value}>
            {children}
        </ExhibitorContext.Provider>
    );
};

export const useExhibitor = (): ExhibitorContextType => {
    const context = useContext(ExhibitorContext);
    if (context === undefined) {
        throw new Error('useExhibitor must be used within an ExhibitorProvider');
    }
    return context;
};