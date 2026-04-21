import { useEffect, useMemo, useRef, useState } from 'react'
import { getIngredientData } from '@/app/api/ingredientApi'
import Loading from '@/components/Loading'
import { MacroOption } from '@/constants'
import { Ingredient } from '@/models'
import { IngredientBadgeSelector } from '@/components/selectors/IngredientBadgeSelector'

export const INGREDIENT_SEARCH_DEBOUNCE_MS = 1000

type SelectedIngredientBadge = {
  id: string
  name: string
  macro: MacroOption
  onRemoveClick?: () => void
}

type IngredientSearchProps = {
  label?: string
  standalone?: boolean
  selectedBadges?: SelectedIngredientBadge[]
  onClearAllClick?: () => void
  onIngredientSelected: (ingredient: Ingredient) => void | Promise<void>
  onSearchError?: (errorMessage: string) => void
  excludedIngredientNames?: string[]
}

export const IngredientSearch = ({
  label = 'Ingredient',
  standalone = false,
  selectedBadges = [],
  onClearAllClick,
  onIngredientSelected,
  onSearchError,
  excludedIngredientNames = [],
}: IngredientSearchProps) => {
  const [ingredientInput, setIngredientInput] = useState('')
  const [rawSearchResults, setRawSearchResults] = useState<Ingredient[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const latestSearchRequestId = useRef(0)
  const excludedNamesRef = useRef<string[]>([])
  const onSearchErrorRef = useRef(onSearchError)

  useEffect(() => {
    excludedNamesRef.current = excludedIngredientNames.map((name) => name.toLowerCase())
  }, [excludedIngredientNames])

  useEffect(() => {
    onSearchErrorRef.current = onSearchError
  }, [onSearchError])

  const searchResults = useMemo(() => {
    const excluded = new Set(excludedIngredientNames.map((name) => name.toLowerCase()))
    return rawSearchResults.filter((ingredient) => !excluded.has(ingredient.name.toLowerCase()))
  }, [rawSearchResults, excludedIngredientNames])

  useEffect(() => {
    const term = ingredientInput.trim()

    if (term.length < 2) {
      setRawSearchResults([])
      setSearchLoading(false)
      setHasSearched(false)
      return
    }

    setSearchLoading(true)

    const debounceTimeout = setTimeout(() => {
      const requestId = latestSearchRequestId.current + 1
      latestSearchRequestId.current = requestId

      const runSearch = async () => {
        const { ingredients, error } = await getIngredientData({ search: term })

        if (requestId !== latestSearchRequestId.current) {
          return
        }

        if (error) {
          onSearchErrorRef.current?.(error)
          setSearchLoading(false)
          setHasSearched(true)
          return
        }

        setRawSearchResults(ingredients ?? [])
        setSearchLoading(false)
        setHasSearched(true)
      }

      void runSearch()
    }, INGREDIENT_SEARCH_DEBOUNCE_MS)

    return () => {
      clearTimeout(debounceTimeout)
    }
  }, [ingredientInput])

  return (
    <>
      <IngredientBadgeSelector
        label={label}
        standalone={standalone}
        inputValue={ingredientInput}
        onInputChange={setIngredientInput}
        onInputClear={() => {
          setIngredientInput('')
          setRawSearchResults([])
          setHasSearched(false)
        }}
        suggestions={searchResults.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.name,
          macro: ingredient.macro,
        }))}
        onSuggestionClick={(suggestion) => {
          const ingredient = searchResults.find((item) => item.id === suggestion.id)
          if (!ingredient) return

          void onIngredientSelected(ingredient)
          setIngredientInput('')
          setRawSearchResults([])
          setHasSearched(false)
        }}
        selectedBadges={selectedBadges}
        onClearAllClick={onClearAllClick}
      />

      {searchLoading && (
        <div className="text-sm opacity-70 mt-2">
          <Loading label="Searching ingredients..." />
        </div>
      )}

      {!searchLoading &&
        hasSearched &&
        ingredientInput.trim().length >= 2 &&
        searchResults.length === 0 && (
          <p className="text-sm opacity-70 mt-2">No matching ingredients found.</p>
        )}
    </>
  )
}
