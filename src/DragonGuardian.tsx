import { useEffect, useRef, type RefObject } from 'react'
import dragonImage from './assets/dragon/devthon-dragon.png'

type DragonGuardianProps = {
  hostRef: RefObject<HTMLElement | null>
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function DragonGuardian({ hostRef }: DragonGuardianProps) {
  const guardianRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const guardian = guardianRef.current
    const host = hostRef.current
    if (!guardian || !host) return

    const finePointer = window.matchMedia('(min-width: 900px) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame = 0
    let latestPointer: PointerEvent | null = null

    const resetPose = () => {
      guardian.style.setProperty('--dragon-x', '0px')
      guardian.style.setProperty('--dragon-y', '0px')
      guardian.style.setProperty('--dragon-rotate', '0deg')
      guardian.style.setProperty('--dragon-opacity', '0.38')
      guardian.style.setProperty('--dragon-glow', '0.24')
      guardian.style.setProperty('--dragon-brightness', '1')
    }

    const renderPose = () => {
      animationFrame = 0
      const pointer = latestPointer
      if (!pointer || !finePointer.matches || reducedMotion.matches) {
        resetPose()
        return
      }

      const bounds = host.getBoundingClientRect()
      const normalizedX = clamp((pointer.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1)
      const normalizedY = clamp((pointer.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1)
      const anchorX = bounds.right - bounds.width * 0.06
      const anchorY = bounds.top + bounds.height * 0.5
      const distance = Math.hypot(pointer.clientX - anchorX, pointer.clientY - anchorY)
      const proximity = 1 - clamp(distance / (bounds.width * 0.72), 0, 1)

      guardian.style.setProperty('--dragon-x', `${(normalizedX * 18).toFixed(2)}px`)
      guardian.style.setProperty('--dragon-y', `${(normalizedY * 14).toFixed(2)}px`)
      guardian.style.setProperty('--dragon-rotate', `${(normalizedY * 3.5).toFixed(2)}deg`)
      guardian.style.setProperty('--dragon-opacity', (0.38 + proximity * 0.22).toFixed(3))
      guardian.style.setProperty('--dragon-glow', (0.24 + proximity * 0.34).toFixed(3))
      guardian.style.setProperty('--dragon-brightness', (1 + proximity * 0.18).toFixed(3))
    }

    const schedulePose = (event: PointerEvent) => {
      latestPointer = event
      if (!animationFrame) animationFrame = window.requestAnimationFrame(renderPose)
    }

    const handlePointerLeave = () => {
      latestPointer = null
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(renderPose)
    }

    resetPose()
    window.addEventListener('pointermove', schedulePose, { passive: true })
    document.documentElement.addEventListener('mouseleave', handlePointerLeave)
    finePointer.addEventListener('change', handlePointerLeave)
    reducedMotion.addEventListener('change', handlePointerLeave)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', schedulePose)
      document.documentElement.removeEventListener('mouseleave', handlePointerLeave)
      finePointer.removeEventListener('change', handlePointerLeave)
      reducedMotion.removeEventListener('change', handlePointerLeave)
    }
  }, [hostRef])

  return (
    <div ref={guardianRef} className="dragon-guardian" aria-hidden="true">
      <div className="dragon-guardian__motion">
        <div className="dragon-guardian__aura" />
        <img className="dragon-guardian__image" src={dragonImage} alt="" draggable={false} />
      </div>
    </div>
  )
}
