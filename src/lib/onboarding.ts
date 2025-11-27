/**
 * Onboarding state management
 */

const ONBOARDING_COMPLETED_KEY = 'celobargain_onboarding_completed';
const USER_ROLE_KEY = 'celobargain_user_role';
const PRODUCT_TYPE_KEY = 'celobargain_product_type';

export type UserRole = 'buyer' | 'seller';
export type ProductType = 'premium' | 'other';

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Mark onboarding as completed
 */
export function completeOnboarding(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Error completing onboarding:', error);
  }
}

/**
 * Get the user's selected role
 */
export function getUserRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const role = localStorage.getItem(USER_ROLE_KEY);
    if (role === 'buyer' || role === 'seller') {
      return role;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Set the user's selected role
 */
export function setUserRole(role: UserRole): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USER_ROLE_KEY, role);
  } catch (error) {
    console.error('Error setting user role:', error);
  }
}

/**
 * Get the user's selected product type (for sellers)
 */
export function getProductType(): ProductType | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const type = localStorage.getItem(PRODUCT_TYPE_KEY);
    if (type === 'premium' || type === 'other') {
      return type;
    }
    return null;
  } catch (error) {
    console.error('Error getting product type:', error);
    return null;
  }
}

/**
 * Set the user's selected product type (for sellers)
 */
export function setProductType(type: ProductType): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(PRODUCT_TYPE_KEY, type);
  } catch (error) {
    console.error('Error setting product type:', error);
  }
}

/**
 * Reset onboarding (for testing or if user wants to see it again)
 */
export function resetOnboarding(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(PRODUCT_TYPE_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
}

