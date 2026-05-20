import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://fqqgxhnxdsdmecxkvscg.supabase.co"

const supabaseKey = "sb_publishable_KyZAiqM36KSTiGZxpLmz9g_bIdEhTeU"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)