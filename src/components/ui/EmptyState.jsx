import { Link } from "react-router-dom"
import Button from "./Button"

const EmptyState = ({ icon, title, description, actionLabel, actionTo, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-3xl mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
            {description && (
                <p className="text-text-secondary mt-2 max-w-sm">{description}</p>
            )}
            {actionLabel && actionTo && (
                <Link to={actionTo} className="mt-6">
                    <Button>{actionLabel}</Button>
                </Link>
            )}
            {actionLabel && onAction && !actionTo && (
                <Button className="mt-6" onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    )
}

export default EmptyState