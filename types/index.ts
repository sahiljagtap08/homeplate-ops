export interface Ingredient {
  id: string
  fdc_id: number
  name: string
  data_type: string | null
  energy_kcal: number | null
  protein_g: number | null
  total_fat_g: number | null
  saturated_fat_g: number | null
  trans_fat_g: number | null
  cholesterol_mg: number | null
  sodium_mg: number | null
  total_carb_g: number | null
  dietary_fiber_g: number | null
  total_sugars_g: number | null
  phosphorus_mg: number | null
  potassium_mg: number | null
  created_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  ingredient_id: string
  amount_g: number
  ingredient: Ingredient
}

export interface Recipe {
  id: string
  name: string
  description: string | null
  servings: number
  created_at: string
  updated_at: string
  recipe_ingredients?: RecipeIngredient[]
}

export interface DietaryCondition {
  id: string
  name: string
  metric: NutrientKey
  operator: '<' | '>'
  threshold: number
  description: string | null
  created_at: string
}

export interface WeeklyPlan {
  id: string
  week_start: string
  created_at: string
  weekly_plan_items?: WeeklyPlanItem[]
}

export interface WeeklyPlanItem {
  id: string
  plan_id: string
  recipe_id: string
  servings: number
  recipe?: Recipe
}

export type NutrientKey =
  | 'energy_kcal'
  | 'protein_g'
  | 'total_fat_g'
  | 'saturated_fat_g'
  | 'trans_fat_g'
  | 'cholesterol_mg'
  | 'sodium_mg'
  | 'total_carb_g'
  | 'dietary_fiber_g'
  | 'total_sugars_g'
  | 'phosphorus_mg'
  | 'potassium_mg'

export interface NutritionTotals {
  energy_kcal: number
  protein_g: number
  total_fat_g: number
  saturated_fat_g: number
  trans_fat_g: number
  cholesterol_mg: number
  sodium_mg: number
  total_carb_g: number
  dietary_fiber_g: number
  total_sugars_g: number
  phosphorus_mg: number
  potassium_mg: number
}

export interface ConditionResult {
  condition: DietaryCondition
  value: number
  passes: boolean
}

export interface UsdaSearchResult {
  fdcId: number
  description: string
  dataType: string
  brandOwner?: string
  foodCategory?: string
}

export interface ShoppingItem {
  ingredientName: string
  totalGrams: number
  recipes: { recipeName: string; servings: number; amountG: number }[]
}

export const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  energy_kcal: 'Calories (kcal)',
  protein_g: 'Protein (g)',
  total_fat_g: 'Total Fat (g)',
  saturated_fat_g: 'Saturated Fat (g)',
  trans_fat_g: 'Trans Fat (g)',
  cholesterol_mg: 'Cholesterol (mg)',
  sodium_mg: 'Sodium (mg)',
  total_carb_g: 'Total Carbs (g)',
  dietary_fiber_g: 'Dietary Fiber (g)',
  total_sugars_g: 'Total Sugars (g)',
  phosphorus_mg: 'Phosphorus (mg)',
  potassium_mg: 'Potassium (mg)',
}
