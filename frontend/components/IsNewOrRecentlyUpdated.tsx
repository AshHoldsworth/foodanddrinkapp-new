import { DateInput, isNewOrRecentlyUpdated } from '@/utils/isNewOrRecentlyUpdated'
import { Badge } from './Badge'
import { NEW_LABEL, UPDATED_LABEL } from '@/constants/labels'

interface IsNewOrRecentlyUpdatedProps {
  createdAt: DateInput
  updatedAt: DateInput
}

export const IsNewOrRecentlyUpdated = ({ createdAt, updatedAt }: IsNewOrRecentlyUpdatedProps) => {
  const { isNew, isRecentlyUpdated } = isNewOrRecentlyUpdated(createdAt, updatedAt)

  if (isNew) {
    return <Badge type={NEW_LABEL} />
  } else if (isRecentlyUpdated) {
    return <Badge type={UPDATED_LABEL} />
  } else {
    return null
  }
}
