const VARIANTS = {
    primary: "bg-accent hover:bg-accent-hover text-white",
    danger: "bg-danger hover:bg-danger-hover text-white",
    warning: "bg-warning hover:bg-warning/90 text-black",
    success: "bg-success hover:bg-success/90 text-white",
    ghost: "bg-surface hover:bg-surface-hover text-text-primary border border-border",
}

const SIZES = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
}

const Button = ({
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    type = "button",
    onClick,
    className = "",
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
        font-semibold rounded-lg transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.98]
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
        >
            {children}
        </button>
    )
}

export default Button