export interface BaseConsumable {
  id: string;
  name: string;
  rating: number;
  isHealthyOption: boolean;
  cost: number;
}

export interface Ingredient extends BaseConsumable {
  macro: string;
  barcodes?: string[];
}

export interface Food extends BaseConsumable {
  ingredients: Ingredient[];
  course: string;
  difficulty: number;
  speed: number;
}

export interface ApiResponse<T> {
  data?: T;
  errorMessage?: string;
}

export interface AddFoodRequest {
  name: string;
  rating: number;
  isHealthyOption: boolean;
  cost: number;
  course: string;
  difficulty: number;
  speed: number;
  ingredients: Ingredient[];
}

export interface AddIngredientRequest {
  name: string;
  rating: number;
  isHealthyOption: boolean;
  cost: number;
  macro: string;
  barcodes?: string[];
}

export interface UpdateFoodRequest {
  id: string;
  name?: string;
  rating?: number;
  isHealthyOption?: boolean;
  cost?: number;
  course?: string;
  difficulty?: number;
  speed?: number;
  ingredients?: Ingredient[];
}

export interface UpdateIngredientRequest {
  id: string;
  name?: string;
  rating?: number;
  isHealthyOption?: boolean;
  cost?: number;
  macro?: string;
  barcodes?: string[];
}
