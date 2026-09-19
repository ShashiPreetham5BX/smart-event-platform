import { useState, useEffect } from "react"

const STORAGE_KEY = "eventai-theme"

const getInitialTheme = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "light" || saved === "dark") return saved

    // No saved preference yet — respect the OS-level setting
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches
    return prefersLight ? "light" : "dark"
}

export const useTheme = () => {
    const [theme, setTheme] = useState(getInitialTheme)

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem(STORAGE_KEY, theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme((current) => (current === "dark" ? "light" : "dark"))
    }

    return { theme, toggleTheme }
}