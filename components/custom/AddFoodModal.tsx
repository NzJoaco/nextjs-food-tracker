"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMacroStore } from "@/lib/store";
import { fetchUsdaData } from "@/app/api/nutrition/usda-api"; 

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface FoodData {
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

interface AddFoodModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentDate: string;
}

export function AddFoodModal({ isOpen, onClose, currentDate }: AddFoodModalProps) {
    const { addFoodToMeal } = useMacroStore();
    
    const [query, setQuery] = useState("");
    const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<FoodData[]>([]);

    const handleSearch = async () => {
        if (!query.trim()) {
            setError("Por favor, ingresa un alimento y cantidad (ej: manzana, 100g de arroz).");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSearchResults([]);

        try {
            const foods = await fetchUsdaData(query);

            if (foods.length > 0) {
                setSearchResults(foods);
            } else {
                setError(`No se encontraron resultados para "${query}". Intenta términos más amplios.`);
            }
        } catch (err) {
            setError("Ocurrió un error al buscar el alimento. Verifica la clave API.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAndAdd = (foodData: FoodData) => {
        addFoodToMeal(currentDate, selectedMealType, {
            name: foodData.name,
            calories: foodData.calories,
            protein: foodData.protein,
            carbs: foodData.carbs,
            fat: foodData.fat,
            fiber: foodData.fiber,
            sugar: foodData.sugar,
            sodium: foodData.sodium,
            quantity: foodData.quantity,
        });
        
        setQuery("");
        setSearchResults([]);
        onClose();
    };

    const handleClose = () => {
        setQuery("");
        setSearchResults([]);
        setError(null);
        setIsLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Agregar Alimento</DialogTitle>
                    <DialogDescription>
                        Describe el alimento para buscar (ej: apple, pechuga de pollo)
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="meal-type">Añadir a:</Label>
                        <select
                            id="meal-type"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedMealType}
                            onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                        >
                            <option value="breakfast">Desayuno</option>
                            <option value="lunch">Almuerzo</option>
                            <option value="dinner">Cena</option>
                            <option value="snack">Snack</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="query">Búsqueda (Inglés/Español)</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="query"
                                placeholder="Ej: Salmon, arroz blanco, Chicken Breast"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                disabled={isLoading}
                            />
                            <Button onClick={handleSearch} disabled={isLoading} variant="secondary">
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                    
                    {searchResults.length > 0 && (
                        <div className="mt-4 space-y-3">
                            <h3 className="text-md font-semibold border-b pb-1">Selecciona un Alimento (Datos por 100g)</h3>
                            {searchResults.map((food, index) => (
                                <Card key={index} className="border-green-300">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <p className="font-bold text-lg">{food.name}</p>
                                            <p className="text-sm text-primary font-medium">{Math.round(food.calories)} cal / 100g</p>
                                            <div className="flex space-x-4 text-xs mt-1 text-muted-foreground">
                                                <span>P: {Math.round(food.protein)}g</span>
                                                <span>C: {Math.round(food.carbs)}g</span>
                                                <span>G: {Math.round(food.fat)}g</span>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => handleSelectAndAdd(food)} 
                                            variant="default" 
                                            size="sm"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1"/> Añadir
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}