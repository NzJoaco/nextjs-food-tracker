const API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY;
const ENDPOINT = "https://api.nal.usda.gov/fdc/v1/foods/search";

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


export async function fetchUsdaData(query: string): Promise<Food[]> {
    if (!API_KEY) {
        console.error("La clave de API de USDA FDC no está configurada.");
        return [];
    }

    const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&api_key=${API_KEY}&pageSize=10`;
    
    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error("Error en la API de USDA FDC:", response.statusText);
            return [];
        }

        const data = await response.json();
        
        if (!data.foods || data.foods.length === 0) {
            return [];
        }

        interface UsdaFoodNutrient {
            nutrientName: string;
            value: number;
        }

        interface UsdaFoodItem {
            fdcId: string | number;
            description: string;
            foodNutrients: UsdaFoodNutrient[];
        }

        const foods: Food[] = data.foods.map((foodItem: UsdaFoodItem) => {
            
            const getNutrientValue = (nutrientName: string) => {
                const nutrient = foodItem.foodNutrients?.find((n: UsdaFoodNutrient) => n.nutrientName === nutrientName);
                return nutrient ? nutrient.value : 0;
            };

            const nameEnglish = foodItem.description || "Unknown Food";
            
            return {
                id: foodItem.fdcId, 
                name: nameEnglish, 
                
                calories: getNutrientValue("Energy") || 0, 
                protein: getNutrientValue("Protein") || 0,
                carbs: getNutrientValue("Carbohydrate, by difference") || 0,
                fat: getNutrientValue("Total lipid (fat)") || 0,
                fiber: getNutrientValue("Fiber, total dietary") || 0,
                sugar: getNutrientValue("Sugars, total including NLEA") || 0,
                sodium: getNutrientValue("Sodium, Na") || 0, 
                quantity: 100, 
            };
        });

        return foods;

    } catch (error) {
        console.error("Error al obtener datos de USDA FDC:", error);
        return [];
    }
}