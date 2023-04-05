let cfg = {
  img: '',
  influence: 100,
  particleSize: 4,
  canvasSize: 500,
  stiffness: 5,
  friction: 0.9,
  overflow: 0,
  motionBlur: 0.25,
  interactMode: 0
}

let c = document.getElementById('canvas')
let ctx = c.getContext('2d')
let mouse = {
  x: 0,
  y: 0,
  down: false
}
;[c.width,c.height] = [cfg.canvasSize,cfg.canvasSize]

class ParticleSystem {
  constructor () {
    this.particles = []
    this.imgC = document.createElement('canvas')
    ;[this.imgC.width,this.imgC.height]=[cfg.canvasSize,cfg.canvasSize]
    this.imgCtx = this.imgC.getContext('2d')
    // document.body.append(this.imgC)

    this.img = new Image()
  }
  draw () {
    ctx.fillStyle = `rgba(91,98,111,${1-cfg.motionBlur})`
    ctx.fillRect(0,0,cfg.canvasSize,cfg.canvasSize)
    // ctx.clearRect(0,0,cfg.canvasSize,cfg.canvasSize)

    for (let i of this.particles) {
      ctx.fillStyle = i.color
      let x = i.x
      let y = i.y
      switch (cfg.overflow) {
        case 0: break;
        case 1:
          while(x < 0){x+=cfg.canvasSize}
          while(x > cfg.canvasSize){x-=cfg.canvasSize}
          while(y < 0){y+=cfg.canvasSize}
          while(y > cfg.canvasSize){y-=cfg.canvasSize}
          break;
        case 2:
          x = Math.min(cfg.canvasSize,Math.max(0,x))
          y = Math.min(cfg.canvasSize,Math.max(0,y))
      }


      // ctx.fillRect(x-(cfg.particleSize/2),y-(cfg.particleSize/2),cfg.particleSize,cfg.particleSize)
      ctx.fillRect(Math.floor(x-(cfg.particleSize/2)),Math.floor(y-(cfg.particleSize/2)),cfg.particleSize,cfg.particleSize)

    }
  }
  addParticle(x, y, color) {
    if (isNaN(x)) {x = (Math.random()*cfg.canvasSize)}
    if (isNaN(y)) {y = (Math.random()*cfg.canvasSize)}
    let index = this.particles.push({
      x: x,
      y: y,
      color: (color || `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`),
      vel: {
        x: 0,
        y: 0
      }
    })
    let part = this.particles[index-1]
    part.org = {
      x: parseInt(part.x),
      y: parseInt(part.y)
    }
  }
  update() {
    for (let i of this.particles) {
      if (mouse.down && Math.dist(i.x,i.y,mouse.x,mouse.y) < cfg.influence) {
          i.vel.x += -Math.sin(Math.atan2(mouse.x-i.x,mouse.y-i.y))
          i.vel.y += -Math.cos(Math.atan2(mouse.x-i.x,mouse.y-i.y))
      } else if (Math.dist(i.x,i.y,i.org.x,i.org.y) > 2.5){
        if (!(cfg.interactMode == 1 && mouse.down)) {
          i.vel.x += -(i.x - i.org.x)/(cfg.stiffness*10)
          i.vel.y += -(i.y - i.org.y)/(cfg.stiffness*10)
        }
        // i.vel.x += -Math.dist(i.x,i.y,i.org.x,i.org.y)/100
        // i.vel.x *= 0.9
        // i.vel.y *= 0.9
      } else if (Math.dist(i.x,i.y,i.org.x,i.org.y) < 2.5 && Math.abs(i.vel.x) < 0.1 && Math.abs(i.vel.y) < 0.1) {
        i.vel.x = 0
        i.vel.y = 0
        i.x = i.org.x
        i.y = i.org.y
      }
      // if (i.x < 0) {i.x = cfg.canvasSize}
      // if (i.x > cfg.canvasSize) {i.x = 0}
      // if (i.y < 0) {i.y = cfg.canvasSize}
      // if (i.y > cfg.canvasSize) {i.y = 0}
      i.vel.x *= cfg.friction
      i.vel.y *= cfg.friction
      i.x += i.vel.x
      i.y += i.vel.y

    }
  }
  tick (frameStart=0,lastFPS=0) {
    this.update()
    this.draw()
    let fps = ((performance.now() - frameStart)+(lastFPS*49))/50
    document.getElementById('statParticleNum').innerHTML = this.particles.length
    document.getElementById('statFPS').innerHTML = Math.floor(1000/fps)
    document.getElementById('statImage').innerHTML = this.imgName
    requestAnimationFrame(()=>{
      let t = performance.now()
      this.tick(t,fps)
    })
  }
  addImage(src) {
    this.imgName = src
    this.img.src = 'images/'+src+'.png'
    this.img.onload = () => {
      // this.imgCtx.drawImage(this.img,0,0)
      let aspect = this.img.width/this.img.height
      // let [aspectX,aspectY]
      let [width,height] = [this.img.width, this.img.height]
      // if (this.img.width < this.img.height) {
      //   aspect = cfg.canvasSize/width
      //   let size = (cfg.canvasSize*aspect)
      //   this.imgCtx.drawImage(this.img,(cfg.canvasSize-size)/2,0,size,cfg.canvasSize)
      // } else {
      //   aspect = cfg.canvasSize/height
      //   let size = (cfg.canvasSize*aspect)
      //   this.imgCtx.drawImage(this.img,0,(cfg.canvasSize-size)/2,cfg.canvasSize,size)
      // }
      this.imgCtx.clearRect(0,0,cfg.canvasSize,cfg.canvasSize)
      this.imgCtx.drawImage(this.img,0,0,cfg.canvasSize,cfg.canvasSize)
      console.log(aspect);
      for (let x = 0; x < cfg.canvasSize; x+=cfg.particleSize) {
        for (let y = 0; y < cfg.canvasSize; y+=cfg.particleSize) {
          let col = this.imgCtx.getImageData(x,y,1,1).data
          // console.log(this.imgCtx.getImageData(x,y,1,1).data);
          if (col[3] > 50) {
            this.addParticle(x,y,`rgb(${col[0]},${col[1]},${col[2]})`)
          }
        }
      }
    }
  }
}

let p = new ParticleSystem()
// p.addParticle()
// p.addParticle()

p.tick()

document.addEventListener('mousemove',e=>{
  mouse.x = (e.clientX - c.getBoundingClientRect().x) * (c.width/c.getBoundingClientRect().width)
  mouse.y = (e.clientY - c.getBoundingClientRect().y) * (c.height/c.getBoundingClientRect().height)
})
document.addEventListener('mousedown',e=>{mouse.down = true})
document.addEventListener('mouseup',e=>{mouse.down = false})

// let img = new Image()
// img.src = ''
//
// imgCtx.drawImage(img,0,0)
let images = [
  'mushroom',
  'steam',
  'youtube',
  'twitch'
]
let imgInd = 0
function newImg() {
  // p.addImage(images.randFrom())
  p.addImage(images[imgInd])
  imgInd++
  imgInd = imgInd % (images.length)
}
newImg()

document.getElementById('statsContainer').addEventListener('mousedown',(e)=>{
  let el = document.getElementById('statsContainer')
  let open = (el.getAttribute('open')=="true"?true:false)
  el.setAttribute('open',!open)
  console.log(el.getAttribute('open'));
});
