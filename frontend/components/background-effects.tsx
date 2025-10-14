"use client"

import { useEffect, useRef } from "react"

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particleLayers: Array<{
      particles: Array<{
        x: number
        y: number
        size: number
        speedX: number
        speedY: number
        opacity: number
        baseOpacity: number
        flickerSpeed: number
        flickerPhase: number
      }>
      depth: number
    }> = []

    for (let layer = 0; layer < 6; layer++) {
      const depth = (layer + 1) / 6
      const particleCount = Math.floor(150 + layer * 30)
      const particles = []

      for (let i = 0; i < particleCount; i++) {
        const baseOpacity = Math.random() * 0.4 + 0.1
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.2 + 0.3,
          speedX: (Math.random() - 0.5) * 0.08 * depth,
          speedY: (Math.random() - 0.5) * 0.08 * depth,
          opacity: baseOpacity,
          baseOpacity,
          flickerSpeed: Math.random() * 0.008 + 0.002,
          flickerPhase: Math.random() * Math.PI * 2,
        })
      }

      particleLayers.push({ particles, depth })
    }

    let frame = 0

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      frame++

      particleLayers.forEach((layer) => {
        layer.particles.forEach((particle) => {
          particle.x += particle.speedX
          particle.y += particle.speedY

          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y < 0) particle.y = canvas.height
          if (particle.y > canvas.height) particle.y = 0

          const flicker = Math.sin(frame * particle.flickerSpeed + particle.flickerPhase) * 0.15 + 0.85
          const currentOpacity = particle.baseOpacity * flicker

          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 2,
          )

          const isWhite = Math.random() > 0.3
          const color = isWhite ? "255, 255, 255" : "200, 230, 255"

          gradient.addColorStop(0, `rgba(${color}, ${currentOpacity})`)
          gradient.addColorStop(0.5, `rgba(${color}, ${currentOpacity * 0.3})`)
          gradient.addColorStop(1, "transparent")

          ctx.fillStyle = gradient
          ctx.fill()

          if (particle.size > 0.8 && Math.random() > 0.95) {
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size * 0.4, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 1.2})`
            ctx.fill()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Neon background glow with multiple layers */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-cyan-500/5 animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-tl from-purple-500/5 via-cyan-500/5 to-purple-500/5 animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "1s" }}
        />

        {/* Animated particles canvas with enhanced opacity */}
        <canvas ref={canvasRef} className="absolute inset-0 opacity-80" />

        {/* Floating orbs for additional depth */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDuration: "10s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDuration: "12s", animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-400/8 rounded-full blur-3xl animate-float"
          style={{ animationDuration: "15s", animationDelay: "4s" }}
        />
      </div>
    </>
  )
}
