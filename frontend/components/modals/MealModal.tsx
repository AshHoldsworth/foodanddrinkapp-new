import { useEffect, useRef, useState } from 'react'
import { Toggle } from '../selectors/Toggle'
import { Select } from '../selectors/Select'
import { StepperInput } from '../selectors/StepperInput'
import { NewMealRequest, postNewMeal, updateMeal, UpdateMealRequest } from '@/app/api/mealsApi'
import { getIngredientData } from '@/app/api/ingredientApi'
import { COURSE_OPTIONS, CourseOption, HEALTHY_CHOICE_LABEL, MEAL_LABEL } from '@/constants'
import { Ingredient, MealIngredient } from '@/models'
import { getMacroOrder } from '@/utils/macroOrder'
import { savePendingAlert } from '@/utils/pendingAlert'
import { MealModalProps } from './interfaces/mealAndIngredientModals'
import { Button } from '../Button'
import { IngredientSearch } from '../selectors/IngredientSearch'
import { ModalFormShell } from './ModalFormShell'
import { MACRO_BG_CLASS } from '@/constants'
import { XMarkIcon } from '@heroicons/react/16/solid'
import { orderIngredients } from '@/utils/orderIngredients'

const ingredientExists = (values: MealIngredient[], ingredientId: string) => {
  return values.some((ingredient) => ingredient.ingredientId === ingredientId)
}

export const MealModal = ({ setOpen, setAlertProps, initialValues, onSuccess }: MealModalProps) => {
  const isEditing = initialValues !== undefined
  const [name, setName] = useState<string>(initialValues?.name ?? '')
  const [isHealthyOption, setIsHealthyOption] = useState<boolean>(
    initialValues?.isHealthyOption ?? false,
  )
  const [course, setCourse] = useState<CourseOption>(initialValues?.course ?? COURSE_OPTIONS[0])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [ingredients, setIngredients] = useState<MealIngredient[]>(initialValues?.ingredients ?? [])
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([])
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const ingredientListEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (ingredients.length === 0) return

    ingredientListEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [ingredients])

  useEffect(() => {
    const fetchIngredients = async () => {
      const { ingredients: data } = await getIngredientData()
      setAvailableIngredients(data ?? [])
    }

    void fetchIngredients()
  }, [])

  useEffect(() => {
    if (availableIngredients.length === 0) return

    setIngredients((previousIngredients) =>
      previousIngredients.map((ingredient) => {
        if (ingredient.macro) return ingredient

        const match = availableIngredients.find((item) => item.name === ingredient.name)
        if (!match) return ingredient

        return {
          ...ingredient,
          macro: match.macro,
        }
      }),
    )
  }, [availableIngredients])

  const onHealthyToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsHealthyOption(e.target.checked)
  }

  const onAlertCloseClick = () => {
    setAlertProps(undefined)
  }

  const onAddIngredient = (ingredient: Ingredient) => {
    if (ingredientExists(ingredients, ingredient.id)) return

    setIngredients([
      ...ingredients,
      {
        ingredientId: ingredient.id,
        name: ingredient.name,
        macro: ingredient.macro,
        quantity: 1,
        uoM: ingredient.uoM,
      },
    ])
  }

  const handleSuccess = (successMessage: string) => {
    setOpen(false)

    const successAlert = {
      type: 'success' as const,
      message: successMessage,
      onCloseClick: onAlertCloseClick,
    }

    setAlertProps(successAlert)

    if (onSuccess) {
      onSuccess()
      return
    }

    savePendingAlert({ type: 'success', message: successMessage })
    window.location.reload()
  }

  const handleRequestError = (errorMessage: string | null, fallbackMessage: string) => {
    setAlertProps({
      type: 'error',
      message: errorMessage ?? fallbackMessage,
      onCloseClick: onAlertCloseClick,
    })
  }

  const onSubmit = async () => {
    if (name.trim() === '') {
      setAlertProps({
        type: 'warning',
        message: 'Name cannot be blank',
        onCloseClick: onAlertCloseClick,
      })
      return
    }

    if (ingredients.length === 0) {
      setAlertProps({
        type: 'warning',
        message: 'At least one ingredient must be added',
        onCloseClick: onAlertCloseClick,
      })
      return
    }

    const mealPayload: NewMealRequest | UpdateMealRequest = {
      ...(isEditing ? { id: initialValues.id } : {}),
      name,
      isHealthyOption,
      course,
      ingredients,
      imageFile,
    }

    const { status, errorMessage } = isEditing
      ? await updateMeal(mealPayload as UpdateMealRequest)
      : await postNewMeal(mealPayload as NewMealRequest)

    if (status !== 200) {
      handleRequestError(errorMessage, 'Failed to save meal')
    } else {
      handleSuccess(isEditing ? 'Meal updated.' : 'Meal added.')
    }
  }

  const orderedIngredients = orderIngredients(ingredients)

  const title = isEditing ? `Edit ${MEAL_LABEL}` : `Add New ${MEAL_LABEL}`
  const primaryLabel = isEditing ? `Save ${MEAL_LABEL}` : `Add ${MEAL_LABEL}`

  return (
    <ModalFormShell
      title={title}
      primaryButtonLabel={primaryLabel}
      onPrimaryClick={() => void onSubmit()}
      onCancel={() => setOpen(false)}
      overlayTestId="meal-modal-overlay"
      backdropTestId="meal-modal-backdrop"
      contentTestId="meal-modal-content"
    >
      <div className="flex gap-3 items-center">
        <legend className="fieldset-legend">Name</legend>
        <input
          ref={nameInputRef}
          type="text"
          placeholder={`${MEAL_LABEL} Name`}
          className="input input-bordered grow"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.currentTarget.blur()
            }
          }}
        />
        <Toggle
          label={HEALTHY_CHOICE_LABEL}
          checked={isHealthyOption}
          onChange={onHealthyToggleChange}
          className="flex-row"
        />
      </div>

      <div className="mb-3">
        <legend className="fieldset-legend">Image</legend>
        <input
          type="file"
          accept="image/*"
          className="file-input file-input-bordered w-full"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
        />
        <p className="text-xs mt-1 text-gray-500">
          {isEditing
            ? 'Leave this blank to keep the current image, or choose a new image to replace it.'
            : 'You can take a picture or choose one from your library.'}
        </p>
        {imageFile && <p className="text-xs mt-1">Selected: {imageFile.name}</p>}
      </div>

      <Select
        label="Course"
        value={course}
        className="mb-3"
        onChange={(value: string) => setCourse(value as CourseOption)}
        options={COURSE_OPTIONS.map((opt) => ({ label: opt, value: opt }))}
      />

      <>
        <IngredientSearch
          label="Add Ingredient"
          onIngredientSelected={onAddIngredient}
          excludedIngredientNames={ingredients.map((ingredient) => ingredient.name)}
          onSearchError={(errorMessage) =>
            setAlertProps({
              type: 'error',
              message: errorMessage,
              onCloseClick: onAlertCloseClick,
            })
          }
        />
        {orderedIngredients.length > 0 && (
          <div className="mt-3 space-y-2 border border-base-300 rounded-box p-3">
            <div className="flex items-center justify-between mb-1">
              <legend className="text-sm font-semibold">Ingredients</legend>
              <Button variant="ghost" size="xs" tone="error" onClick={() => setIngredients([])}>
                Clear all
              </Button>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {orderedIngredients.map(({ ingredient, originalIndex }) => {
                const style = `flex ${MACRO_BG_CLASS[ingredient.macro]} rounded p-2 items-center`
                return (
                  <div key={`${originalIndex}-${ingredient.name}`} className={style}>
                    <p className="text-sm font-bold flex-1">{ingredient.name}</p>
                    <div className="flex items-center gap-2">
                      <StepperInput
                        value={ingredient.quantity ?? 1}
                        min={1}
                        onChange={(qty) =>
                          setIngredients((prev) =>
                            prev.map((item, idx) =>
                              idx === originalIndex ? { ...item, quantity: qty } : item,
                            ),
                          )
                        }
                      />
                      <span className="text-sm min-w-12 text-center">{ingredient.uoM}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() =>
                        setIngredients((prev) => prev.filter((_, idx) => idx !== originalIndex))
                      }
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        <div ref={ingredientListEndRef} />
      </>
    </ModalFormShell>
  )
}
