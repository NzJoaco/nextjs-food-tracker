"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useMacroStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard/navbar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { SeguimientoSection } from "@/components/dashboard/sections/seguimiento"
import { ObjetivosSection } from "@/components/dashboard/sections/objetivos"
import { CrearComidasSection } from "@/components/dashboard/sections/crear-comidas"
import { CalendarioSection } from "@/components/dashboard/sections/calendario"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const { loadMeals } = useMacroStore();
  const [activeSection, setActiveSection] = useState("seguimiento")
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user) {
      loadMeals(user.id);
    }
  }, [user, isLoading, router, loadMeals])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const renderSection = () => {
    switch (activeSection) {
      case "seguimiento":
        return <SeguimientoSection />
      case "objetivos":
        return <ObjetivosSection />
      case "crear-comidas":
        return <CrearComidasSection />
      case "calendario":
        return <CalendarioSection />
      default:
        return <SeguimientoSection />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <div className="flex">
        <DashboardSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-6">{renderSection()}</main>
      </div>
    </div>
  )
}
