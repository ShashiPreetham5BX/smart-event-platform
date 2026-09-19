import { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now() + Math.random()
        setToasts((prev) => [...prev, { id, message, type }])

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 4000)
    }, [])

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* TOAST STACK — fixed to the corner, above everything */}
            <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        role="status"
                        className={`
              rounded-lg border px-4 py-3 shadow-elevated backdrop-blur-sm
              flex items-start gap-3 animate-toast-in
              ${toast.type === "success"
                                ? "bg-success/15 border-success/30 text-success"
                                : "bg-danger/15 border-danger/30 text-danger"}
            `}
                    >
                        <span className="text-lg leading-none">
                            {toast.type === "success" ? "✓" : "!"}
                        </span>
                        <p className="text-sm text-text-primary flex-1">{toast.message}</p>
                        <button
                            onClick={() => dismissToast(toast.id)}
                            aria-label="Dismiss notification"
                            className="text-text-muted hover:text-text-primary"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => useContext(ToastContext)