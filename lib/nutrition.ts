import { RecipeIngredient, NutritionTotals, NutrientKey } from '@/types'

const ZERO_TOTALS: NutritionTotals = {
  energy_kcal: 0,
  protein_g: 0,
  total_fat_g: 0,
  saturated_fat_g: 0,
  trans_fat_g: 0,
  cholesterol_mg: 0,
  sodium_mg: 0,
  total_carb_g: 0,
  dietary_fiber_g: 0,
  total_sugars_g: 0,
  phosphorus_mg: 0,
  potassium_mg: 0,
}

const NUTRIENT_KEYS: NutrientKey[] = [
  'energy_kcal',
  'protein_g',
  'total_fat_g',
  'saturated_fat_g',
  'trans_fat_g',
  'cholesterol_mg',
  'sodium_mg',
  'total_carb_g',
  'dietary_fiber_g',
  'total_sugars_g',
  'phosphorus_mg',
  'potassium_mg',
]

/**
 * USDA data is per 100g. We divide by 100 to get per 1g,
 * then multiply by the actual grams in the recipe.
 * We sum across all ingredients to get dish-level nutrition.
 */
export function calculateNutrition(ingredients: RecipeIngredient[]): NutritionTotals {
  const totals = { ...ZERO_TOTALS }

  for (const ri of ingredients) {
    const { ingredient, amount_g } = ri
    const factor = amount_g / 100 // USDA is per 100g

    for (const key of NUTRIENT_KEYS) {
      const val = ingredient[key]
      if (val != null) {
        totals[key] += val * factor
      }
    }
  }

  // Round to 2 decimal places
  for (const key of NUTRIENT_KEYS) {
    totals[key] = Math.round(totals[key] * 100) / 100
  }

  return totals
}

export function scaleNutrition(totals: NutritionTotals, servings: number): NutritionTotals {
  const scaled = { ...ZERO_TOTALS }
  for (const key of NUTRIENT_KEYS) {
    scaled[key] = Math.round(totals[key] * servings * 100) / 100
  }
  return scaled
}
