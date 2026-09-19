import { useEffect } from "react"
import Button from "./Button"

const Modal = ({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    onConfirm,
    onCancel,
}) => {
    // Allow closing the modal with the Escape key — a small but expected
    // accessibility convention for any dialog.
    useEffect(() => {
        if (!open) return

        const handleKeyDown = (e) => {
            if (e.key === "Escape") onCancel()
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [open, onCancel])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            {/* Backdrop — dimmed background, click to dismiss */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog box */}
            <div className="relative bg-surface border border-border rounded-xl p-6 w-full max-w-sm shadow-elevated">
                <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                {description && (
                    <p className="text-text-secondary text-sm mt-2">{description}</p>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button variant={variant} size="sm" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Modal