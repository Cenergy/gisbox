/*
 * @Author: your name
 * @Date: 2019-11-20 11:46:17
 * @LastEditTime: 2019-11-25 17:27:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\threebox\examples\ringShaderFunction.js
 */
import { GlowBind } from './GlowBind.js'
import { GUI } from '../dat.gui.module.js';
import Stats from '../stats.module.js';
if (!config) console.error("Config not set! Make a copy of 'config_template.js', add in your access token, and save the file as 'config.js'.");

mapboxgl.accessToken = config.accessToken;
let origin = [108.19472406258183, 35.06330834377377, 100];
let ring
let stats
let settings
function initGUI() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    let panel = new GUI({ width: 310 });
    settings = {
        '环R通道': 0,
        '环G通道': 165,
        '环B通道': 255,
        '环alpha': 1.0,
        '是否显示': true,
        '环高度': 18,
        '环半径': 4000,
        '是否删除':false
    }
    panel.add(settings, "环R通道", 0, 255).onChange((v) => {
        settings.环R通道 = v
        ring.setColor(`rgba(${settings.环R通道},${settings.环G通道},${settings.环B通道},${settings.环alpha})`)
    });
    panel.add(settings, "环G通道", 0, 255).onChange((v) => {
        settings.环G通道 = v
        ring.setColor(`rgba(${settings.环R通道},${settings.环G通道},${settings.环B通道},${settings.环alpha})`)
    });
    panel.add(settings, "环B通道", 0, 255).onChange((v) => {
        settings.环B通道 = v
        ring.setColor(`rgba(${settings.环R通道},${settings.环G通道},${settings.环B通道},${settings.环alpha})`)
    });
    panel.add(settings, "环alpha", 0.0, 1.0).onChange((v) => {
        settings.环alpha = v
        ring.setColor(`rgba(${settings.环R通道},${settings.环G通道},${settings.环B通道},${settings.环alpha})`)
    });
    panel.add(settings, "环高度", 1.0, 120).onChange((v) => {
        settings.环高度 = v
        ring.setHeight(settings.环高度)
    });
    panel.add(settings, "环半径", 1, 50000).onChange((v) => {
        settings.环半径 = v
        ring.setRadius(settings.环半径)
    });
    panel.add(settings, '是否显示').onChange((v) => {
        settings['是否显示'] = v
        if (v) {
            ring.setShow(settings['是否显示'])
        } else {
            ring.setShow(settings['是否显示'])
        }
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
    ring.setPosition([e.lngLat.lng, e.lngLat.lat])
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
            let config = {
                //材质,增加磨砂感
                texture: './meshline.png',
                //颜色以及透明度
                color: "rgba(0,168,255,0.5)",
                //高度
                height: 18,
                //半径,单位米
                radius: 4000,
                //圆心
                center: [origin[0], origin[1]],
                //THREE对象
                THREE: THREE,
                //threeBox对象
                Threebox: tb,
            }
            ring = new GlowBind(config);

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