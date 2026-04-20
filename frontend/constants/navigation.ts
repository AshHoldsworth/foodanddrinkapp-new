interface NavItem {
  title: string
  href: string
  requiresAdmin?: boolean
}

export const navigation: NavItem[] = [
  { title: 'Meals', href: '/meal' },
  { title: 'Drinks', href: '/drinks' },
  { title: 'Ingredients', href: '/ingredients' },
  { title: 'Inventory', href: '/admin/inventory', requiresAdmin: true },
  { title: 'Account', href: '/account' },
  { title: 'Admin', href: '/admin/users', requiresAdmin: true },
]
