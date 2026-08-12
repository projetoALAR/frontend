const STORAGE_PREFIX = "alar-onboarding-v1"

export function isOnboardingDone(userId: string): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(`${STORAGE_PREFIX}:${userId}`) === "1"
}

export function markOnboardingDone(userId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(`${STORAGE_PREFIX}:${userId}`, "1")
}

export function resetOnboarding(userId: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(`${STORAGE_PREFIX}:${userId}`)
}
