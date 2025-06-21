import "./FormInput.css";

/**
 * Reusable FormInput component with accessibility features
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.name - Input name attribute
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.error - Error message
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.readOnly - Read-only state
 * @param {string} props.icon - Icon component
 * @param {string} props.helpText - Help text
 * @param {Object} props.inputProps - Additional input props
 */
const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  icon,
  helpText,
  inputProps = {},
  className = "",
}) => {
  const inputId = `input-${name}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  return (
    <div
      className={`form-input-group ${error ? "has-error" : ""} ${className}`}
    >
      {label && (
        <label
          htmlFor={inputId}
          className={`form-label ${required ? "required" : ""}`}
        >
          {label}
          {required && (
            <span className="required-indicator" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <div className={`input-wrapper ${icon ? "has-icon" : ""}`}>
        {icon && <span className="input-icon">{icon}</span>}

        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={`form-input ${error ? "input-error" : ""}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={`${error ? errorId : ""} ${
            helpText ? helpId : ""
          }`.trim()}
          {...inputProps}
        />
      </div>

      {helpText && !error && (
        <span id={helpId} className="form-help-text">
          {helpText}
        </span>
      )}

      {error && (
        <span id={errorId} className="form-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
