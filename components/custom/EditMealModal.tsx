"use client"

import React, { useState, useEffect} from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Check, X, AlertTriangle } from "lucide-react"
import { useMacroStore } from "@/lib/store"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface MealFood {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  quantity: number
}

interface Meal {
  id: number
  name: string
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  foods: MealFood[]
  date: string
}

interface EditMealModalProps {
  isOpen: boolean
  onClose: () => void
  meal: Meal | null
}

export function EditMealModal({ isOpen, onClose, meal }: EditMealModalProps) {
  const { updateMealFood, deleteMeal } = useMacroStore()
  const [currentFoods, setCurrentFoods] = useState<MealFood[]>([])
  const [editedQuantities, setEditedQuantities] = useState<{ [key: number]: number }>({})
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
  const [confirmTitle, setConfirmTitle] = useState("")
  const [confirmDescription, setConfirmDescription] = useState("")

  useEffect(() => {
    if (meal) {
      setCurrentFoods(meal.foods)
      const initialQuantities = meal.foods.reduce((acc, food) => {
        acc[food.id] = food.quantity
        return acc
      }, {} as { [key: number]: number })
      setEditedQuantities(initialQuantities)
    }
  }, [meal])

  const handleQuantityChange = (foodId: number, value: string) => {
    const quantity = Math.max(0, parseInt(value, 10) || 0)
    setEditedQuantities((prev) => ({
      ...prev,
      [foodId]: quantity,
    }))
  }

  const handleConfirmAction = (title: string, description: string, action: () => void) => {
    setConfirmTitle(title)
    setConfirmDescription(description)
    setConfirmAction(() => action) 
    setIsConfirmOpen(true)
  }

  const executeConfirmedAction = () => {
    if (confirmAction) {
      confirmAction()
    }
    setIsConfirmOpen(false)
    setConfirmAction(null)
  }

  const handleDeleteFood = (foodId: number) => {
    handleConfirmAction(
      "Confirmar Eliminación de Alimento",
      "¿Estás seguro de que quieres eliminar este alimento de tu comida? Este cambio se aplicará al guardar.",
      () => {
        setCurrentFoods((prev) => prev.filter(f => f.id !== foodId))
        
        setEditedQuantities((prev) => ({
          ...prev,
          [foodId]: 0,
        }))
      }
    )
  }

  const handleDeleteMeal = () => {
    handleConfirmAction(
      "Confirmar Eliminación de Comida",
      `¿Estás seguro de que quieres eliminar completamente la comida "${meal!.name}"? Esta acción es irreversible.`,
      () => {
        deleteMeal(meal!.id)
        onClose()
      }
    )
  }

  const handleSave = () => {
    if (!meal) return

    Object.entries(editedQuantities).forEach(([foodIdStr, newQuantity]) => {
      const foodId = parseInt(foodIdStr, 10)
      
      const originalFood = meal.foods.find(f => f.id === foodId)

      if (originalFood && (originalFood.quantity !== newQuantity || newQuantity === 0)) {
        updateMealFood(meal.id, foodId, newQuantity)
      }
    })

    onClose()
  }

  if (!meal) return null

  const foodsToDisplay = currentFoods.filter(food => {
    const quantity = editedQuantities[food.id];
    return quantity === undefined ? food.quantity > 0 : quantity > 0;
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar {meal?.name}</DialogTitle>
            <DialogDescription>
              Modifica la cantidad en gramos o elimina alimentos. Los datos son por 100g.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {foodsToDisplay.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No quedan alimentos visibles. Presiona Eliminar Comida si deseas borrar el registro.
              </p>
            )}

            {foodsToDisplay.map((food) => {
              const currentQuantity = editedQuantities[food.id] ?? food.quantity
              const totalCalories = Math.round(food.calories * (currentQuantity / 100))

              return (
                <div key={food.id} className="flex items-center space-x-3 border-b pb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{food.name}</p>
                    <p className="text-xs text-muted-foreground">{totalCalories} cal</p>
                  </div>
                  
                  <div className="w-28 flex items-center">
                    <Input
                      type="number"
                      min="0"
                      value={currentQuantity}
                      onChange={(e) => handleQuantityChange(food.id, e.target.value)}
                      className="h-9 text-right pr-1 w-full"
                    />
                    <span className="text-sm ml-1 text-muted-foreground">g</span>
                  </div>

                  <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteFood(food.id)}
                      className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteMeal}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Comida
            </Button>
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-lg text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {confirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executeConfirmedAction} className="bg-red-500 hover:bg-red-600">
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}