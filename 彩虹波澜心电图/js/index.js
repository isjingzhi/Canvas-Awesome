let c = document.querySelector('#c') /* canvas element */,
    w /* canvas width */, h /* canvas height */,
    ctx = c.getContext('2d') /* canvas context */,

    /* previous & current coordinates */
    x0, y0, x, y,
    t = 0,
    t_step = 1 / 20,    //水平速度增量
    tmp,
    period = 2,   //振动周期参数

    /* just me being lazy */
    exp = Math.exp, pow = Math.pow, sqrt = Math.sqrt,
    PI = Math.PI, sin = Math.sin, cos = Math.cos;


/* FUNCTIONS */
/* a random number between min & max */
let rand = function (max, min) {
    let b = (max === 0 || max) ? max : 1, a = min || 0;

    return a + (b - a) * Math.random();
};

let trimUnit = (input_str, unit) => parseInt(input_str.split(unit)[0], 10);

let initCanvas = function () {
    let s = getComputedStyle(c);

    w = c.width = trimUnit(s.width, 'px');
    h = c.height = trimUnit(s.height, 'px');
};

let positiveCosine = (x) => cos(x) > 0 ? cos(x) : 0;    //非负余弦函数:将cos()<0的曲线去掉以增加不动动的时间段

let wave = function () {
    x0 = -1;
    y0 = h / 2;

    ctx.clearRect(0, 0, w, h);

    tmp = pow(t, 1.75) / 19;
    //变态的简谐运动
    for (x = 0; x < w; x = x + 3) {
        y = 9 * sqrt(x) * sin(x / 23 / PI + t / 3 + sin(x / 29 + t)) +
            32 * sin(t) * cos(x / 19 + t / 7) +
            //     抖动周期                    振幅大小
            16 * positiveCosine(t / period) * sin(sqrt(x) + rand(3, 2) * tmp) +      //这一项决定了抖动偏移值
            h / 2;

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x, y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = `hsl( ${(2 * x / w + t) * 180}, 100%, 65%)`;
        ctx.stroke();

        x0 = x;
        y0 = y;
    }


    t += t_step;

    requestAnimationFrame(wave);
};


/* START THE MADNESS */
setTimeout(function () {
    initCanvas();
    wave();
    addEventListener('resize', initCanvas, false);
}, 15);

addEventListener('keydown', () => {
    t_step = 1 / 10;
    period = 4;
});

addEventListener('keyup', () => {
    t_step = 1 / 20;
    period = 2;
});

console.log('空格键可以加速');