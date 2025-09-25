"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useMacroStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, X } from "lucide-react"
import { toast } from "sonner"

interface Food {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
}

interface SelectedFood extends Food {
  quantity: number
}

export function CrearComidasSection() {
  const { user } = useAuth()
  const { foods, addMeal } = useMacroStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Food[]>([])
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([])
  const [mealName, setMealName] = useState("")
  const [mealType, setMealType] = useState("")
  const [saving, setSaving] = useState(false)

  const searchFoods = () => {
    if (!searchTerm.trim()) return

    const results = foods.filter((food) => food.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setSearchResults(results)
  }

  const addFood = (food: Food) => {
    const existingFood = selectedFoods.find((f) => f.id === food.id)
    if (existingFood) {
      setSelectedFoods(selectedFoods.map((f) => (f.id === food.id ? { ...f, quantity: f.quantity + 100 } : f)))
    } else {
      setSelectedFoods([...selectedFoods, { ...food, quantity: 100 }])
    }
  }

  const removeFood = (foodId: number) => {
    setSelectedFoods(selectedFoods.filter((f) => f.id !== foodId))
  }

  const updateQuantity = (foodId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFood(foodId)
      return
    }
    setSelectedFoods(selectedFoods.map((f) => (f.id === foodId ? { ...f, quantity } : f)))
  }

  const getTotalMacros = () => {
    return selectedFoods.reduce(
      (total, food) => ({
        calories: total.calories + food.calories * (food.quantity / 100),
        protein: total.protein + food.protein * (food.quantity / 100),
        carbs: total.carbs + food.carbs * (food.quantity / 100),
        fat: total.fat + food.fat * (food.quantity / 100),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }

  const saveMeal = async () => {
    if (!mealName || !mealType || selectedFoods.length === 0) {
      toast(
        "Por favor completa todos los campos y agrega al menos un alimento."
        )
      return
    }

    setSaving(true)
    try {
      
      await new Promise((resolve) => setTimeout(resolve, 1000))

      addMeal({
        name: mealName,
        meal_type: mealType as "breakfast" | "lunch" | "dinner" | "snack",
        date: new Date().toISOString().split("T")[0],
        foods: selectedFoods,
      })

      toast("Tu comida ha sido registrada exitosamente.")

     
      setMealName("")
      setMealType("")
      setSelectedFoods([])
      setSearchResults([])
      setSearchTerm("")
    } catch (error) {
      toast("No se pudo guardar la comida. Inténtalo de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  const totals = getTotalMacros()

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Crear Comida</h1>
          <p className="text-muted-foreground">Agrega alimentos para crear una nueva comida</p>
        </div>
        <Button onClick={saveMeal} disabled={selectedFoods.length === 0 || saving}>
          <Plus className="mr-2 h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Comida"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Buscar Alimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alimentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchFoods()}
                  className="pl-10"
                />
              </div>
              <Button onClick={searchFoods} disabled={!searchTerm.trim()}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.length === 0 && searchTerm && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No se encontraron alimentos. Intenta con otro término de búsqueda.
                </p>
              )}
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer"
                  onClick={() => addFood(food)}
                >
                  <div>
                    <h4 className="font-medium">{food.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {food.calories} cal, {food.protein}g prot - por 100g
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        
        <Card>
          <CardHeader>
            <CardTitle>Crear Comida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mealName">Nombre de la Comida</Label>
              <Input
                id="mealName"
                placeholder="Ej: Desayuno saludable"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mealType">Tipo de Comida</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Desayuno</SelectItem>
                  <SelectItem value="lunch">Almuerzo</SelectItem>
                  <SelectItem value="dinner">Cena</SelectItem>
                  <SelectItem value="snack">Merienda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            
            <div className="space-y-3">
              <Label>Alimentos Seleccionados</Label>
              {selectedFoods.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay alimentos seleccionados</p>
              ) : (
                <div className="space-y-2">
                  {selectedFoods.map((food) => (
                    <div key={food.id} className="flex items-center justify-between p-2 border border-border rounded">
                      <div className="flex-1">
                        <span className="font-medium">{food.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={food.quantity}
                          onChange={(e) => updateQuantity(food.id, Number.parseFloat(e.target.value) || 0)}
                          className="w-16 h-8"
                          min="0"
                          step="1"
                        />
                        <span className="text-xs text-muted-foreground">g</span>
                        <Button size="sm" variant="ghost" onClick={() => removeFood(food.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            
            {selectedFoods.length > 0 && (
              <div className="pt-4 border-t space-y-2">
                <h4 className="font-medium">Totales</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Badge variant="secondary">{Math.round(totals.calories)} cal</Badge>
                  <Badge variant="secondary">{Math.round(totals.protein)}g prot</Badge>
                  <Badge variant="secondary">{Math.round(totals.carbs)}g carb</Badge>
                  <Badge variant="secondary">{Math.round(totals.fat)}g grasa</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
