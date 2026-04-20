export type ShoppingListItem = {
  ingredientId: string
  ingredientName: string
  quantity: number
  isPurchased: boolean
  purchasedAt: string | null
}

export type ShoppingList = {
  id: string
  startDate: string
  endDate: string
  items: ShoppingListItem[]
  isCompleted: boolean
  completedAt: string | null
  completedBy: string | null
  createdAt: string
  lastModifiedBy: string | null
  lastModifiedAt: string | null
}
