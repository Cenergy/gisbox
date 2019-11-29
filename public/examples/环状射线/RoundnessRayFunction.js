/*
 * @Author: your name
 * @Date: 2019-11-20 11:46:17
 * @LastEditTime: 2019-11-28 10:06:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\threebox\examples\ringShaderFunction.js
 */
import { RoundnessRay } from './RoundnessRay.js'
import { GUI } from '../dat.gui.module.js';
import Stats from '../stats.module.js';
if (!config) console.error("Config not set! Make a copy of 'config_template.js', add in your access token, and save the file as 'config.js'.");

mapboxgl.accessToken = config.accessToken;
let origin = [108.19472406258183, 35.06330834377377, 100];
let flys = []
let stats
let settings
function initGUI() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    let panel = new GUI({ width: 310 });
    settings = {
        '射线R通道': 0,
        '射线G通道': 165,
        '射线B通道': 255,
        '射线alpha': 1.0,
        '是否显示': true,
        '射线高度': 10,
        '射线半径': 500,
        '射线宽度': 100,
        '射线长度': 500,
        '射线速度': 10.0,
        '是否删除': false,
        '射线间隔': 10
    }
    panel.add(settings, "射线R通道", 0, 255).onChange((v) => {
        settings.射线R通道 = v
        flys.forEach((item) => {
            item.setColor(`rgba(${settings.射线R通道},${settings.射线G通道},${settings.射线B通道},${settings.射线alpha})`)
        })
    });
    panel.add(settings, "射线G通道", 0, 255).onChange((v) => {
        settings.射线G通道 = v
        flys.forEach((item) => {
            item.setColor(`rgba(${settings.射线R通道},${settings.射线G通道},${settings.射线B通道},${settings.射线alpha})`)
        })
    });
    panel.add(settings, "射线B通道", 0, 255).onChange((v) => {
        settings.射线B通道 = v
        flys.forEach((item) => {
            item.setColor(`rgba(${settings.射线R通道},${settings.射线G通道},${settings.射线B通道},${settings.射线alpha})`)
        })
    });
    panel.add(settings, "射线alpha", 0.0, 1.0).onChange((v) => {
        settings.射线alpha = v
        flys.forEach((item) => {
            item.setColor(`rgba(${settings.射线R通道},${settings.射线G通道},${settings.射线B通道},${settings.射线alpha})`)
        })
    });
    panel.add(settings, "射线间隔", 10.0, 30.0).step(1.0).onChange((v) => {
        settings.射线alpha = v
        flys.forEach((item) => {
            item.setGap(settings.射线间隔)
        })
    });
    panel.add(settings, "射线半径", 1, 3000).onChange((v) => {
        settings.射线半径 = v
        flys.forEach((item, index) => {
            item.setRadius(settings.射线半径)
        })
    });
    panel.add(settings, "射线高度", 1, 3000).onChange((v) => {
        settings.射线高度 = v
        flys.forEach((item) => {
            item.setHeight(settings.射线高度)
        })
    });
    panel.add(settings, "射线宽度", 1, 350).onChange((v) => {
        settings.射线宽度 = v
        flys.forEach((item) => {
            item.setWidth(settings.射线宽度)
        })
    });
    panel.add(settings, "射线长度", 1, 1000).onChange((v) => {
        settings.射线长度 = v
        flys.forEach((item, index) => {
            item.setLength(settings.射线长度)
        })
    });
    panel.add(settings, "射线速度", 0.2, 100).onChange((v) => {
        settings.射线速度 = v
        flys.forEach((item, index) => {
            item.setSpeed(settings.射线速度)
        })
    });
    panel.add(settings, '是否显示').onChange((v) => {
        settings['是否显示'] = v
        if (v) {
            flys.forEach((item) => {
                item.setShow(settings['是否显示'])
            })
        } else {
            flys.forEach((item) => {
                item.setShow(settings['是否显示'])
            })
        }
    });
}

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: origin,
    zoom: 14.5,
    pitch: 60,
    bearing: 40
});
map.on('click', function (e) {
    console.log(e.lngLat.lng, e.lngLat.lat)
});
map.on('style.load', function () {
    let tb
    let arr = []
    for (let i = 0; i <= 10; i++) {
        arr.push({ position: [origin[0] + Math.random() * 0.01, origin[1] + Math.random() * 0.01], radius: 10 })
    }
    map.addLayer({
        id: 'custom_layer',
        type: 'custom',
        onAdd: function (map, mbxContext) {
            tb = new Threebox(
                map,
                mbxContext,
                { defaultLights: true, passiveRendering: false }
            );
            for (let i = -2; i <= 2; i++) {
                for (let j = -2; j <= 2; j++) {
                    let config = {
                        //材质,增加磨砂感
                        texture: './meshline.png',
                        //颜色以及透明度
                        color: "rgba(0,168,255,1.0)",
                        //飞行高度
                        height: 0,
                        //半径,单位米
                        radius: 500,
                        //射线间隔
                        gap: 10.0,
                        //圆心
                        center: [origin[0]+0.01*i, origin[1]+0.01*j],
                        //线长
                        length: 500,
                        //线宽
                        width: 100,
                        //运行速率
                        speed: 10,
                        pointnum: 500,
                        //THREE对象
                        THREE: THREE,
                        //threeBox对象
                        Threebox: tb,
                    }
                    flys.push(new RoundnessRay(config))
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