/*
* 此脚本功能:
* 1.动态生成numOfLoops个span
* 2.每一个span设置圆形边框,并赋予不同的背景色调
* 3.每个span通过旋转等差的角度形成一个彩色的球体
* (注意,旋转前每个circle在空间上是重叠的)
* */

const numOfLoops = 36;
const delta = 360 / numOfLoops;
const cube = document.querySelector('.cube');
let degree = 0;
for (let i = 0; i < numOfLoops; i++) {
    let circle = document.createElement('span');
    // circle.style.borderRadius = '50%';
    circle.style.backgroundColor = `hsl(${degree}, 100%, 80%)`;
    circle.style.transform = `rotateY(${degree / 2}deg)`;
    cube.appendChild(circle);
    degree += delta;
}
