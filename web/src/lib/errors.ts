/** Message from an API error body (`{ detail }`, string or FastAPI validation list); `fallback` when there is none. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { detail?: unknown } | null | undefined)?.detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail) && typeof detail[0]?.msg === "string") return detail[0].msg
  return fallback
}

/** Message from anything thrown: an Error's message, else `fallback`. */
export function errorText(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
