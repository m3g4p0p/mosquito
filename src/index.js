import Phaser from 'phaser'
import bloodImg from './assets/blood.png'
import smileyImg from './assets/smiley.png'
import mosquitoImg from './assets/mosquito.png'

const SPEED = {
  VICTIM: 200,
  MOSQUITO: [100, 300]
}

const COLOR = {
  BLOOD: 0x8a0303
}

const MAX_DIRECTION = 0.001

class MainScene extends Phaser.Scene {
  preload () {
    this.load.image('blood', bloodImg)
    this.load.image('smiley', smileyImg)
    this.load.image('mosquito', mosquitoImg)
  }

  create () {
    const { centerX, centerY } = this.cameras.main

    this.blood = this.add.particles('blood')
    this.mosquitos = this.physics.add.group({ maxSize: 10 })
    this.victim = this.physics.add.sprite(centerX, centerY, 'smiley')
    this.isDead = false
    this.score = 0

    this.scoreText = this.add.text(16, 16, '', {
      fontSize: '16px',
      color: '#fff'
    })

    this.time.addEvent({
      delay: 1000,
      callback: this.spawnMosquito,
      callbackScope: this,
      loop: true,
      startAt: 0
    })

    this.updateScore()
    this.updateVelocity(this.victim, SPEED.VICTIM)
    this.victim.setBounce(1, 1)
    this.victim.setCollideWorldBounds(true)

    this.physics.add.overlap(
      this.victim,
      this.mosquitos,
      this.gameover,
      null,
      this
    )

    this.victim.setInteractive(
      new Phaser.Geom.Circle(16, 16, 32),
      Phaser.Geom.Circle.Contains
    ).on('pointerdown', () => {
      this.updateVelocity(this.victim, SPEED.VICTIM)

      this.mosquitos.children.each(mosquito => {
        const angle = Phaser.Math.Angle.BetweenPoints(
          mosquito.body.position,
          this.victim.body.position
        ) + Math.PI

        mosquito.body.velocity.setAngle(angle)
      })
    })
  }

  update (time, delta) {
    this.mosquitos.children.each(mosquito => {
      const { velocity } = mosquito.body
      const direction = mosquito.getData('direction')

      velocity.setAngle(velocity.angle() + delta * direction)
      this.updateRotation(mosquito.body)

      if (Math.random() < 0.01) {
        mosquito.setData(
          'direction',
          Phaser.Math.FloatBetween(
            -MAX_DIRECTION,
            MAX_DIRECTION
          )
        )
      }
    })
  }

  gameover () {
    const { centerX, centerY } = this.cameras.main
    const { width, height } = this.game.canvas

    const overlay = this.add.rectangle(
      centerX,
      centerY,
      width,
      height,
      COLOR.BLOOD
    )

    this.isDead = true
    overlay.setAlpha(0)
    overlay.setDepth(-1)

    this.tweens.add({
      targets: overlay,
      duration: 1000,
      alpha: { from: 0, to: 1 }
    })

    this.smash(this.victim, {
      maxParticles: 50,
      deathCallback: () => {
        this.input.addListener('pointerdown', () => {
          this.scene.restart()
        })
      }
    })
  }

  updateVelocity (target, speed) {
    const direction = Phaser.Math.FloatBetween(0, Math.PI)

    target.setVelocityX(Math.cos(direction) * speed)
    target.setVelocityY(Math.sin(direction) * speed)
  }

  updateRotation (body) {
    body.gameObject.setRotation(body.velocity.angle() + Math.PI / 2)
  }

  updateScore (value = 0) {
    this.scoreText.setText('Score: ' + (this.score += value))
  }

  spawnMosquito () {
    if (this.mosquitos.isFull()) {
      return
    }

    const { width, height } = this.game.config
    const speed = Phaser.Math.Between(...SPEED.MOSQUITO)
    const corner = Phaser.Math.Between(0, 3)

    /**
     * @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody}
     */
    const mosquito = this.mosquitos.create(
      (corner % 2) * width,
      Math.floor(corner / 2) * height,
      'mosquito'
    )

    mosquito.setBounce(1, 1)
    mosquito.setCollideWorldBounds(true)
    mosquito.setData('direction', 0)
    this.updateVelocity(mosquito, speed)
    this.updateRotation(mosquito.body)

    mosquito.setInteractive(
      new Phaser.Geom.Circle(16, 16, 32),
      Phaser.Geom.Circle.Contains
    ).on('pointerdown', () => {
      if (this.isDead) {
        return
      }

      this.smash(mosquito, {
        maxParticles: 10,
        speed: 30
      })

      this.updateScore(1)
    })
  }

  smash (target, { deathCallback, ...options } = {}) {
    navigator.vibrate(100)
    target.destroy()

    this.blood.createEmitter({
      speed: 50,
      blendMode: Phaser.BlendModes.ADD,
      follow: target,
      tint: COLOR.BLOOD,
      gravityY: 100,
      /**
       * @param {Phaser.GameObjects.Particles.Particle} particle
       */
      deathCallback: particle => {
        const { emitter } = particle

        if (
          emitter.getDeadParticleCount() ===
          emitter.maxParticles
        ) {
          emitter.remove()

          if (deathCallback) {
            deathCallback()
          }
        }
      },
      ...options
    })
  }
}

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  scene: MainScene,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: document.body,
    width: window.innerWidth,
    height: window.innerHeight
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
})
