import { useState, forwardRef, type InputHTMLAttributes } from "react"

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
  helperText?: string
  error?: string
  inputClassName?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      helperText,
      error,
      className = "",
      inputClassName = "",
      id,
      name = "password",
      placeholder = "Your password",
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || name

    const inputElement = (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          id={inputId}
          name={name}
          type={showPassword ? "text" : "password"}
          disabled={disabled}
          placeholder={placeholder}
          className={`form-field pr-11 ${error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : ""} ${inputClassName}`}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:text-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            // Eye Off Icon
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            // Eye Icon
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    )

    if (!label && !helperText && !error) {
      return <div className={className}>{inputElement}</div>
    }

    return (
      <div className={`space-y-1 ${className}`}>
        {label && (
          <label htmlFor={inputId} className="field-label mb-1">
            {label}
          </label>
        )}
        {inputElement}
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"
export default PasswordInput
