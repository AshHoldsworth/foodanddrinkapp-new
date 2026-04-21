import { BeakerIcon, CakeIcon, ShoppingCartIcon } from '@heroicons/react/16/solid'

export const getIcon = ({type, className}: {type: string, className: string}) => {
    let icon = null
  switch (type) {
    case 'Meal':
        icon = <CakeIcon className={className} />
        break
    case 'Drink':
        icon = <BeakerIcon className={className} />
        break
    case 'Ingredient':
        icon = <ShoppingCartIcon className={className} />
        break
    default:
        break
  }

  return icon
}
