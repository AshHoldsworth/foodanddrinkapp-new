'use client'

import { useEffect, useMemo, useState } from 'react'
import { getMealData } from '@/app/api/mealsApi'
import { getMealPlan, saveMealPlan } from '@/app/api/mealPlannerApi'
import { Alert, AlertProps } from '@/components/errors/Alert'
import { MealSearchField } from '@/components/selectors/MealSearchField'
import { Select } from '@/components/selectors/Select'
import { Meal, MealPlanDay } from '@/models'

type PlannerMealType = 'lunchMealId' | 'dinnerMealId'

const getUtcDateKey = (date: Date) => {
  return date.toISOString().slice(0, 10)
}

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

const getWeekStart = (date: Date) => {
  const utcDate = parseDateKey(getUtcDateKey(date))
  const daysSinceMonday = (utcDate.getUTCDay() + 6) % 7
  utcDate.setUTCDate(utcDate.getUTCDate() - daysSinceMonday)
  return utcDate
}

const toApiDateString = (dateKey: string) => {
  return `${dateKey}T00:00:00.000Z`
}

const mapPlanDays = (days: MealPlanDay[]) => {
  return days.map((day) => ({
    date: day.date.slice(0, 10),
    lunchMealId: day.lunchMealId,
    dinnerMealId: day.dinnerMealId,
  }))
}

const formatWeekLabel = (weekStartKey: string) => {
  const weekStart = parseDateKey(weekStartKey)
  const weekEnd = parseDateKey(weekStartKey)
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)

  return `${weekStart.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })} - ${weekEnd.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`
}

const formatDayLabel = (dateKey: string) => {
  const date = parseDateKey(dateKey)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
}

const MealPlannerPage = () => {
  const currentWeekStartKey = getUtcDateKey(getWeekStart(new Date()))
  const todayKey = getUtcDateKey(new Date())

  const [selectedWeekStartKey, setSelectedWeekStartKey] = useState(currentWeekStartKey)
  const [mealOptions, setMealOptions] = useState<Meal[]>([])
  const [plannerDays, setPlannerDays] = useState<MealPlanDay[]>([])
  const [savedPlannerDays, setSavedPlannerDays] = useState<MealPlanDay[]>([])
  const [mealSearchInputs, setMealSearchInputs] = useState<Record<string, string>>({})
  const [loadingMeals, setLoadingMeals] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [savingPlan, setSavingPlan] = useState(false)
  const [alertProps, setAlertProps] = useState<AlertProps | undefined>()

  const weekOptions = useMemo(() => {
    const currentWeekStart = parseDateKey(currentWeekStartKey)

    const weekOffsets = [-1, 0, 1, 2]

    return weekOffsets.map((offset) => {
      const optionDate = new Date(currentWeekStart)
      optionDate.setUTCDate(currentWeekStart.getUTCDate() + offset * 7)
      const value = getUtcDateKey(optionDate)

      const weekEnd = new Date(optionDate)
      weekEnd.setUTCDate(optionDate.getUTCDate() + 6)

      const dateRange = `${optionDate.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
      })} - ${weekEnd.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`

      return {
        value,
        label: dateRange,
      }
    })
  }, [currentWeekStartKey])

  const selectableMealOptions = useMemo(
    () => mealOptions.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [mealOptions],
  )

  const mealNamesById = useMemo(
    () =>
      selectableMealOptions.reduce<Record<string, string>>((accumulator, meal) => {
        accumulator[meal.id] = meal.name
        return accumulator
      }, {}),
    [selectableMealOptions],
  )

  const hasPendingChanges = useMemo(
    () => JSON.stringify(plannerDays) !== JSON.stringify(savedPlannerDays),
    [plannerDays, savedPlannerDays],
  )

  const isPastWeek = selectedWeekStartKey < currentWeekStartKey

  useEffect(() => {
    const loadMeals = async () => {
      setLoadingMeals(true)
      const { mealItems, error } = await getMealData()

      if (error) {
        setAlertProps({
          type: 'error',
          message: error,
          onCloseClick: () => setAlertProps(undefined),
        })
        setLoadingMeals(false)
        return
      }

      setMealOptions(mealItems ?? [])
      setLoadingMeals(false)
    }

    void loadMeals()
  }, [])

  useEffect(() => {
    const loadPlan = async () => {
      setLoadingPlan(true)
      const { plan, error } = await getMealPlan(toApiDateString(selectedWeekStartKey))

      if (error || !plan) {
        setAlertProps({
          type: 'error',
          message: error ?? 'Failed to load meal plan.',
          onCloseClick: () => setAlertProps(undefined),
        })
        setLoadingPlan(false)
        return
      }

      const mappedDays = mapPlanDays(plan.days)
      setPlannerDays(mappedDays)
      setSavedPlannerDays(mappedDays)
      setMealSearchInputs(
        mappedDays.reduce<Record<string, string>>((accumulator, day) => {
          accumulator[`${day.date}-lunchMealId`] =
            (day.lunchMealId && mealNamesById[day.lunchMealId]) || ''
          accumulator[`${day.date}-dinnerMealId`] =
            (day.dinnerMealId && mealNamesById[day.dinnerMealId]) || ''
          return accumulator
        }, {}),
      )
      setLoadingPlan(false)
    }

    void loadPlan()
  }, [selectedWeekStartKey])

  useEffect(() => {
    if (!alertProps || alertProps.type !== 'success') return

    const timeoutId = window.setTimeout(() => {
      setAlertProps(undefined)
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [alertProps])

  const isLockedDay = (dateKey: string) => {
    if (isPastWeek) {
      return true
    }

    return selectedWeekStartKey === currentWeekStartKey && dateKey < todayKey
  }

  const onMealChange = (dateKey: string, mealType: PlannerMealType, value: string | null) => {
    setPlannerDays((current) =>
      current.map((day) =>
        day.date === dateKey
          ? {
              ...day,
              [mealType]: value,
            }
          : day,
      ),
    )
  }

  const onMealSearchInputChange = (dateKey: string, mealType: PlannerMealType, value: string) => {
    const fieldKey = `${dateKey}-${mealType}`

    setMealSearchInputs((current) => ({
      ...current,
      [fieldKey]: value,
    }))
  }

  const onMealSuggestionClick = (dateKey: string, mealType: PlannerMealType, meal: Meal) => {
    const fieldKey = `${dateKey}-${mealType}`

    setMealSearchInputs((current) => ({
      ...current,
      [fieldKey]: '',
    }))

    onMealChange(dateKey, mealType, meal.id)
  }

  const onMealClear = (dateKey: string, mealType: PlannerMealType) => {
    const fieldKey = `${dateKey}-${mealType}`

    setMealSearchInputs((current) => ({
      ...current,
      [fieldKey]: '',
    }))

    onMealChange(dateKey, mealType, null)
  }

  const getMealSuggestions = (dateKey: string, mealType: PlannerMealType) => {
    const fieldKey = `${dateKey}-${mealType}`
    const query = mealSearchInputs[fieldKey]?.trim().toLowerCase() ?? ''

    if (!query) {
      return []
    }

    return selectableMealOptions
      .filter((meal) => meal.name.toLowerCase().includes(query))
      .slice(0, 6)
  }

  const onSave = async () => {
    if (!hasPendingChanges) {
      setAlertProps({
        type: 'info',
        message: 'No planner changes to save.',
        onCloseClick: () => setAlertProps(undefined),
      })
      return
    }

    setSavingPlan(true)

    const { status, errorMessage } = await saveMealPlan({
      weekStart: toApiDateString(selectedWeekStartKey),
      days: plannerDays.map((day) => ({
        date: toApiDateString(day.date),
        lunchMealId: day.lunchMealId,
        dinnerMealId: day.dinnerMealId,
      })),
    })

    if (status !== 200) {
      setAlertProps({
        type: 'error',
        message: errorMessage ?? 'Failed to save meal plan.',
        onCloseClick: () => setAlertProps(undefined),
      })
      setSavingPlan(false)
      return
    }

    setSavedPlannerDays(plannerDays)
    setAlertProps({
      type: 'success',
      message: 'Meal plan saved.',
      onCloseClick: () => setAlertProps(undefined),
    })
    setSavingPlan(false)
  }

  return (
    <main className="p-5 space-y-5">
      <section className="border border-base-300 rounded-lg p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Meal Planner</h1>
            <p className="text-sm opacity-80">
              Choose lunch and dinner for each day, then click Save to store the week.
            </p>
          </div>
          <button
            className="btn btn-success btn-sm"
            type="button"
            onClick={() => void onSave()}
            disabled={savingPlan || !hasPendingChanges || isPastWeek}
          >
            {savingPlan ? 'Saving...' : 'Save'}
          </button>
        </div>

        <Select
          label="Week"
          value={selectedWeekStartKey}
          options={weekOptions}
          onChange={setSelectedWeekStartKey}
          className="w-full sm:max-w-sm"
          direction="col"
        />
      </section>

      {loadingMeals || loadingPlan ? (
        <p>Loading meal planner...</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {plannerDays.map((day) => {
              const locked = isLockedDay(day.date)

              return (
                <article
                  key={day.date}
                  className="rounded-lg border border-base-300 p-3 flex flex-col gap-3 sm:grid sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-3 sm:items-start"
                >
                  <div className="flex flex-col gap-1">
                    <h2 className="font-medium leading-tight">{formatDayLabel(day.date)}</h2>
                  </div>

                  <MealSearchField
                    label="Lunch"
                    searchValue={mealSearchInputs[`${day.date}-lunchMealId`] ?? ''}
                    selectedMealId={day.lunchMealId ?? null}
                    selectedMealName={
                      day.lunchMealId ? (mealNamesById[day.lunchMealId] ?? null) : null
                    }
                    suggestions={getMealSuggestions(day.date, 'lunchMealId')}
                    disabled={locked || savingPlan}
                    onInputChange={(value) =>
                      onMealSearchInputChange(day.date, 'lunchMealId', value)
                    }
                    onSuggestionClick={(meal) =>
                      onMealSuggestionClick(day.date, 'lunchMealId', meal)
                    }
                    onClear={() => onMealClear(day.date, 'lunchMealId')}
                  />

                  <MealSearchField
                    label="Dinner"
                    searchValue={mealSearchInputs[`${day.date}-dinnerMealId`] ?? ''}
                    selectedMealId={day.dinnerMealId ?? null}
                    selectedMealName={
                      day.dinnerMealId ? (mealNamesById[day.dinnerMealId] ?? null) : null
                    }
                    suggestions={getMealSuggestions(day.date, 'dinnerMealId')}
                    disabled={locked || savingPlan}
                    onInputChange={(value) =>
                      onMealSearchInputChange(day.date, 'dinnerMealId', value)
                    }
                    onSuggestionClick={(meal) =>
                      onMealSuggestionClick(day.date, 'dinnerMealId', meal)
                    }
                    onClear={() => onMealClear(day.date, 'dinnerMealId')}
                  />
                </article>
              )
            })}
          </div>
        </>
      )}

      {alertProps && (
        <Alert {...alertProps} className="top-20 left-4 right-4 sm:left-10 sm:right-10" />
      )}
    </main>
  )
}

export default MealPlannerPage
