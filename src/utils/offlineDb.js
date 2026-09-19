const DB_NAME = "eventai-offline"
const DB_VERSION = 1
const STORE_TICKETS = "tickets"
const STORE_QUEUE = "sync_queue"

// Opens (or creates, on first use) the local offline database.
const openDb = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onupgradeneeded = (event) => {
            const db = event.target.result

            if (!db.objectStoreNames.contains(STORE_TICKETS)) {
                db.createObjectStore(STORE_TICKETS, { keyPath: "ticket_token" })
            }

            if (!db.objectStoreNames.contains(STORE_QUEUE)) {
                db.createObjectStore(STORE_QUEUE, { keyPath: "id", autoIncrement: true })
            }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

// Wipes and replaces the local ticket cache for an event with a fresh
// snapshot — used right before offline mode starts.
export const cacheTicketsForEvent = async (tickets) => {
    const db = await openDb()
    const tx = db.transaction(STORE_TICKETS, "readwrite")
    const store = tx.objectStore(STORE_TICKETS)

    tickets.forEach((ticket) => store.put(ticket))

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

// Looks up one ticket by its token in the local cache.
export const getCachedTicket = async (token) => {
    const db = await openDb()
    const tx = db.transaction(STORE_TICKETS, "readonly")
    const store = tx.objectStore(STORE_TICKETS)

    return new Promise((resolve, reject) => {
        const request = store.get(token)
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
    })
}

// Marks a ticket as checked-in LOCALLY (does not touch the real server).
export const markCheckedInLocally = async (token) => {
    const db = await openDb()
    const tx = db.transaction(STORE_TICKETS, "readwrite")
    const store = tx.objectStore(STORE_TICKETS)

    const ticket = await new Promise((resolve) => {
        const req = store.get(token)
        req.onsuccess = () => resolve(req.result)
    })

    if (ticket) {
        ticket.checked_in_locally = true
        ticket.checked_in_local_time = new Date().toISOString()
        store.put(ticket)
    }

    return new Promise((resolve) => { tx.oncomplete = () => resolve() })
}

// Adds a check-in to the queue to be synced with the server later.
export const queueCheckIn = async (token) => {
    const db = await openDb()
    const tx = db.transaction(STORE_QUEUE, "readwrite")
    const store = tx.objectStore(STORE_QUEUE)

    store.add({ ticket_token: token, queued_at: new Date().toISOString() })

    return new Promise((resolve) => { tx.oncomplete = () => resolve() })
}

// Reads everything currently waiting to be synced.
export const getQueuedCheckIns = async () => {
    const db = await openDb()
    const tx = db.transaction(STORE_QUEUE, "readonly")
    const store = tx.objectStore(STORE_QUEUE)

    return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

// Removes one item from the sync queue after it's been successfully synced.
export const removeFromQueue = async (id) => {
    const db = await openDb()
    const tx = db.transaction(STORE_QUEUE, "readwrite")
    const store = tx.objectStore(STORE_QUEUE)

    store.delete(id)

    return new Promise((resolve) => { tx.oncomplete = () => resolve() })
}