import { create } from "zustand"
import { persist } from "zustand/middleware"
import { mockFoods, mockMeals, mockGoals } from "./mock-data"

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

interface MealFood extends Food {
  quantity: number
}

interface Meal {
  id: number
  name: string
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  foods: MealFood[]
  date: string
}

interface UserGoals {
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

  addMeal: (meal: Omit<Meal, "id">) => void
  updateMeal: (id: number, meal: Partial<Meal>) => void
  deleteMeal: (id: number) => void
  setUserGoals: (goals: UserGoals) => void
  setSelectedDate: (date: string) => void
  initializeWithMockData: () => void
  addFoodToMeal: (date: string, mealType: Meal["meal_type"], foodData: Omit<MealFood, "id">) => void
  updateMealFood: (mealId: number, foodId: number, newQuantity: number) => void

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
      foods: mockFoods,


      addMeal: (meal) =>
        set((state) => ({
          meals: [...state.meals, { ...meal, id: Date.now() }],
        })),

      updateMeal: (id, updatedMeal) =>
        set((state) => ({
          meals: state.meals.map((meal) => (meal.id === id ? { ...meal, ...updatedMeal } : meal)),
        })),

      deleteMeal: (id) =>
        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        })),

      setUserGoals: (goals) => set({ userGoals: goals }),

      setSelectedDate: (date) => set({ selectedDate: date }),

      addFoodToMeal: (date, mealType, foodData) => {
        set((state) => {
            const existingMeal = state.meals.find(
                (m) => m.date === date && m.meal_type === mealType
            );
            const newFoodWithId = { ...foodData, id: Date.now() };

            if (existingMeal) {
                const updatedMeals = state.meals.map((meal) =>
                    meal.id === existingMeal.id
                        ? { ...meal, foods: [...meal.foods, newFoodWithId] }
                        : meal
                );
                return { meals: updatedMeals };
            } else {
                const newMeal: Meal = {
                    id: Date.now() + 1,
                    name: mealType.charAt(0).toUpperCase() + mealType.slice(1),
                    meal_type: mealType,
                    date: date,
                    foods: [newFoodWithId],
                };
                return { meals: [...state.meals, newMeal] };
            }
        });
      },

      updateMealFood: (mealId, foodId, newQuantity) => {
        set((state) => ({
          meals: state.meals.map((meal) => {
            if (meal.id === mealId) {
              const updatedFoods = meal.foods
                .map((food) => {
                  if (food.id === foodId) {
                    return newQuantity > 0 ? { ...food, quantity: newQuantity } : null;
                  }
                  return food;
                })
                .filter((food): food is MealFood => food !== null);

              if (updatedFoods.length === 0) {
                return null; 
              }

              return { ...meal, foods: updatedFoods };
            }
            return meal;
          }).filter((meal): meal is Meal => meal !== null)
        }));
      },

      initializeWithMockData: () => {
        const today = new Date().toISOString().split("T")[0]
        const mockMealsWithToday = mockMeals.map((meal) => ({
          id: meal.id,
          name: meal.name,
          meal_type: (meal as Meal).meal_type ?? "breakfast",
          date: today,
          foods: meal.foods.map((food) => ({
            id: food.id,
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            fiber: food.fiber,
            sugar: food.sugar,
            sodium: food.sodium,
            quantity: food.quantity,
          })),
        }))

        set({
          meals: mockMealsWithToday,
          userGoals: {
            ...mockGoals,
            activityLevel: "moderate",
            goal: "maintain",
          },
          foods: mockFoods,
        })
      },

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