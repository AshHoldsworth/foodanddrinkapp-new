import { useEffect, useRef, useState } from 'react'
import { Toggle } from '../selectors/Toggle'
import { Select } from '../selectors/Select'
import { RangeSelector } from '../selectors/RangeSelector'
import { NewMealRequest, postNewMeal, updateMeal, UpdateMealRequest } from '@/app/api/mealsApi'
import { NewDrinkRequest, postNewDrink, updateDrink, UpdateDrinkRequest } from '@/app/api/drinkApi'
import {
  getIngredientData,
  NewIngredientRequest,
  postNewIngredient,
  updateIngredient,
  UpdateIngredientRequest,
} from '@/app/api/ingredientApi'
import {
  COST_OPTIONS,
  COURSE_OPTIONS,
  CourseOption,
  DIFFICULTY_OPTIONS,
  DRINK_LABEL,
  HEALTHY_CHOICE_LABEL,
  INGREDIENT_LABEL,
  MACRO_OPTIONS,
  MacroOption,
  MEAL_LABEL,
  RATING_FILTER_OPTIONS,
  SPEED_OPTIONS,
} from '@/constants'
import { Cost, Difficulty, Ingredient, Rating, MealIngredient, Speed } from '@/models'
import { getMacroOrder } from '@/utils/macroOrder'
import { AddModalProps } from './interfaces/AddModal'
import { IngredientBadgeSelector } from '../selectors/IngredientBadgeSelector'

export type { ModalContents } from './interfaces/AddModal'

const ingredientNameExists = (values: MealIngredient[], ingredientName: string) => {
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
  const [course, setCourse] = useState<CourseOption>(initialValues?.course ?? COURSE_OPTIONS[0])
  const [difficulty, setDifficulty] = useState<Difficulty>(initialValues?.difficulty ?? 2)
  const [macro, setMacro] = useState<MacroOption>(initialValues?.macro ?? MACRO_OPTIONS[0])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [ingredientInput, setIngredientInput] = useState<string>('')
  const [ingredients, setIngredients] = useState<MealIngredient[]>(
    initialValues?.ingredients ?? [],
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

    if (modalContents.label === MEAL_LABEL) {
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
        handleSuccess()
      }
    }

    if (modalContents.label === DRINK_LABEL) {
      const drinkPayload: NewDrinkRequest | UpdateDrinkRequest = {
        ...(isEditing ? { id: initialValues.id } : {}),
        name,
        rating,
        isHealthyOption,
        cost,
        difficulty,
        speed,
        ingredients,
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

    if (modalContents.label === INGREDIENT_LABEL) {
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

          {modalContents.image && (
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
          )}

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
              defaultValue={COST_OPTIONS.find((opt) => opt.value === cost)?.label as string}
              onChange={(value: string) => setCost(Number(value) as Cost)}
              options={COST_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
            />

            {modalContents.speed && (
              <div className="flex gap-3 mb-2 items-center grow">
                <label className="fieldset-legend">Speed</label>
                <Select
                  defaultValue={String(speed)}
                  onChange={(value: string) => setSpeed(Number(value) as Speed)}
                  options={SPEED_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
                />
              </div>
            )}

            {modalContents.course && (
              <div className="flex gap-3 mb-2 items-center grow">
                <Select
                  label="Course"
                  defaultValue={COURSE_OPTIONS[0]}
                  onChange={(value: string) => setCourse(value as CourseOption)}
                  options={COURSE_OPTIONS.map((opt, index) => ({ label: opt, value: index }))}
                />
              </div>
            )}

            {modalContents.macro && (
              <div className="flex gap-3 mb-2 items-center grow">
                <Select
                  label="Macro"
                  defaultValue={macro}
                  onChange={(value: string) => setMacro(value as MacroOption)}
                  options={MACRO_OPTIONS.map((opt, index) => ({ label: opt, value: index }))}
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
                onChange={(value: number) => setDifficulty(Number(value) as Difficulty)}
                className="mb-3"
              />
            </div>
          )}

          {modalContents.ingredients && (
            <>
              <IngredientBadgeSelector
                label="Ingredient"
                inputValue={ingredientInput}
                onInputChange={setIngredientInput}
                onInputClear={() => setIngredientInput('')}
                suggestions={ingredientSuggestions.map((ingredient) => ({
                  id: ingredient.id,
                  name: ingredient.name,
                  macro: ingredient.macro,
                }))}
                onSuggestionClick={(ingredient) => onAddIngredient(ingredient.name)}
                selectedBadges={orderedIngredients.map(({ ingredient, originalIndex }) => ({
                  id: `${originalIndex}-${ingredient.name}`,
                  name: ingredient.name,
                  macro: ingredient.macro,
                  onRemoveClick: () =>
                    setIngredients((prev) => prev.filter((_, index) => index !== originalIndex)),
                }))}
                onClearAllClick={() => setIngredients([])}
                inputRef={ingredientInputRef}
                suggestionsRef={ingredientSuggestionsRef}
                selectedEndRef={ingredientListEndRef}
              />
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
