import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { Toggle } from './Toggle'
import { Select } from './Select'
import { RangeSelector } from './RangeSelector'
import { XMarkIcon } from '@heroicons/react/16/solid'
import {
  getIngredientData,
  NewDrinkRequest,
  NewFoodRequest,
  NewIngredientRequest,
  postNewDrink,
  postNewFood,
  postNewIngredient,
  updateDrink,
  UpdateDrinkRequest,
  updateFood,
  UpdateFoodRequest,
  updateIngredient,
  UpdateIngredientRequest,
} from '@/app/api/foodApi'
import { AlertProps } from './Alert'
import { Ingredient } from '@/models/ingredient'
import { Food } from '@/models/food'
import { Drink } from '@/models/drink'

export interface ModalContents {
  label: 'Food' | 'Drink' | 'Ingredient'
  ingredients: boolean
  course: boolean
  difficulty: boolean
  speed: boolean
  macro: boolean
}

export interface ModalInitialValues {
  id: string
  name: string
  rating: Food['rating'] | Drink['rating'] | Ingredient['rating']
  isHealthyOption: boolean
  cost: Food['cost'] | Drink['cost'] | Ingredient['cost']
  ingredients?: string[]
  course?: Food['course']
  difficulty?: Food['difficulty'] | Drink['difficulty']
  speed?: Food['speed'] | Drink['speed']
  macro?: Ingredient['macro']
  barcodes?: string[] | null
}

interface AddModalProps {
  setShowAddModal: (show: boolean) => void
  modalContents: ModalContents
  setAlertProps: Dispatch<SetStateAction<AlertProps | undefined>>
  initialValues?: ModalInitialValues
  onSuccess?: () => void
}

const costLabelMap: Record<1 | 2 | 3, 'Cheap' | 'Moderate' | 'Expensive'> = {
  1: 'Cheap',
  2: 'Moderate',
  3: 'Expensive',
}

const speedLabelMap: Record<1 | 2 | 3, 'Slow' | 'Average' | 'Quick'> = {
  1: 'Slow',
  2: 'Average',
  3: 'Quick',
}

const normalizeIngredients = (values?: string[]) => {
  if (!values || values.length === 0) return []

  const result: string[] = []

  values.forEach((value) => {
    const trimmed = value.trim()
    if (!trimmed) return

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            if (typeof item === 'string' && item.trim()) {
              result.push(item.trim())
            }
          })
          return
        }
      } catch {
        // Fall through and keep the original value when it's not valid JSON.
      }
    }

    result.push(trimmed)
  })

  return result
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
  const [cost, setCost] = useState<1 | 2 | 3>(initialValues?.cost ?? 1)
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(
    initialValues?.rating ?? 5,
  )
  const [speed, setSpeed] = useState<1 | 2 | 3>(initialValues?.speed ?? 1)
  const [course, setCourse] = useState<'Breakfast' | 'Lunch' | 'Dinner'>(
    initialValues?.course ?? 'Dinner',
  )
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(initialValues?.difficulty ?? 2)
  const [macro, setMacro] = useState<'Protein' | 'Carbs' | 'Fat'>(initialValues?.macro ?? 'Protein')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [ingredientInput, setIngredientInput] = useState<string>('')
  const [ingredients, setIngredients] = useState<string[]>(
    normalizeIngredients(initialValues?.ingredients),
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
    if (!modalContents.ingredients) return

    const trimmedValue = ingredientInput.trim().toLowerCase()

    if (trimmedValue === '') {
      setIngredientSuggestions([])
      return
    }

    const suggestions = availableIngredients
      .filter((ingredient) => ingredient.name.toLowerCase().includes(trimmedValue))
      .filter((ingredient) => !ingredients.includes(ingredient.name))
      .slice(0, 8)

    setIngredientSuggestions(suggestions)
  }, [ingredientInput, availableIngredients, ingredients, modalContents.ingredients])

  const onHealthyToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsHealthyOption(e.target.checked)
  }

  const onCostChange = (value: string) => {
    if (value === 'Cheap') setCost(1)
    else if (value === 'Moderate') setCost(2)
    else if (value === 'Expensive') setCost(3)
    else throw new Error('cost must be either Cheap, Moderate or Expensive.')
  }

  const onSpeedChange = (value: string) => {
    if (value === 'Slow') setSpeed(1)
    else if (value === 'Average') setSpeed(2)
    else if (value === 'Quick') setSpeed(3)
    else throw new Error('speed must be either Slow, Average or Quick.')
  }

  const onDifficultyChange = (value: number) => {
    if (value === 1) setDifficulty(1)
    else if (value === 2) setDifficulty(2)
    else if (value === 3) setDifficulty(3)
    else throw new Error('difficulty must be either 1, 2 or 3.')
  }

  const onCourseChange = (value: string) => {
    if (value === 'Breakfast') setCourse('Breakfast')
    else if (value === 'Lunch') setCourse('Lunch')
    else if (value === 'Dinner') setCourse('Dinner')
    else throw new Error('course must be either Breakfast, Lunch or Dinner.')
  }

  const onMacroChange = (value: string) => {
    if (value === 'Protein') setMacro('Protein')
    else if (value === 'Carbs') setMacro('Carbs')
    else if (value === 'Fat') setMacro('Fat')
    else throw new Error('macro must be either Protein, Carbs or Fat.')
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

    if (ingredients.includes(trimmedValue)) {
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

    setIngredients([...ingredients, exactIngredientMatch.name])
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

    if (modalContents.label === 'Food') {
      const foodPayload: NewFoodRequest | UpdateFoodRequest = {
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
        ? await updateFood(foodPayload as UpdateFoodRequest)
        : await postNewFood(foodPayload as NewFoodRequest)

      if (status !== 200) {
        handleRequestError(errorMessage, 'Failed to save food')
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
              label="Healthy Choice"
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
            options={['1', '5', '10']}
            value={rating}
            onChange={(value: number) => setRating(value as Food['rating'])}
            className="mb-3"
          />

          <div className="flex flex-col sm:flex-row w-full gap-2 justify-between">
            <div className="flex gap-3 mb-2 items-center grow">
              <label className="fieldset-legend">Cost</label>
              <Select
                defaultValue={costLabelMap[cost]}
                onChange={(value) => onCostChange(value)}
                options={['Cheap', 'Moderate', 'Expensive']}
              />
            </div>

            {modalContents.speed && (
              <div className="flex gap-3 mb-2 items-center grow">
                <label className="fieldset-legend">Speed</label>
                <Select
                  defaultValue={speedLabelMap[speed]}
                  onChange={(value) => onSpeedChange(value)}
                  options={['Slow', 'Average', 'Quick']}
                />
              </div>
            )}

            {modalContents.course && (
              <div className="flex gap-3 mb-2 items-center grow">
                <label className="fieldset-legend">Course</label>
                <Select
                  defaultValue={course}
                  onChange={(value) => onCourseChange(value)}
                  options={['Breakfast', 'Lunch', 'Dinner']}
                />
              </div>
            )}

            {modalContents.macro && (
              <div className="flex gap-3 mb-2 items-center grow">
                <label className="fieldset-legend">Macro</label>
                <Select
                  defaultValue={macro}
                  onChange={(value) => onMacroChange(value)}
                  options={['Protein', 'Carbs', 'Fat']}
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
                options={['Easy', 'Medium', 'Hard']}
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
                {ingredients.map((ingredientName, index) => (
                  <div
                    className={`badge badge-soft flex items-center gap-1 ${
                      index % 2 === 0 ? 'badge-primary' : 'badge-secondary'
                    }`}
                    key={`${ingredientName}-${index}`}
                  >
                    {ingredientName}
                    <XMarkIcon
                      className="w-4 h-4 cursor-pointer hover:text-red-500 ml-1"
                      onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))}
                    />
                  </div>
                ))}
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
