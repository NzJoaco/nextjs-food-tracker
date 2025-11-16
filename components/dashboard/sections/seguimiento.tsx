"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context" 
import { useMacroStore, type Meal } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus, Utensils, Edit } from "lucide-react"
import { AddFoodModal } from "@/components/custom/AddFoodModal" 
import { EditMealModal } from "@/components/custom/EditMealModal"

export function SeguimientoSection() {
    const { user } = useAuth()
    const { 
        meals, 
        userGoals, 
        getDailyTotals, 
        getMealsForDate, 
        loadMeals
    } = useMacroStore()

    const today = new Date().toISOString().split("T")[0]
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null) 

    useEffect(() => {
        if (user && user.id) {
            loadMeals(user.id)
        } else if (user === null) {
        }
    }, [user, loadMeals])

    const getProgressPercentage = (consumed: number, goal: number) => {
        return Math.min((consumed / goal) * 100, 100)
    }

    const getRemainingCalories = () => {
        const consumed = getDailyTotals(today)
        return Math.max(userGoals.calories - consumed.calories, 0)
    }

    const openEditModal = (meal: Meal) => {
      setSelectedMeal(meal)
      setIsEditModalOpen(true)
    }

    const closeEditModal = () => {
      setIsEditModalOpen(false)
      setSelectedMeal(null)
    }

    const consumed = getDailyTotals(today)
    const todaysMeals = getMealsForDate(today)

    return (
        <div className="space-y-6">
            
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Seguimiento Diario</h1>
                    <p className="text-muted-foreground">
                        Hoy,{" "}
                        {new Date().toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Comida
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Calorías</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(consumed.calories)}</div>
                        <div className="text-sm text-muted-foreground">de {userGoals.calories}</div>
                        <Progress value={getProgressPercentage(consumed.calories, userGoals.calories)} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Proteínas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(consumed.protein)}g</div>
                        <div className="text-sm text-muted-foreground">de {userGoals.protein}g</div>
                        <Progress value={getProgressPercentage(consumed.protein, userGoals.protein)} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Carbohidratos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(consumed.carbs)}g</div>
                        <div className="text-sm text-muted-foreground">de {userGoals.carbs}g</div>
                        <Progress value={getProgressPercentage(consumed.carbs, userGoals.carbs)} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Grasas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(consumed.fat)}g</div>
                        <div className="text-sm text-muted-foreground">de {userGoals.fat}g</div>
                        <Progress value={getProgressPercentage(consumed.fat, userGoals.fat)} className="mt-2" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{Math.round(getRemainingCalories())}</div>
                        <div className="text-muted-foreground">calorías restantes</div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Utensils className="mr-2 h-5 w-5" />
                        Comidas de Hoy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {todaysMeals.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                {!user 
                                    ? "Inicia sesión para ver y guardar tus comidas."
                                    : "No has registrado comidas para hoy. ¡Comienza agregando una!"
                                }
                            </p>
                        ) : (
                            todaysMeals.map((meal) => {
                                const mealCalories = meal.foods.reduce(
                                    (total, food) => total + food.calories * (food.quantity / 100),
                                    0,
                                )
                                return (
                                    <div key={meal.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                                        <div>
                                            <h3 className="font-medium">{meal.name}</h3>
                                            <p className="text-sm text-muted-foreground">{meal.foods.map((food) => food.name).join(", ")}</p>
                                        </div>
                                        <div className="text-right flex items-center space-x-2">
                                            <div className="font-medium">{Math.round(mealCalories)} cal</div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => openEditModal(meal)}
                                                className="p-2 h-8"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })
                        )}

                        <Button 
                            variant="outline" 
                            className="w-full bg-transparent"
                            onClick={() => setIsAddModalOpen(true)}
                            disabled={!user}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Nueva Comida
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <AddFoodModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                currentDate={today}
            />

            <EditMealModal
              isOpen={isEditModalOpen}
              onClose={closeEditModal}
              meal={selectedMeal}
            />
        </div>
    )
}