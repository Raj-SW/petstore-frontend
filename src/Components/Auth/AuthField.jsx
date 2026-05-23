const AuthField = ({
  label,
  name,
  type = "text",
  icon: Icon,
  value,
  onChange,
  placeholder,
  error,
  required,
  rightAdornment,
  ...rest
}) => (
  <div className="auth-field">
    {label && <label htmlFor={name} className="auth-field-label">{label}</label>}
    <div className={`auth-field-input-wrap${error ? " auth-field-input-wrap--error" : ""}`}>
      {Icon && <Icon className="auth-field-icon" />}
      <input
        id={name}
        name={name}
        type={type}
        className="auth-field-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...rest}
      />
      {rightAdornment && <span className="auth-field-right">{rightAdornment}</span>}
    </div>
    {error && <span className="auth-field-error">{error}</span>}
  </div>
);

export default AuthField;
