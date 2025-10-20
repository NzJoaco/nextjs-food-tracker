"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "./supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export interface AppUser {
  id: string
  name: string
  email: string
  rawUser: SupabaseUser 
}

interface AuthContextType {
  user: AppUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const mapSupabaseUser = (supabaseUser: SupabaseUser): AppUser => ({
    id: supabaseUser.id,
    email: supabaseUser.email || "No Email",
    name: supabaseUser.email?.split("@")[0] || "Usuario",
    rawUser: supabaseUser,
  })

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setUser(mapSupabaseUser(data.session.user))
      }
      setIsLoading(false)
    }
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUser(mapSupabaseUser(session.user))
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    loadSession()
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setIsLoading(false)

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, error: null }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { full_name: name } 
      }
    })
    setIsLoading(false)

    if (error) {
      return { success: false, error: error.message }
    }
    if (data.user) {
        return { success: true, error: null }
    }
    return { success: true, error: null } 
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}