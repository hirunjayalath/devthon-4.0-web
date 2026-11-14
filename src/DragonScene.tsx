/* eslint-disable react/immutability */
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import guardianModelUrl from './assets/dragon/devthon-guardian.glb?url'
import guardianTextureUrl from './assets/dragon/devthon-guardian-basecolor.png'
import guardianFallbackUrl from './assets/dragon/devthon-dragon-sprites.png'
import { GUARDIAN_FIRE_EVENT } from './guardianEvents'

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

type BoundaryProps = {
  children: ReactNode
  fallback: ReactNode
}

class GuardianErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('The 3D guardian could not be displayed.', error, info)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function makeFireGroup() {
  const group = new THREE.Group()
  group.name = 'GuardianFire'
  group.visible = false

  const flameColors = [0xff5a00, 0xff8a1f, 0xffc246, 0xffe5a1]
  const lengths = [1.5, 1.15, 0.82, 0.48]
  lengths.forEach((length, index) => {
    const geometry = new THREE.ConeGeometry(0.18 - index * 0.026, length, 7, 1, false)
    const material = new THREE.MeshBasicMaterial({
      color: flameColors[index],
      transparent: true,
      opacity: 0.86 - index * 0.1,
      depthWrite: false,
    })
    const flame = new THREE.Mesh(geometry, material)
    flame.name = `FlameLayer${index + 1}`
    flame.position.y = 0.12 + length * 0.43 + index * 0.1
    flame.scale.z = 0.72
    group.add(flame)
  })

  return group
}

function makeSparks() {
  const positions = new Float32Array(12 * 3)
  positions.fill(1000)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: 0xff8a25,
    size: 0.055,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    sizeAttenuation: true,
  })
  const points = new THREE.Points(geometry, material)
  points.name = 'MouthSparks'
  return points
}

type GuardianModelProps = {
  fireSignal: number
  isMobile: boolean
  reduceMotion: boolean
  onReady: () => void
}

function GuardianModel({ fireSignal, isMobile, reduceMotion, onReady }: GuardianModelProps) {
  const gltf = useLoader(GLTFLoader, guardianModelUrl)
  const texture = useLoader(THREE.TextureLoader, guardianTextureUrl)
  const model = useMemo(() => clone(gltf.scene), [gltf.scene])
  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model])
  const head = useMemo(() => model.getObjectByName('neck3'), [model])
  const mouth = useMemo(() => model.getObjectByName('jaw_upper'), [model])
  const fire = useMemo(() => makeFireGroup(), [])
  const sparks = useMemo(() => makeSparks(), [])
  const pointer = useRef({ x: 0, y: 0, active: false })
  const fireUntil = useRef(0)
  const sparkLife = useRef(new Float32Array(12))
  const sparkVelocity = useRef(Array.from({ length: 12 }, () => new THREE.Vector3()))
  const nextSpark = useRef(0)
  const baseHeadRotation = useRef({ y: head?.rotation.y ?? 0, z: head?.rotation.z ?? 0 })

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.flipY = true
    texture.anisotropy = isMobile ? 2 : 6
    const material = new THREE.MeshStandardMaterial({
      color: 0xe0a078,
      map: texture,
      metalness: 0.34,
      roughness: 0.52,
    })
    model.traverse((node) => {
      if (node instanceof THREE.Mesh) node.material = material
    })
    return () => material.dispose()
  }, [isMobile, model, texture])

  useEffect(() => {
    if (reduceMotion) return
    const allowedAnimations = isMobile
      ? new Set(['idle', 'tailSway'])
      : new Set(['idle', 'wingFlex', 'tailSway', 'weightShift'])
    const actions = gltf.animations
      .filter((clip) => allowedAnimations.has(clip.name))
      .map((clip) => {
        const action = mixer.clipAction(clip, model).reset().play()
        if (clip.name === 'weightShift') {
          action.setEffectiveWeight(0.12)
          action.timeScale = 0.55
        } else if (clip.name === 'wingFlex') {
          action.setEffectiveWeight(0.18)
          action.timeScale = 0.82
        } else if (clip.name === 'idle') {
          action.setEffectiveWeight(0.9)
          action.timeScale = 0.7
        } else if (clip.name === 'tailSway') {
          action.setEffectiveWeight(0.22)
        }
        return action
      })

    return () => {
      actions.forEach((action) => action.stop())
      mixer.stopAllAction()
    }
  }, [gltf.animations, isMobile, mixer, model, reduceMotion])

  useEffect(() => {
    const effectsAnchor = mouth ?? head
    if (effectsAnchor) {
      const useHeadOffset = !mouth
      fire.position.set(useHeadOffset ? -0.96 : 0, useHeadOffset ? -0.18 : 0, 0)
      sparks.position.copy(fire.position)
      effectsAnchor.add(fire, sparks)
    }
    onReady()
    return () => {
      effectsAnchor?.remove(fire, sparks)
    }
  }, [fire, head, mouth, onReady, sparks])

  useEffect(() => {
    if (isMobile || reduceMotion) return
    const updatePointer = (event: PointerEvent) => {
      pointer.current.x = event.clientX / window.innerWidth * 2 - 1
      pointer.current.y = 1 - event.clientY / window.innerHeight * 2
      pointer.current.active = true

      if (performance.now() < nextSpark.current || !sparks.geometry) return
      nextSpark.current = performance.now() + 65
      const positions = sparks.geometry.attributes.position as THREE.BufferAttribute
      const index = sparkLife.current.findIndex((life) => life <= 0)
      if (index < 0) return
      positions.setXYZ(index, (Math.random() - 0.5) * 0.12, 0.1, (Math.random() - 0.5) * 0.12)
      sparkVelocity.current[index].set((Math.random() - 0.5) * 0.16, 0.32 + Math.random() * 0.22, (Math.random() - 0.5) * 0.16)
      sparkLife.current[index] = 0.34 + Math.random() * 0.18
      positions.needsUpdate = true
    }
    const clearPointer = () => {
      pointer.current.active = false
    }
    window.addEventListener('pointermove', updatePointer, { passive: true })
    window.addEventListener('pointerleave', clearPointer)
    return () => {
      window.removeEventListener('pointermove', updatePointer)
      window.removeEventListener('pointerleave', clearPointer)
    }
  }, [isMobile, reduceMotion, sparks])

  useEffect(() => {
    if (fireSignal <= 0 || isMobile || reduceMotion) return
    fireUntil.current = performance.now() + 1400
    const fireClip = gltf.animations.find((clip) => clip.name === 'fireBreath')
    if (!fireClip) return
    const action = mixer.clipAction(fireClip, model)
    action.reset().setLoop(THREE.LoopOnce, 1)
    action.clampWhenFinished = false
    action.setEffectiveWeight(0.68).play()
  }, [fireSignal, gltf.animations, isMobile, mixer, model, reduceMotion])

  useFrame((state, delta) => {
    if (!reduceMotion) mixer.update(delta)

    if (head && !isMobile && !reduceMotion) {
      const targetY = baseHeadRotation.current.y + (pointer.current.active ? THREE.MathUtils.clamp(pointer.current.x * 0.17, -0.17, 0.17) : 0)
      const targetZ = baseHeadRotation.current.z + (pointer.current.active ? THREE.MathUtils.clamp(pointer.current.y * 0.09, -0.08, 0.08) : 0)
      head.rotation.y = THREE.MathUtils.damp(head.rotation.y, targetY, 6, delta)
      head.rotation.z = THREE.MathUtils.damp(head.rotation.z, targetZ, 6, delta)
    }

    const fireActive = performance.now() < fireUntil.current
    fire.visible = fireActive
    if (fireActive) {
      fire.children.forEach((child, index) => {
        child.scale.y = 0.92 + Math.sin(state.clock.elapsedTime * 15 + index) * 0.11
        child.scale.z = 0.66 + Math.cos(state.clock.elapsedTime * 12 + index * 0.8) * 0.09
      })
    }

    const positions = sparks.geometry.attributes.position as THREE.BufferAttribute
    let sparksChanged = false
    for (let index = 0; index < sparkLife.current.length; index += 1) {
      if (sparkLife.current[index] <= 0) continue
      sparkLife.current[index] -= delta
      if (sparkLife.current[index] <= 0) {
        positions.setXYZ(index, 1000, 1000, 1000)
      } else {
        positions.setXYZ(
          index,
          positions.getX(index) + sparkVelocity.current[index].x * delta,
          positions.getY(index) + sparkVelocity.current[index].y * delta,
          positions.getZ(index) + sparkVelocity.current[index].z * delta,
        )
      }
      sparksChanged = true
    }
    if (sparksChanged) positions.needsUpdate = true
  })

  return <primitive object={model} position={[0.1, -0.1, -0.4]} rotation={[0, -0.72, 0]} scale={8.5} dispose={null} />
}

function GuardianCanvas({ fireSignal, isMobile, reduceMotion, onReady }: GuardianModelProps) {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [1.8, 1.25, 10], fov: 40, near: 0.1, far: 100 }}
      dpr={isMobile ? [0.85, 1.1] : [1, 1.6]}
      gl={{ alpha: true, antialias: !isMobile, powerPreference: 'high-performance' }}
      performance={{ min: 0.55 }}
      onCreated={({ camera, gl }) => {
        camera.lookAt(0.35, -0.05, 0)
        gl.setClearColor(0x000000, 0)
      }}
    >
      <ambientLight intensity={1.35} />
      <directionalLight color="#ffffff" intensity={2.1} position={[4, 6, 8]} />
      <directionalLight color="#d6d0c9" intensity={0.45} position={[-5, 1, 3]} />
      <Suspense fallback={null}>
        <GuardianModel fireSignal={fireSignal} isMobile={isMobile} reduceMotion={reduceMotion} onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}

export function DragonScene() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [ready, setReady] = useState(false)
  const [fireSignal, setFireSignal] = useState(0)
  const [webGLAvailable] = useState(supportsWebGL)

  useEffect(() => {
    const fire = () => setFireSignal((signal) => signal + 1)
    window.addEventListener(GUARDIAN_FIRE_EVENT, fire)
    return () => window.removeEventListener(GUARDIAN_FIRE_EVENT, fire)
  }, [])

  const fallback = (
    <img
      src={guardianFallbackUrl}
      alt="Mechanical DEVthon dragon"
      className="absolute inset-0 h-full w-full object-contain object-center"
    />
  )

  return (
    <div
      className="relative h-[360px] w-full overflow-hidden sm:h-[440px] lg:-ml-12 lg:h-[620px] lg:w-[calc(100%+6rem)]"
      aria-label="Articulated 3D mechanical DEVthon dragon guardian"
      role="img"
    >
      {(!ready || !webGLAvailable) && <div className="absolute inset-0">{fallback}</div>}
      {webGLAvailable && (
        <GuardianErrorBoundary fallback={fallback}>
          <GuardianCanvas
            fireSignal={fireSignal}
            isMobile={isMobile}
            reduceMotion={reduceMotion}
            onReady={() => setReady(true)}
          />
        </GuardianErrorBoundary>
      )}
    </div>
  )
}
