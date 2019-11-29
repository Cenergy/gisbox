/*
 * @Author: your name
 * @Date: 2019-11-20 11:46:17
 * @LastEditTime: 2019-11-26 14:32:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\threebox\examples\SphereShaderFunction.js
 */
import { SphereShader } from './SphereShader.js'
import { GUI } from '../dat.gui.module.js';
import Stats from '../stats.module.js';
if (!config) console.error("Config not set! Make a copy of 'config_template.js', add in your access token, and save the file as 'config.js'.");

mapboxgl.accessToken = config.accessToken;
let origin = [117.54838310791251, 32.12685785706586, 0];
let sphere = []
let stats
function initGUI() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    let panel = new GUI({ width: 310 });
    let settings = {
        '球体R通道': 255,
        '球体G通道': 138,
        '球体B通道': 0,
        '球体alpha': 1.0,
        '波浪R通道': 255,
        '波浪G通道': 138,
        '波浪B通道': 0,
        '波浪alpha': 1.0,
        '波浪运动速度': 0.3,
        '是否循环波动': true,
        '球半径(m)': 200,
        '波浪宽度和间隔': 1.2,
        '波浪数量': 5,
        '抗锯齿等级': 2,
        '是否显示': true,
        '是否删除': false
    }
    panel.add(settings, "球体R通道", 0, 255).onChange((v) => {
        settings.球体R通道 = v
        sphere.forEach((item) => {
            item.setColor(`rgba(${settings.球体R通道},${settings.球体G通道},${settings.球体B通道},${settings.球体alpha})`)
        })
    });
    panel.add(settings, "球体G通道", 0, 255).onChange((v) => {
        settings.球体G通道 = v
        sphere.forEach((item) => {
            item.setColor(`rgba(${settings.球体R通道},${settings.球体G通道},${settings.球体B通道},${settings.球体alpha})`)
        })
    });
    panel.add(settings, "球体B通道", 0, 255).onChange((v) => {
        settings.球体B通道 = v
        sphere.forEach((item) => {
            item.setColor(`rgba(${settings.球体R通道},${settings.球体G通道},${settings.球体B通道},${settings.球体alpha})`)
        })
    });
    panel.add(settings, "球体alpha", 0.2, 0.8).onChange((v) => {
        settings.球体alpha = v
        sphere.forEach((item) => {
            item.setColor(`rgba(${settings.球体R通道},${settings.球体G通道},${settings.球体B通道},${settings.球体alpha})`)
        })
    });
    panel.add(settings, "波浪R通道", 0, 255).onChange((v) => {
        settings.波浪R通道 = v
        sphere.forEach((item) => {
            item.setWaveColor(`rgba(${settings.波浪R通道},${settings.波浪G通道},${settings.波浪B通道},${settings.波浪alpha})`)
        })
    });
    panel.add(settings, "波浪G通道", 0, 255).onChange((v) => {
        settings.波浪G通道 = v
        sphere.forEach((item) => {
            item.setWaveColor(`rgba(${settings.波浪R通道},${settings.波浪G通道},${settings.波浪B通道},${settings.波浪alpha})`)
        })
    });
    panel.add(settings, "波浪B通道", 0, 255).onChange((v) => {
        settings.波浪B通道 = v
        sphere.forEach((item) => {
            item.setWaveColor(`rgba(${settings.波浪R通道},${settings.波浪G通道},${settings.波浪B通道},${settings.波浪alpha})`)
        })
    });
    panel.add(settings, "波浪alpha", 0.2, 1.0).onChange((v) => {
        settings.波浪alpha = v
        sphere.forEach((item) => {
            item.setWaveColor(`rgba(${settings.波浪R通道},${settings.波浪G通道},${settings.波浪B通道},${settings.波浪alpha})`)
        })
    });
    panel.add(settings, "波浪运动速度", 0.00, 20.0).onChange((v) => {
        settings.波浪运动速度 = v
        sphere.forEach((item) => {
            item.setSpeed(settings.波浪运动速度)
        })
    });
    panel.add(settings, "球半径(m)", 10, 350).step(2).onChange((v) => {
        settings['球半径(m)'] = v
        sphere.forEach((item) => {
            item.setRadius(settings['球半径(m)'])
        })
    });
    panel.add(settings, "波浪宽度和间隔", 0.2, 5).onChange((v) => {
        settings['波浪宽度和间隔'] = v
        sphere.forEach((item) => {
            item.setWaveGap(settings['波浪宽度和间隔'])
        })
    });
    panel.add(settings, '是否显示').onChange((v) => {
        settings['是否显示'] = v
        if (v) {
            sphere.forEach((item) => {
                item.setShow(settings['是否显示'])
            })
        } else {
            sphere.forEach((item) => {
                item.setHide(settings['是否显示'])
            })
        }
    });
    panel.add(settings, "抗锯齿等级", 1, 4).step(1).onChange((v) => {
        settings['抗锯齿等级'] = v
        sphere.forEach((item) => {
            item.setFaxx(settings['抗锯齿等级'])
        })
    });
    let a
    panel.add(settings, '是否循环波动').onChange((v) => {
        settings['是否循环波动'] = v
        sphere.forEach((item) => {
            item.setNeedinfinite(settings['是否循环波动'])
        })
        if (v) {
            panel.remove(a)
        } else {
            a = panel.add(settings, "波浪数量", 1, 125).step(1).onChange((v) => {
                settings['波浪数量'] = v
                sphere.forEach((item) => {
                    item.setWaveNums(settings['波浪数量'])
                })
            });
        }
    });


}

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: origin,
    zoom: 14.7,
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
            for (let i = -2; i <= 2; i++) {
                for (let j = -2; j <= 2; j++) {
                    sphere.push(new SphereShader({
                        position: [origin[0] + i * 0.01, origin[1] + j * 0.01],
                        Threebox: tb,
                        THREE: THREE,
                        //球体颜色以及透明度
                        color: `rgba(255,138,0,1.0)`,
                        //球体半径,单位是米
                        radius: 200,
                        //波浪颜色以及透明度
                        wavecolor: `rgba(255,138,0,1.0)`,
                        //波浪运动速度
                        speed: 0.3,
                        //波浪宽度以及间隔
                        wavegap: 1.2,
                        //波浪数量，不能超过125
                        wavenums: 5,
                        //是否需要无线滚动,一旦设置无线滚动,wavenums会被默认设为125
                        needinfinite: true,
                        //波纹抗锯齿,默认为5。越高则消耗的GPU资源越多,锯齿感越小。反之亦然。
                        faxx: 2
                    }))
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