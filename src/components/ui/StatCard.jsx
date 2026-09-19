const StatCard = ({ icon: Icon, label, value, accent = false }) => {
    return (
        <div
            className={`
        rounded-xl p-6 border transition-colors
        ${accent
                    ? "bg-accent-soft border-accent/30"
                    : "bg-surface border-border"}
      `}
        >
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${accent ? "bg-accent/20" : "bg-bg"}`}>
                <Icon className={`text-xl ${accent ? "text-accent" : "text-text-secondary"}`} />
            </div>
            <h2 className="text-sm font-medium text-text-secondary">{label}</h2>
            <p className={`text-4xl font-bold mt-2 ${accent ? "text-accent" : "text-text-primary"}`}>
                {value}
            </p>
        </div>
    )
}

export default StatCard