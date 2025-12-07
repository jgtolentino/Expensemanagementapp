/**
 * Auth Context
 * 
 * Provides authentication state and user context:
 * - tenantId
 * - roles (super_admin, analyst, brand_sponsor, store_owner)
 * - user metadata
 * 
 * Integrates with Supabase Auth and sets API client context.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { setAuthContext, clearAuthContext } from '@/api/client'
import type { User, Session } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'super_admin' | 'analyst' | 'brand_sponsor' | 'store_owner'

export interface AuthUser {
  id: string
  email: string
  tenant_id: string
  roles: UserRole[]
  metadata: {
    full_name?: string
    avatar_url?: string
    store_ids?: string[] // For store_owner role
    brand_ids?: string[] // For brand_sponsor role
  }
}

interface AuthContextValue {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Role checks
  hasRole: (role: UserRole) => boolean
  isSuperAdmin: boolean
  isAnalyst: boolean
  isBrandSponsor: boolean
  isStoreOwner: boolean
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ============================================================================
// PROVIDER
// ============================================================================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        loadUserProfile(session.user)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session) {
          await loadUserProfile(session.user)
        } else {
          setUser(null)
          clearAuthContext()
          setIsLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Load user profile and roles from database
  async function loadUserProfile(supabaseUser: User) {
    try {
      // Fetch user roles from scout.user_roles table
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('tenant_id, role, metadata')
        .eq('user_id', supabaseUser.id)
        .single()

      if (rolesError) {
        console.error('Error loading user roles:', rolesError)
        setUser(null)
        setIsLoading(false)
        return
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        tenant_id: userRoles.tenant_id,
        roles: [userRoles.role], // In production, might have multiple roles
        metadata: {
          full_name: supabaseUser.user_metadata?.full_name,
          avatar_url: supabaseUser.user_metadata?.avatar_url,
          store_ids: userRoles.metadata?.store_ids || [],
          brand_ids: userRoles.metadata?.brand_ids || [],
        },
      }

      setUser(authUser)

      // Set API client context
      const token = session?.access_token || ''
      setAuthContext(token, authUser.tenant_id, authUser.roles)

      setIsLoading(false)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUser(null)
      setIsLoading(false)
    }
  }

  // Sign in
  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
  }

  // Sign out
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    setUser(null)
    setSession(null)
    clearAuthContext()
  }

  // Role checks
  const hasRole = (role: UserRole) => user?.roles.includes(role) || false
  const isSuperAdmin = hasRole('super_admin')
  const isAnalyst = hasRole('analyst')
  const isBrandSponsor = hasRole('brand_sponsor')
  const isStoreOwner = hasRole('store_owner')

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    isSuperAdmin,
    isAnalyst,
    isBrandSponsor,
    isStoreOwner,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ============================================================================
// PROTECTED ROUTE WRAPPER
// ============================================================================

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole
  fallback?: ReactNode
}

export function ProtectedRoute({ children, requiredRole, fallback }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, hasRole } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Please sign in to continue</div>
      </div>
    )
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Insufficient permissions</div>
      </div>
    )
  }

  return <>{children}</>
}
