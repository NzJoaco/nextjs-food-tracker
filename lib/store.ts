import { create } from 'zustand';
import { supabase } from './supabase';
import { toast } from 'sonner';

export interface MealFood {
  id: string | number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  quantity: number;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: MealFood[];
  date: string; 
}

export interface CustomMeal {
  id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: MealFood[];
}

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  activityLevel: string;
  goal: string;
}

interface MacroState {
  meals: Meal[];
  userGoals: UserGoals;
  loading: boolean;
  loadMeals: (userId: string) => Promise<void>;
  getDailyTotals: (date: string) => { calories: number; protein: number; carbs: number; fat: number };
  getMealsForDate: (date: string) => Meal[];
  addCustomMealToLog: (userId: string, date: string, customMeal: CustomMeal) => Promise<void>;
  updateMealFoods: (mealId: string, updatedFoods: MealFood[]) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  setUserGoals: (goals: UserGoals) => void;
}


export const useMacroStore = create<MacroState>((set, get) => ({
  meals: [],
  userGoals: {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    activityLevel: "moderate",
    goal: "maintain",
  },
  loading: true,
  loadMeals: async (userId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      set({ meals: data || [] });
    } catch (error) {
      toast.error("No se pudieron cargar las comidas.");
    } finally {
      set({ loading: false });
    }
  },
  addCustomMealToLog: async (userId: string, date: string, customMeal: CustomMeal) => {
    const newMealPayload = {
      user_id: userId,
      date: date,
      name: customMeal.name,
      meal_type: customMeal.meal_type,
      foods: customMeal.foods,
    };

    try {
      const { data, error } = await supabase
        .from('meals')
        .insert(newMealPayload)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ meals: [...state.meals, data] }));
    } catch (error) {
      toast.error(`Error al agregar "${customMeal.name}" a tu registro.`);
      console.error("Error en addCustomMealToLog:", error);
    }
  },

  updateMealFoods: async (mealId, updatedFoods) => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .update({ foods: updatedFoods })
        .eq('id', mealId)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        meals: state.meals.map(m => (m.id === mealId ? data : m)),
      }));
      toast.success("Comida actualizada correctamente.");
    } catch (error) {
      toast.error("Error al actualizar la comida.");
    }
  },
  deleteMeal: async (mealId) => {
    try {
      const { error } = await supabase.from('meals').delete().eq('id', mealId);
      if (error) throw error;

      set(state => ({
        meals: state.meals.filter(m => m.id !== mealId),
      }));
      toast.success("Comida eliminada.");
    } catch (error) {
      toast.error("Error al eliminar la comida.");
    }
  },
  setUserGoals: (goals) => set({ userGoals: goals }),
  getDailyTotals: (date) => {
    const todaysMeals = get().meals.filter(m => m.date === date);
    return todaysMeals.reduce(
      (totals, meal) => {
        meal.foods.forEach(food => {
          const ratio = food.quantity / 100;
          totals.calories += food.calories * ratio;
          totals.protein += food.protein * ratio;
          totals.carbs += food.carbs * ratio;
          totals.fat += food.fat * ratio;
        });
        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  },
  getMealsForDate: (date) => {
    return get().meals.filter(m => m.date === date);
  },
}));
