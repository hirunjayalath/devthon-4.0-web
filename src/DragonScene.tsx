import { useEffect, useRef } from 'react'
import dragonTextureUrl from './assets/dragon/devthon-dragon-fullbody-chroma.png'

type DragonPiece = {
  sourceX: number
  sourceY: number
  width: number
  height: number
  pivotX: number
  pivotY: number
  amplitude: number
  speed: number
  phase: number
}

const imageWidth = 1536
const imageHeight = 1024

const dragonPieces: DragonPiece[] = [
  // Far wing, near wing, then the four lower legs.
  { sourceX: 0, sourceY: 0, width: 476, height: 320, pivotX: 461, pivotY: 164, amplitude: 0.032, speed: 3.4, phase: 0.5 },
  { sourceX: 860, sourceY: 41, width: 676, height: 399, pivotX: 876, pivotY: 287, amplitude: -0.035, speed: 3.4, phase: 0 },
  { sourceX: 69, sourceY: 666, width: 223, height: 256, pivotX: 261, pivotY: 707, amplitude: 0.028, speed: 1.85, phase: 0.2 },
  { sourceX: 307, sourceY: 773, width: 300, height: 225, pivotX: 522, pivotY: 788, amplitude: -0.026, speed: 1.75, phase: 1.1 },
  { sourceX: 630, sourceY: 676, width: 222, height: 246, pivotX: 753, pivotY: 707, amplitude: 0.025, speed: 1.82, phase: 2.1 },
  { sourceX: 799, sourceY: 768, width: 222, height: 236, pivotX: 891, pivotY: 788, amplitude: -0.028, speed: 1.72, phase: 2.8 },
]

function smoothstep(edgeStart: number, edgeEnd: number, value: number) {
  const normalized = Math.min(1, Math.max(0, (value - edgeStart) / (edgeEnd - edgeStart)))
  return normalized * normalized * (3 - 2 * normalized)
}

function prepareDragonImage(image: HTMLImageElement) {
  const keyedCanvas = document.createElement('canvas')
  keyedCanvas.width = imageWidth
  keyedCanvas.height = imageHeight
  const keyedContext = keyedCanvas.getContext('2d', { willReadFrequently: true })
  if (!keyedContext) return null

  keyedContext.drawImage(image, 0, 0, imageWidth, imageHeight)
  const pixels = keyedContext.getImageData(0, 0, imageWidth, imageHeight)

  for (let index = 0; index < pixels.data.length; index += 4) {
    const red = pixels.data[index]
    const green = pixels.data[index + 1]
    const blue = pixels.data[index + 2]
    const greenDominance = green - Math.max(red, blue)
    const greenStrength = smoothstep(18, 95, greenDominance) * smoothstep(70, 190, green)

    if (greenStrength > 0) {
      pixels.data[index + 3] = Math.round(pixels.data[index + 3] * (1 - greenStrength))
      pixels.data[index + 1] = Math.min(green, Math.round(Math.max(red, blue) * 1.12))
    }
  }

  keyedContext.putImageData(pixels, 0, 0)

  const bodyCanvas = document.createElement('canvas')
  bodyCanvas.width = imageWidth
  bodyCanvas.height = imageHeight
  const bodyContext = bodyCanvas.getContext('2d')
  if (!bodyContext) return null
  bodyContext.drawImage(keyedCanvas, 0, 0)

  const pieceCanvases = dragonPieces.map((piece, index) => {
    const pieceCanvas = document.createElement('canvas')
    pieceCanvas.width = piece.width
    pieceCanvas.height = piece.height
    const pieceContext = pieceCanvas.getContext('2d')
    if (!pieceContext) return pieceCanvas
    pieceContext.drawImage(
      keyedCanvas,
      piece.sourceX,
      piece.sourceY,
      piece.width,
      piece.height,
      0,
      0,
      piece.width,
      piece.height,
    )

    if (index === 0) {
      // Follow the far wing's actual outer silhouette so its two pointed sections stay together.
      pieceContext.globalCompositeOperation = 'destination-in'
      pieceContext.beginPath()
      pieceContext.moveTo(0, 0)
      pieceContext.lineTo(476, 0)
      pieceContext.lineTo(476, 210)
      pieceContext.lineTo(400, 210)
      pieceContext.lineTo(330, 190)
      pieceContext.lineTo(270, 185)
      pieceContext.lineTo(190, 210)
      pieceContext.lineTo(20, 310)
      pieceContext.lineTo(0, 320)
      pieceContext.closePath()
      pieceContext.fillStyle = '#fff'
      pieceContext.fill()
    }

    return pieceCanvas
  })

  dragonPieces.forEach((piece, index) => {
    if (index === 0) {
      // Remove the inner portion while retaining a narrow overlap along the structural joint.
      bodyContext.save()
      bodyContext.beginPath()
      bodyContext.moveTo(0, 0)
      bodyContext.lineTo(452, 0)
      bodyContext.lineTo(452, 190)
      bodyContext.lineTo(390, 190)
      bodyContext.lineTo(325, 175)
      bodyContext.lineTo(265, 170)
      bodyContext.lineTo(185, 195)
      bodyContext.lineTo(20, 310)
      bodyContext.lineTo(0, 320)
      bodyContext.closePath()
      bodyContext.clip()
      bodyContext.clearRect(0, 0, piece.width, piece.height)
      bodyContext.restore()
      return
    }
    if (index === 1) {
      // This wing reaches the image's outer edge; retain overlap only along its inner joint.
      bodyContext.clearRect(piece.sourceX + 26, piece.sourceY, piece.width - 26, piece.height - 26)
      return
    }
    bodyContext.clearRect(piece.sourceX, piece.sourceY, piece.width, piece.height)
  })

  return { bodyCanvas, pieceCanvases }
}

export function DragonScene() {
  const hostRef = useRef<HTMLDivElement>(null)
  const dragonCanvasRef = useRef<HTMLCanvasElement>(null)
  const fireCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = hostRef.current
    const dragonCanvas = dragonCanvasRef.current
    const fireCanvas = fireCanvasRef.current
    if (!host || !dragonCanvas || !fireCanvas) return

    const dragonContext = dragonCanvas.getContext('2d')
    const fireContext = fireCanvas.getContext('2d')
    if (!dragonContext || !fireContext) return

    const pointer = { x: -10000, y: -10000, active: false }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let bodyCanvas: HTMLCanvasElement | null = null
    let pieceCanvases: HTMLCanvasElement[] = []
    let animationFrame = 0
    let disposed = false
    let displayWidth = 1
    let displayHeight = 1
    let pixelRatio = 1
    let fireInsetLeft = 0
    let fireWidth = 1
    let fireHeight = 1

    const image = new Image()
    image.decoding = 'async'
    image.src = dragonTextureUrl
    image.onload = () => {
      const preparedImage = prepareDragonImage(image)
      if (!preparedImage || disposed) return
      bodyCanvas = preparedImage.bodyCanvas
      pieceCanvases = preparedImage.pieceCanvases
    }

    const resize = () => {
      const bounds = host.getBoundingClientRect()
      displayWidth = Math.max(1, Math.round(bounds.width))
      displayHeight = Math.max(1, Math.round(bounds.height))
      pixelRatio = Math.min(window.devicePixelRatio, 2)

      dragonCanvas.width = Math.round(displayWidth * pixelRatio)
      dragonCanvas.height = Math.round(displayHeight * pixelRatio)
      dragonCanvas.style.width = `${displayWidth}px`
      dragonCanvas.style.height = `${displayHeight}px`
      dragonContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

      fireInsetLeft = Math.min(560, Math.round(displayWidth * 0.95))
      fireWidth = displayWidth + fireInsetLeft
      fireHeight = displayHeight
      fireCanvas.width = Math.round(fireWidth * pixelRatio)
      fireCanvas.height = Math.round(fireHeight * pixelRatio)
      fireCanvas.style.left = `${-fireInsetLeft}px`
      fireCanvas.style.width = `${fireWidth}px`
      fireCanvas.style.height = `${fireHeight}px`
      fireContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const getPlacement = () => {
      const scale = Math.min(displayWidth / imageWidth, displayHeight / imageHeight) * 1.04
      const renderedWidth = imageWidth * scale
      const renderedHeight = imageHeight * scale
      return {
        scale,
        offsetX: (displayWidth - renderedWidth) / 2,
        offsetY: (displayHeight - renderedHeight) / 2,
      }
    }

    const drawDragon = (elapsed: number) => {
      dragonContext.clearRect(0, 0, displayWidth, displayHeight)
      if (!bodyCanvas || pieceCanvases.length !== dragonPieces.length) return

      const { scale, offsetX, offsetY } = getPlacement()
      dragonContext.drawImage(bodyCanvas, offsetX, offsetY, imageWidth * scale, imageHeight * scale)

      dragonPieces.forEach((piece, index) => {
        const angle = reducedMotion ? 0 : Math.sin(elapsed * piece.speed + piece.phase) * piece.amplitude
        const pivotDisplayX = offsetX + piece.pivotX * scale
        const pivotDisplayY = offsetY + piece.pivotY * scale

        dragonContext.save()
        dragonContext.translate(pivotDisplayX, pivotDisplayY)
        dragonContext.rotate(angle)
        dragonContext.drawImage(
          pieceCanvases[index],
          (piece.sourceX - piece.pivotX) * scale,
          (piece.sourceY - piece.pivotY) * scale,
          piece.width * scale,
          piece.height * scale,
        )
        dragonContext.restore()
      })
    }

    const drawFire = (time: number) => {
      fireContext.clearRect(0, 0, fireWidth, fireHeight)
      if (!pointer.active || reducedMotion || !bodyCanvas || pointer.y < 0 || pointer.y > fireHeight) return

      const { scale, offsetX, offsetY } = getPlacement()
      const mouthX = offsetX + imageWidth * 0.105 * scale + fireInsetLeft
      const mouthY = offsetY + imageHeight * 0.445 * scale
      const dx = pointer.x - mouthX
      const dy = pointer.y - mouthY

      // The dragon only breathes forward; a cursor behind its head produces no fake backwards flame.
      if (dx > -28) return

      const distance = Math.hypot(dx, dy)
      const rawAngle = Math.atan2(dy, dx)
      const forwardOffset = Math.atan2(Math.sin(rawAngle - Math.PI), Math.cos(rawAngle - Math.PI))
      const angle = Math.PI + Math.max(-0.38, Math.min(0.38, forwardOffset))
      const verticalDirection = Math.sin(angle)
      const verticalRoom = verticalDirection >= 0 ? fireHeight - mouthY - 18 : mouthY - 18
      const verticalLimit = Math.abs(verticalDirection) > 0.04
        ? Math.max(120, verticalRoom / Math.abs(verticalDirection))
        : 560
      const length = Math.min(560, verticalLimit, Math.max(125, distance * 0.98))
      const normalX = -Math.sin(angle)
      const normalY = Math.cos(angle)
      const flicker = Math.sin(time * 0.018) * 5 + Math.sin(time * 0.031) * 3
      fireContext.save()
      fireContext.globalCompositeOperation = 'lighter'

      const drawFlameLayer = (
        layerLength: number,
        width: number,
        colors: [number, string][],
        turbulence: number,
      ) => {
        const layerEndX = mouthX + Math.cos(angle) * layerLength
        const layerEndY = mouthY + Math.sin(angle) * layerLength
        const gradient = fireContext.createLinearGradient(mouthX, mouthY, layerEndX, layerEndY)
        colors.forEach(([stop, color]) => gradient.addColorStop(stop, color))

        // Both ends meet at a point, so the flame grows naturally out of the mouth instead of
        // beginning with the flat edge of a beam.
        fireContext.beginPath()
        fireContext.moveTo(mouthX, mouthY)
        fireContext.bezierCurveTo(
          mouthX + Math.cos(angle) * layerLength * 0.12 + normalX * width * 0.42,
          mouthY + Math.sin(angle) * layerLength * 0.12 + normalY * width * 0.42,
          mouthX + Math.cos(angle) * layerLength * 0.34 + normalX * (width + flicker * turbulence),
          mouthY + Math.sin(angle) * layerLength * 0.34 + normalY * (width + flicker * turbulence),
          mouthX + Math.cos(angle) * layerLength * 0.58 + normalX * width * 0.52,
          mouthY + Math.sin(angle) * layerLength * 0.58 + normalY * width * 0.52,
        )
        fireContext.bezierCurveTo(
          mouthX + Math.cos(angle) * layerLength * 0.78 - normalX * width * 0.28,
          mouthY + Math.sin(angle) * layerLength * 0.78 - normalY * width * 0.28,
          mouthX + Math.cos(angle) * layerLength * 0.92 + normalX * width * 0.12,
          mouthY + Math.sin(angle) * layerLength * 0.92 + normalY * width * 0.12,
          layerEndX,
          layerEndY,
        )
        fireContext.bezierCurveTo(
          mouthX + Math.cos(angle) * layerLength * 0.82 + normalX * width * 0.24,
          mouthY + Math.sin(angle) * layerLength * 0.82 + normalY * width * 0.24,
          mouthX + Math.cos(angle) * layerLength * 0.60 - normalX * width * 0.64,
          mouthY + Math.sin(angle) * layerLength * 0.60 - normalY * width * 0.64,
          mouthX + Math.cos(angle) * layerLength * 0.31 - normalX * (width - flicker * turbulence),
          mouthY + Math.sin(angle) * layerLength * 0.31 - normalY * (width - flicker * turbulence),
        )
        fireContext.bezierCurveTo(
          mouthX + Math.cos(angle) * layerLength * 0.12 - normalX * width * 0.28,
          mouthY + Math.sin(angle) * layerLength * 0.12 - normalY * width * 0.28,
          mouthX + Math.cos(angle) * 4,
          mouthY + Math.sin(angle) * 4,
          mouthX,
          mouthY,
        )
        fireContext.closePath()
        fireContext.fillStyle = gradient
        fireContext.fill()
      }

      drawFlameLayer(length, Math.min(36, 18 + length * 0.025), [
        [0, 'rgba(255,156,22,0.92)'],
        [0.42, 'rgba(255,76,0,0.82)'],
        [0.78, 'rgba(230,43,0,0.48)'],
        [1, 'rgba(190,30,0,0)'],
      ], 1)
      drawFlameLayer(length * 0.72, 11, [
        [0, 'rgba(255,252,206,1)'],
        [0.28, 'rgba(255,211,71,0.96)'],
        [0.7, 'rgba(255,112,8,0.55)'],
        [1, 'rgba(255,70,0,0)'],
      ], 0.45)

      for (let index = 0; index < 16; index++) {
        const progress = (index * 0.137 + time * 0.00045) % 1
        const wander = Math.sin(index * 5.7 + time * 0.012) * 18 * progress
        const particleX = mouthX + Math.cos(angle) * length * progress + normalX * wander
        const particleY = mouthY + Math.sin(angle) * length * progress + normalY * wander
        const radius = (1 - progress) * 5 + 1
        fireContext.beginPath()
        fireContext.arc(particleX, particleY, radius, 0, Math.PI * 2)
        fireContext.fillStyle = `rgba(255, ${Math.round(95 + (1 - progress) * 115)}, 18, ${0.75 - progress * 0.5})`
        fireContext.fill()
      }
      fireContext.restore()
    }

    const updatePointer = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left + fireInsetLeft
      pointer.y = event.clientY - bounds.top
      pointer.active = true
    }
    const clearPointer = () => {
      pointer.active = false
    }

    const animate = (time: number) => {
      if (disposed) return
      drawDragon(time / 1000)
      drawFire(time)
      animationFrame = requestAnimationFrame(animate)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    window.addEventListener('pointermove', updatePointer, { passive: true })
    window.addEventListener('pointerleave', clearPointer)
    resize()
    animationFrame = requestAnimationFrame(animate)

    return () => {
      disposed = true
      image.onload = null
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', updatePointer)
      window.removeEventListener('pointerleave', clearPointer)
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className="relative min-h-[360px] w-full overflow-visible sm:min-h-[440px] lg:min-h-[540px]"
      aria-label="Mechanical DEVthon dragon with animated wings and fire breath"
      role="img"
    >
      <canvas ref={fireCanvasRef} className="pointer-events-none absolute top-0 h-full" />
      <canvas ref={dragonCanvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
