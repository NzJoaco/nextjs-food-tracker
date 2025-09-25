"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"


type CalendarDayData = {
  calories: number
  protein: number
  status: string
}

const mockCalendarData: { [date: string]: CalendarDayData } = {
  "2025-01-15": { calories: 1850, protein: 120, status: "good" },
  "2025-01-16": { calories: 2200, protein: 140, status: "over" },
  "2025-01-17": { calories: 1650, protein: 95, status: "under" },
  "2025-01-18": { calories: 1950, protein: 135, status: "good" },
  "2025-01-19": { calories: 2100, protein: 155, status: "good" },
  "2025-01-20": { calories: 1750, protein: 110, status: "under" },
  "2025-01-21": { calories: 2000, protein: 150, status: "perfect" },
}

export function CalendarioSection() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "perfect":
        return "bg-green-500"
      case "good":
        return "bg-blue-500"
      case "over":
        return "bg-orange-500"
      case "under":
        return "bg-yellow-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "perfect":
        return "Perfecto"
      case "good":
        return "Bien"
      case "over":
        return "Excedido"
      case "under":
        return "Bajo"
      default:
        return "Sin datos"
    }
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const selectedData = selectedDate ? mockCalendarData[selectedDate] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendario</h1>
          <p className="text-muted-foreground">Revisa tu progreso a lo largo del tiempo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} className="p-2 h-12"></div>
              ))}

              
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
                const dayData = mockCalendarData[dateStr]
                const isSelected = selectedDate === dateStr
                const isToday = dateStr === new Date().toISOString().split("T")[0]

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`
                      p-2 h-12 text-sm rounded-lg border transition-colors relative
                      ${isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-accent"}
                      ${isToday ? "font-bold" : ""}
                    `}
                  >
                    <span>{day}</span>
                    {dayData && (
                      <div
                        className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${getStatusColor(dayData.status)}`}
                      ></div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle>{selectedDate ? `Detalles del ${selectedDate}` : "Selecciona un día"}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedData ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <Badge variant="secondary" className={getStatusColor(selectedData.status)}>
                      {getStatusText(selectedData.status)}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Calorías:</span>
                    <span className="font-medium">{selectedData.calories}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Proteínas:</span>
                    <span className="font-medium">{selectedData.protein}g</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  Ver Detalles Completos
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Haz clic en un día del calendario para ver los detalles de tu progreso.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      
      <Card>
        <CardHeader>
          <CardTitle>Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Perfecto (objetivo alcanzado)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Bien (cerca del objetivo)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm">Excedido (sobre el objetivo)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm">Bajo (debajo del objetivo)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
