"use client"

import { useState, useEffect } from 'react'
import { useMacroStore } from '@/lib/store'
import type { Meal, MealFood } from '@/lib/store' 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface EditMealModalProps {
  isOpen: boolean
  onClose: () => void
  meal: Meal | null
}

export function EditMealModal({ isOpen, onClose, meal }: EditMealModalProps) {
  const { updateMealFoods, deleteMeal } = useMacroStore()
  const [foods, setFoods] = useState<MealFood[]>(meal?.foods || [])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (meal) {
      setFoods(meal.foods)
    } else {
      setFoods([])
    }
  }, [meal])

  const handleQuantityChange = (foodId: string | number, value: string) => {
    const quantity = Number.parseFloat(value)
    setFoods(prevFoods => 
      prevFoods.map(food => 
        food.id === foodId ? { ...food, quantity: quantity >= 0 ? quantity : 0 } : food
      )
    )
  }

  const handleRemoveFood = (foodId: string | number) => {
    setFoods(prevFoods => prevFoods.filter(food => food.id !== foodId))
  }

  const handleSave = async () => {
    if (!meal) return
    setIsSaving(true)
    
    try {
      await updateMealFoods(meal.id, foods)
      
      onClose()
      
    } catch (error) {
      console.error("Error al guardar cambios:", error);
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMeal = async () => {
    if (!meal || !window.confirm(`¿Estás seguro de que quieres eliminar la comida "${meal.name}"?`)) return
    
    setIsDeleting(true)
    try {
      await deleteMeal(meal.id)
      onClose()
    } catch (error) {
      toast.error("Error al eliminar la comida.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!meal) return null

  const activeFoods = foods.filter(f => f.quantity > 0)
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Comida: {meal.name}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeFoods.length === 0 && (
            <p className='text-center text-muted-foreground'>
              Esta comida no tiene alimentos.
              <Button 
                variant="link" 
                onClick={handleDeleteMeal}
                disabled={isDeleting}
                className='text-red-500 hover:text-red-600'
              >
                Eliminar comida
              </Button>
            </p>
          )}

          {activeFoods.map((food) => (
            <div key={food.id} className="flex items-center justify-between space-x-2 border-b pb-2">
              <div className='flex-1'>
                <Label htmlFor={`qty-${food.id}`}>{food.name}</Label>
                <p className='text-xs text-muted-foreground'>{Math.round(food.calories * (food.quantity / 100))} cal</p>
              </div>
              
              <div className='flex items-center space-x-2'>
                <Input
                  id={`qty-${food.id}`}
                  type="number"
                  value={food.quantity}
                  onChange={(e) => handleQuantityChange(food.id, e.target.value)}
                  className="w-20 text-right h-8"
                  min="0"
                  step="1"
                />
                <span className="text-sm">g</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveFood(food.id)}
                  className='p-1 h-8'
                  title="Eliminar alimento de la comida"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className='flex-col sm:flex-col pt-4 space-y-2'>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isDeleting}
            className='w-full'
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDeleteMeal}
            disabled={isDeleting || isSaving}
            className='w-full text-red-500 hover:bg-red-50 hover:text-red-600'
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Eliminar Comida Completa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}