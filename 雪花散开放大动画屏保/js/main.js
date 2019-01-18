let canvas = document.querySelector('#canvas');

const RENDERER = {
    SNOW_COUNT: {INIT: 100, DELTA: 1},
    BACKGROUND_COLOR: 'hsl(%h, 50%, %l%)',  //饱和度不高,因背景色不需要太鲜艳;
    INIT_HUE: 180,
    DELTA_HUE: 0.1,

    init: function () {
        this.setParameters();
        this.reconstructMethod();
        this.createSnow(this.SNOW_COUNT.INIT * this.countRate, true);
        this.render();
    },
    setParameters: function () {
        this.window = window;

        canvas.width = this.width = window.innerWidth;
        canvas.height = this.height = window.innerHeight;
        this.container = document.querySelector('#jsi-snow-container');
        // this.$container = $('#jsi-snow-container');
        this.center = {x: this.width / 2, y: this.height / 2};
        this.countRate = this.width * this.height / 500 / 500;
        // this.canvas = $('<canvas />').attr({width: this.width, height: this.height}).appendTo(this.$container).get(0);
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');

        this.radius = Math.sqrt(this.center.x * this.center.x + this.center.y * this.center.y);
        this.hue = this.INIT_HUE;
        this.snows = [];    //存放SNOW对象
    },
    reconstructMethod: function () {
        this.render = this.render.bind(this);
    },
    createSnow: function (count, toRandomize) {
        for (let i = 0; i < count; i++) {
            this.snows.push(new SNOW(this.width, this.height, this.center, toRandomize));
        }
    },
    render: function () {
        requestAnimationFrame(this.render);

        const gradient = this.ctx.createRadialGradient(this.center.x, this.center.y, 0, this.center.x, this.center.y, this.radius),
            backgroundColor = this.BACKGROUND_COLOR.replace('%h', this.hue);

        gradient.addColorStop(0, backgroundColor.replace('%l', '30'));
        gradient.addColorStop(0.2, backgroundColor.replace('%l', '20'));
        gradient.addColorStop(1, backgroundColor.replace('%l', '5'));   //明度足够小以衬托白色雪花

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        for (let i = this.snows.length - 1; i >= 0; i--) {
            if (!this.snows[i].render(this.ctx)) {
                this.snows.splice(i, 1);
            }
        }
        this.hue += this.DELTA_HUE;
        this.hue %= 360;

        this.createSnow(this.SNOW_COUNT.DELTA, false);
    }
};
const SNOW = function (width, height, center, toRandomize) {
    this.width = width;
    this.height = height;
    this.center = center;
    this.init(toRandomize);
};
SNOW.prototype = {
    RADIUS: 20,
    OFFSET: 4,
    INIT_POSITION_MARGIN: 20,
    COLOR: 'rgba(255, 255, 255, 0.8)',
    TOP_RADIUS: {MIN: 1, MAX: 3},
    SCALE: {INIT: 0.04, DELTA: 0.01},
    DELTA_ROTATE: {MIN: -Math.PI / 180 / 2, MAX: Math.PI / 180 / 2},
    THRESHOLD_TRANSPARENCY: 0.7,
    VELOCITY: {MIN: -1, MAX: 1},
    LINE_WIDTH: 2,
    BLUR: 10,

    init: function (toRandomize) {
        this.setParameters(toRandomize);
        this.createSnow();
    },
    setParameters: function (toRandomize) {
        if (!this.canvas) {
            this.radius = this.RADIUS + this.TOP_RADIUS.MAX * 2 + this.LINE_WIDTH;
            this.length = this.radius * 2;
            this.canvas = document.createElement('canvas');     //临时的canvas
            this.canvas.width = this.length;
            this.canvas.height = this.length;
            this.ctx = this.canvas.getContext('2d');
        }
        this.topRadius = this.getRandomValue(this.TOP_RADIUS);

        const theta = Math.PI * 2 * Math.random();

        this.x = this.center.x + this.INIT_POSITION_MARGIN * Math.cos(theta);
        this.y = this.center.y + this.INIT_POSITION_MARGIN * Math.sin(theta);
        this.vx = this.getRandomValue(this.VELOCITY);
        this.vy = this.getRandomValue(this.VELOCITY);

        this.deltaRotate = this.getRandomValue(this.DELTA_ROTATE);
        this.scale = this.SCALE.INIT;
        this.deltaScale = 1 + this.SCALE.DELTA * 500 / Math.max(this.width, this.height);
        this.rotate = 0;

        if (toRandomize) {
            let i = 0;
            const count = Math.random() * 1000;
            for (; i < count; i++) {
                this.x += this.vx;
                this.y += this.vy;
                this.scale *= this.deltaScale;
                this.rotate += this.deltaRotate;
            }
        }
    },
    getRandomValue: function (range) {
        return range.MIN + (range.MAX - range.MIN) * Math.random();
    },
    createSnow: function () {   //draw
        let y;
        this.ctx.clearRect(0, 0, this.length, this.length);

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(this.radius, this.radius);
        this.ctx.strokeStyle = this.COLOR;
        this.ctx.lineWidth = this.LINE_WIDTH;
        this.ctx.shadowColor = this.COLOR;
        this.ctx.shadowBlur = this.BLUR;

        const angle60 = Math.PI / 180 * 60,
            sin60 = Math.sin(angle60),
            cos60 = Math.cos(angle60),
            threshold = Math.random() * this.RADIUS / this.OFFSET | 0,
            rate = 0.5 + Math.random() * 0.5,
            offsetY = this.OFFSET * Math.random() * 2,
            offsetCount = this.RADIUS / this.OFFSET;

        for (let i = 0; i < 6; i++) {
            let j;
            this.ctx.save();
            this.ctx.rotate(angle60 * i);   //雪花每60deg对称

            //花瓣样式
            for (j = 0; j <= threshold; j++) {
                y = -this.OFFSET * j;

                this.ctx.moveTo(0, y);
                this.ctx.lineTo(y * sin60, y * cos60);
            }

            //花蕊样式
            for (j = threshold; j < offsetCount; j++) {
                y = -this.OFFSET * j;
                let x = j * (offsetCount - j + 1) * rate;

                this.ctx.moveTo(x, y - offsetY);
                this.ctx.lineTo(0, y);
                this.ctx.lineTo(-x, y - offsetY);
            }

            //每一瓣雪花的主枝干和末端的圆圈
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(0, -this.RADIUS);
            this.ctx.arc(0, -this.RADIUS - this.topRadius, this.topRadius, Math.PI / 2, Math.PI * 2.5, false);
            this.ctx.restore();
        }
        this.ctx.stroke();
        this.ctx.restore();
    },
    render: function (ctx) {
        ctx.save();

        if (this.scale > this.THRESHOLD_TRANSPARENCY) {
            ctx.globalAlpha = Math.max(0, (1 - this.scale) / (1 - this.THRESHOLD_TRANSPARENCY));

            //边界检测
            if (this.scale > 1 || this.x < -this.radius || this.x > this.width + this.radius || this.y < -this.radius || this.y > this.height + this.radius) {
                ctx.restore();
                return false;
            }
        }
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotate);
        ctx.scale(this.scale, this.scale);
        ctx.drawImage(this.canvas, -this.radius, -this.radius);
        ctx.restore();

        this.x += this.vx;
        this.y += this.vy;
        this.scale *= this.deltaScale;
        this.rotate += this.deltaRotate;
        return true;
    }
};

RENDERER.init();