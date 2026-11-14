export const GUARDIAN_FIRE_EVENT = 'devthon:guardian-fire'

export function triggerGuardianFire() {
  window.dispatchEvent(new Event(GUARDIAN_FIRE_EVENT))
}
