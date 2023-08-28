'use strict';

const randomInRange = (max, min) => Math.floor(Math.random() * (max - min + 1)) + min;
const ACTIVE_PROBABILITY = 0;
const BASE_SIZE = 1;
const VELOCITY_INC = 1.01;
const VELOCITY_INIT_INC = 1.025;
const JUMP_VELOCITY_INC = 1.25;
const JUMP_SIZE_INC = 1.15;
const SIZE_INC = 1.01;
const RAD = Math.PI / 180;
const WARP_COLORS = [
  [255, 255, 255],
  [254, 254, 254],
  [253, 253, 253],
  [252, 252, 252],
  [251, 251, 251],
];
class Star {
  STATE = {
    alpha: Math.random(),
    angle: randomInRange(0, 360) * RAD,
  };

  reset() {
    const angle = randomInRange(0, 360) * (Math.PI / 180);
    const vX = Math.cos(angle);
    const vY = Math.sin(angle);
    const travelled =
      Math.random() > 0.5
        ? Math.random() * Math.max(window.innerWidth, window.innerHeight) +
          Math.random() * (window.innerWidth * 0.24)
        : Math.random() * (window.innerWidth * 0.25);
    this.STATE = {
      ...this.STATE,
      iX: undefined,
      iY: undefined,
      active: travelled ? true : false,
      x: Math.floor(vX * travelled) + window.innerWidth / 2,
      vX,
      y: Math.floor(vY * travelled) + window.innerHeight / 2,
      vY,
      size: BASE_SIZE,
    };
  }

  constructor() {
    this.reset();
  }
}

function generateStarPool(size) {
  return new Array(size).fill().map(() => new Star());
}

// initiate the drawing process and event listeners
class JumpToHyperspace {
  STATE = {
    stars: generateStarPool(180),
    bgAlpha: 0,
    sizeInc: SIZE_INC,
    velocity: VELOCITY_INC,
  };

  canvas = document.createElement('canvas');
  context = this.canvas.getContext('2d');

  constructor() {
    this.bind();
    this.setup();
    document.body.appendChild(this.canvas);
    this.render();
  }

  render = () => {
    const {
      STATE: { bgAlpha, velocity, sizeInc, initiating, jumping, stars },
      context,
      render,
    } = this;
    // clear the canvas
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (bgAlpha > 0) {
      // context.fillStyle = `rgba(31, 58, 157, ${bgAlpha})`;
      context.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
    // should add a new star
    const nonActive = stars.filter((s) => !s.STATE.active);
    if (!initiating && nonActive.length > 0) {
      // Introduce a star
      nonActive[0].STATE.active = true;
    }
    // update the stars and draw them.
    for (const star of stars.filter((s) => s.STATE.active)) {
      const { active, x, y, iX, iY, iVX, iVY, size, vX, vY } = star.STATE;
      // Check if the star needs deactivating
      if (
        ((iX || x) < 0 ||
          (iX || x) > window.innerWidth ||
          (iY || y) < 0 ||
          (iY || y) > window.innerHeight) &&
        active &&
        !initiating
      ) {
        star.reset(true);
      } else if (active) {
        const newIX = initiating ? iX : iX + iVX;
        const newIY = initiating ? iY : iY + iVY;
        const newX = x + vX;
        const newY = y + vY;
        // Just need to work out if it overtakes the original line that's all
        const caught =
          (vX < 0 && newIX < x) ||
          (vX > 0 && newIX > x) ||
          (vY < 0 && newIY < y) ||
          (vY > 0 && newIY > y);
        star.STATE = {
          ...star.STATE,
          iX: caught ? undefined : newIX,
          iY: caught ? undefined : newIY,
          iVX: caught ? undefined : iVX * VELOCITY_INIT_INC,
          iVY: caught ? undefined : iVY * VELOCITY_INIT_INC,
          x: newX,
          vX: star.STATE.vX * velocity,
          y: newY,
          vY: star.STATE.vY * velocity,
          size: initiating ? size : size * (iX || iY ? SIZE_INC : sizeInc),
        };
        let color = `rgba(255, 255, 255, ${star.STATE.alpha})`;
        if (jumping) {
          const [r, g, b] = WARP_COLORS[randomInRange(0, WARP_COLORS.length)];
          color = `rgba(${r}, ${g}, ${b}, ${star.STATE.alpha})`;
        }
        context.strokeStyle = color;
        context.lineWidth = size;
        context.beginPath();
        context.moveTo(star.STATE.iX || x, star.STATE.iY || y);
        context.lineTo(star.STATE.x, star.STATE.y);
        context.stroke();
      }
    }

    requestAnimationFrame(render);
  };

  initiate = () => {
    if (this.STATE.jumping || this.STATE.initiating) return;
    this.STATE = {
      ...this.STATE,
      initiating: true,
      initiateTimestamp: new Date().getTime(),
    };
    TweenMax.to(this.STATE, 0.25, { velocity: VELOCITY_INIT_INC, bgAlpha: 0.3 });
    // when initiate, stop the XY origin from moving so that we draw
    // longer lines until the jump
    for (const star of this.STATE.stars.filter((s) => s.STATE.active)) {
      star.STATE = {
        ...star.STATE,
        iX: star.STATE.x,
        iY: star.STATE.y,
        iVX: star.STATE.vX,
        iVY: star.STATE.vY,
      };
    }
  };

  jump = () => {
    this.STATE = {
      ...this.STATE,
      bgAlpha: 0,
      jumping: true,
    };
    TweenMax.to(this.STATE, 0.25, {
      velocity: JUMP_VELOCITY_INC,
      bgAlpha: 0.75,
      sizeInc: JUMP_SIZE_INC,
    });
    setTimeout(() => {
      this.STATE = {
        ...this.STATE,
        jumping: false,
      };
      TweenMax.to(this.STATE, 0.25, { bgAlpha: 0, velocity: VELOCITY_INC, sizeInc: SIZE_INC });
    }, 2500);
  };

  enter = () => {
    if (this.STATE.jumping) return;
    const { initiateTimestamp } = this.STATE;
    this.STATE = {
      ...this.STATE,
      initiating: false,
      initiateTimestamp: undefined,
    };
    if (new Date().getTime() - initiateTimestamp > 600) {
      this.jump();
    } else {
      TweenMax.to(this.STATE, 0.25, { velocity: VELOCITY_INC, bgAlpha: 0 });
    }
  };

  bind = () => {
    this.canvas.addEventListener('mousedown', this.initiate);
    this.canvas.addEventListener('touchstart', this.initiate);
    this.canvas.addEventListener('mouseup', this.enter);
    this.canvas.addEventListener('touchend', this.enter);
  };

  setup = () => {
    this.context.lineCap = 'round';
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
  };

  reset = () => {
    this.STATE = {
      ...this.STATE,
      stars: generateStarPool(180),
    };
    this.setup();
  };
}

class BootScreen {
  constructor(opts) {
    this.num_bars = 12;
    this.num_lines = 26;
    this.line_sections = 4;
    this.chars = [
      '☇',
      '☈',
      '☄',
      '☌',
      '@',
      '☍',
      '☣',
      '☡',
      '☠',
      '☤',
      '☥',
      '☦',
      '☧',
      '☨',
      '☩',
      '♄',
      '♅',
      '♃',
      '♇',
      '♆',
      '♢',
      '⚙',
    ];
    this.mother_container_elm = document.querySelector(opts.main);
    this.build();
  }

  build() {
    this.root_elm = document.createElement('div');
    this.root_elm.classList.add('boot_screen');
    gsap.set(this.root_elm, {
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyItems: 'center',
    });

    this.random_chars_screen = document.createElement('div');
    this.random_chars_screen.classList.add('random_chars_screen');
    gsap.set(this.random_chars_screen, {
      width: '100%',
      height: '85%',
      top: 0,
      left: 0,
      position: 'relative',
      overflow: 'hidden',
      padding: '1.5rem',
    });

    this.root_elm.appendChild(this.random_chars_screen);

    gsap.set(this.root_elm, {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    });
    this.line_elms = [];
    this.line_section_elms = [];
    for (var i = 0; i < this.num_lines; i++) {
      let line_elm = document.createElement('div');
      line_elm.classList.add('line_elm');
      line_elm.classList.add(`line_elm_${i}`);
      gsap.set(line_elm, { display: 'grid', gridTemplateRows: '1fr' });
      for (var n = 0; n < this.line_sections; n++) {
        let sec = document.createElement('div');
        gsap.set(sec, {
          display: 'inline-block',
          opacity: 0,
          gridRow: 1,
          fontSize: '0.5rem',
          justifySelf: gsap.utils.random(['start', 'end', 'center']),
        });
        sec.classList.add('section');
        let char = gsap.utils.random(this.chars);
        sec.innerHTML = `<span class='char'>${char}</span><span class='char'>${char}</span><span class='char'>${char}</span><span class='char'>${char}</span><span class='char'>${char}</span><span class='char'>${char}</span><span class='char'>${char}</span><span class='char'>${char}</span>`;
        line_elm.appendChild(sec);
        gsap.set(sec.querySelectorAll('.char'), { opacity: 0 });
        gsap.set([...sec.querySelectorAll('.char')].slice(0, gsap.utils.random(2, 7)), {
          opacity: 1,
        });
        this.line_section_elms.push(sec);
      } //for line section
      this.random_chars_screen.appendChild(line_elm);
      this.line_elms.push(line_elm);
    } //for line nums
    for (var ls = 0; ls < this.line_section_elms.length / 3; ls++) {
      let lse = gsap.utils.random(this.line_section_elms);
      gsap.set(lse, { opacity: 1 });
    } //for

    //front bars
    this.bars_container = document.createElement('div');
    this.bars_container.classList.add('bars_container');
    gsap.set(this.bars_container, {
      position: 'relative',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    });

    this.mother_container_elm?.appendChild(this.root_elm);
  } //build

  detailsScreenAnimation() {
    let tl = gsap.timeline();

    tl.fromTo(
      this.random_chars_screen.querySelectorAll('.line_elm'),
      { opacity: 1 },
      { opacity: 0, duration: 0.01, stagger: 0.1 },
      0
    );

    return tl;
  } //detailsScreenAnimation

  barsAnimation() {
    this.bar_tl = gsap.timeline({ repeatRefresh: true });

    return this.bar_tl;
  } //barsAnimation

  charsBGAnimation() {
    this.chars_tl = gsap
      .timeline({ repeat: -1, repeatRefresh: true })
      .set(this.line_section_elms, { opacity: 0, delay: 0.1 })
      .add(
        function () {
          for (var ls = 0; ls < this.line_section_elms.length / gsap.utils.random(3, 4, 1); ls++) {
            let lse = gsap.utils.random(this.line_section_elms);
            gsap.set(lse, {
              opacity: 1,
              justifySelf: gsap.utils.random(['start', 'end', 'center']),
            });
          } //for
        }.bind(this)
      );
    return this.chars_tl;
  } //charsBGAnimation

  animate() {
    let tl = gsap
      .timeline()
      .add(
        function () {
          gsap.set(this.root_elm, { display: 'grid' });
          gsap.set(this.bars_container, { opacity: 1 });
          this.charsBGAnimation();
          this.barsAnimation();
        }.bind(this)
      )
      .add(this.detailsScreenAnimation(), 2)
      .add(
        function () {
          this.chars_tl.pause();
          this.bar_tl.pause();
          gsap.set(this.bars_container, { opacity: 0 });
        }.bind(this),
        '-=0.15'
      );
    return tl;
  } //animate
} //BootScreen

class Mother {
  constructor(opts) {
    this.opts = opts;
    this.lines_container = document.querySelector(opts.line);
    this.mother_container_elm = document.querySelector(opts.main);
    this.cmd_seq = opts.cmd_seq || [{ type: 'line', copy: 'HELLO WORLD!' }];
    this.lines = [];
    this.cmds = [];
    this.master_tl = gsap.timeline({ paused: true, repeat: -1 });
    this.build();
  }

  build() {
    this.loadAndPlay();
  }

  load() {
    return Promise.all([]);
  } //load

  buildSeq() {
    this.cmd_seq.forEach(
      function (cmd, index) {
        let c = null;
        switch (cmd.type) {
          case 'boot':
            c = new BootScreen({ main: this.opts.main });
            break;
          default:
        }
        this.master_tl.add(c.animate.apply(c));
      }.bind(this) //function
    ); //this.cmd_seq.forEach
    this.master_tl.play();
  } //buildSeq

  loadAndPlay() {
    this.load().then(this.buildSeq.bind(this));
  } //loadAndPlay
} //Mother

window.myJump = new JumpToHyperspace();

window.addEventListener('resize', () => window.myJump.reset());

let mother = new Mother({
  cmd_seq: [{ type: 'boot', direction: 'right' }],
  line: '#lines_container',
  main: '#mother_container',
});

let mother2 = new Mother({
  cmd_seq: [{ type: 'boot', direction: 'right' }],
  line: '#lines_container2',
  main: '#mother_container2',
});
