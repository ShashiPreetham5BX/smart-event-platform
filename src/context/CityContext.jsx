import { createContext, useContext, useState, useEffect } from "react"

export const CITIES = [
  { id: "hyderabad", name: "Hyderabad", label: "Hyderabad, TS" },
  { id: "bengaluru", name: "Bengaluru", label: "Bengaluru, KA" },
  { id: "mumbai", name: "Mumbai", label: "Mumbai, MH" },
  { id: "delhi", name: "Delhi NCR", label: "Delhi NCR" },
  { id: "pune", name: "Pune", label: "Pune, MH" },
  { id: "chennai", name: "Chennai", label: "Chennai, TN" }
]

const CityContext = createContext()

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem("eventai_city") || "Hyderabad"
  })

  useEffect(() => {
    localStorage.setItem("eventai_city", selectedCity)
  }, [selectedCity])

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, cities: CITIES }}>
      {children}
    </CityContext.Provider>
  )
}

export const useCity = () => {
  const context = useContext(CityContext)
  if (!context) {
    return { selectedCity: "Hyderabad", setSelectedCity: () => {}, cities: CITIES }
  }
  return context
}
