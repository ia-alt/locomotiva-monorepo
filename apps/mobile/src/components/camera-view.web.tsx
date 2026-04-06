import React, { useEffect, useRef } from 'react'
import jsQR from 'jsqr'

type Props = {
    onScan: (code: string) => void
}

export function CameraView({ onScan }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animFrameRef = useRef<number>(0)
    const streamRef = useRef<MediaStream | null>(null)
    const scannedRef = useRef(false)

    useEffect(() => {
        scannedRef.current = false

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'environment' } })
            .then((stream) => {
                streamRef.current = stream
                const video = videoRef.current
                if (!video) return
                video.srcObject = stream
                video.play()
                requestAnimationFrame(scanFrame)
            })
            .catch((err) => {
                console.error('[QRCodeReader] Erro ao acessar câmera:', err)
            })

        function scanFrame() {
            if (scannedRef.current) return

            const video = videoRef.current
            const canvas = canvasRef.current
            if (!video || !canvas) return

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                const ctx = canvas.getContext('2d')
                if (!ctx) return
                ctx.drawImage(video, 0, 0)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const result = jsQR(imageData.data, imageData.width, imageData.height)
                if (result) {
                    scannedRef.current = true
                    stopCamera()
                    onScan(result.data)
                    return
                }
            }

            animFrameRef.current = requestAnimationFrame(scanFrame)
        }

        function stopCamera() {
            cancelAnimationFrame(animFrameRef.current)
            streamRef.current?.getTracks().forEach((t) => t.stop())
        }

        return () => {
            stopCamera()
        }
    }, [onScan])

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                playsInline
                muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    )
}
