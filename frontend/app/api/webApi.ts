export const API_BASE_PATH = '/backend'

export type ApiMutationResult = {
  status: number
  errorMessage: string | null
}

export type ReadApiMessages = {
  ErrorMessage: string
  LogLabel: string
}

export type MutationApiMessages = {
  ErrorMessage: string
  FallbackErrorMessage: string
  LogLabel: string
}

type QueryValue = string | number | boolean | undefined

export const buildQueryString = (params: Record<string, QueryValue>) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return
    if (typeof value === 'boolean') {
      if (value) searchParams.set(key, 'true')
      return
    }

    searchParams.set(key, value.toString())
  })

  return searchParams.toString()
}

const buildErrorMessage = async (res: Response, fallback: string) => {
  const message = await res.text()
  return message || fallback
}

export const apiGet = async <T>(
  path: string,
  messages: ReadApiMessages,
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const res = await fetch(`${API_BASE_PATH}${path}`, { cache: 'no-store' })

    if (!res.ok) {
      return { data: null, error: messages.ErrorMessage }
    }

    const json = await res.json()
    return { data: json.data as T, error: null }
  } catch (error) {
    console.error(`${messages.LogLabel}:`, error)
    return { data: null, error: messages.ErrorMessage }
  }
}

type ApiPostOptions = {
  queryParams?: Record<string, QueryValue>
  body?: FormData
}

export const apiPost = async (
  path: string,
  options: ApiPostOptions,
  messages: MutationApiMessages,
): Promise<ApiMutationResult> => {
  const queryString = options.queryParams ? buildQueryString(options.queryParams) : ''
  const url = `${API_BASE_PATH}${path}${queryString ? `?${queryString}` : ''}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: options.body,
    })

    if (!res.ok) {
      const errorMessage = await buildErrorMessage(res, messages.FallbackErrorMessage)
      return { status: res.status, errorMessage }
    }

    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error(`${messages.LogLabel}:`, error)
    return {
      status: 500,
      errorMessage: messages.ErrorMessage,
    }
  }
}

type ApiDeleteOptions = {
  queryParams?: Record<string, QueryValue>
}

export const apiDelete = async (
  path: string,
  options: ApiDeleteOptions,
  messages: MutationApiMessages,
): Promise<ApiMutationResult> => {
  const queryString = options.queryParams ? buildQueryString(options.queryParams) : ''
  const url = `${API_BASE_PATH}${path}${queryString ? `?${queryString}` : ''}`

  try {
    const res = await fetch(url, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const errorMessage = await buildErrorMessage(res, messages.FallbackErrorMessage)
      return { status: res.status, errorMessage }
    }

    return { status: 200, errorMessage: null }
  } catch (error) {
    console.error(`${messages.LogLabel}:`, error)
    return {
      status: 500,
      errorMessage: messages.ErrorMessage,
    }
  }
}

export const appendIngredients = (
  formData: FormData,
  ingredients: Array<{ name: string; macro?: string }>,
) => {
  ingredients.forEach((ingredient, index) => {
    formData.append(`ingredients[${index}].name`, ingredient.name)
    if (ingredient.macro) {
      formData.append(`ingredients[${index}].macro`, ingredient.macro)
    }
  })
}
