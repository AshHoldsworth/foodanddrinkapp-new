import { useEffect, useRef, useState } from 'react'
import { Toggle } from '../selectors/Toggle'
import { Select } from '../selectors/Select'
import {
  NewIngredientRequest,
  postNewIngredient,
  updateIngredient,
  UpdateIngredientRequest,
} from '@/app/api/ingredientApi'
import {
  HEALTHY_CHOICE_LABEL,
  INGREDIENT_LABEL,
  MACRO_OPTIONS,
  MacroOption,
  UOM_OPTIONS,
  DEFAULT_UOM,
} from '@/constants'
import { savePendingAlert } from '@/utils/pendingAlert'
import { IngredientModalProps } from './interfaces/mealAndIngredientModals'
import { ModalFormShell } from './ModalFormShell'

export const IngredientModal = ({
  setOpen,
  setAlertProps,
  initialValues,
  onSuccess,
}: IngredientModalProps) => {
  const isEditing = initialValues !== undefined
  const [name, setName] = useState<string>(initialValues?.name ?? '')
  const [isHealthyOption, setIsHealthyOption] = useState<boolean>(
    initialValues?.isHealthyOption ?? false,
  )
  const [macro, setMacro] = useState<MacroOption>(initialValues?.macro ?? MACRO_OPTIONS[0])
  const [uoM, setUoM] = useState<string>(initialValues?.uoM ?? DEFAULT_UOM)
  const nameInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  const onHealthyToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsHealthyOption(e.target.checked)
  }

  const onAlertCloseClick = () => {
    setAlertProps(undefined)
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

    const ingredientPayload: NewIngredientRequest | UpdateIngredientRequest = {
      ...(isEditing ? { id: initialValues.id, barcodes: initialValues.barcodes ?? null } : {}),
      name,
      isHealthyOption,
      macro,
      uoM,
    }

    const { status, errorMessage } = isEditing
      ? await updateIngredient(ingredientPayload as UpdateIngredientRequest)
      : await postNewIngredient(ingredientPayload as NewIngredientRequest)

    if (status !== 200) {
      handleRequestError(errorMessage, 'Failed to save ingredient')
    } else {
      handleSuccess(isEditing ? 'Ingredient updated.' : 'Ingredient added.')
    }
  }

  const title = isEditing ? `Edit ${INGREDIENT_LABEL}` : `Add New ${INGREDIENT_LABEL}`
  const primaryLabel = isEditing ? `Save ${INGREDIENT_LABEL}` : `Add ${INGREDIENT_LABEL}`

  return (
    <ModalFormShell
      title={title}
      primaryButtonLabel={primaryLabel}
      onPrimaryClick={() => void onSubmit()}
      onCancel={() => setOpen(false)}
      overlayTestId="ingredient-modal-overlay"
      backdropTestId="ingredient-modal-backdrop"
      contentTestId="ingredient-modal-content"
    >
      <div className="flex gap-3 mb-2 items-center">
        <legend className="fieldset-legend">Name</legend>
        <input
          ref={nameInputRef}
          type="text"
          placeholder={`${INGREDIENT_LABEL} Name`}
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

      <div className="flex flex-col w-full gap-3">
        <Select
          label="Macro"
          value={macro}
          onChange={(value: string) => setMacro(value as MacroOption)}
          options={MACRO_OPTIONS.map((opt) => ({ label: opt, value: opt }))}
        />
        <Select
          label="Unit"
          value={uoM}
          onChange={(value: string) => setUoM(value)}
          options={UOM_OPTIONS.map((opt) => ({ label: opt, value: opt }))}
        />
      </div>
    </ModalFormShell>
  )
}
