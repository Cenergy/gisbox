/*
 * @Author: your name
 * @Date: 2019-11-20 11:46:17
 * @LastEditTime: 2019-11-29 14:23:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\threebox\examples\lineShaderFunction.js
 */
import { HighLightBuilding } from './HighLightBuilding.js'
import { GUI } from '../dat.gui.module.js';
import Stats from '../stats.module.js';
if (!config) console.error("Config not set! Make a copy of 'config_template.js', add in your access token, and save the file as 'config.js'.");

mapboxgl.accessToken = config.accessToken;
let origin = [117.23787708105328,31.8321197643413, 100];
let building
let stats
let settings
function initGUI() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    let panel = new GUI({ width: 310 });
    settings = {
        '本体R通道': 255,
        '本体G通道': 168,
        '本体B通道': 0,
        '本体alpha': 1.0,
        '本体高度': 10,
        '本体是否显示': true,
        '皮肤R通道': 255,
        '皮肤G通道': 168,
        '皮肤B通道': 0,
        '皮肤alpha': 0.3,
        '皮肤高度': 2,
        '皮肤是否显示': true,
        '包围盒R通道': 0,
        '包围盒G通道': 168,
        '包围盒B通道': 255,
        '包围盒alpha': 0.18,
        '包围盒高度': 7,
        '包围盒是否显示': true,
        '是否删除':false,
    }
    panel.add(settings, "本体R通道", 0, 255).onChange((v) => {
        settings.本体R通道 = v
        building.setBoxColor(`rgba(${settings.本体R通道},${settings.本体G通道},${settings.本体B通道},${settings.本体alpha})`)
    });
    panel.add(settings, "本体G通道", 0, 255).onChange((v) => {
        settings.本体G通道 = v
        building.setBoxColor(`rgba(${settings.本体R通道},${settings.本体G通道},${settings.本体B通道},${settings.本体alpha})`)
    });
    panel.add(settings, "本体B通道", 0, 255).onChange((v) => {
        settings.本体B通道 = v
        building.setBoxColor(`rgba(${settings.本体R通道},${settings.本体G通道},${settings.本体B通道},${settings.本体alpha})`)
    });
    panel.add(settings, "本体alpha", 0.0, 1.0).onChange((v) => {
        settings.本体alpha = v
        building.setBoxColor(`rgba(${settings.本体R通道},${settings.本体G通道},${settings.本体B通道},${settings.本体alpha})`)
    });
    panel.add(settings, "本体高度", 10, 1000).onChange((v) => {
        settings.本体高度 = v
        building.setBoxHeight(settings.本体高度)
    });
    panel.add(settings, '本体是否显示').onChange((v) => {
        settings['本体是否显示'] = v
        if (v) {
            building.setBoxShow(settings['本体是否显示'])
        } else {
            building.setBoxShow(settings['本体是否显示'])
        }
    });


    panel.add(settings, "皮肤R通道", 0, 255).onChange((v) => {
        settings.皮肤R通道 = v
        building.setSkinColor(`rgba(${settings.皮肤R通道},${settings.皮肤G通道},${settings.皮肤B通道},${settings.皮肤alpha})`)
    });
    panel.add(settings, "皮肤G通道", 0, 255).onChange((v) => {
        settings.皮肤G通道 = v
        building.setSkinColor(`rgba(${settings.皮肤R通道},${settings.皮肤G通道},${settings.皮肤B通道},${settings.皮肤alpha})`)
    });
    panel.add(settings, "皮肤B通道", 0, 255).onChange((v) => {
        settings.皮肤B通道 = v
        building.setSkinColor(`rgba(${settings.皮肤R通道},${settings.皮肤G通道},${settings.皮肤B通道},${settings.皮肤alpha})`)
    });
    panel.add(settings, "皮肤alpha", 0.0, 1.0).onChange((v) => {
        settings.皮肤alpha = v
        building.setSkinColor(`rgba(${settings.皮肤R通道},${settings.皮肤G通道},${settings.皮肤B通道},${settings.皮肤alpha})`)
    });
    panel.add(settings, "皮肤高度", 1, 1000).onChange((v) => {
        settings.皮肤高度 = v
        building.setSkinHeight(settings.皮肤高度)
    });
    panel.add(settings, '皮肤是否显示').onChange((v) => {
        settings['皮肤是否显示'] = v
        if (v) {
            building.setSkinShow(settings['皮肤是否显示'])
        } else {
            building.setSkinShow(settings['皮肤是否显示'])
        }
    });

    panel.add(settings, "包围盒R通道", 0, 255).onChange((v) => {
        settings.包围盒R通道 = v
        building.setOutBoxColor(`rgba(${settings.包围盒R通道},${settings.包围盒G通道},${settings.包围盒B通道},${settings.包围盒alpha})`)
    });
    panel.add(settings, "包围盒G通道", 0, 255).onChange((v) => {
        settings.包围盒G通道 = v
        building.setOutBoxColor(`rgba(${settings.包围盒R通道},${settings.包围盒G通道},${settings.包围盒B通道},${settings.包围盒alpha})`)
    });
    panel.add(settings, "包围盒B通道", 0, 255).onChange((v) => {
        settings.包围盒B通道 = v
        building.setOutBoxColor(`rgba(${settings.包围盒R通道},${settings.包围盒G通道},${settings.包围盒B通道},${settings.包围盒alpha})`)
    });
    panel.add(settings, "包围盒alpha", 0.0, 1.0).onChange((v) => {
        settings.包围盒alpha = v
        building.setOutBoxColor(`rgba(${settings.包围盒R通道},${settings.包围盒G通道},${settings.包围盒B通道},${settings.包围盒alpha})`)
    });
    panel.add(settings, "包围盒高度", 1, 1000).onChange((v) => {
        settings.包围盒高度 = v
        building.setOutBoxHeight(settings.包围盒高度)
    });
    panel.add(settings, '包围盒是否显示').onChange((v) => {
        settings['包围盒是否显示'] = v
        if (v) {
            building.setOutBoxShow(settings['包围盒是否显示'])
        } else {
            building.setOutBoxShow(settings['包围盒是否显示'])
        }
    });
}

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: origin,
    zoom: 13.5,
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
            $.getJSON("./hefei.geojson", (result) => {
                //let height = Number(item.properties.floor) * 3
                let config = {
                    //需要展示的Geojson线中的features。采用时间换效率的方式，利用CPU组装信息到一起扔到GPU渲染，渲染好之后性能极好(50fps,几乎不会消耗内存)。
                    features: result.features.slice(13000,23000),
                    //建筑本体高，单位米
                    height: 10,
                    //建筑本体颜色,透明度
                    color: `rgba(255,168,0,1.0)`,
                    //是否需要生成包围盒
                    needbbox: true,
                    //外围包围盒高，单位米。其base从建筑体高度算起
                    outerheight: 7,
                    //外围盒颜色,透明度
                    outercolor: `rgba(0,168,255,0.18)`,
                    //是否需要蒙皮
                    needskin: true,
                    //建筑皮肤蒙层颜色，建议与建筑同色，透明度设置低一些
                    skincolor: `rgba(255,168,0,0.3)`,
                    //建筑蒙层高度,单位是米其base从建筑体高度算起
                    skinheight: 2,
                    //THREE对象
                    THREE: THREE,
                    //threebox对象
                    threebox: tb,
                }
                building = new HighLightBuilding(config);
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