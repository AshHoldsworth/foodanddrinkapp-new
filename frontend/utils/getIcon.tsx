import { BeakerIcon, CakeIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { JSX } from 'react/jsx-dev-runtime'

export const getIcon = ({ type, className }: { type: string; className: string }): JSX.Element => {
  const normalisedType = type.toLowerCase()
  let icon: JSX.Element = <></>
  switch (normalisedType) {
    case 'meal':
      icon = <CakeIcon className={className} />
      break
    case 'drink':
      icon = <BeakerIcon className={className} />
      break
    case 'ingredient':
      icon = <ShoppingCartIcon className={className} />
      break
  }

  return icon
}
