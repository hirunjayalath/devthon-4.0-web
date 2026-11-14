import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { DOMParser } from '@xmldom/xmldom'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'

globalThis.DOMParser = DOMParser
globalThis.document = {
  createElementNS() {
    return {
      addEventListener() {},
      removeEventListener() {},
      set src(_value) {},
      get src() { return '' },
    }
  },
}

if (!globalThis.FileReader) {
  globalThis.FileReader = class FileReader {
    result = null
    onloadend = null

    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((value) => {
        this.result = value
        this.onloadend?.({ target: this })
      })
    }
  }
}

const sourceDirectory = resolve('scripts/guardian-source')
const outputPath = resolve('src/assets/dragon/devthon-guardian.glb')
const loader = new ColladaLoader()

async function parseSource(fileName) {
  const source = await readFile(resolve(sourceDirectory, fileName), 'utf8')
  return loader.parse(source, '')
}

function retargetClip(collada, name, test) {
  const sourceClip = collada.scene.animations[0]
  const nodeNames = new Map()
  collada.scene.traverse((node) => {
    if (node.name) nodeNames.set(node.uuid, node.name)
  })

  const tracks = sourceClip.tracks.flatMap((sourceTrack) => {
    const [nodeId, property] = sourceTrack.name.split('.')
    const nodeName = nodeNames.get(nodeId)
    if (!nodeName || !test(nodeName)) return []
    const track = sourceTrack.clone()
    track.name = `${nodeName}.${property}`
    return [track]
  })

  return new THREE.AnimationClip(name, -1, tracks).optimize()
}

const [base, idleSource, attackSource, walkSource] = await Promise.all([
  parseSource('dragon.dae'),
  parseSource('dragon_idle.dae'),
  parseSource('dragon_attack.dae'),
  parseSource('dragon_walk.dae'),
])

const guardian = base.scene
guardian.name = 'GuardianRoot'
guardian.userData = {
  title: 'DEV{thon} 3D Dragon Guardian',
  source: 'Cethiel’s Dragon 3D (CC0)',
  style: 'dark bronze mechanical armour',
}

const bronze = new THREE.MeshStandardMaterial({
  name: 'DarkBronzeArmour',
  color: 0x5b2f20,
  metalness: 0.62,
  roughness: 0.54,
})

guardian.traverse((node) => {
  if (!node.isMesh) return
  node.material = bronze
  node.castShadow = false
  node.receiveShadow = false
  node.frustumCulled = true
})

const clips = [
  retargetClip(idleSource, 'idle', () => true),
  retargetClip(idleSource, 'wingFlex', (name) => name.startsWith('wing_')),
  retargetClip(idleSource, 'tailSway', (name) => name.startsWith('tail')),
  retargetClip(walkSource, 'weightShift', (name) => name.startsWith('leg_')),
  retargetClip(attackSource, 'fireBreath', (name) => ['neck1', 'neck2', 'neck3', 'jaw_upper', 'jaw_lower'].includes(name)),
]

const bounds = new THREE.Box3().setFromObject(guardian)
const size = bounds.getSize(new THREE.Vector3())
const centre = bounds.getCenter(new THREE.Vector3())
console.log(`Guardian bounds: ${size.toArray().map((value) => value.toFixed(3)).join(' × ')}`)
console.log(`Guardian centre: ${centre.toArray().map((value) => value.toFixed(3)).join(', ')}`)

const exporter = new GLTFExporter()
const binary = await exporter.parseAsync(guardian, {
  binary: true,
  animations: clips,
  onlyVisible: true,
  truncateDrawRange: true,
})

await writeFile(outputPath, Buffer.from(binary))
console.log(`Wrote ${outputPath} (${Math.round(binary.byteLength / 1024)} KB, ${clips.length} animation clips)`)
