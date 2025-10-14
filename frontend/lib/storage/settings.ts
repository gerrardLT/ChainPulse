export interface UserSettings {
  telegram: {
    chatId: string
    enabled: boolean
  }
  discord: {
    webhookUrl: string
    enabled: boolean
  }
  notifications: {
    sound: boolean
    desktop: boolean
    telegram: boolean
    discord: boolean
  }
}

const SETTINGS_KEY = "chainpulse_settings"

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function saveSettings(settings: Partial<UserSettings>): void {
  if (!isBrowser()) {
    console.warn("[v0] Cannot save settings on server side")
    return
  }

  try {
    const current = getSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("[v0] Failed to save settings:", error)
    throw new Error("Failed to save settings")
  }
}

export function getSettings(): UserSettings {
  if (!isBrowser()) {
    return getDefaultSettings()
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) {
      return getDefaultSettings()
    }
    return { ...getDefaultSettings(), ...JSON.parse(stored) }
  } catch (error) {
    console.error("[v0] Failed to load settings:", error)
    return getDefaultSettings()
  }
}

function getDefaultSettings(): UserSettings {
  return {
    telegram: {
      chatId: "",
      enabled: false,
    },
    discord: {
      webhookUrl: "",
      enabled: false,
    },
    notifications: {
      sound: true,
      desktop: true,
      telegram: false,
      discord: false,
    },
  }
}

export function clearSettings(): void {
  if (!isBrowser()) {
    return
  }
  localStorage.removeItem(SETTINGS_KEY)
}
