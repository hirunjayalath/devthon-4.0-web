import { useEffect, useRef } from 'react'
import dragonTextureUrl from './assets/dragon/devthon-dragon-sprites.png'

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
  targetX: number
  targetY: number
}

type Point = { x: number; y: number }

const imageWidth = 1536
const imageHeight = 1024

const dragonPieces: DragonPiece[] = [
  // The sprite sheet contains two complete, separate wings. Each rotates around its
  // connector and lands on the matching shoulder socket on the wingless body.
  {
    sourceX: 40, sourceY: 10, width: 620, height: 420,
    pivotX: 580, pivotY: 386, targetX: 584, targetY: 620,
    amplitude: 0.055, speed: 3.6, phase: 0.15,
  },
  {
    sourceX: 780, sourceY: 10, width: 756, height: 460,
    pivotX: 831, pivotY: 411, targetX: 713, targetY: 626,
    amplitude: -0.052, speed: 3.6, phase: 0,
  },
  // Only the lower leg sections move. Their armored joints stay fixed on the body.
  {
    sourceX: 235, sourceY: 835, width: 180, height: 145,
    pivotX: 350, pivotY: 865, targetX: 350, targetY: 865,
    amplitude: 0.026, speed: 1.8, phase: 0.2,
  },
  {
    sourceX: 440, sourceY: 840, width: 190, height: 184,
    pivotX: 570, pivotY: 875, targetX: 570, targetY: 875,
    amplitude: -0.025, speed: 1.72, phase: 1.1,
  },
  {
    sourceX: 640, sourceY: 835, width: 170, height: 145,
    pivotX: 755, pivotY: 865, targetX: 755, targetY: 865,
    amplitude: 0.024, speed: 1.76, phase: 2.1,
  },
  {
    sourceX: 845, sourceY: 830, width: 180, height: 194,
    pivotX: 950, pivotY: 860, targetX: 950, targetY: 860,
    amplitude: -0.026, speed: 1.68, phase: 2.8,
  },
]

// The far wing shares a crop boundary with the dragon's horns. This mask keeps the
// complete wing and connector while excluding the separately rendered body below it.
const pieceMasks: Point[][] = [
  [
    { x: 40, y: 10 }, { x: 660, y: 10 }, { x: 660, y: 430 },
    { x: 525, y: 430 }, { x: 525, y: 355 }, { x: 40, y: 355 },
  ],
  [
    { x: 780, y: 10 }, { x: 1536, y: 10 }, { x: 1536, y: 470 }, { x: 780, y: 470 },
  ],
  [
    { x: 300, y: 835 }, { x: 380, y: 835 }, { x: 415, y: 920 },
    { x: 385, y: 980 }, { x: 235, y: 980 }, { x: 235, y: 895 },
  ],
  [
    { x: 515, y: 840 }, { x: 600, y: 840 }, { x: 630, y: 930 },
    { x: 600, y: 1024 }, { x: 440, y: 1024 }, { x: 440, y: 925 },
  ],
  [
    { x: 700, y: 835 }, { x: 785, y: 835 }, { x: 810, y: 925 },
    { x: 780, y: 980 }, { x: 640, y: 980 }, { x: 640, y: 900 },
  ],
  [
    { x: 885, y: 830 }, { x: 980, y: 830 }, { x: 1025, y: 920 },
    { x: 1010, y: 1024 }, { x: 845, y: 1024 }, { x: 845, y: 900 },
  ],
]

function tracePolygon(context: CanvasRenderingContext2D, points: Point[], offsetX = 0, offsetY = 0) {
  context.beginPath()
  context.moveTo(points[0].x + offsetX, points[0].y + offsetY)
  for (let index = 1; index < points.length; index += 1) {
    context.lineTo(points[index].x + offsetX, points[index].y + offsetY)
  }
  context.closePath()
}

function removeSpriteGlow(context: CanvasRenderingContext2D) {
  const imageData = context.getImageData(0, 0, imageWidth, imageHeight)
  const { data } = imageData
  // The generated sprite already has alpha, but its very faint backdrop creates a
  // large grey/orange aura on the dark hero. Remove only that low-alpha backdrop
  // and remap the solid artwork back to a clean, naturally anti-aliased cutout.
  for (let offset = 3; offset < data.length; offset += 4) {
    const alpha = data[offset]
    data[offset] = alpha <= 104 ? 0 : Math.min(255, Math.round((alpha - 104) * 1.72))
  }
  context.putImageData(imageData, 0, 0)
}

function prepareDragonImage(image: HTMLImageElement) {
  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = imageWidth
  sourceCanvas.height = imageHeight
  const sourceContext = sourceCanvas.getContext('2d')
  if (!sourceContext) return null
  sourceContext.drawImage(image, 0, 0, imageWidth, imageHeight)
  removeSpriteGlow(sourceContext)

  const bodyCanvas = document.createElement('canvas')
  bodyCanvas.width = imageWidth
  bodyCanvas.height = imageHeight
  const bodyContext = bodyCanvas.getContext('2d')
  if (!bodyContext) return null
  bodyContext.drawImage(sourceCanvas, 0, 0)

  const pieceCanvases = dragonPieces.map((piece, index) => {
    const pieceCanvas = document.createElement('canvas')
    pieceCanvas.width = piece.width
    pieceCanvas.height = piece.height
    const pieceContext = pieceCanvas.getContext('2d')
    if (!pieceContext) return pieceCanvas
    pieceContext.drawImage(
      sourceCanvas,
      piece.sourceX,
      piece.sourceY,
      piece.width,
      piece.height,
      0,
      0,
      piece.width,
      piece.height,
    )

    pieceContext.globalCompositeOperation = 'destination-in'
    tracePolygon(pieceContext, pieceMasks[index], -piece.sourceX, -piece.sourceY)
    pieceContext.fillStyle = '#fff'
    pieceContext.fill()

    return pieceCanvas
  })

  pieceMasks.forEach((mask) => {
    bodyContext.save()
    tracePolygon(bodyContext, mask)
    bodyContext.clip()
    bodyContext.clearRect(0, 0, imageWidth, imageHeight)
    bodyContext.restore()
  })

  const jointCanvas = document.createElement('canvas')
  jointCanvas.width = imageWidth
  jointCanvas.height = imageHeight
  const jointContext = jointCanvas.getContext('2d')
  if (!jointContext) return null
  jointContext.save()
  jointContext.beginPath()
  dragonPieces.slice(2).forEach((piece) => {
    jointContext.moveTo(piece.pivotX + 25, piece.pivotY)
    jointContext.arc(piece.pivotX, piece.pivotY, 25, 0, Math.PI * 2)
  })
  jointContext.clip()
  jointContext.drawImage(sourceCanvas, 0, 0)
  jointContext.restore()

  return { bodyCanvas, jointCanvas, pieceCanvases }
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
    let jointCanvas: HTMLCanvasElement | null = null
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
      jointCanvas = preparedImage.jointCanvas
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
      // These are the bounds of the assembled dragon rather than the full sprite sheet.
      // Fitting to them keeps the full body large without stretching the artwork.
      const contentX = 55
      const contentY = 235
      const contentWidth = 1420
      const contentHeight = 775
      const scale = Math.min(displayWidth / contentWidth, displayHeight / contentHeight) * 1.02
      const renderedWidth = contentWidth * scale
      const renderedHeight = contentHeight * scale
      return {
        scale,
        offsetX: (displayWidth - renderedWidth) / 2 - contentX * scale,
        offsetY: (displayHeight - renderedHeight) / 2 - contentY * scale,
      }
    }

    const drawDragon = (elapsed: number) => {
      dragonContext.clearRect(0, 0, displayWidth, displayHeight)
      if (!bodyCanvas || !jointCanvas || pieceCanvases.length !== dragonPieces.length) return

      const { scale, offsetX, offsetY } = getPlacement()
      const drawPiece = (index: number) => {
        const piece = dragonPieces[index]
        const angle = reducedMotion ? 0 : Math.sin(elapsed * piece.speed + piece.phase) * piece.amplitude
        const pivotDisplayX = offsetX + piece.targetX * scale
        const pivotDisplayY = offsetY + piece.targetY * scale

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
      }

      // Complete wings and lower legs move behind the fixed body. No membrane is divided.
      dragonPieces.forEach((_, index) => drawPiece(index))

      dragonContext.drawImage(bodyCanvas, offsetX, offsetY, imageWidth * scale, imageHeight * scale)
      dragonContext.drawImage(jointCanvas, offsetX, offsetY, imageWidth * scale, imageHeight * scale)
    }

    const drawFire = (time: number) => {
      fireContext.clearRect(0, 0, fireWidth, fireHeight)
      if (!pointer.active || reducedMotion || !bodyCanvas || pointer.y < 0 || pointer.y > fireHeight) return

      const { scale, offsetX, offsetY } = getPlacement()
      const mouthX = offsetX + imageWidth * 0.205 * scale + fireInsetLeft
      const mouthY = offsetY + imageHeight * 0.535 * scale
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
      className="relative min-h-[360px] w-full overflow-visible sm:min-h-[440px] lg:-ml-12 lg:min-h-[620px] lg:w-[calc(100%+6rem)]"
      aria-label="Mechanical DEVthon dragon with animated wings and fire breath"
      role="img"
    >
      <canvas ref={dragonCanvasRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={fireCanvasRef} className="pointer-events-none absolute top-0 h-full" />
    </div>
  )
}
