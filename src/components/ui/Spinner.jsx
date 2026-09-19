const Spinner = ({ size = "md", label = "Loading" }) => {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-6 h-6 border-2",
        lg: "w-10 h-10 border-[3px]",
    }

    return (
        <div
            role="status"
            aria-label={label}
            className={`
        ${sizeClasses[size]}
        rounded-full border-border border-t-accent
        animate-spin
      `}
        />
    )
}

export default Spinner