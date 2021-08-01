import Phaser from 'phaser'
import bloodImg from './assets/blood.png'
import smileyImg from './assets/smiley.png'
import mosquitoImg from './assets/mosquito.png'

const SPEED = {
  PLAYER: 300
}

class PhazorGame extends Phaser.Scene {
  preload () {
    this.load.image('blood', bloodImg)
    this.load.image('smiley', smileyImg)
    this.load.image('mosquito', mosquitoImg)
  }

  create () {
    const blood = this.add.particles('blood')
    const { centerX, centerY } = this.cameras.main

    this.victim = this.physics.add.sprite(centerX, centerY, 'smiley')

    this.victim.setBounce(0.2)
    this.victim.setDragX(SPEED.PLAYER)
    this.victim.body.setGravityY(0)
    // this.cameras.main.startFollow(this.victim)

    this.emitter = blood.createEmitter({
      speed: 20,
      scale: 0.2,
      blendMode: Phaser.BlendModes.ADD,
      // follow: this.victim,
      on: true
    })
  }

  update () {
    const pointer = this.input.activePointer

    if (!pointer.isDown) {
      return
    }

    console.log('sting')
  }
}

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  scene: PhazorGame,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  }
})
