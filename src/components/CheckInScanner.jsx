import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"

const CheckInScanner = ({ onScan, paused }) => {
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const animationRef = useRef(null)
    const [cameraError, setCameraError] = useState(null)

    useEffect(() => {
        let stream = null

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                })

                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()
                    scanLoop()
                }
            } catch (err) {
                setCameraError(
                    "Could not access camera. Please grant camera permission and reload."
                )
            }
        }

        const scanLoop = () => {
            if (paused) {
                animationRef.current = requestAnimationFrame(scanLoop)
                return
            }

            const video = videoRef.current
            const canvas = canvasRef.current

            if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight

                const ctx = canvas.getContext("2d")
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const code = jsQR(imageData.data, imageData.width, imageData.height)

                if (code && code.data) {
                    onScan(code.data)
                }
            }

            animationRef.current = requestAnimationFrame(scanLoop)
        }

        startCamera()

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (cameraError) {
        return (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-6 text-center">
                {cameraError}
            </div>
        )
    }

    return (
        <div className="relative rounded-xl overflow-hidden bg-black">
            <video ref={videoRef} className="w-full aspect-square object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-8 border-2 border-accent rounded-2xl pointer-events-none" />
        </div>
    )
}
export default CheckInScanner