import { Food, Ingredient, ApiResponse, AddFoodRequest, AddIngredientRequest, UpdateFoodRequest } from '@/types';

const API_BASE_URL = 'http://localhost:5237'; // Based on your launchSettings.json

// Helper function to handle fetch responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Check if there's an error message in the response body
  if (data.errorMessage) {
    throw new Error(data.errorMessage);
  }
  
  return data;
};

export const foodApi = {
  // Get all food items
  getAllFood: async (): Promise<Food[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/food/all`);
      const data = await handleResponse<ApiResponse<Food[]>>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching all food:', error);
      throw error;
    }
  },

  // Get food by ID
  getFoodById: async (id: string): Promise<Food | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/food?id=${encodeURIComponent(id)}`);
      const data = await handleResponse<ApiResponse<Food>>(response);
      return data.data || null;
    } catch (error) {
      console.error('Error fetching food by ID:', error);
      throw error;
    }
  },

  // Add new food
  addFood: async (food: AddFoodRequest): Promise<Food> => {
    try {
      const formData = new FormData();
      formData.append('name', food.name);
      formData.append('rating', food.rating.toString());
      formData.append('isHealthyOption', food.isHealthyOption.toString());
      formData.append('cost', food.cost.toString());
      formData.append('course', food.course);
      formData.append('difficulty', food.difficulty.toString());
      formData.append('speed', food.speed.toString());
      formData.append('ingredients', JSON.stringify(food.ingredients));

      const response = await fetch(`${API_BASE_URL}/food/add`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await handleResponse<ApiResponse<Food>>(response);
      
      if (!data.data) {
        throw new Error(data.errorMessage || 'Failed to add food');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error adding food:', error);
      throw error;
    }
  },

  // Update food
  updateFood: async (food: UpdateFoodRequest): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('id', food.id);
      if (food.name) formData.append('name', food.name);
      if (food.rating !== undefined) formData.append('rating', food.rating.toString());
      if (food.isHealthyOption !== undefined) formData.append('isHealthyOption', food.isHealthyOption.toString());
      if (food.cost !== undefined) formData.append('cost', food.cost.toString());
      if (food.course) formData.append('course', food.course);
      if (food.difficulty !== undefined) formData.append('difficulty', food.difficulty.toString());
      if (food.speed !== undefined) formData.append('speed', food.speed.toString());
      if (food.ingredients) formData.append('ingredients', JSON.stringify(food.ingredients));

      const response = await fetch(`${API_BASE_URL}/food/update`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await handleResponse<ApiResponse<void>>(response);
      
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
    } catch (error) {
      console.error('Error updating food:', error);
      throw error;
    }
  },
};

export const ingredientApi = {
  // Get all ingredients
  getAllIngredients: async (): Promise<Ingredient[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredient/all`);
      const data = await handleResponse<ApiResponse<Ingredient[]>>(response);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching all ingredients:', error);
      throw error;
    }
  },

  // Add new ingredient
  addIngredient: async (ingredient: AddIngredientRequest): Promise<Ingredient> => {
    try {
      const formData = new FormData();
      formData.append('name', ingredient.name);
      formData.append('rating', ingredient.rating.toString());
      formData.append('isHealthyOption', ingredient.isHealthyOption.toString());
      formData.append('cost', ingredient.cost.toString());
      formData.append('macro', ingredient.macro);
      if (ingredient.barcodes) {
        formData.append('barcodes', JSON.stringify(ingredient.barcodes));
      }

      const response = await fetch(`${API_BASE_URL}/ingredient/add`, {
        method: 'POST',
        body: formData,
      });
      
      await handleResponse<void>(response); // Just check for errors, don't expect data
      
      // Return the ingredient data that was sent, with a generated ID
      return {
        ...ingredient,
        id: crypto.randomUUID(), // Generate a temporary ID for frontend use
      };
    } catch (error) {
      console.error('Error adding ingredient:', error);
      throw error;
    }
  },
};
