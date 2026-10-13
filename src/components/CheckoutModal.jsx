import { useState, useEffect } from "react"
import QRCode from "qrcode"
import { FaCheckCircle, FaTimes, FaQrcode, FaCreditCard, FaEnvelope, FaTicketAlt, FaShieldAlt } from "react-icons/fa"
import Button from "./ui/Button"
import Spinner from "./ui/Spinner"

const TIERS = [
  { id: "standard", name: "Standard Admission", multiplier: 1, desc: "General access to event hall & seating" },
  { id: "early_bird", name: "Early Bird Discount", multiplier: 0.85, desc: "15% off limited special admission" },
  { id: "vip", name: "VIP Experience", multiplier: 1.5, desc: "Priority seating, fast-track entry & refreshments" }
]

const CheckoutModal = ({
  open,
  event,
  user,
  onClose,
  onCompleteBooking
}) => {
  const [selectedTier, setSelectedTier] = useState("standard")
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [upiId, setUpiId] = useState("")
  const [emailDelivery, setEmailDelivery] = useState(true)
  const [deliveryEmail, setDeliveryEmail] = useState("")
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)
  const [upiQrUrl, setUpiQrUrl] = useState("")

  useEffect(() => {
    if (user?.email) {
      setDeliveryEmail(user.email)
    }
  }, [user])

  // Generate UPI payment QR code string: upi://pay?pa=...
  useEffect(() => {
    if (!open || !event) return
    const tier = TIERS.find((t) => t.id === selectedTier) || TIERS[0]
    const unitPrice = Math.round(Number(event.price || 0) * tier.multiplier)
    const totalAmount = unitPrice * quantity

    const upiString = `upi://pay?pa=organizer@upi&pn=EventPlatform&am=${totalAmount}&cu=INR&tn=Ticket_${event.id}`
    QRCode.toDataURL(upiString, { width: 180, margin: 1 })
      .then(setUpiQrUrl)
      .catch((err) => console.error("Error generating UPI QR:", err))
  }, [open, event, selectedTier, quantity])

  useEffect(() => {
    if (!open) {
      setProcessing(false)
      setCompleted(false)
      setBookingResult(null)
      setSelectedTier("standard")
      setQuantity(1)
    }
  }, [open])

  if (!open || !event) return null

  const tier = TIERS.find((t) => t.id === selectedTier) || TIERS[0]
  const unitPrice = Math.round(Number(event.price || 0) * tier.multiplier)
  const subtotal = unitPrice * quantity
  const serviceFee = subtotal > 0 ? Math.round(subtotal * 0.05) : 0
  const grandTotal = subtotal + serviceFee

  const handlePayAndConfirm = async () => {
    setProcessing(true)

    // Simulate payment gateway delay (1.2s)
    await new Promise((res) => setTimeout(res, 1200))

    const bookingPayload = {
      tier: tier.name,
      quantity,
      unitPrice,
      totalAmount: grandTotal,
      deliveryEmail: emailDelivery ? deliveryEmail : null,
      paymentMethod
    }

    const result = await onCompleteBooking(bookingPayload)
    setProcessing(false)

    if (result.success) {
      setBookingResult(result)
      setCompleted(true)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={() => !processing && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaTicketAlt className="text-blue-500" />
              {completed ? "Booking Confirmed!" : "Book Your Tickets"}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-sm">{event.title}</p>
          </div>
          {!processing && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {completed ? (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                <FaCheckCircle />
              </div>
              <h3 className="text-2xl font-bold text-white">You're all set!</h3>
              <p className="text-zinc-400 max-w-sm mx-auto">
                Payment received via <span className="uppercase text-white font-semibold">{paymentMethod}</span>. Your ticket has been generated and confirmed.
              </p>

              {emailDelivery && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 flex items-center justify-center gap-2">
                  <FaEnvelope className="text-blue-400 text-sm" />
                  Confirmation & digital pass sent to: <span className="font-semibold text-white">{deliveryEmail}</span>
                </div>
              )}

              <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 text-left space-y-2 mt-4">
                {bookingResult?.bookingId && (
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Booking Ref</span>
                    <span className="text-white font-mono font-semibold">#{bookingResult.bookingId}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Pass Type</span>
                  <span className="text-white font-medium">{tier.name}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Tickets</span>
                  <span className="text-white font-medium">{quantity} seat(s)</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Total Paid</span>
                  <span className="text-emerald-400 font-bold">₹{grandTotal}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button variant="primary" onClick={onClose} className="w-full justify-center">
                  Done & View Tickets
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Tier Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  1. Select Ticket Tier
                </label>
                <div className="grid gap-2">
                  {TIERS.map((t) => {
                    const price = Math.round(Number(event.price || 0) * t.multiplier)
                    const isSelected = selectedTier === t.id
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTier(t.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-950/40 border-blue-500 shadow-sm"
                            : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {t.name}
                            {t.id === "early_bird" && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                                15% OFF
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">{t.desc}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-blue-400">₹{price}</span>
                          <span className="text-[10px] text-zinc-500 block">/ticket</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  2. Number of Tickets
                </label>
                <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <span className="text-zinc-300 font-medium">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="font-bold text-base px-2">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= 10}
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  3. Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                      paymentMethod === "upi"
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <FaQrcode /> UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                      paymentMethod === "card"
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <FaCreditCard /> Card / NetBanking
                  </button>
                </div>

                {paymentMethod === "upi" ? (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-3">
                    <p className="text-xs text-zinc-400 text-center">
                      Scan with Google Pay, PhonePe, Paytm, or any UPI app to pay <strong className="text-white">₹{grandTotal}</strong>
                    </p>
                    {upiQrUrl && (
                      <div className="bg-white p-2 rounded-xl shadow-lg">
                        <img src={upiQrUrl} alt="UPI QR Code" className="w-36 h-36" />
                      </div>
                    )}
                    <div className="w-full flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        placeholder="Or enter UPI ID (e.g. name@upi)"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setUpiId("sample@upi")}
                        className="text-[11px] text-blue-400 hover:underline shrink-0"
                      >
                        Auto-fill
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number (4111 2222 3333 4444)"
                      defaultValue="4242 •••• •••• 4242"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="12/28"
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        defaultValue="888"
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Email Delivery Option */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailDelivery}
                    onChange={(e) => setEmailDelivery(e.target.checked)}
                    className="accent-blue-500 rounded"
                  />
                  <span>Send copy of ticket & QR pass to email</span>
                </label>
                {emailDelivery && (
                  <input
                    type="email"
                    value={deliveryEmail}
                    onChange={(e) => setDeliveryEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Tickets ({quantity} × ₹{unitPrice})</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Platform & Processing Fee (5%)</span>
                  <span>₹{serviceFee}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-zinc-800/80">
                  <span>Total Payable</span>
                  <span className="text-blue-400 text-base">₹{grandTotal}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-500 justify-center">
                <FaShieldAlt className="text-emerald-500" /> 256-bit Encrypted Checkout • Instant QR Ticket Delivery
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!completed && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handlePayAndConfirm}
              disabled={processing}
              className="gap-2"
            >
              {processing ? (
                <>
                  <Spinner size="sm" /> Authorizing Payment...
                </>
              ) : (
                `Pay ₹${grandTotal} & Confirm`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutModal
