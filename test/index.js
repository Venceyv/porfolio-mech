class Line {
  constructor(opts) {
    this.line_container = opts.line_container;
    this.copy = opts.copy || 'HELLO WORLD!';
    this.delay = opts.delay || 0;
    this.has_underline = typeof opts.has_underline === 'boolean' ? opts.has_underline : false;
    this.build();
  } //constructor

  build() {} //build
} //Line

class LineBreak {
  constructor(opts) {
    this.line_container = opts.line_container;
    this.build();
  }
  build() {
    this.line_elm = document.createElement('div');
    this.line_elm.classList.add('line');
    this.copy_elm = document.createElement('div');
    this.copy_elm.innerHTML = '&nbsp;';

    this.line_elm.appendChild(this.copy_elm);

    this.line_container?.appendChild(this.line_elm);
  }
  animate() {
    return gsap.timeline().set(this.line_elm, { display: 'grid' });
  }
} //LineBreak

class BootScreen {
  constructor(opts) {
    this.num_bars = 12;
    this.num_lines = 26;
    this.line_sections = 4;
    this.chars = [
      'A',
      'X',
      'Y',
      'I',
      '@',
      '2',
      '0',
      'K',
      '5',
      '9',
      'V',
      'D',
      'H',
      '%',
      '}',
      '#',
      'U',
      '1',
      '^',
      '>',
      '+',
      'E',
    ];
    this.mother_container_elm = document.querySelector('#mother_container');
    this.mother_container_elm2 = document.querySelector('#mother_container2');
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
      height: '100%',
      top: 0,
      left: 0,
      position: 'relative',
      overflow: 'hidden',
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
    // this.random_chars_screen.appendChild(this.bars_container);

    this.bars_elm = [];
    for (var b = 0; b < this.num_bars; b++) {
      let bar_elm = document.createElement('div');
      bar_elm.classList.add('bar_elm');
      this.bars_container.appendChild(bar_elm);

      let bar_glow = document.createElement('div');
      bar_glow.classList.add('bar_glow');
      bar_elm.appendChild(bar_glow);

      gsap.set(bar_elm, {
        background: '#80ff10',
        '--glow-opacity': 0,
        width: 'random(15,100)%',
        height: 'random(1,2)%',
        position: 'absolute',
        top: 'random(0,100)%',
        left: 'random(-25,75)%',
        opacity: 0,
      });

      gsap.set(bar_glow, {
        width: '100%',
        height: '100%',
        boxShadow: '0px 0px 5px #80ff10, 0px 0px 15px #80ff10, 0px 0px 20px #80ff10',
        opacity: 'var(--glow-opacity)',
      });

      this.bars_elm.push(bar_elm);
    } //for this.num_bars
    //end front bars

    this.mother_container_elm?.appendChild(this.root_elm);
  } //build

  detailsScreenAnimation() {
    let tl = gsap.timeline();
    this.details_screen.querySelectorAll('.detail_line').forEach(
      function (line_elm, index) {
        tl.set(line_elm, { '--text-shadow-opacity': 0 });
        tl.fromTo(
          line_elm.querySelectorAll('.char'),
          {
            opacity: 0,
          },
          {
            opacity: 1,
            stagger: 0.01,
            duration: 0.01,
            onComplete: function () {
              gsap.fromTo(
                line_elm,
                { '--text-shadow-opacity': 1 },
                {
                  '--text-shadow-opacity': 0,
                  duration: 1,
                  ease: 'expo.out',
                }
              );

              if (this.detail_beep_sound) {
                let s = this.detail_beep_sound.clone();

                s.on(
                  'end',
                  function () {
                    s._events.end.pop();
                    s.disconnect();
                    s = null;
                  }.bind(this)
                );
                s.play();
                s.sourceNode.playbackRate.value = gsap.utils.random(0.9, 1.5);
              }
            }.bind(this),
          }
        ); // tl.fromTo
      }.bind(this)
    ); //.('.detail_line').forEach

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

    this.bars_elm.forEach(
      function (bar_elm) {
        let b_tl = gsap.timeline({ repeatRefresh: true, repeat: -1 });
        b_tl.set(bar_elm, {
          width: 'random(15,100)%',
          height: 'random(1,2)%',
          top: 'random(0,100)%',
          left: 'random(-25,75)%',
        });
        b_tl.to(bar_elm, {
          opacity: 1,
          '--glow-opacity': 1,
          delay: 'random(0,2.5)',
          duration: 0.05,
          ease: 'expo.out',
        });
        b_tl.to(bar_elm, {
          opacity: 0,
          '--glow-opacity': 0,
          duration: 'random(0.2,0.5)',
        });
        this.bar_tl.add(b_tl, 0);
      }.bind(this)
    ); //this.bars_elm.forEach

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
    this.lines_container = document.querySelector('#lines_container');
    this.mother_container_elm = document.querySelector('#mother_container');
    this.mother_container_elm2 = document.querySelector('#mother_container');
    this.lines_copy_array = opts.lines_copy_array || ['HELLO WORLD!!'];
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
    let default_line_opts = {
      line_container: this.lines_container,
      key_sound: this.key_sound,
      has_underline: false,
    };

    let boot_screen_opts = {
      boot_sound: this.boot_sound,
      detail_beep_sound: this.detail_beep_sound,
    };
    this.cmd_seq.forEach(
      function (cmd, index) {
        let c = null;
        switch (cmd.type) {
          case 'boot':
            c = new BootScreen();
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

let mother = new Mother({
  cmd_seq: [{ type: 'boot' }],
});
