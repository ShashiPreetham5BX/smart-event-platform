const Input = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
    ...rest
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`
          w-full px-4 py-3 rounded-lg bg-surface border
          text-text-primary placeholder:text-text-muted
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-accent/40
          ${error ? "border-danger focus:ring-danger/30" : "border-border focus:border-accent"}
        `}
                {...rest}
            />
            {error && (
                <p className="mt-1.5 text-sm text-danger">{error}</p>
            )}
        </div>
    )
}

export default Input