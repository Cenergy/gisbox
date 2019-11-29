/*
 * @Author: your name
 * @Date: 2019-11-20 11:46:17
 * @LastEditTime: 2019-11-25 17:24:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\threebox\examples\lineShaderFunction.js
 */
import { RoadLines } from './RoadLines.js'
import { GUI } from '../dat.gui.module.js';
import Stats from '../stats.module.js';
if (!config) console.error("Config not set! Make a copy of 'config_template.js', add in your access token, and save the file as 'config.js'.");

mapboxgl.accessToken = config.accessToken;
let origin = [108.19472406258183, 35.06330834377377, 100];
let line
let stats
let settings
function initGUI() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    let panel = new GUI({ width: 310 });
    settings = {
        '道路R通道': 0,
        '道路G通道': 165,
        '道路B通道': 255,
        '道路alpha': 1.0,
        '是否显示': true,
        '道路宽度': 15,
        '道路长度': 860,
        '道路流转速度': 15,
        '道路线密度': 150,
        '样式是否是虚线': false,
        '是否删除': false
    }
    panel.add(settings, "道路R通道", 0, 255).onChange((v) => {
        settings.道路R通道 = v
        line.setColor(`rgba(${settings.道路R通道},${settings.道路G通道},${settings.道路B通道},${settings.道路alpha})`)
    });
    panel.add(settings, "道路G通道", 0, 255).onChange((v) => {
        settings.道路G通道 = v
        line.setColor(`rgba(${settings.道路R通道},${settings.道路G通道},${settings.道路B通道},${settings.道路alpha})`)
    });
    panel.add(settings, "道路B通道", 0, 255).onChange((v) => {
        settings.道路B通道 = v
        line.setColor(`rgba(${settings.道路R通道},${settings.道路G通道},${settings.道路B通道},${settings.道路alpha})`)
    });
    panel.add(settings, "道路alpha", 0.0, 1.0).onChange((v) => {
        settings.道路alpha = v
        line.setColor(`rgba(${settings.道路R通道},${settings.道路G通道},${settings.道路B通道},${settings.道路alpha})`)
    });
    panel.add(settings, "道路宽度", 1.0, 50).onChange((v) => {
        settings.道路宽度 = v
        line.setWidth(settings.道路宽度)
    });
    panel.add(settings, "道路长度", 1.0, 5000).onChange((v) => {
        settings.道路长度 = v
        line.setLength(settings.道路长度)
    });
    panel.add(settings, "道路流转速度", 1.0, 100).onChange((v) => {
        settings.道路流转速度 = v
        line.setSpeed(settings.道路流转速度)
    });
    panel.add(settings, "道路线密度", 1, 200).step(1.0).onChange((v) => {
        settings.道路线密度 = v
        line.setPointsInLine(settings.道路线密度)
    });
    panel.add(settings, '是否显示').onChange((v) => {
        settings['是否显示'] = v
        if (v) {
            line.setShow(settings['是否显示'])
        } else {
            line.setHide(settings['是否显示'])
        }
    });
    panel.add(settings, '样式是否是虚线').onChange((v) => {
        settings['样式是否是虚线'] = v
        let type = ''
        settings['样式是否是虚线'] ? type = 'dashed' : 'normal'
        line.setType(type)
    });
}

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: origin,
    zoom: 11.5,
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
            $.getJSON("./咸阳线数据.json", (result) => {
                let config = {
                    //颜色以及透明度,透明度体现在稍近距离,远距离叠加作用感觉不明显
                    color: `rgba(0,167,255,1.0)`,
                    //需要展示的Geojson线中的features。数量在15000时帧率会下降到45左右(G1050)
                    //如有特别大量需求请合并features
                    features: result.features.slice(0, 5000),
                    //线宽
                    width: 15,
                    //线光流长
                    length: 860,
                    //播放速度
                    speed: 15,
                    //此线条的差值点数量,越大则越密,视觉上显得越细腻。150为建议值。如此值越大则需要更大的speed才可以流动的一样快
                    //超过200的值会导致初始运算时间长和性能影响
                    pointsInLine: 150,
                    //是否变为虚线,支持dashed和normal
                    type: 'dashed',
                    //THREE对象
                    THREE: THREE,
                    Threebox: tb,
                }
                line = new RoadLines(config);
            })
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