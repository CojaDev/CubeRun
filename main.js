import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2.74, 20);
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(2);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color = '#00ff00',
    velocity = { x: 0, y: 0, z: 0 },
    position = {
      x: 0,
      y: 0,
      z: 0,
    },
    zAcceleration = false,
    friction = 0.4,
  }) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color });
    super(geometry, material);
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.friction = friction;
    this.position.set(position.x, position.y, position.z);

    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;

    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;

    this.start = this.position.z + this.depth / 2;
    this.end = this.position.z - this.depth / 2;

    this.velocity = velocity;
    this.gravity = -0.008;

    this.zAcceleration = zAcceleration;
  }
  updateSides() {
    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;

    this.bottom = this.position.y - this.height / 2;
    this.top = this.position.y + this.height / 2;

    this.start = this.position.z + this.depth / 2;
    this.end = this.position.z - this.depth / 2;
  }
  update(ground) {
    this.updateSides();

    if (this.zAcceleration) this.velocity.z += 0.0005;

    this.position.x += this.velocity.x;
    this.position.z += this.velocity.z;

    this.applyGravity(ground);
  }

  applyGravity(ground) {
    this.velocity.y += this.gravity;

    if (
      boxCollision({
        box1: this,
        box2: ground,
      })
    ) {
      const friction = this.friction;
      this.velocity.y *= friction;
      this.velocity.y = -this.velocity.y;
    } else this.position.y += this.velocity.y;
  }
}
function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right;
  const yCollision =
    box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
  const zCollision = box1.start >= box2.end && box1.end <= box2.start;

  return xCollision && yCollision && zCollision;
}
let spawn = false;

const startbtn = document.querySelector('#start');
startbtn.addEventListener('click', () => {
  spawn = true;
  enemies.forEach((enemy) => scene.remove(enemy));
  enemies = [];
  frames = 0;
  spawnrate = 200;
  spawnrate2 = 500;
  spawnrate3 = 400;
});

const cube = new Box({
  width: 1,
  height: 1,
  depth: 1,
  color: 0x00ff00,
  velocity: {
    x: 0,
    y: 0,
    z: 0,
  },
});
cube.castShadow = true;
if (spawn) {
  scene.add(cube);
}

const ground = new Box({
  width: 10,
  height: 0.5,
  depth: 50,
  color: '#0369a1',
  position: {
    x: 0,
    y: -1,
    z: -13,
  },
});

ground.receiveShadow = true;
scene.add(ground);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.z = 1;
light.position.y = 2;
light.castShadow = true;
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 1));

camera.position.z = 5;

const keys = {
  w: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'KeyW':
      keys.w.pressed = true;
      break;
    case 'KeyS':
      keys.s.pressed = true;
      break;
    case 'KeyA':
      keys.a.pressed = true;
      break;
    case 'KeyD':
      keys.d.pressed = true;
      break;
    case 'Space':
      if (cube.bottom - 0.7 <= ground.top) {
        console.log(cube.bottom);
        console.log(ground.top);
        cube.velocity.y = 0.2;
      }
      break;
  }
});
window.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW':
      keys.w.pressed = false;
      break;
    case 'KeyS':
      keys.s.pressed = false;
      break;
    case 'KeyA':
      keys.a.pressed = false;
      break;
    case 'KeyD':
      keys.d.pressed = false;
      break;
  }
});
const startMenu = document.querySelector('.startMenu');
const scoreui = document.querySelector('#score');
let score = 0;

let scopacity = 0;
let smopacity = 1;
let ishere = false;
const enemies = [];
let frames = 0;
let spawnrate = 200;
let spawnrate2 = 500;
let spawnrate3 = 400;
function animate() {
  const animationId = requestAnimationFrame(animate);

  if (spawn) {
    scene.add(cube);
    spawn = false;
    ishere = true;
    setInterval(() => {
      smopacity -= 0.01;
      startMenu.style.opacity = `${smopacity}`;
    }, 6);
    let fade = setInterval(() => {
      scopacity += 0.01;
      scoreui.parentElement.parentElement.style.opacity = `${scopacity}`;
    }, 6);
    startMenu.classList.add('unActive');
    if (smopacity <= 0) {
      startMenu.style.display = 'none';
    }
  }

  frames++;
  renderer.render(scene, camera);
  cube.update(ground);
  if (ishere) {
    enemies.forEach((enemy) => {
      enemy.update(ground);
      if (
        boxCollision({
          box1: cube,
          box2: enemy,
        })
      ) {
        gameOver(animationId);
      }
    });

    if (frames % 10 === 0) {
      score += 1;
      scoreui.innerHTML = parseInt(score);
    }

    if (frames % spawnrate === 0) {
      if (spawnrate >= 40) spawnrate -= 10;
      const enemy = new Box({
        width: 1,
        height: 1,
        depth: 1,
        color: 'red',
        position: { x: (Math.random() - 0.5) * 8, y: 0, z: -37.4 },
        velocity: {
          x: 0,
          y: 0,
          z: 0.05,
        },
        zAcceleration: true,
      });
      enemy.castShadow = true;
      scene.add(enemy);
      enemies.push(enemy);
    }

    if (frames % spawnrate2 === 0) {
      if (spawnrate2 >= 100) spawnrate2 -= 20;
      const enemy = new Box({
        width: 1,
        height: 1,
        depth: 1,
        color: 'purple',
        position: { x: (Math.random() - 0.5) * 8, y: 0, z: -37.4 },
        velocity: {
          x: 0,
          y: 0.2,
          z: 0.05,
        },
        zAcceleration: true,
        friction: 1,
      });
      enemy.castShadow = true;
      scene.add(enemy);
      enemies.push(enemy);
    }
    if (frames % spawnrate3 === 0) {
      if (spawnrate3 >= 120) spawnrate3 -= 25;
      const enemy = new Box({
        width: (Math.random() + 0.5) * 3.5,
        height: 2.7,
        depth: 0.45,
        color: 'yellow',
        position: { x: (Math.random() - 0.5) * 6.5, y: 0, z: -37.4 },
        velocity: {
          x: 0,
          y: 0.2,
          z: 0.05,
        },
        zAcceleration: true,
      });
      enemy.castShadow = true;
      scene.add(enemy);
      enemies.push(enemy);
    }
  }
  cube.velocity.x = 0;
  const speed = 0.07;
  if (keys.a.pressed) {
    cube.velocity.x = -speed;
  } else if (keys.d.pressed) {
    cube.velocity.x = speed;
  }
  cube.velocity.z = 0;
  if (keys.w.pressed) {
    cube.velocity.z = -speed;
  } else if (keys.s.pressed) {
    cube.velocity.z = speed;
  }

  if (cube.position.y <= -3) {
    gameOver(animationId);
  }

  //cube.rotation.x += 0.01;
  //cube.rotation.y += 0.01;
}
animate();

const gameoverlay = document.querySelector('.gameover');
let opacity = 0;
function gameOver(animationId) {
  if (ishere) {
    window.cancelAnimationFrame(animationId);
    let fade = setInterval(() => {
      opacity += 0.01;
      gameoverlay.style.opacity = `${opacity}`;
    }, 8);
    if (opacity >= 1) {
      clearInterval(fade);
    }
    gameoverlay.classList.add('active');
  }
}

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
});
