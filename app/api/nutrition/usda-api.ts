const APP_ID = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_ID;
const API_KEY = process.env.NEXT_PUBLIC_NUTRITIONIX_API_KEY;


interface Food {
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

export async function fetchNutritionixData(query: string): Promise<Food[]> {
  if (!APP_ID || !API_KEY) {
    console.error("Claves de API de Nutritionix (ID o KEY) no configuradas.");
    return [];
  }

  const ENDPOINT = "https://trackapi.nutritionix.com/v2/natural/nutrients";

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": APP_ID,
        "x-app-key": API_KEY,
      },
      body: JSON.stringify({
        query: query,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error en la API de Nutritionix:", errorData);
      return [];
    }

    const data = await response.json();

    interface NutritionixFood {
      nix_item_id?: string;
      food_name?: string;
      nf_calories?: number;
      nf_protein?: number;
      nf_total_carbohydrate?: number;
      nf_total_fat?: number;
      nf_dietary_fiber?: number;
      nf_sugars?: number;
      nf_sodium?: number;
      serving_weight_grams?: number;
    }

    const foods: Food[] = data.foods.map((food: NutritionixFood) => ({
      id: food.nix_item_id || Math.random().toString(36).substring(2, 9),
      name: food.food_name || 'Alimento Desconocido',
      calories: food.nf_calories || 0,
      protein: food.nf_protein || 0,
      carbs: food.nf_total_carbohydrate || 0,
      fat: food.nf_total_fat || 0,
      fiber: food.nf_dietary_fiber || 0,
      sugar: food.nf_sugars || 0,
      sodium: food.nf_sodium || 0, 
      quantity: food.serving_weight_grams || 100, 
    }));

    return foods;

  } catch (error) {
    console.error("Error al obtener datos de Nutritionix:", error);
    return [];
  }
}