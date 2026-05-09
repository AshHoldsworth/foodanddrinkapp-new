export const API_BASE_PATH = '/backend'
const AUTHENTIK_USERNAME_HEADER = 'x-authentik-username'
const AUTHENTIK_USERNAME =
  process.env.NEXT_PUBLIC_AUTHENTIK_USERNAME ??
  process.env.NEXT_PUBLIC_DEV_USERNAME ??
  ''

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

const logRequest = (method: string, path: string, headers?: HeadersInit) => {
  const serializedHeaders = headers ? Array.from(new Headers(headers).entries()) : []
  console.log('[webApi] request', { method, path, headers: serializedHeaders })
}

const logResponse = async (method: string, path: string, res: Response) => {
  console.log('[webApi] response', { method, path, status: res.status, ok: res.ok })

  if (!res.ok) {
    const text = await res.clone().text().catch(() => '')
    console.warn('[webApi] non-ok response body', { method, path, text })
  }
}

const buildHeaders = (headers?: HeadersInit) => {
  const mergedHeaders = new Headers(headers)

  if (AUTHENTIK_USERNAME) {
    mergedHeaders.set(AUTHENTIK_USERNAME_HEADER, AUTHENTIK_USERNAME)
  }

  console.log('[webApi] buildHeaders', {
    authentikHeaderConfigured: Boolean(AUTHENTIK_USERNAME),
    headers: Array.from(mergedHeaders.entries()),
  })

  return mergedHeaders
}

export const apiGet = async <T>(
  path: string,
  messages: ReadApiMessages,
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const requestHeaders = buildHeaders()
    logRequest('GET', path, requestHeaders)

    const res = await fetch(`${API_BASE_PATH}${path}`, {
      cache: 'no-store',
      headers: requestHeaders,
    })

    await logResponse('GET', path, res)

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

export const apiPostJson = async <T = unknown>(
  path: string,
  body: T,
): Promise<ApiMutationResult> => {
  const url = `${API_BASE_PATH}${path}`

  try {
    const requestHeaders = buildHeaders({ 'Content-Type': 'application/json' })
    logRequest('POST', path, requestHeaders)

    const res = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      credentials: 'include',
      body: JSON.stringify(body),
    })

    await logResponse('POST', path, res)

    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as {
        errorMessage?: string
        ErrorMessage?: string
      }
      return {
        status: res.status,
        errorMessage: json.errorMessage ?? json.ErrorMessage ?? 'Request failed',
      }
    }

    return { status: res.status, errorMessage: null }
  } catch (error) {
    console.error(`[apiPostJson] ${path}:`, error)
    return { status: 500, errorMessage: 'Request failed' }
  }
}

export const apiPutJson = async <T = unknown>(
  path: string,
  body: T,
): Promise<ApiMutationResult> => {
  const url = `${API_BASE_PATH}${path}`

  try {
    const requestHeaders = buildHeaders({ 'Content-Type': 'application/json' })
    logRequest('PUT', path, requestHeaders)

    const res = await fetch(url, {
      method: 'PUT',
      headers: requestHeaders,
      credentials: 'include',
      body: JSON.stringify(body),
    })

    await logResponse('PUT', path, res)

    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as {
        errorMessage?: string
        ErrorMessage?: string
      }
      return {
        status: res.status,
        errorMessage: json.errorMessage ?? json.ErrorMessage ?? 'Request failed',
      }
    }

    return { status: res.status, errorMessage: null }
  } catch (error) {
    console.error(`[apiPutJson] ${path}:`, error)
    return { status: 500, errorMessage: 'Request failed' }
  }
}

export const apiPost = async (
  path: string,
  options: ApiPostOptions,
  messages: MutationApiMessages,
): Promise<ApiMutationResult> => {
  const queryString = options.queryParams ? buildQueryString(options.queryParams) : ''
  const url = `${API_BASE_PATH}${path}${queryString ? `?${queryString}` : ''}`

  try {
    const requestHeaders = buildHeaders()
    logRequest('POST', path, requestHeaders)

    const res = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: options.body,
    })

    await logResponse('POST', path, res)

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
    const requestHeaders = buildHeaders()
    logRequest('DELETE', path, requestHeaders)

    const res = await fetch(url, {
      method: 'DELETE',
      headers: requestHeaders,
      credentials: 'include',
    })

    await logResponse('DELETE', path, res)

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
  ingredients: Array<{
    ingredientId: string
    preparation?: string | null
    quantity?: number | null
    uoM?: string | null
  }>,
) => {
  ingredients.forEach((ingredient, index) => {
    formData.append(`ingredients[${index}].ingredientId`, ingredient.ingredientId)

    if (ingredient.preparation) {
      formData.append(`ingredients[${index}].preparation`, ingredient.preparation)
    }

    if (ingredient.quantity !== undefined && ingredient.quantity !== null) {
      formData.append(`ingredients[${index}].quantity`, ingredient.quantity.toString())
    }

    if (ingredient.uoM) {
      formData.append(`ingredients[${index}].uoM`, ingredient.uoM)
    }
  })
}
