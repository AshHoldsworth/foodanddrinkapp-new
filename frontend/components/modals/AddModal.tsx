import { useEffect, useRef, useState } from 'react'
import { Toggle } from '../selectors/Toggle'
import { Select } from '../selectors/Select'
import { RangeSelector } from '../selectors/RangeSelector'
import { XMarkIcon } from '@heroicons/react/16/solid'
import {
  getIngredientData,
  NewDrinkRequest,
  NewMealRequest,
  NewIngredientRequest,
  postNewDrink,
  postNewMeal,
  postNewIngredient,
  updateDrink,
  UpdateDrinkRequest,
  updateMeal,
  UpdateMealRequest,
  updateIngredient,
  UpdateIngredientRequest,
} from '@/app/api/mealApi'
import {
  COST_OPTIONS,
  COURSE_OPTIONS,
  DIFFICULTY_OPTIONS,
  getMacroOrder,
  HEALTHY_CHOICE_LABEL,
  MACRO_OPTIONS,
  RATING_FILTER_OPTIONS,
  SPEED_LABEL_BY_VALUE,
  SPEED_OPTIONS,
  SPEED_VALUE_BY_LABEL,
} from '@/constants'
import { Cost, Difficulty, Drink, Ingredient, Meal, MealIngredient, Rating, Speed } from '@/models'
import { getMacroBadgeClass } from '../../utils/macroBadge'
import { AddModalProps } from './interfaces/AddModal'

type SelectedIngredient = {
  name: string
  macro?: Ingredient['macro']
}

const toSelectedIngredient = (value: SelectedIngredient): SelectedIngredient | null => {
  const trimmedName = value.name.trim()
  if (trimmedName === '') return null

  return {
    name: trimmedName,
    macro: value.macro,
  }
}

const normaliseIngredients = (values?: MealIngredient[]) => {
  if (!values || values.length === 0) return []

  return values
    .map((value) => toSelectedIngredient(value))
    .filter((ingredient): ingredient is SelectedIngredient => ingredient !== null)
}

const ingredientsToNames = (values: SelectedIngredient[]) => {
  return values.map((ingredient) => ({
    name: ingredient.name,
    macro: ingredient.macro,
  }))
}

const toMealIngredientsPayload = (values: SelectedIngredient[]): MealIngredient[] => {
  return values.map((ingredient) => ({
    name: ingredient.name,
    macro: ingredient.macro,
  }))
}

const ingredientNameExists = (values: SelectedIngredient[], ingredientName: string) => {
  return values.some((ingredient) => ingredient.name === ingredientName)
}

export const AddModal = ({
  setShowAddModal,
  modalContents,
  setAlertProps,
  initialValues,
  onSuccess,
}: AddModalProps) => {
  const isEditing = initialValues !== undefined
  const [name, setName] = useState<string>(initialValues?.name ?? '')
  const [isHealthyOption, setIsHealthyOption] = useState<boolean>(
    initialValues?.isHealthyOption ?? false,
  )
  const [cost, setCost] = useState<Cost>(initialValues?.cost ?? 1)
  const [rating, setRating] = useState<Rating>(initialValues?.rating ?? 5)
  const [speed, setSpeed] = useState<Speed>(initialValues?.speed ?? 1)
  const [course, setCourse] = useState<Meal['course']>(initialValues?.course ?? COURSE_OPTIONS[0])
  const [difficulty, setDifficulty] = useState<Difficulty>(initialValues?.difficulty ?? 2)
  const [macro, setMacro] = useState<Ingredient['macro']>(initialValues?.macro ?? MACRO_OPTIONS[0])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [ingredientInput, setIngredientInput] = useState<string>('')
  const [ingredients, setIngredients] = useState<SelectedIngredient[]>(
    normaliseIngredients(initialValues?.ingredients),
  )
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([])
  const [ingredientSuggestions, setIngredientSuggestions] = useState<Ingredient[]>([])
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const ingredientInputRef = useRef<HTMLInputElement | null>(null)
  const ingredientSuggestionsRef = useRef<HTMLDivElement | null>(null)
  const ingredientListEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!modalContents.ingredients || ingredients.length === 0) return

    ingredientListEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [ingredients, modalContents.ingredients])

  useEffect(() => {
    if (!modalContents.ingredients || ingredientSuggestions.length === 0) return

    ingredientSuggestionsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [ingredientSuggestions, modalContents.ingredients])

  useEffect(() => {
    if (!modalContents.ingredients) return

    const fetchIngredients = async () => {
      const { ingredients: data } = await getIngredientData()
      setAvailableIngredients(data ?? [])
    }

    void fetchIngredients()
  }, [modalContents.ingredients])

  useEffect(() => {
    if (!modalContents.ingredients || availableIngredients.length === 0) return

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
  }, [availableIngredients, modalContents.ingredients])

  useEffect(() => {
    if (!modalContents.ingredients) return

    const trimmedValue = ingredientInput.trim().toLowerCase()

    if (trimmedValue === '') {
      setIngredientSuggestions([])
      return
    }

    const suggestions = availableIngredients
      .filter((ingredient) => ingredient.name.toLowerCase().includes(trimmedValue))
      .filter((ingredient) => !ingredientNameExists(ingredients, ingredient.name))
      .slice(0, 8)

    setIngredientSuggestions(suggestions)
  }, [ingredientInput, availableIngredients, ingredients, modalContents.ingredients])

  const onHealthyToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsHealthyOption(e.target.checked)
  }

  const onCostChange = (value: string) => {
    const costObject = COST_OPTIONS.find((opt) => opt.label === value) as {
      label: string
      value: Cost
    }
    setCost(costObject.value)
  }

  const onSpeedChange = (value: string) => {
    setSpeed(SPEED_VALUE_BY_LABEL[value as keyof typeof SPEED_VALUE_BY_LABEL])
  }

  const onDifficultyChange = (value: number) => {
    if (value === 1) setDifficulty(1)
    else if (value === 2) setDifficulty(2)
    else if (value === 3) setDifficulty(3)
    else throw new Error('difficulty must be either 1, 2 or 3.')
  }

  const onCourseChange = (value: string) => {
    setCourse(value as Meal['course'])
  }

  const onMacroChange = (value: string) => {
    setMacro(value as Ingredient['macro'])
  }

  const onAlertCloseClick = () => {
    setAlertProps(undefined)
  }

  const onAddIngredient = (value: string) => {
    const focusIngredientInput = () => {
      requestAnimationFrame(() => {
        ingredientInputRef.current?.focus()
      })
    }

    const trimmedValue = value.trim()

    if (trimmedValue === '') {
      setIngredientInput('')
      focusIngredientInput()
      return
    }

    if (ingredientNameExists(ingredients, trimmedValue)) {
      setIngredientInput('')
      focusIngredientInput()
      return
    }

    const exactIngredientMatch = availableIngredients.find(
      (ingredient) => ingredient.name.toLowerCase() === trimmedValue.toLowerCase(),
    )

    if (!exactIngredientMatch) {
      setAlertProps({
        type: 'warning',
        message: 'Cannot find ingredient',
        onCloseClick: onAlertCloseClick,
      })
      focusIngredientInput()
      return
    }

    setIngredients([
      ...ingredients,
      { name: exactIngredientMatch.name, macro: exactIngredientMatch.macro },
    ])
    setIngredientInput('')
    setIngredientSuggestions([])
    focusIngredientInput()
  }

  const handleSuccess = () => {
    setShowAddModal(false)

    if (onSuccess) {
      onSuccess()
      return
    }

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

    if (modalContents.ingredients && ingredients.length === 0) {
      setAlertProps({
        type: 'warning',
        message: 'At least one ingredient must be added',
        onCloseClick: onAlertCloseClick,
      })
      return
    }

    if (modalContents.label === 'Meal') {
      const mealPayload: NewMealRequest | UpdateMealRequest = {
        ...(isEditing ? { id: initialValues.id } : {}),
        name,
        rating,
        isHealthyOption,
        cost,
        course,
        difficulty,
        speed,
        ingredients: toMealIngredientsPayload(ingredients),
        imageFile,
      }

      const { status, errorMessage } = isEditing
        ? await updateMeal(mealPayload as UpdateMealRequest)
        : await postNewMeal(mealPayload as NewMealRequest)

      if (status !== 200) {
        handleRequestError(errorMessage, 'Failed to save meal')
      } else {
        handleSuccess()
      }
    }

    if (modalContents.label === 'Drink') {
      const drinkPayload: NewDrinkRequest | UpdateDrinkRequest = {
        ...(isEditing ? { id: initialValues.id } : {}),
        name,
        rating,
        isHealthyOption,
        cost,
        difficulty,
        speed,
        ingredients: ingredientsToNames(ingredients),
        imageFile,
      }

      const { status, errorMessage } = isEditing
        ? await updateDrink(drinkPayload as UpdateDrinkRequest)
        : await postNewDrink(drinkPayload as NewDrinkRequest)

      if (status !== 200) {
        handleRequestError(errorMessage, 'Failed to save drink')
      } else {
        handleSuccess()
      }
    }

    if (modalContents.label === 'Ingredient') {
      const ingredientPayload: NewIngredientRequest | UpdateIngredientRequest = {
        ...(isEditing ? { id: initialValues.id, barcodes: initialValues.barcodes ?? null } : {}),
        name,
        rating,
        isHealthyOption,
        cost,
        macro,
      }

      const { status, errorMessage } = isEditing
        ? await updateIngredient(ingredientPayload as UpdateIngredientRequest)
        : await postNewIngredient(ingredientPayload as NewIngredientRequest)

      if (status !== 200) {
        handleRequestError(errorMessage, 'Failed to save ingredient')
      } else {
        handleSuccess()
      }
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

  return (
    <div className="w-screen h-screen z-100 flex justify-center items-start sm:items-center fixed top-0 left-0 bg-black/75 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white p-4 rounded shadow-md w-full sm:w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[90dvh] flex flex-col">
        <h3 className="font-bold text-lg mb-5">
          {isEditing ? `Edit ${modalContents.label}` : `Add New ${modalContents.label}`}
        </h3>
        <div className="modal-body flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="flex gap-3 mb-2 items-center">
            <legend className="fieldset-legend">Name</legend>
            <input
              ref={nameInputRef}
              type="text"
              placeholder={`${modalContents.label} Name`}
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
            <div className="flex gap-3 mb-2 items-center grow">
              <label className="fieldset-legend">Cost</label>
              <Select
                defaultValue={COST_OPTIONS.find((opt) => opt.value === cost)?.label as string}
                onChange={(value) => onCostChange(value)}
                options={COST_OPTIONS.map((opt) => opt.label)}
              />
            </div>

            {modalContents.speed && (
              <div className="flex gap-3 mb-2 items-center grow">
                <label className="fieldset-legend">Speed</label>
                <Select
                  defaultValue={SPEED_LABEL_BY_VALUE[speed]}
                  onChange={(value) => onSpeedChange(value)}
                  options={SPEED_OPTIONS.map((opt) => opt.label)}
                />
              </div>
            )}

            {modalContents.course && (
              <div className="flex gap-3 mb-2 items-center grow">
                <label className="fieldset-legend">Course</label>
                <Select
                  defaultValue={course}
                  onChange={(value) => onCourseChange(value)}
                  options={[...COURSE_OPTIONS]}
                />
              </div>
            )}

            {modalContents.macro && (
              <div className="flex gap-3 mb-2 items-center grow">
                <label className="fieldset-legend">Macro</label>
                <Select
                  defaultValue={macro}
                  onChange={(value) => onMacroChange(value)}
                  options={[...MACRO_OPTIONS]}
                />
              </div>
            )}
          </div>

          {modalContents.difficulty && (
            <div className="mb-2">
              <RangeSelector
                label="Difficulty"
                min={1}
                max={3}
                step={1}
                options={DIFFICULTY_OPTIONS.map((opt) => opt.label)}
                value={difficulty}
                onChange={(value: number) => onDifficultyChange(value)}
                className="mb-3"
              />
            </div>
          )}

          {modalContents.ingredients && (
            <>
              <div className="flex gap-2 mb-2">
                <legend className="fieldset-legend">Ingredient</legend>
                <div className="relative grow">
                  <input
                    ref={ingredientInputRef}
                    type="text"
                    className="input w-full pr-10"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                  />
                  <XMarkIcon
                    className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setIngredientInput('')}
                  />
                </div>
                <button className="btn btn-outline btn-error" onClick={() => setIngredients([])}>
                  Clear All
                </button>
              </div>
              {ingredientSuggestions.length > 0 && (
                <div ref={ingredientSuggestionsRef} className="flex gap-2 flex-wrap mb-2">
                  {ingredientSuggestions.map((ingredient) => (
                    <button
                      key={ingredient.id}
                      type="button"
                      className="badge badge-soft badge-neutral cursor-pointer opacity-70 hover:opacity-100"
                      onClick={() => onAddIngredient(ingredient.name)}
                    >
                      {ingredient.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                {orderedIngredients.map(({ ingredient, originalIndex }) => {
                  const badgeClass = getMacroBadgeClass(ingredient.macro)

                  return (
                    <div
                      className={`badge flex items-center gap-1 ${badgeClass}`}
                      key={`${ingredient.name}-${originalIndex}`}
                    >
                      {ingredient.name}
                      <XMarkIcon
                        className="w-4 h-4 cursor-pointer hover:text-red-500 ml-1"
                        onClick={() =>
                          setIngredients(ingredients.filter((_, i) => i !== originalIndex))
                        }
                      />
                    </div>
                  )
                })}
                <div ref={ingredientListEndRef} />
              </div>
            </>
          )}
        </div>
        <div className="modal-action mt-3">
          <button className="btn btn-error" onClick={() => setShowAddModal(false)}>
            Close
          </button>
          <button className="btn btn-success" onClick={onSubmit}>
            {isEditing ? `Save ${modalContents.label}` : `Add ${modalContents.label}`}
          </button>
        </div>
      </div>
    </div>
  )
}
