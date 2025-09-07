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
      const response = await fetch(`${API_BASE_URL}/food/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(food),
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
      const response = await fetch(`${API_BASE_URL}/food/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(food),
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

  // Delete food
  deleteFood: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/food?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      
      await handleResponse<ApiResponse<void>>(response);
    } catch (error) {
      console.error('Error deleting food:', error);
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

  // Delete ingredient
  deleteIngredient: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredient/delete?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      
      await handleResponse<void>(response); // Just check for errors
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  },
};
