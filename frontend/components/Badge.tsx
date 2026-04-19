import { COURSE_BADGE_COLOUR, COURSE_OPTIONS, CourseOption, HEALTHY_CHOICE_LABEL, MACRO_BADGE_COLOUR, MACRO_OPTIONS, MacroOption } from '@/constants'
import { toTitleCase } from '@/utils/toTitleCase'
import { XMarkIcon } from '@heroicons/react/16/solid'

interface BadgeProps {
  type: 'new' | 'updated' | MacroOption | CourseOption | typeof HEALTHY_CHOICE_LABEL | undefined
  labelOverride?: string | null
  onCloseClick?: (() => void) | null
}

export const Badge = ({ type, labelOverride = null, onCloseClick = null }: BadgeProps) => {
  const badgeLabel = labelOverride ? labelOverride : type as string
  const formattedBadgeLabel = toTitleCase(badgeLabel)
  let badgeClass = null

  switch (type) {
    case 'new':
    case 'updated':
      badgeClass = 'badge-secondary font-bold'
      break
    case HEALTHY_CHOICE_LABEL:
      badgeClass = 'badge-success font-bold text-base-200'
      break
    case MACRO_OPTIONS.includes(type as MacroOption) ? (type as MacroOption) : null:
      const macroColour = getMacroBadgeClass(type as MacroOption)
      badgeClass = `badge-outline ${macroColour}`
      break
    case COURSE_OPTIONS.includes(type as CourseOption) ? (type as CourseOption) : null:
      const courseColour = getCourseBadgeClass(type as CourseOption)
      badgeClass = `badge-outline ${courseColour}`
      break
    default:
      badgeClass = 'hidden'
  }

  return (
    <div className={`badge ${badgeClass}`}>
      {formattedBadgeLabel}
      {onCloseClick && (
        <XMarkIcon
          className="w-4 h-4 cursor-pointer hover:text-red-500 ml-1"
          onClick={onCloseClick}
        />
      )}
    </div>
  )
}

const getMacroBadgeClass = (macro: MacroOption) => {
  return macro ? MACRO_BADGE_COLOUR[macro] : 'badge-neutral'
}

const getCourseBadgeClass = (course?: CourseOption) => {
  return course ? COURSE_BADGE_COLOUR[course] : 'badge-neutral'
}
