const cub = document.getElementById('scene');
//高效
const [f, a, l, r, t, b] = document.querySelectorAll(`.shape .face .photon-shader`);

window.onload = function () {
    window.reader();
    // arguemts.callee指代的是所在函数体对应的函数
    // 队规调用+立即执行不再需要函数名了...
    // 所以这里不能用箭头函数..
    window['timer'] = requestAnimationFrame(arguments.callee);  // 很fancy的写法
};

// 模块化编程
(function () {
    let scale = 0,
        rotateX = 0,
        speed = 2,
        n = 0,
        m = 0,
        flag = true;

    function reader() {
        const patten = /-?\d+\.?\d*/g;
        const rotate = cub.style.transform.match(patten);
        if (flag) { // 形态1
            if (+rotate[4] > 0.6)
                scale = (+rotate[4] - 0.002)
            else flag = false;
            if (+rotate[0] > -15)
                rotateX = +rotate[0] - 0.05;
            if (speed > 0) speed = speed - 0.0008;
        } else { //切换形态2
            if (+rotate[4] < 5)
                scale = (+rotate[4] + 0.008)
            if (+rotate[0] > -15)
                rotateX = +rotate[0] - 0.05;
            if (speed > 0) speed = speed - 0.0085;
            if (n < 120) n++;
            if (m < 90) m = m + 0.5;
            else {
                speed = 0;
                cancelAnimationFrame(window.timer);
            }
            t.style.transform = `rotateY(${n}deg)`;
            a.style.transform = `rotateX(${-m}deg)`;
            l.style.transform = `rotateX(${-m}deg)`;
        }
        cub.style.transform = `rotateX(${rotateX}deg) rotateY(${+rotate[1] - speed}deg) scale3d(${scale}, ${scale}, ${scale})`;
    }

    //利用window共享全局对象
    return window['reader'] = reader;
})();