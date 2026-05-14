import { useEffect, useRef, useState } from 'react'
import { Toggle } from '../selectors/Toggle'
import { Select } from '../selectors/Select'
import { RangeSelector } from '../selectors/RangeSelector'
import { StepperInput } from '../selectors/StepperInput'
import { NewMealRequest, postNewMeal, updateMeal, UpdateMealRequest } from '@/app/api/mealsApi'
import { getIngredientData } from '@/app/api/ingredientApi'
import {
  COST_OPTIONS,
  COURSE_OPTIONS,
  CourseOption,
  DIFFICULTY_OPTIONS,
  HEALTHY_CHOICE_LABEL,
  MEAL_LABEL,
  RATING_FILTER_OPTIONS,
  SPEED_OPTIONS,
} from '@/constants'
import { Cost, Difficulty, Ingredient, Rating, MealIngredient, Speed } from '@/models'
import { getMacroOrder } from '@/utils/macroOrder'
import { savePendingAlert } from '@/utils/pendingAlert'
import { MealModalProps } from './interfaces/mealAndIngredientModals'
import { Button } from '../Button'
import { IngredientSearch } from '../selectors/IngredientSearch'
import { ModalFormShell } from './ModalFormShell'

const ingredientExists = (values: MealIngredient[], ingredientId: string) => {
  return values.some((ingredient) => ingredient.ingredientId === ingredientId)
}

export const MealModal = ({ setOpen, setAlertProps, initialValues, onSuccess }: MealModalProps) => {
  const isEditing = initialValues !== undefined
  const [name, setName] = useState<string>(initialValues?.name ?? '')
  const [isHealthyOption, setIsHealthyOption] = useState<boolean>(
    initialValues?.isHealthyOption ?? false,
  )
  const [cost, setCost] = useState<Cost>(initialValues?.cost ?? 1)
  const [rating, setRating] = useState<Rating>(initialValues?.rating ?? 5)
  const [speed, setSpeed] = useState<Speed>(initialValues?.speed ?? 1)
  const [course, setCourse] = useState<CourseOption>(initialValues?.course ?? COURSE_OPTIONS[0])
  const [difficulty, setDifficulty] = useState<Difficulty>(initialValues?.difficulty ?? 2)
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
      rating,
      isHealthyOption,
      cost,
      course,
      difficulty,
      speed,
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

  const orderedIngredients = ingredients
    .map((ingredient, originalIndex) => ({ ingredient, originalIndex }))
    .sort((a, b) => {
      const macroOrderDifference =
        getMacroOrder(a.ingredient.macro) - getMacroOrder(b.ingredient.macro)
      if (macroOrderDifference !== 0) return macroOrderDifference

      const nameDifference = a.ingredient.name.localeCompare(b.ingredient.name)
      if (nameDifference !== 0) return nameDifference

      return a.originalIndex - b.originalIndex
    })

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
      <div className="flex gap-3 mb-2 items-center">
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
          className="flex items-start font-bold"
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

      <RangeSelector
        label="Rating"
        min={1}
        max={10}
        step={1}
        options={RATING_FILTER_OPTIONS}
        value={rating}
        onChange={(value: number) => setRating(value as Rating)}
        className="mb-3"
      />

      <div className="flex flex-col sm:flex-row w-full gap-2 justify-between">
        <Select
          label="Cost"
          value={cost}
          onChange={(value: string) => setCost(Number(value) as Cost)}
          options={COST_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
        />

        <div className="flex gap-3 mb-2 items-center grow">
          <label className="fieldset-legend">Speed</label>
          <Select
            defaultValue={String(speed)}
            onChange={(value: string) => setSpeed(Number(value) as Speed)}
            options={SPEED_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
          />
        </div>

        <div className="flex gap-3 mb-2 items-center grow">
          <Select
            label="Course"
            value={course}
            onChange={(value: string) => setCourse(value as CourseOption)}
            options={COURSE_OPTIONS.map((opt) => ({ label: opt, value: opt }))}
          />
        </div>
      </div>

      <div className="mb-2">
        <RangeSelector
          label="Difficulty"
          min={1}
          max={3}
          step={1}
          options={DIFFICULTY_OPTIONS.map((opt) => opt.label)}
          value={difficulty}
          onChange={(value: number) => setDifficulty(Number(value) as Difficulty)}
          className="mb-3"
        />
      </div>

      <>
        <IngredientSearch
          label="Ingredient"
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
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">Ingredients</span>
              <Button variant="ghost" size="xs" tone="error" onClick={() => setIngredients([])}>
                Clear all
              </Button>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {orderedIngredients.map(({ ingredient, originalIndex }) => (
                <div
                  key={`${originalIndex}-${ingredient.name}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-base-200 rounded p-2"
                >
                  <span className="text-sm font-medium flex-1">{ingredient.name}</span>
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
                    <span className="text-sm text-base-content/60 min-w-12 text-center">
                      {ingredient.uoM}
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      tone="error"
                      onClick={() =>
                        setIngredients((prev) => prev.filter((_, idx) => idx !== originalIndex))
                      }
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div ref={ingredientListEndRef} />
      </>
    </ModalFormShell>
  )
}
