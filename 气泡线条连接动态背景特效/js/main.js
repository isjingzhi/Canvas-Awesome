let stable_number = 80;     //稳定时粒子的数量
let particles = [];
let w, h;

const tela = document.querySelector('#canvas');
tela.width = w = window.innerWidth;
tela.height = h = window.innerHeight;

const ctx = tela.getContext('2d');
// const colors = ["#feea00", "#a9df85", "#5dc0ad", "#ff9a00", "#fa3f20"];
const types = ["double", "wrap", "fill", "empty"];  //四种粒子样式

class Particle {
    //实现一种正态分布  //!!!!!!    //类比高尔顿钉板
    constructor(x = (w / 2) + (Math.random() * w / 2 - Math.random() * w / 2), y = (h / 2) + (Math.random() * h / 2 - Math.random() * h / 2)) {
        //瞬时坐标 和 初始坐标
        this.x = this.X = x;
        this.y = this.Y = y;

        //瞬时极坐标(R,radian)
        this.R = 0;     //半径
        this.radian = Math.random() * 2 * Math.PI;  //弧度rad

        //增量
        this.RDelta = Math.random() * 0.4 + 0.1;
        this.radDelta = Math.random() * 0.04 - 0.02;

        this.radius = 2 + (8 * Math.random());
        this.type = types[Particle.randomIntFromInterval(0, types.length - 1)];     //通过类名调用静态方法...
        this.color = `hsl(${(360 * Math.random()).toFixed(0)},100%,80%)`;
    }

    getCoordinates() {
        return {
            x: this.x,
            y: this.y
        }
    }

    static randomIntFromInterval(min, max) {    //静态方法,因为函数体内没有this!!!!
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    render() {      //渲染(画图)
        let lineWidth = 2;
        let color = this.color;
        switch (this.type) {
            case "wrap":  //空心套实心
                this.createArcFill(this.radius - 1, color);
                this.createArcEmpty(this.radius + lineWidth, lineWidth / 2, color);
                break;
            case "fill":    //实心
                this.createArcFill(this.radius, color);
                break;
            case "empty":   //空心
                this.createArcEmpty(this.radius, lineWidth, color);
                break;
            case "double":  //空心套空心
                this.createArcEmpty(this.radius, lineWidth / 2, color);
                this.createArcEmpty(this.radius / 2, lineWidth / 2, color);
                break;
            default:
                break;
        }
    }

    createArcFill(radius, color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    createArcEmpty(radius, lineWidth, color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }

    update() {  //粒子更新兼边间检查
        this.R += this.RDelta;
        this.radian += this.radDelta;

        this.x = this.X + this.R * Math.cos(this.radian);
        this.y = this.Y - this.R * Math.sin(this.radian);

        //边界检测
        if (this.x < -this.radius || this.x > w + this.radius)
            return false;
        if (this.y < -this.radius || this.y > h + this.radius)
            return false;

        this.render();
        return true;
    }
}

//初始化80个粒子
let preview = setInterval(() => {
    if (particles.length >= stable_number) {
        clearInterval(preview);
        preview = null;
    }
    particles.push(new Particle());
}, 70);

function clear() {
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, tela.width, tela.height);
}

//两点一线
function connect() {
    let old_element = null;
    particles.forEach(function (element, i) {
        if (i > 0) {
            let box1 = old_element.getCoordinates();
            let box2 = element.getCoordinates();
            ctx.beginPath();
            ctx.moveTo(box1.x, box1.y);
            ctx.lineTo(box2.x, box2.y);
            ctx.lineWidth = 0.45;
            ctx.strokeStyle = "rgba(255,255,255,0.4)";
            ctx.stroke();
            ctx.closePath();
        }
        old_element = element
    })
}

(function animate() {
    clear();
    connect();
    //粒子位置更新的同时过滤
    particles = particles.filter((p) => p.update());
    //等待预处理状态结束后进行周期填入粒子
    if (!preview)
        if (particles.length < stable_number)
            particles.push(new Particle());
    requestAnimationFrame(animate.bind(this));   //这里的this是window,因为this指向的是所在函数体(也就是animate定义的内部)被调用的对象,而不是参数体中!!!!!
})();


addEventListener('click', (e) => {
    particles.push(new Particle(e.clientX, e.clientY));
});

console.log('点击一下试试');