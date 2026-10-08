export const PASSWORD_REQUIREMENTS_HINT =
  "Must be at least 8 characters and include uppercase, lowercase, a number, and a special character (!@#$%^&*(),.?\":{}|<>_+-)."

export interface PasswordRuleCheck {
  id: string
  label: string
  valid: boolean
}

export function getPasswordRuleChecks(password: string): PasswordRuleCheck[] {
  return [
    {
      id: "length",
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      id: "upper",
      label: "At least one uppercase letter (A-Z)",
      valid: /[A-Z]/.test(password),
    },
    {
      id: "lower",
      label: "At least one lowercase letter (a-z)",
      valid: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "At least one number (0-9)",
      valid: /\d/.test(password),
    },
    {
      id: "special",
      label: "At least one special character",
      valid: /[!@#$%^&*(),.?":{}|<>_+-]/.test(password),
    },
  ]
}

export function validatePasswordComplexity(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long"
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter"
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter"
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one digit"
  }
  if (!/[!@#$%^&*(),.?":{}|<>_+-]/.test(password)) {
    return "Password must contain at least one special character"
  }
  return null
}
