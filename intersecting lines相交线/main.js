let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let cw = canvas.width = window.innerWidth;
let ch = canvas.height = window.innerHeight;
let linesNum = 16;//线段总数
let linesRy = [];//存储所有的线段
let requestId = null;
let color = "#ccc";
let h, s, l = '50%', numOfL = 50;
ctx.fillStyle = "#000";//相交点

//line类
function Line(f) {
    this.flag = f;
    //线段的两个端点都在窗口边框上
    this.a = {};//起点
    this.b = {};//终点

    if (this.flag === "v") {//"v"代表大致上竖直的线
        this.a.y = 0;
        this.b.y = ch;
        this.a.x = Math.random() * cw;
        this.b.x = Math.random() * cw;
    } else if (this.flag === "h") {//"h"代表大致上水平的线
        this.a.x = 0;
        this.b.x = cw;
        this.a.y = Math.random() * ch;
        this.b.y = Math.random() * ch;
    }
    //速度/增量(px),(-1.5~1.5)
    this.va = Math.random() * 3 - 1.5;
    this.vb = Math.random() * 3 - 1.5;

    //draw()-->update()-->edges()
    this.draw = () => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.b.x, this.b.y);
        ctx.stroke();
        this.update();
    };

    //端点坐标更新
    this.update = () => {
        if (this.flag === "v") {
            this.a.x += this.va;
            this.b.x += this.vb;
        } else if (this.flag === "h") {
            this.a.y += this.va;
            this.b.y += this.vb;
        }
        this.edges();
    };

    //判断线条移动到边界时
    this.edges = () => {
        if (this.flag === "v") {
            if (this.a.x < 0 || this.a.x > cw)
                this.va *= -1;
            if (this.b.x < 0 || this.b.x > cw)
                this.vb *= -1;
        } else if (this.flag === "h") {
            if (this.a.y < 0 || this.a.y > ch)
                this.va *= -1;
            if (this.b.y < 0 || this.b.y > ch)
                this.vb *= -1;
        }
    }

}

//刷新canvas
function Draw() {
    ctx.clearRect(0, 0, cw, ch);

    //遍历二维数组的两两组合
    for (let l of linesRy) {    //卧槽.for in 默认i是字符串型.....// let i = parseInt(ii);
        l.draw();
        for (let j = linesRy.indexOf(l) + 1; j < linesRy.length; j++)
            Intersect2lines(l, linesRy[j]);
    }
    requestId = window.requestAnimationFrame(Draw);
}

function Init() {
    linesRy.length = 0;
    for (let i = 0; i < linesNum; i++) {
        //公平算法:垂直或水平线条按照宽高比例分配数量
        let flag = Math.random() * (cw + ch) < cw ? 'v' : 'h';
        let l = new Line(flag);
        linesRy.push(l);
    }

    if (requestId) {
        window.cancelAnimationFrame(requestId);
        requestId = null;
    }

    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;

    Draw();
}

setTimeout(() => {
    Init();
    addEventListener('resize', Init, false);
}, 15);

function Intersect2lines(l1, l2) {
    let [p1, p2, p3, p4] = [l1.a, l1.b, l2.a, l2.b];
    //计算交点位置公式
    let denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    let ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
    let ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
    let x = p1.x + ua * (p2.x - p1.x);
    let y = p1.y + ua * (p2.y - p1.y);
    if (ua > 0 && ub > 0) markPoint({x: x, y: y});
}

function markPoint(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
    ctx.fill();
}

window.addEventListener("mousemove", (e) => {
    h = Math.floor((e.clientX / cw) * 360);
    s = Math.floor((e.clientY / ch) * 101) + '%';
    color = `hsl(${h},${s},${l})`;
});

//注意wheel和scroll事件的区别
canvas.addEventListener("wheel", (e) => {
    // console.log(e.wheelDelta);
    if (e.wheelDelta > 0 && numOfL > 0) numOfL--;
    else if (e.wheelDelta < 0 && numOfL < 100) numOfL++;
    else return;
    l = numOfL + '%';
    color = `hsl(${h},${s},${l})`;
});

console.log('试试鼠标和滚轮:D');