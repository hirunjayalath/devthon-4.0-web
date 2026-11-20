import dragonImage from './assets/dragon/devthon-dragon.png'

export function DragonGuardian() {
  return (
    <div className="dragon-guardians" aria-hidden="true">
      <div className="dragon-guardian dragon-guardian--left">
        <div className="dragon-guardian__aura" />
        <img className="dragon-guardian__image" src={dragonImage} alt="" draggable={false} />
      </div>
      <div className="dragon-guardian dragon-guardian--right">
        <div className="dragon-guardian__aura" />
        <img className="dragon-guardian__image" src={dragonImage} alt="" draggable={false} />
      </div>
    </div>
  )
}
