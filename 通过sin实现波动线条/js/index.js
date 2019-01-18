class wave {
    constructor(p1, p2, p3, p4) {
        this.timeModifier = p1;
        this.lineWidth = p2;
        this.amplitude = p3;
        this.wavelength = p4;
    }
}

const waves = new SineWaves({
    el: document.getElementById('waves'),

    speed: 4,

    width: function () {
        return $(window).width();
    },

    height: function () {
        return $(window).height();
    },

    ease: 'SineInOut',

    wavesWidth: '80%',

    waves: [
        new wave(4, 2, -100, 25),
        new wave(4, 1, -50, 20)
    ],

    // Resize
    resizeEvent: function () {
        let gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, "rgba(0,134,141,1)");

        let index = -1;
        let length = this.waves.length;
        while (++index < length) {
            this.waves[index].strokeStyle = gradient;
        }

        // Clean Up
        index = void 0;
        length = void 0;
        gradient = void 0;
    }
});
