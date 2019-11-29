/*
 * @Author: your name
 * @Date: 2019-11-20 11:46:17
 * @LastEditTime: 2019-11-28 09:44:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\threebox\examples\ringShaderFunction.js
 */
import { RoundnessLine } from './RoundnessLine.js'
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
        '环线R通道': 0,
        '环线G通道': 165,
        '环线B通道': 255,
        '环线alpha': 1.0,
        '是否显示': true,
        '环线高度': 10,
        '环线半径': 10,
        '环线宽度': 10,
        '环线长度': 10,
        '环线速度': 0.2,
        '是否删除':false
    }
    panel.add(settings, "环线R通道", 0, 255).onChange((v) => {
        settings.环线R通道 = v
        flys.forEach((item) => {
            item.setColor(`rgba(${settings.环线R通道},${settings.环线G通道},${settings.环线B通道},${settings.环线alpha})`)
        })
    });
    panel.add(settings, "环线G通道", 0, 255).onChange((v) => {
        settings.环线G通道 = v
        flys.forEach((item) => {
            item.setColor(`rgba(${settings.环线R通道},${settings.环线G通道},${settings.环线B通道},${settings.环线alpha})`)
        })
    });
    panel.add(settings, "环线B通道", 0, 255).onChange((v) => {
        settings.环线B通道 = v
        flys.forEach((item) => {
            item.setColor(`rgba(${settings.环线R通道},${settings.环线G通道},${settings.环线B通道},${settings.环线alpha})`)
        })
    });
    panel.add(settings, "环线alpha", 0.0, 1.0).onChange((v) => {
        settings.环线alpha = v
        flys.forEach((item) => {
            item.setColor(`rgba(${settings.环线R通道},${settings.环线G通道},${settings.环线B通道},${settings.环线alpha})`)
        })
    });
    panel.add(settings, "环线半径", 1, 300).onChange((v) => {
        settings.环线半径 = v
        flys.forEach((item, index) => {
            item.setRadius(settings.环线半径 + index * settings.环线半径 / 3.0)
        })
    });
    panel.add(settings, "环线高度", 1, 300).onChange((v) => {
        settings.环线高度 = v
        flys.forEach((item, index) => {
            item.setHeight(settings.环线高度 + index * settings.环线高度 / 3.0)
        })
    });
    panel.add(settings, "环线宽度", 1, 150).onChange((v) => {
        settings.环线宽度 = v
        flys.forEach((item, index) => {
            item.setWidth(settings.环线宽度 + index * settings.环线宽度 / 3.0)
        })
    });
    panel.add(settings, "环线长度", 1, 300).onChange((v) => {
        settings.环线长度 = v
        flys.forEach((item, index) => {
            item.setLength(settings.环线长度 + index * settings.环线长度 / 3.0)
        })
    });
    panel.add(settings, "环线速度", 0.2, 30).onChange((v) => {
        settings.环线速度 = v
        flys.forEach((item, index) => {
            item.setSpeed(settings.环线速度 + index * settings.环线速度 / 3.0)
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
    flys.forEach((item) => {
        item.setPosition([e.lngLat.lng, e.lngLat.lat])
    })
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
            for (let i = 1; i <= 50; i++) {
                let config = {
                    //材质,增加磨砂感
                    texture: './meshline.png',
                    //颜色以及透明度
                    color: "rgba(0,168,255,1.0)",
                    //飞行高度
                    height: 200 + i * 10,
                    //半径,单位米
                    radius: 500 + i * 20,
                    //圆心
                    center: [origin[0], origin[1]],
                    //线长
                    length: 100 + i * 20,
                    //线宽
                    width: 100 - i,
                    //运行速率
                    speed: 1 + i * 0.2,
                    //THREE对象
                    THREE: THREE,
                    //threeBox对象
                    Threebox: tb,
                }
                flys.push(new RoundnessLine(config))
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