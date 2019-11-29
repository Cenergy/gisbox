/*
 * @Author: your name
 * @Date: 2019-11-20 11:46:17
 * @LastEditTime: 2019-11-27 15:37:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\threebox\examples\ringShaderFunction.js
 */
import { FlyLine } from './FlyLine.js'
import { GUI } from '../dat.gui.module.js';
import Stats from '../stats.module.js';
if (!config) console.error("Config not set! Make a copy of 'config_template.js', add in your access token, and save the file as 'config.js'.");

mapboxgl.accessToken = config.accessToken;
let origin = [108.41373552158518, 35.07420225285843, 100];
let flylines = []
let stats
let settings
function initGUI() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    let panel = new GUI({ width: 310 });
    settings = {
        '飞线R通道': 255,
        '飞线G通道': 0,
        '飞线B通道': 0,
        '飞线alpha': 1.0,
        '是否显示': true,
        '飞线宽度': 10,
        '飞线长度': 300,
        '飞线速度': 2,
        '是否删除': false,
        '飞线密度': 500,
    }
    panel.add(settings, "飞线R通道", 0, 255).onChange((v) => {
        settings.飞线R通道 = v
        flylines.forEach((item) => {
            item.setColor(`rgba(${settings.飞线R通道},${settings.飞线G通道},${settings.飞线B通道},${settings.飞线alpha})`)
        })
    });
    panel.add(settings, "飞线G通道", 0, 255).onChange((v) => {
        settings.飞线G通道 = v
        flylines.forEach((item) => {
            item.setColor(`rgba(${settings.飞线R通道},${settings.飞线G通道},${settings.飞线B通道},${settings.飞线alpha})`)
        })
    });
    panel.add(settings, "飞线B通道", 0, 255).onChange((v) => {
        settings.飞线B通道 = v
        flylines.forEach((item) => {
            item.setColor(`rgba(${settings.飞线R通道},${settings.飞线G通道},${settings.飞线B通道},${settings.飞线alpha})`)
        })
    });
    panel.add(settings, "飞线alpha", 0.0, 1.0).onChange((v) => {
        settings.飞线alpha = v
        flylines.forEach((item) => {
            item.setColor(`rgba(${settings.飞线R通道},${settings.飞线G通道},${settings.飞线B通道},${settings.飞线alpha})`)
        })
    });
    panel.add(settings, "飞线宽度", 1, 150).onChange((v) => {
        settings.飞线宽度 = v
        flylines.forEach((item, index) => {
            item.setWidth(settings.飞线宽度)
        })
    });
    panel.add(settings, "飞线长度", 1, 3000).onChange((v) => {
        settings.飞线长度 = v
        flylines.forEach((item, index) => {
            item.setLength(settings.飞线长度)
        })
    });
    panel.add(settings, "飞线速度", 0.2, 30).onChange((v) => {
        settings.飞线速度 = v
        flylines.forEach((item, index) => {
            item.setSpeed(settings.飞线速度)
        })
    });
    panel.add(settings, "飞线密度", 10, 3000).onChange((v) => {
        settings.飞线密度 = v
        flylines.forEach((item) => {
            item.setPointNum(settings.飞线密度)
        })
    });

    panel.add(settings, '是否显示').onChange((v) => {
        settings['是否显示'] = v
        if (v) {
            flylines.forEach((item) => {
                item.setShow(settings['是否显示'])
            })
        } else {
            flylines.forEach((item) => {
                item.setShow(settings['是否显示'])
            })
        }
    });
}

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: origin,
    zoom: 9.5,
    pitch: 60,
    bearing: 40
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
            for (let i = 1; i <= 100; i++) {
                let config = {
                    //材质,增加磨砂感
                    texture: './meshline.png',
                    //颜色以及透明度
                    color: "rgba(255,0,0,1.0)",
                    //线的轨迹,支持添加高度
                    position: [
                        [108.18622280825014 + i * 0.01, 35.0617203368993],
                        [108.19364787478332 + i * 0.01, 35.062352088785715 + i * 0.01, 10000], 
                        [108.20416280943596 + i * 0.01, 35.06027736168831, 15000], 
                        [108.21742738302652 + i * 0.01, 35.065179721566054]
                    ],
                    //线密度，越大则越细致
                    pointnum: 500,
                    //线长
                    length: 100,
                    //线宽
                    width: 100,
                    //运行速率
                    speed: 2,
                    //THREE对象
                    THREE: THREE,
                    //threeBox对象
                    Threebox: tb,
                }
                flylines.push(new FlyLine(config))
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