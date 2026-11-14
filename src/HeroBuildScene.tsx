/* eslint-disable react/immutability */
import { Canvas, useFrame } from '@react-three/fiber'
import { Component, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import * as THREE from 'three'
import { HERO_BUILD_EVENT } from './heroExperienceEvents'

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

type BoundaryProps = { children: ReactNode; fallback: ReactNode }

class SceneBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('The interactive build scene could not be displayed.', error, info)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function EdgeBox({
  size,
  position = [0, 0, 0],
  color = '#9a4a23',
  opacity = 1,
}: {
  size: [number, number, number]
  position?: [number, number, number]
  color?: string
  opacity?: number
}) {
  const geometry = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...size)), [size])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <lineSegments geometry={geometry} position={position}>
      <lineBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} />
    </lineSegments>
  )
}

function Bar({
  position,
  size,
  color = '#d8cec4',
  opacity = 1,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
  opacity?: number
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} roughness={0.82} metalness={0.06} />
    </mesh>
  )
}

function Connector({ points, color = '#8b4a29', opacity = 0.72 }: {
  points: Array<[number, number, number]>
  color?: string
  opacity?: number
}) {
  const geometry = useMemo(() => {
    const line = new THREE.BufferGeometry()
    line.setFromPoints(points.map((point) => new THREE.Vector3(...point)))
    return line
  }, [points])
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
    [color, opacity],
  )
  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material])

  useEffect(() => () => {
    geometry.dispose()
    material.dispose()
  }, [geometry, material])

  return <primitive object={line} />
}

function Label({ text, position, color = '#f97316', scale = 1 }: {
  text: string
  position: [number, number, number]
  color?: string
  scale?: number
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 96
    const context = canvas.getContext('2d')
    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = color
      context.font = '700 34px monospace'
      context.textAlign = 'left'
      context.textBaseline = 'middle'
      context.fillText(text, 8, 48)
    }
    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    result.needsUpdate = true
    return result
  }, [color, text])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[2.7, 0.5]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}

function StructureLayer() {
  return (
    <group>
      <EdgeBox size={[4.8, 0.5, 0.04]} position={[0, 1.18, 0]} color="#a55a31" />
      <EdgeBox size={[2.9, 0.72, 0.04]} position={[-0.74, 0.36, 0]} color="#7d472d" />
      <EdgeBox size={[1.46, 0.72, 0.04]} position={[1.63, 0.36, 0]} color="#7d472d" />
      <EdgeBox size={[1.46, 1.26, 0.04]} position={[-1.67, -0.78, 0]} color="#6e402c" />
      <EdgeBox size={[1.46, 1.26, 0.04]} position={[0, -0.78, 0]} color="#6e402c" />
      <EdgeBox size={[1.46, 1.26, 0.04]} position={[1.67, -0.78, 0]} color="#6e402c" />
      <Connector points={[[-2.38, 0.9, 0], [-2.38, -1.4, 0], [2.38, -1.4, 0]]} opacity={0.45} />
    </group>
  )
}

function StyleLayer() {
  return (
    <group>
      <Bar position={[-1.65, 1.18, 0]} size={[1.22, 0.11, 0.08]} color="#f97316" />
      <Bar position={[0.38, 1.18, 0]} size={[1.65, 0.08, 0.08]} color="#cbbeb1" opacity={0.72} />
      <Bar position={[-1.02, 0.42, 0]} size={[2.36, 0.22, 0.08]} color="#f0e9e2" />
      <Bar position={[-1.46, 0.04, 0]} size={[1.48, 0.1, 0.07]} color="#9f8c7b" />
      <Bar position={[-1.6, -0.25, 0]} size={[1.2, 0.1, 0.07]} color="#9f8c7b" />
      <Bar position={[-1.54, -0.82, 0]} size={[0.76, 0.34, 0.09]} color="#d95916" />
      <Bar position={[0.15, -0.72, 0]} size={[0.96, 0.08, 0.07]} color="#927b6b" />
      <Bar position={[0.15, -0.98, 0]} size={[0.96, 0.08, 0.07]} color="#927b6b" />
      <Bar position={[1.68, -0.72, 0]} size={[0.96, 0.08, 0.07]} color="#927b6b" />
      <Bar position={[1.68, -0.98, 0]} size={[0.96, 0.08, 0.07]} color="#927b6b" />
    </group>
  )
}

function LogicLayer({ pulseRef, cursorRef, scanRef }: {
  pulseRef: React.RefObject<THREE.Group | null>
  cursorRef: React.RefObject<THREE.Group | null>
  scanRef: React.RefObject<THREE.Mesh | null>
}) {
  return (
    <group>
      <Connector points={[[0.8, 1.1, 0], [1.9, 1.1, 0], [1.9, 0.3, 0]]} color="#f97316" opacity={0.9} />
      <Connector points={[[-1.1, -0.68, 0], [-0.55, -0.68, 0], [-0.55, -1.2, 0], [1.8, -1.2, 0]]} color="#ca5b22" />
      <group ref={pulseRef}>
        <Bar position={[0, 0, 0]} size={[0.11, 0.11, 0.08]} color="#ff8a32" />
        <Bar position={[0.22, 0, 0]} size={[0.07, 0.07, 0.08]} color="#f5d08b" />
      </group>
      <group ref={cursorRef}>
        <Bar position={[0, 0, 0]} size={[0.16, 0.16, 0.1]} color="#f97316" />
        <Connector points={[[0.13, -0.13, 0], [0.42, -0.42, 0]]} color="#f97316" opacity={1} />
      </group>
      <mesh ref={scanRef} position={[0, 2.5, 0]} visible={false}>
        <boxGeometry args={[5.1, 0.045, 0.06]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>
    </group>
  )
}

function BuildSystem({ isMobile, reduceMotion, onReady }: {
  isMobile: boolean
  reduceMotion: boolean
  onReady: () => void
}) {
  const root = useRef<THREE.Group>(null)
  const structure = useRef<THREE.Group>(null)
  const style = useRef<THREE.Group>(null)
  const logic = useRef<THREE.Group>(null)
  const pulse = useRef<THREE.Group>(null)
  const cursor = useRef<THREE.Group>(null)
  const scan = useRef<THREE.Mesh>(null)
  const launchUntil = useRef(0)

  useEffect(() => {
    onReady()
    const launch = () => {
      if (!reduceMotion) launchUntil.current = performance.now() + 1500
    }
    window.addEventListener(HERO_BUILD_EVENT, launch)
    return () => window.removeEventListener(HERO_BUILD_EVENT, launch)
  }, [onReady, reduceMotion])

  useFrame((state, delta) => {
    if (!root.current || !structure.current || !style.current || !logic.current) return
    const time = state.clock.elapsedTime
    const launching = performance.now() < launchUntil.current
    const depth = launching ? 0.08 : isMobile ? 0.42 : 0.72

    structure.current.position.z = THREE.MathUtils.damp(structure.current.position.z, -depth, 7, delta)
    style.current.position.z = THREE.MathUtils.damp(style.current.position.z, 0, 7, delta)
    logic.current.position.z = THREE.MathUtils.damp(logic.current.position.z, depth, 7, delta)

    if (!reduceMotion) {
      const targetY = isMobile ? -0.2 : -0.22 + state.pointer.x * 0.16
      const targetX = isMobile ? 0.08 : 0.08 - state.pointer.y * 0.1
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetY, 4, delta)
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, targetX, 4, delta)
      root.current.position.y = Math.sin(time * 0.72) * 0.035

      if (cursor.current) {
        const cursorX = isMobile ? 1.35 : THREE.MathUtils.clamp(state.pointer.x * 2.1, -2.1, 2.1)
        const cursorY = isMobile ? -0.9 : THREE.MathUtils.clamp(state.pointer.y * 1.35, -1.3, 1.3)
        cursor.current.position.x = THREE.MathUtils.damp(cursor.current.position.x, cursorX, 7, delta)
        cursor.current.position.y = THREE.MathUtils.damp(cursor.current.position.y, cursorY, 7, delta)
      }

      if (pulse.current) {
        const progress = (time * 0.34) % 1
        pulse.current.position.set(-0.55 + progress * 2.35, -1.2, 0)
      }
    }

    if (scan.current) {
      scan.current.visible = launching
      if (launching) {
        const progress = 1 - Math.max(0, launchUntil.current - performance.now()) / 1500
        scan.current.position.y = 1.55 - progress * 3.1
      }
    }
  })

  return (
    <group ref={root} rotation={[0.08, -0.22, 0]} scale={isMobile ? 1.13 : 1}>
      <group position={[0, 0, -0.86]}>
        <Label text="STRUCTURE / HTML" position={[-1.46, 1.83, 0]} color="#b77a59" scale={0.62} />
      </group>
      <group ref={structure}>
        <StructureLayer />
      </group>
      <group ref={style}>
        <StyleLayer />
        <Label text="STYLE / CSS" position={[-1.62, -1.78, 0]} color="#f2e8df" scale={0.54} />
      </group>
      <group ref={logic}>
        <LogicLayer pulseRef={pulse} cursorRef={cursor} scanRef={scan} />
        <Label text="LOGIC / JS" position={[1.35, -1.78, 0]} color="#f97316" scale={0.54} />
      </group>
      <EdgeBox size={[5.45, 3.65, 0.12]} color="#b45b2b" opacity={0.88} />
      <Bar position={[0, 1.52, 0]} size={[5.42, 0.045, 0.1]} color="#7b3b20" />
      <Bar position={[-2.38, 1.67, 0]} size={[0.09, 0.09, 0.12]} color="#f97316" />
      <Bar position={[-2.18, 1.67, 0]} size={[0.09, 0.09, 0.12]} color="#d8cec4" />
      <Bar position={[-1.98, 1.67, 0]} size={[0.09, 0.09, 0.12]} color="#7e6b5d" />
    </group>
  )
}

function StaticBuildFallback() {
  return (
    <div className="absolute inset-6 border border-orange-500/45 p-5" aria-hidden="true">
      <div className="border-b border-orange-500/30 pb-3 font-mono text-xs font-bold tracking-[0.18em] text-orange-400">
        BUILD / TEST / SHIP
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3">
        <div className="h-24 border border-orange-300/20" />
        <div className="h-24 border border-orange-300/20" />
        <div className="h-24 border border-orange-300/20" />
      </div>
      <div className="mt-4 h-2 w-2/3 bg-orange-500" />
      <div className="mt-3 h-2 w-1/2 bg-orange-100/40" />
    </div>
  )
}

export function HeroBuildScene() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [ready, setReady] = useState(false)
  const [webGLAvailable] = useState(supportsWebGL)
  const handleReady = useCallback(() => setReady(true), [])
  const fallback = <StaticBuildFallback />

  return (
    <div
      className="relative h-[340px] w-full overflow-hidden sm:h-[430px] lg:-ml-8 lg:h-[590px] lg:w-[calc(100%+4rem)]"
      aria-label="Interactive three-dimensional web build system"
      role="img"
    >
      {(!ready || !webGLAvailable) && fallback}
      {webGLAvailable && (
        <SceneBoundary fallback={fallback}>
          <Canvas
            className="absolute inset-0"
            camera={{ position: [0.2, 0.1, 8.6], fov: 38, near: 0.1, far: 50 }}
            dpr={isMobile ? [0.75, 1] : [1, 1.5]}
            gl={{ alpha: true, antialias: !isMobile, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          >
            <ambientLight intensity={1.45} />
            <directionalLight color="#ffffff" intensity={1.9} position={[3, 5, 7]} />
            <BuildSystem isMobile={isMobile} reduceMotion={reduceMotion} onReady={handleReady} />
          </Canvas>
        </SceneBoundary>
      )}
    </div>
  )
}
