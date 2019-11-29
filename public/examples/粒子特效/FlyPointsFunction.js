/*
 * @Author: your name
 * @Date: 2019-11-20 11:46:17
 * @LastEditTime: 2019-11-26 14:58:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\threebox\examples\SphereShaderFunction.js
 */
import { FlyPoints } from './FlyPoints.js'
import { GUI } from '../dat.gui.module.js';
import Stats from '../stats.module.js';
if (!config) console.error("Config not set! Make a copy of 'config_template.js', add in your access token, and save the file as 'config.js'.");

mapboxgl.accessToken = config.accessToken;
let origin = [117.5100333202542,31.84329786620833, 100];
let points = []
let stats
function initGUI() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    let panel = new GUI({ width: 310 });
    let settings = {
        '粒子R通道': 255,
        '粒子G通道': 128,
        '粒子B通道': 128,
        '粒子alpha': 1.0,
        '粒子数量': 17700,
        '是否显示': true,
        '粒子像素大小': 4.5,
        '粒子速度': 1.6,
        '粒子颜色加深系数': 3,
        '粒子波间隔时间': 1500,
        '是否删除': false
    }
    panel.add(settings, "粒子R通道", 0, 255).onChange((v) => {
        settings.粒子R通道 = v
        points.forEach((item) => {
            item.setColor(`rgba(${settings.粒子R通道},${settings.粒子G通道},${settings.粒子B通道},${settings.粒子alpha})`)
        })
    });
    panel.add(settings, "粒子G通道", 0, 255).onChange((v) => {
        settings.粒子G通道 = v
        points.forEach((item) => {
            item.setColor(`rgba(${settings.粒子R通道},${settings.粒子G通道},${settings.粒子B通道},${settings.粒子alpha})`)
        })
    });
    panel.add(settings, "粒子B通道", 0, 255).onChange((v) => {
        settings.粒子B通道 = v
        points.forEach((item) => {
            item.setColor(`rgba(${settings.粒子R通道},${settings.粒子G通道},${settings.粒子B通道},${settings.粒子alpha})`)
        })
    });
    panel.add(settings, "粒子alpha", 0.2, 0.8).onChange((v) => {
        settings.粒子alpha = v
        points.forEach((item) => {
            item.setColor(`rgba(${settings.粒子R通道},${settings.粒子G通道},${settings.粒子B通道},${settings.粒子alpha})`)
        })
    });
    panel.add(settings, "粒子数量", 500, 10000).step(1.0).onChange((v) => {
        settings['粒子数量'] = v
        points.forEach((item) => {
            item.setNums(settings['粒子数量'])
        })
    });

    panel.add(settings, "粒子像素大小", 0, 20).onChange((v) => {
        settings['粒子像素大小'] = v
        points.forEach((item) => {
            item.setSize(settings['粒子像素大小'])
        })
    });
    panel.add(settings, "粒子速度", 0, 50).onChange((v) => {
        settings['粒子速度'] = v
        points.forEach((item) => {
            item.setSpeed(settings['粒子速度'])
        })
    });
    panel.add(settings, "粒子颜色加深系数", 1, 10).onChange((v) => {
        settings['粒子颜色加深系数'] = v
        points.forEach((item) => {
            item.setDeepAlpha(settings['粒子颜色加深系数'])
        })
    });
    panel.add(settings, "粒子波间隔时间", 0, 2000).step(1.0).onChange((v) => {
        settings['粒子波间隔时间'] = v
        points.forEach((item) => {
            item.setWaveDelay(settings['粒子波间隔时间'])
        })
    });


    panel.add(settings, '是否显示').onChange((v) => {
        settings['是否显示'] = v

        if (v) {
            points.forEach((item) => {
                item.setShow(settings['是否显示'])
            })
        } else {
            points.forEach((item) => {
                item.setHide(settings['是否显示'])
            })
        }
    });



}

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: origin,
    zoom: 9.4,
    pitch: 60,
    bearing: 80
});
map.on('click', function (e) {
    console.log(e.lngLat.lng, e.lngLat.lat)
});
map.on('style.load', function () {
    let tb
    map.addLayer({
        id: 'custom_layer',
        type: 'custom',
        onAdd: function (map, mbxContext) {
            tb = new Threebox(
                map,
                mbxContext,
                { defaultLights: true, passiveRendering: false }
            );
            for (let i = -2; i <= 1; i++) {
                for (let j = -2; j <= 1; j++) {
                    points.push(new FlyPoints({
                        //材质,也可以不写,缺乏渐变效果
                        texture: "./meshline.png",
                        //颜色以及透明度
                        color: `rgba(255,128,128,1)`,
                        //坐标[[x,y],[x,y],[x,y],[x,y]],形成的一个矩形
                        position: [[117.29081781300727 + i * 0.1, 31.893930065648547 + j * 0.1], [117.22196508071193 + i * 0.1, 31.89697627648806 + j * 0.1], [117.22726814038714 + i * 0.1, 31.833036505825163 + j * 0.1], [117.29279345221869 + i * 0.1, 31.837074849597713 + j * 0.1]],
                        //离子大小
                        size: 4.5,
                        //上升高度,单位米,从地面算起
                        height: 1000,
                        //播放速度
                        speed: 1.7,
                        //离子数量
                        numbers: 17700,
                        //颜色加深倍数1-10
                        alpha: 3.0,
                        //粒子波间隔时间，调整此值以优化动画效果，单位毫秒默认500
                        //实际上动画以20个波200ms间隔发射出去的，对于过慢的速度或过长的距离需要设置更长的间隔时间
                        wavedelay: 1500,
                        //THREE对象
                        THREE: THREE,
                        //threebox实例对象
                        Threebox: tb
                    }));
                }

            }


            initGUI()
        },
        render: function (gl, matrix) {
            try {
                tb.update();
                stats.update();
            } catch (error) {

            }

        }
    });
});