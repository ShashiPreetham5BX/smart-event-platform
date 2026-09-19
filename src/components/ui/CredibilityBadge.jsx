import { useCredibility } from "../../hooks/useCredibility"

const CredibilityBadge = ({ userId }) => {
    const { score, loading } = useCredibility(userId)

    // While loading, or if we couldn't compute a score at all, show nothing
    // rather than a half-finished badge — a missing badge is less confusing
    // than one that briefly shows wrong information.
    if (loading || score === null) {
        return null
    }

    let label = "New Reviewer"
    let colorClasses = "bg-surface-hover text-text-muted"

    if (score >= 70) {
        label = "Trusted Reviewer"
        colorClasses = "bg-success/15 text-success"
    } else if (score >= 40) {
        label = "Active Reviewer"
        colorClasses = "bg-accent-soft text-accent"
    }

    return (
        <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClasses}`}
            title={`Credibility score: ${score}/100`}
        >
            {label}
        </span>
    )
}

export default CredibilityBadge