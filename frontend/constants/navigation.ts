interface NavItem {
  title: string
  href: string
  requiresAdmin?: boolean
}

export const navigation: NavItem[] = [
  { title: 'Meals', href: '/meal' },
  { title: 'Planner', href: '/planner' },
  { title: 'Drinks', href: '/drinks' },
  { title: 'Ingredients', href: '/ingredients' },
  { title: 'Inventory', href: '/inventory' },
  { title: 'Account', href: '/account' },
  { title: 'Admin', href: '/admin/users', requiresAdmin: true },
]
