import { supabase } from "./supabase"

// Fallback intelligent EventAI response generator when cloud edge function is offline
const generateLocalEventAIResponse = (prompt) => {
  const lower = prompt.toLowerCase()

  if (lower.includes("music festival") || lower.includes("music fest") || lower.includes("concert")) {
    return `🎶 **Electric Horizons: Live Music Festival 2026**

Get ready for an unforgettable weekend where sound meets soul! *Electric Horizons* unites top indie artists, electronic producers, and acoustic visionaries across three immersive open-air stages.

✨ **Festival Highlights:**
• **Lineup**: 18+ live acts, headline international DJ sets, and underground indie sensations.
• **Experiences**: Artisan food truck village, psychedelic art installations, and chillout acoustic domes.
• **Vibe**: Eco-conscious festival grounds with 100% biodegradable cup policies and solar-powered night stages.

🎟️ *Grab your passes early on EventAI to secure Early-Bird discounts and express gate entry!*`
  }

  if (lower.includes("theme") && (lower.includes("tech") || lower.includes("conference") || lower.includes("summit"))) {
    return `🚀 **Top 5 High-Impact Themes for Your Tech Conference:**

1. **"Beyond Tomorrow: Agentic AI & Autonomous Systems"**
   *Focus:* Real-world AI agents, multi-modal workflows, enterprise governance, and developer productivity.
   
2. **"Code & Cloud: Architecting Resilience at Global Scale"**
   *Focus:* Distributed microservices, edge computing, modern observability, and zero-downtime releases.

3. **"The Decentralized Horizon: Open Source, Security & Trust"**
   *Focus:* Supply chain security, open-weight foundation models, privacy engineering, and cyber defense.

4. **"Next-Gen Interfaces: Spatial, Voice & Cognitive Computing"**
   *Focus:* Beyond the screen — multimodal ambient computing, wearable AI, and human-computer symbiosis.

5. **"Green Compute: Sustainable Engineering & Carbon-Aware Clouds"**
   *Focus:* Datacenter efficiency, efficient model training, and reducing IT carbon footprints.

💡 *Pro-Tip: Choose 3 key tracks (e.g., Engineering, Architecture, Product) to keep attendees focused!*`
  }

  if (lower.includes("ticket") || lower.includes("sales") || lower.includes("increase") || lower.includes("promote")) {
    return `📈 **Proven Playbook to Supercharge Event Ticket Sales:**

1. **Tiered Scarcity Pricing** 🎟️
   • Launch *Super Early-Bird* (25% off, first 50 tickets only).
   • Create a ticking countdown banner on EventAI: "Price rises in 48 hours".
   • Introduce VIP Passes (bundle express entry, lanyard, backstage lounge access).

2. **Micro-Community Influencer Access** 📣
   • Give prominent speakers, local creators, and community leads a personalized promo code (e.g., \`SPEAKER10\`).
   • Offer group discounts ("Squad Pass: Buy 4, Get 1 Free").

3. **Engaging Video Teasers & Countdown** 🎥
   • Release 15-second teaser reels showcasing previous event energy or speaker highlights.
   • Post attendee testimonials with credibility badges.

4. **Retargeting & Abandoned Booking Follow-up** 💌
   • Send automated email reminders with direct 1-click checkout links to attendees who viewed the event.

5. **Flash Sales & Secret Perk Drops** ⚡
   • Host a 4-hour "Midweek Flash Drop" with a secret bonus swag item for the next 20 buyers.`
  }

  if (lower.includes("sponsor") || lower.includes("pitch") || lower.includes("partnership")) {
    return `🤝 **Winning Event Sponsorship Proposal Framework:**

• **Slide 1: The Audience Persona** — Quantify who attends (e.g., 68% Senior Engineers, 22% Founders, Avg age 24–38).
• **Slide 2: Measurable Value Pillars** — Don't just sell logos on banners. Offer:
  - Exclusive Workshop Hall naming rights.
  - Sponsored Lounge / Barista Coffee station.
  - Direct hiring / talent booth access.
  - Opt-in attendee resume & lead database.
• **Slide 3: Sponsorship Tiers** — Platinum (₹1,50,000), Gold (₹75,000), Community Partner (₹25,000).`
  }

  if (lower.includes("venue") || lower.includes("location") || lower.includes("logistics")) {
    return `📍 **Event Venue & Logistics Checklist:**

• **Accessibility**: Ramps, elevators, accessible restrooms, and clear signage.
• **Connectivity**: Dedicated 500+ Mbps fiber internet line for live streaming & QR scanners.
• **Power & Backup**: Generator backup for audio/visual setups.
• **Entry Flow**: Minimum 2 check-in scanner lanes per 150 expected attendees to prevent bottlenecking.
• **F&B**: Dedicated water refilling stations and quick-grab meal zones.`
  }

  // General comprehensive response
  return `💡 **EventAI Assistant Insights:**

Here is what I recommend for **"${prompt}"**:

1. **Core Concept & Value Proposition**:
   Focus on the transformation your attendees will experience. Give them a tangible reason to prioritize your date over competing plans.

2. **Target Audience Engagement**:
   Identify the primary demographic and engage them early with teasers, speaker spotlights, or behind-the-scenes previews.

3. **Seamless Discovery & Check-in**:
   Use EventAI's single-use cryptographic QR passes and multi-tier pricing to streamline guest entry and prevent check-in friction.

4. **Post-Event Retention**:
   Send trust-weighted review prompts immediately after the event ends to build a high credibility score for your next edition!

Feel free to ask for specific copy, email templates, budget outlines, or marketing timelines!`
}

export const askEventAI = async (messages) => {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || ""

  // 1. Try Supabase Edge Function first (with 3.5s timeout)
  try {
    const edgePromise = supabase.functions.invoke("ai-chat", {
      body: { messages }
    })
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Edge function timeout")), 3500)
    )

    const { data, error } = await Promise.race([edgePromise, timeoutPromise])
    if (!error && data?.reply) {
      return { success: true, reply: data.reply, provider: "supabase-edge" }
    }
  } catch (err) {
    console.warn("Supabase edge function unreachable, falling back:", err.message)
  }

  // 2. Try Gemini API directly if key is configured
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY
  if (apiKey && !apiKey.startsWith("AQ.Ab")) {
    try {
      const contents = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }))

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{
                text: "You are EventAI, an intelligent assistant for event discovery, planning, ticketing, and marketing. Be creative, practical, concise, and helpful."
              }]
            }
          })
        }
      )

      if (response.ok) {
        const json = await response.json()
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          return { success: true, reply: text, provider: "gemini-direct" }
        }
      }
    } catch (err) {
      console.warn("Gemini direct API call failed:", err.message)
    }
  }

  // 3. Fallback to intelligent local EventAI engine
  // Add a slight realistic typing delay (600ms)
  await new Promise((res) => setTimeout(res, 600))
  const localReply = generateLocalEventAIResponse(lastUserMessage)
  return { success: true, reply: localReply, provider: "eventai-local" }
}
