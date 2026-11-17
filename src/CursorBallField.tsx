import { useEffect, useRef } from 'react'

type Ball = {
  x: number
  y: number
  vx: number
  vy: number
  baseVx: number
  baseVy: number
  radius: number
  color: string
  opacity: number
}

const CURSOR_RADIUS = 140
const DESKTOP_BALLS = 24
const MOBILE_BALLS = 12

function between(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export function CursorBallField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const cursor = { x: -1000, y: -1000, active: false, lastMove: 0 }
    let reduceMotion = motionPreference.matches
    let balls: Ball[] = []
    let viewportWidth = 0
    let viewportHeight = 0
    let animationFrame = 0
    let running = false
    let previousFrame = performance.now()

    const createBall = (): Ball => {
      const angle = between(0, Math.PI * 2)
      const speed = between(0.14, 0.34)
      const baseVx = Math.cos(angle) * speed
      const baseVy = Math.sin(angle) * speed

      return {
        x: between(8, Math.max(9, viewportWidth - 8)),
        y: between(8, Math.max(9, viewportHeight - 8)),
        vx: baseVx,
        vy: baseVy,
        baseVx,
        baseVy,
        radius: between(2.5, 6.5),
        color: Math.random() > 0.28 ? '#f97316' : '#fff7ed',
        opacity: between(0.28, 0.56),
      }
    }

    const draw = () => {
      context.clearRect(0, 0, viewportWidth, viewportHeight)
      balls.forEach((ball) => {
        context.globalAlpha = ball.opacity
        context.fillStyle = ball.color
        context.beginPath()
        context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
        context.fill()
      })
      context.globalAlpha = 1
    }

    const resize = () => {
      const oldWidth = viewportWidth
      const oldHeight = viewportHeight
      viewportWidth = window.innerWidth
      viewportHeight = window.innerHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, viewportWidth < 768 ? 1.25 : 1.5)

      canvas.width = Math.round(viewportWidth * pixelRatio)
      canvas.height = Math.round(viewportHeight * pixelRatio)
      canvas.style.width = `${viewportWidth}px`
      canvas.style.height = `${viewportHeight}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      const requiredCount = viewportWidth < 768 ? MOBILE_BALLS : DESKTOP_BALLS
      if (balls.length === requiredCount && oldWidth > 0 && oldHeight > 0) {
        balls.forEach((ball) => {
          ball.x = Math.min(viewportWidth - ball.radius, Math.max(ball.radius, ball.x * viewportWidth / oldWidth))
          ball.y = Math.min(viewportHeight - ball.radius, Math.max(ball.radius, ball.y * viewportHeight / oldHeight))
        })
      } else {
        balls = Array.from({ length: requiredCount }, createBall)
      }

      draw()
    }

    const animate = (time: number) => {
      if (!running) return

      const frameScale = Math.min(Math.max((time - previousFrame) / 16.67, 0.25), 2.25)
      previousFrame = time
      const cursorIsMoving = cursor.active && time - cursor.lastMove < 180

      balls.forEach((ball) => {
        if (cursorIsMoving) {
          const dx = ball.x - cursor.x
          const dy = ball.y - cursor.y
          const distance = Math.hypot(dx, dy)

          if (distance > 0 && distance < CURSOR_RADIUS) {
            const force = (1 - distance / CURSOR_RADIUS) * 0.62 * frameScale
            ball.vx += dx / distance * force
            ball.vy += dy / distance * force
          }
        }

        ball.vx += (ball.baseVx - ball.vx) * 0.024 * frameScale
        ball.vy += (ball.baseVy - ball.vy) * 0.024 * frameScale

        const speed = Math.hypot(ball.vx, ball.vy)
        if (speed > 3.2) {
          ball.vx = ball.vx / speed * 3.2
          ball.vy = ball.vy / speed * 3.2
        }

        ball.x += ball.vx * frameScale
        ball.y += ball.vy * frameScale

        if (ball.x <= ball.radius || ball.x >= viewportWidth - ball.radius) {
          ball.x = Math.min(viewportWidth - ball.radius, Math.max(ball.radius, ball.x))
          ball.vx *= -0.88
          ball.baseVx *= -1
        }
        if (ball.y <= ball.radius || ball.y >= viewportHeight - ball.radius) {
          ball.y = Math.min(viewportHeight - ball.radius, Math.max(ball.radius, ball.y))
          ball.vy *= -0.88
          ball.baseVy *= -1
        }
      })

      draw()
      animationFrame = window.requestAnimationFrame(animate)
    }

    const start = () => {
      if (running || reduceMotion || document.hidden) return
      running = true
      previousFrame = performance.now()
      animationFrame = window.requestAnimationFrame(animate)
    }

    const stop = () => {
      running = false
      window.cancelAnimationFrame(animationFrame)
    }

    const handlePointerMove = (event: PointerEvent) => {
      cursor.x = event.clientX
      cursor.y = event.clientY
      cursor.active = true
      cursor.lastMove = performance.now()
    }

    const deactivateCursor = () => {
      cursor.active = false
    }

    const handleVisibility = () => {
      if (document.hidden) stop()
      else if (reduceMotion) draw()
      else start()
    }

    const handleMotionPreference = () => {
      reduceMotion = motionPreference.matches
      if (reduceMotion) {
        stop()
        draw()
      } else {
        start()
      }
    }

    resize()
    start()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('blur', deactivateCursor)
    document.documentElement.addEventListener('mouseleave', deactivateCursor)
    document.addEventListener('visibilitychange', handleVisibility)
    motionPreference.addEventListener('change', handleMotionPreference)

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('blur', deactivateCursor)
      document.documentElement.removeEventListener('mouseleave', deactivateCursor)
      document.removeEventListener('visibilitychange', handleVisibility)
      motionPreference.removeEventListener('change', handleMotionPreference)
    }
  }, [])

  return <canvas ref={canvasRef} className="cursor-ball-field" aria-hidden="true" />
}
