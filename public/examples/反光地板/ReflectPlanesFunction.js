/*
 * @Author: your name
 * @Date: 2019-11-20 11:46:17
 * @LastEditTime: 2019-11-28 09:36:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\threebox\examples\planeShaderFunction.js
 */
import { ReflectPlanes } from './ReflectPlanes.js'
import { GUI } from '../dat.gui.module.js';
import Stats from '../stats.module.js';
if (!config) console.error("Config not set! Make a copy of 'config_template.js', add in your access token, and save the file as 'config.js'.");

mapboxgl.accessToken = config.accessToken;
let origin = [117.25547987715589,31.872896299910835, 100];
let plane
let stats
let settings
function initGUI() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    let panel = new GUI({ width: 310 });
    settings = {
        '平面R通道': 0,
        '平面G通道': 165,
        '平面B通道': 255,
        '平面alpha': 1.0,
        '符号大小': 2,
        '符号间隔': 3.0,
        '是否显示': true,
        '符号样式': 'circle',
        '填充空间半径': 10,
        '是否删除':false
    }
    panel.add(settings, "平面R通道", 0, 255).onChange((v) => {
        settings.平面R通道 = v
        plane.setColor(`rgba(${settings.平面R通道},${settings.平面G通道},${settings.平面B通道},${settings.平面alpha})`)
    });
    panel.add(settings, "平面G通道", 0, 255).onChange((v) => {
        settings.平面G通道 = v
        plane.setColor(`rgba(${settings.平面R通道},${settings.平面G通道},${settings.平面B通道},${settings.平面alpha})`)
    });
    panel.add(settings, "平面B通道", 0, 255).onChange((v) => {
        settings.平面B通道 = v
        plane.setColor(`rgba(${settings.平面R通道},${settings.平面G通道},${settings.平面B通道},${settings.平面alpha})`)
    });
    panel.add(settings, "平面alpha", 0.0, 1.0).onChange((v) => {
        settings.平面alpha = v
        plane.setColor(`rgba(${settings.平面R通道},${settings.平面G通道},${settings.平面B通道},${settings.平面alpha})`)
    });
    panel.add(settings, "符号大小", 0.1, 2.0).step(0.5).onChange((v) => {
        settings['符号大小'] = v
        plane.setSize(settings['符号大小'])
    });
    panel.add(settings, "符号间隔", 1.0, 5.0).step(0.5).onChange((v) => {
        settings['符号间隔'] = v
        plane.setSpace(settings['符号间隔'])
    });
    panel.add(settings, '是否显示').onChange((v) => {
        settings['是否显示'] = v
        if (v) {
            plane.setShow(settings['是否显示'])
        } else {
            plane.setHide(settings['是否显示'])
        }
    });
    panel.add(settings, '符号样式', ['circle', 'plane', 'tringle']).onChange((v) => {
        settings['符号样式'] = v
        plane.setType(settings['符号样式'])
    });
    panel.add(settings, "填充空间半径", 1, 50).step(1).onChange((v) => {
        settings['填充空间半径'] = v
    });
}

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: origin,
    zoom: 15.7,
    pitch: 60,
    bearing: 80
});
map.on('click', function (e) {
    console.log(e.lngLat.lng, e.lngLat.lat)
    plane.addHole([{ position: [e.lngLat.lng, e.lngLat.lat], radius: settings['填充空间半径'] }])
});
map.on('style.load', function () {
    let tb
    let arr = []
    for (let i = 0; i <= 11; i++) {
        arr.push({ position: [origin[0]+Math.random()*0.01, origin[1]+Math.random()*0.01], radius: 10 })
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
            plane = new ReflectPlanes({
                //符合geojson格式的包围形
                position: [[
                    [117.28713837742401, 31.861066489281313],
                    [117.28859794532633, 31.862932759026748],
                    [117.29162159997134, 31.862974260700412],
                    [117.29186485387748, 31.881520767401724],
                    [117.24986717036558, 31.88151528385238],
                    [117.2453253074109, 31.873523071925845],
                    [117.24347740770105, 31.867422368802295],
                    [117.23534091247416, 31.869822123255403],
                    [117.22547846126173, 31.869523697451598],
                    [117.22006224325423, 31.863413438845257],
                    [117.21503629159218, 31.863989927015254],
                    [117.21442266216167, 31.860675681459867],
                    [117.28733832898712, 31.86086667256967],
                ]],
                //整体符号的大小,默认为1
                size: 2,
                //整体符号间隔,默认为1,
                space: 3,
                //颜色和透明度
                color: `rgba(0,165,255,1.0)`,
                //传入灰度图点位和半径信息,也可不传
                holes: arr,
                //图元类型,支持tringle三角,circle圆形,plane方形,默认tringle
                type: 'circle',
                //THREE对象
                THREE: THREE,
                //threebox对象
                threebox: tb,
            });
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