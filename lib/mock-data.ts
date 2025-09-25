
export const mockFoods = [
  {
    id: 1,
    name: "Pollo a la plancha",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    sugar: 0,
    sodium: 74,
  },
  {
    id: 2,
    name: "Arroz blanco",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    sugar: 0.1,
    sodium: 1,
  },
  {
    id: 3,
    name: "Brócoli",
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    sugar: 1.5,
    sodium: 33,
  },
  {
    id: 4,
    name: "Salmón",
    calories: 208,
    protein: 22,
    carbs: 0,
    fat: 12,
    fiber: 0,
    sugar: 0,
    sodium: 59,
  },
  {
    id: 5,
    name: "Avena",
    calories: 389,
    protein: 16.9,
    carbs: 66,
    fat: 6.9,
    fiber: 10.6,
    sugar: 0,
    sodium: 2,
  },
  {
    id: 6,
    name: "Plátano",
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12,
    sodium: 1,
  },
  {
    id: 7,
    name: "Huevo",
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    sugar: 1.1,
    sodium: 124,
  },
  {
    id: 8,
    name: "Almendras",
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    fiber: 12,
    sugar: 4,
    sodium: 1,
  },
]

export const mockMeals = [
  {
    id: 1,
    name: "Desayuno",
    foods: [
      { ...mockFoods[4], quantity: 50 }, // Avena
      { ...mockFoods[5], quantity: 100 }, // Plátano
      { ...mockFoods[7], quantity: 30 }, // Almendras
    ],
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: 2,
    name: "Almuerzo",
    foods: [
      { ...mockFoods[0], quantity: 150 }, // Pollo
      { ...mockFoods[1], quantity: 100 }, // Arroz
      { ...mockFoods[2], quantity: 150 }, // Brócoli
    ],
    date: new Date().toISOString().split("T")[0],
  },
]

export const mockGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
}
