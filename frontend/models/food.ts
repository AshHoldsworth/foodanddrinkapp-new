export type Food = {
    id: string;
    name: string;
    rating: 1 | 2 | 3;
    isHealthyOption: boolean;
    cost: 1 | 2 | 3;
    course: string;
    difficulty: 1 | 2 | 3;
    speed: 1 | 2 | 3;
    ingredients: string[];
    createdAt: Date;
    updatedAt: Date | null;
};
