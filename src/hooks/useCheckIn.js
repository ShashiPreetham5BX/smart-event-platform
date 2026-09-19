import { useState } from "react"
import { supabase } from "../services/supabase"

/**
 * Calls verify_and_checkin_ticket() to validate and mark a scanned
 * ticket as checked in. Single-use enforcement happens entirely on
 * the database side (see Feature 6, Step 3).
 */
export const useCheckIn = () => {
    const [processing, setProcessing] = useState(false)

    const checkInTicket = async (token) => {
        setProcessing(true)

        const { data, error } = await supabase
            .rpc("verify_and_checkin_ticket", { token })

        setProcessing(false)

        if (error) {
            return { success: false, message: error.message }
        }

        if (!data || data.length === 0) {
            return { success: false, message: "Unexpected response from server." }
        }

        return data[0]
    }

    return { checkInTicket, processing }
}