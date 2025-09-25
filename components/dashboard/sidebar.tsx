"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Activity, Target, Plus, Calendar } from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const sections = [
  {
    id: "seguimiento",
    label: "Seguimiento",
    icon: Activity,
  },
  {
    id: "objetivos",
    label: "Objetivos",
    icon: Target,
  },
  {
    id: "crear-comidas",
    label: "Crear Comidas",
    icon: Plus,
  },
  {
    id: "calendario",
    label: "Calendario",
    icon: Calendar,
  },
]

export function DashboardSidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="w-64 border-r border-border/40 bg-background/50 backdrop-blur">
      <div className="p-4">
        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  activeSection === section.id && "bg-primary/10 text-primary hover:bg-primary/20",
                )}
                onClick={() => onSectionChange(section.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {section.label}
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
