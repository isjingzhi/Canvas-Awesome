/*jshint esversion:6*/
let can = document.getElementById("canvas");
let ctx = can.getContext('2d');

let text = document.querySelector('#text');
let fontSize = document.querySelector('#fontSize');
let fontFamily = document.querySelector('#fontFamily');

let numOfColors = 10;   //colors数组的长度

function resize() {
    can.width = window.innerWidth;
    can.height = window.innerHeight;
}

//闪烁粒子的半径
const max_radius = 3;
const min_radius = 1;
const drag = .03;    //引力参数(常量)
const radius = 50;   //排斥半径
const mutex = .06;  //排斥常量
window.onresize = resize;

function clear() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, can.width, can.height);
    ctx.fill();
}

let mouse = {
    x: -1000,
    y: -1000
};
can.onmousemove = function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
};
can.ontouchmove = function (e) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
};

resize();
clear();
//两点间距
let distance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

class Particle {
    //额,成员变量直接放在构造函数中写
    constructor(pos, target, vel, color, radius) {
        this.pos = pos;     //瞬时坐标
        this.target = target;   //稳定状态在文本上的位置(原位置)
        this.vel = vel;     //速度分量/velocity(因为动画刷新频率是固定的,所以这里的增量代表了速度
        this.color = color;
        this.radius = radius;
        //半径的增量(影响速度)
        this.direction = [-1, 1][~~(Math.random() * 2)] * Math.random() / 2;   //~~运算符向下取整..
    }

    set(type, value) {
        this[type] = value;
    }

    //update()-->draw()每一帧执行    //核心算法
    update() {
        this.radius += this.direction;
        this.vel.x = (this.target.x - this.pos.x) * drag;
        this.vel.y = (this.target.y - this.pos.y) * drag;
        if (distance(this.pos.x, this.pos.y, mouse.x, mouse.y) < radius) {
            this.vel.x += this.vel.x + (this.pos.x - mouse.x) *mutex;
            this.vel.y += this.vel.y + (this.pos.y - mouse.y) *mutex;
        }
        if (this.radius >= max_radius)
            this.direction *= -1;

        if (this.radius <= min_radius)
            this.direction *= -1;

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

//存放所有的粒子
let particles = [];
// let colors = ["#bf1337", "#f3f1f3", "#084c8d", "#f2d108", "#efd282"];
let colors = [];
for (let i = 0; i < numOfColors; i++) {
    let ran0x = parseInt(0xffffff * Math.random()).toString(16);
    colors.push('#' + (ran0x + "000000").slice(0, 6));
}

let bool = true;

function changeText(theText = text.value, theFontSize = fontSize.value, theFontFamily = fontFamily.value) {
    let current = 0, temp, radius, color;
    clear();
    ctx.fillStyle = "#fff";
    ctx.font = `${theFontSize}px ${theFontFamily}`;
    ctx.fillText(theText, can.width * 0.5 - ctx.measureText(theText).width * 0.5, can.height * 0.5 + 60);
    let data = ctx.getImageData(0, 0, can.width, can.height).data;      //收集图像
    clear();
    for (let i = 0; i < data.length; i += 8) {
        temp = {x: (i / 4) % can.width, y: ~~((i / 4) / can.width)};
        /*(temp.x % (max_radius+1) === 0 && temp.y % (max_radius+1) === 0)*/
        if (data[i] !== 0 && ~~(Math.random() * 5) === 1) {
            if (data[i + 4] !== 255 || data[i - 4] !== 255 || data[i + can.width * 4] !== 255 || data[i - can.width * 4] !== 255) {
                if (current < particles.length)
                    particles[current].set("target", temp);
                else {
                    radius = max_radius - Math.random() * min_radius;
                    temp = {x: Math.random() * can.width, y: Math.random() * can.height};
                    if (bool) temp = {x: (i / 4) % can.width, y: ~~((i / 4) / can.width)};
                    color = colors[~~(Math.random() * numOfColors)];
                    let p = new Particle(
                        temp,
                        {x: (i / 4) % can.width, y: ~~((i / 4) / can.width)},   //遍历每一个点的坐标
                        {x: 0, y: 0},
                        color,
                        radius);
                    particles.push(p);
                }
                ++current;
            }
        }
    }
    bool = false;
    particles.splice(current, particles.length - current);
}

function draw() {
    clear();
    for (let p of particles) {
        p.update();
        p.draw();
    }
    window.requestAnimationFrame(draw);
}

changeText();
draw();