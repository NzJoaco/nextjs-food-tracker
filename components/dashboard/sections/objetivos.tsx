"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useMacroStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Save } from "lucide-react"
import { toast } from "sonner"

export function ObjetivosSection() {
  const { user } = useAuth()
  const { userGoals, setUserGoals } = useMacroStore()
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    activityLevel: "moderate",
    goal: "maintain",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setGoals(userGoals)
  }, [userGoals])

  const handleSave = async () => {
    setSaving(true)
    try {
      
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUserGoals(goals)
      toast("Tus objetivos nutricionales han sido actualizados exitosamente.")
    } catch (error) {
      toast(
        "No se pudieron guardar los objetivos. Inténtalo de nuevo."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Objetivos Nutricionales</h1>
          <p className="text-muted-foreground">Configura tus metas diarias de macronutrientes</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Objetivos Diarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calorías</Label>
              <Input
                id="calories"
                type="number"
                value={goals.calories}
                onChange={(e) => setGoals({ ...goals, calories: Number.parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein">Proteínas (g)</Label>
              <Input
                id="protein"
                type="number"
                value={goals.protein}
                onChange={(e) => setGoals({ ...goals, protein: Number.parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs">Carbohidratos (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={goals.carbs}
                onChange={(e) => setGoals({ ...goals, carbs: Number.parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat">Grasas (g)</Label>
              <Input
                id="fat"
                type="number"
                value={goals.fat}
                onChange={(e) => setGoals({ ...goals, fat: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activityLevel">Nivel de Actividad</Label>
              <Select
                value={goals.activityLevel}
                onValueChange={(value) => setGoals({ ...goals, activityLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentario</SelectItem>
                  <SelectItem value="light">Actividad Ligera</SelectItem>
                  <SelectItem value="moderate">Actividad Moderada</SelectItem>
                  <SelectItem value="active">Muy Activo</SelectItem>
                  <SelectItem value="extra">Extremadamente Activo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Objetivo</Label>
              <Select value={goals.goal} onValueChange={(value) => setGoals({ ...goals, goal: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Perder Peso</SelectItem>
                  <SelectItem value="maintain">Mantener Peso</SelectItem>
                  <SelectItem value="gain">Ganar Peso</SelectItem>
                  <SelectItem value="muscle">Ganar Músculo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Distribución de Macros</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Proteínas:</span>
                  <span>{Math.round(((goals.protein * 4) / goals.calories) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbohidratos:</span>
                  <span>{Math.round(((goals.carbs * 4) / goals.calories) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Grasas:</span>
                  <span>{Math.round(((goals.fat * 9) / goals.calories) * 100)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
