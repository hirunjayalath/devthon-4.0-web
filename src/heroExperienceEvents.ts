export const HERO_BUILD_EVENT = 'devthon:build-launch'

export function triggerBuildSequence() {
  window.dispatchEvent(new CustomEvent(HERO_BUILD_EVENT))
}
