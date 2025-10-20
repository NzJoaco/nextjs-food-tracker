import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "./supabase"
import { toast } from "sonner"

export interface Food {
  id: string | number
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
}

export interface MealFood extends Food {
  quantity: number
}

export interface Meal {
  id: string
  name: string
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  foods: MealFood[]
  date: string
}

export interface UserGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
  activityLevel: string
  goal: string
}

interface MacroStore {
  meals: Meal[]
  userGoals: UserGoals
  selectedDate: string
  foods: Food[]

  loadMeals: (userId: string) => Promise<void>
  addMeal: (newMeal: Omit<Meal, "id">, userId: string) => Promise<void>
  deleteMeal: (mealId: string) => Promise<void>
  updateMealFood: (mealId: string, foodId: string | number, newQuantity: number) => Promise<void>
  updateMeal: (id: string, meal: Partial<Meal>) => void
  setUserGoals: (goals: UserGoals) => void
  setSelectedDate: (date: string) => void

  getDailyTotals: (date: string) => {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  getMealsForDate: (date: string) => Meal[]
}

export const useMacroStore = create<MacroStore>()(
  persist(
    (set, get) => ({
      meals: [],
      userGoals: {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65,
        activityLevel: "moderate",
        goal: "maintain",
      },
      selectedDate: new Date().toISOString().split("T")[0],
      foods: [],

      loadMeals: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from("meals")
            .select("*")
            .eq("user_id", userId)
            .order("date", { ascending: false })
          if (error) throw error
          const loadedMeals: Meal[] = data.map((meal) => ({
              ...meal,
              id: String(meal.id),
              meal_type: meal.meal_type as "breakfast" | "lunch" | "dinner" | "snack",
              foods: meal.foods as MealFood[],
          }))

          set({ meals: loadedMeals })
        } catch (error) {
          console.error("Error cargando comidas:", error)
          toast.error("No se pudieron cargar tus comidas.")
        }
      },

      addMeal: async (newMeal, userId) => {
        const payload = {
          user_id: userId,
          name: newMeal.name,
          meal_type: newMeal.meal_type,
          date: newMeal.date,
          foods: newMeal.foods,
        }

        try {
          const { data, error } = await supabase
            .from("meals")
            .insert([payload])
            .select()

          if (error) throw error

          const savedMeal = data[0]

          const mealWithID: Meal = {
            ...newMeal,
            id: String(savedMeal.id),
          }

          set((state) => ({
            meals: [...state.meals, mealWithID],
          }))
          toast.success("Comida guardada exitosamente.")

        } catch (error) {
          console.error("Error guardando comida:", error)
          toast.error("Error al guardar la comida.")
          throw error
        }
      },

      deleteMeal: async (mealId) => {
        try {
          const { error } = await supabase
            .from("meals")
            .delete()
            .eq("id", mealId)
          if (error) throw error
          set((state) => ({
            meals: state.meals.filter(meal => meal.id !== mealId)
          }))
          toast.success("Comida eliminada.")
        } catch (error) {
          console.error("Error eliminando comida:", error)
          toast.error("Error al eliminar la comida.")
        }
      },
      updateMealFood: async (mealId, foodId, newQuantity) => {
        const meal = get().meals.find(m => m.id === mealId)
        if (!meal) return
        const updatedFoods = meal.foods
          .map(food => {
            if (food.id === foodId) {
              return { ...food, quantity: newQuantity }
            }
            return food
          })
          .filter(food => food.quantity > 0)
        if (updatedFoods.length === 0) {
            await get().deleteMeal(mealId)
            return
        }
        try {
            const { error } = await supabase
              .from("meals")
              .update({ foods: updatedFoods })
              .eq("id", mealId)
            if (error) throw error
            set((state) => ({
                meals: state.meals.map(m =>
                    m.id === mealId ? { ...m, foods: updatedFoods } : m
                )
            }))
            toast.success("Alimento actualizado.")
        } catch (error) {
            console.error("Error actualizando alimento:", error)
            toast.error("Error al actualizar el alimento.")
        }
      },

      updateMeal: (id, updatedMeal) =>
        set((state) => ({
          meals: state.meals.map((meal) => (meal.id === id ? { ...meal, ...updatedMeal } : meal)),
        })),

      setUserGoals: (goals) => set({ userGoals: goals }),

      setSelectedDate: (date) => set({ selectedDate: date }),

      getDailyTotals: (date) => {
        const meals = get().getMealsForDate(date)
        return meals.reduce(
          (totals, meal) => {
            const mealTotals = meal.foods.reduce(
              (mealTotal, food) => ({
                calories: mealTotal.calories + food.calories * (food.quantity / 100),
                protein: mealTotal.protein + food.protein * (food.quantity / 100),
                carbs: mealTotal.carbs + food.carbs * (food.quantity / 100),
                fat: mealTotal.fat + food.fat * (food.quantity / 100),
              }),
              { calories: 0, protein: 0, carbs: 0, fat: 0 },
            )
            return {
              calories: totals.calories + mealTotals.calories,
              protein: totals.protein + mealTotals.protein,
              carbs: totals.carbs + mealTotals.carbs,
              fat: totals.fat + mealTotals.fat,
            }
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 },
        )
      },

      getMealsForDate: (date) => {
        return get().meals.filter((meal) => meal.date === date)
      },
    }),
    {
      name: "macro-tracker-storage",
    },
  ),
)