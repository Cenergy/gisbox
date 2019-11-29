/*
 * @Author: 郭博阳
 * @Date: 2019-10-30 11:09:46
 * @LastEditTime: 2019-11-28 09:47:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\flyLine\fly.js
 */
class FlyPoints {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE;
        this.texture = object.hasOwnProperty("texture") ? new this.THREE.TextureLoader().load(object.texture) : 0.0;
        this.color = object.hasOwnProperty("color") ? object.color : "rgba(255,138,0,1)";
        this.size = object.hasOwnProperty("size") ? object.size : 1;
        this.height = object.hasOwnProperty("height") ? object.height : 10;
        this.layers = object.hasOwnProperty("layers") ? object.layers : 20;
        this.speed = object.hasOwnProperty("speed") ? object.speed : 10;
        this.repeat = object.hasOwnProperty("repeat") ? object.repeat : Infinity;
        this.alpha = object.hasOwnProperty("alpha") ? object.alpha : 2;
        this.show = true
        this.wavedelay = object.hasOwnProperty("wavedelay") ? object.wavedelay : 500;
        this.numbers = object.hasOwnProperty("numbers") ? object.numbers / this.layers : 100;
        this.tb = object.Threebox
        this.points = []
        this.scene = object.scene
        this.position = object.position
        this.requestId = null
        this.flyShader = {
            vertexshader: ` 
                precision mediump float;
                precision mediump int;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform float size; 
                uniform float time; 
                uniform float alpha; 
                uniform float height; 
                varying float u_opacitys;
                attribute vec3 position;
                void main() {
                        if(time<height/2.0){
                            u_opacitys = time / height;
                        }else {
                            u_opacitys = 1.0 - time / height;
                        } 
                        vec3 p = vec3(position.x,position.y,position.z + time);
                        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                        gl_PointSize = size;
                }
                `,
            fragmentshader: ` 
                precision mediump float;
			    precision mediump int;
                uniform sampler2D texture;
                uniform float u_opacity;
                uniform vec3 color;
                uniform float isTexture;
                uniform float alpha; 
                varying float u_opacitys;
                void main() {
                    vec4 u_color = vec4(color,0.5+min(1.0,u_opacity*u_opacitys*alpha));
                    if( isTexture != 0.0 ){
                        gl_FragColor = u_color * texture2D(texture, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
                    }else{
                        gl_FragColor = u_color;
                    }
                }`
        }
        this.init()
    }
    setShow() {
        if (this.show === false) {
            this.points.forEach((item) => {
                item.material.visible = true
            })
            this.show = true
        }
    }
    setNums(nums) {
        this.numbers = nums/ this.layers
        for (let i = 1; i <= this.layers; i++) {
            let geometry = new this.THREE.BufferGeometry();
            //随机在区域中生成离子
            let randomPoints = this.makePointsInRectangle()
            const position = [];
            randomPoints.forEach(function (elem) {
                position.push(elem.x, elem.y, elem.z);
            })
            geometry.addAttribute("position", new this.THREE.Float32BufferAttribute(position, 3));

            this.points[i] ? this.points[i].geometry = geometry : ''
        }
    }
    setSpeed(speed) {
        this.speed = speed
    }
    setSize(size) {
        this.size = size
        this.points.forEach((item) => {
            item.material.uniforms.size.value = this.size
        })
    }
    setColor(color = `rgba(255,138,0,1)`) {
        this.color = color
        let colorArr = this.getColorArr(this.color);
        this.points.forEach((item) => {
            item.material.uniforms.color.value = colorArr[0]
            item.material.uniforms.u_opacity.value = colorArr[1]
        })
    }
    setWaveDelay(delay) {
        this.wavedelay = delay
    }
    setDeepAlpha(alpha) {
        this.alpha = alpha
        this.points.forEach((item) => {
            item.material.uniforms.alpha.value = this.alpha
        })
    }
    setHide() {
        if (this.show === true) {
            this.points.forEach((item) => {
                item.material.visible = false
            })
            this.show = false
        }
    }
    init() {
        let colorArr = this.getColorArr(this.color);
        for (let i = 1; i <= this.layers; i++) {
            let geometry = new this.THREE.BufferGeometry();
            let material = new this.THREE.RawShaderMaterial({
                uniforms: {
                    color: { value: colorArr[0], type: "v3" },
                    size: { value: this.size, type: "f" },
                    texture: { value: this.texture, type: "t2" },
                    u_opacity: { value: colorArr[1], type: "f" },
                    time: { value: 0, type: "f" },
                    isTexture: { value: this.texture, type: "f" },
                    height: { value: this.height, type: "f" },
                    alpha: { value: this.alpha, type: "f" },
                },
                transparent: true,
                depthTest: false,
                vertexShader: this.flyShader.vertexshader,
                fragmentShader: this.flyShader.fragmentshader
            });
            //随机在区域中生成离子
            let randomPoints = this.makePointsInRectangle()
            const position = [];
            randomPoints.forEach(function (elem) {
                position.push(elem.x, elem.y, elem.z);
            })
            geometry.addAttribute("position", new this.THREE.Float32BufferAttribute(position, 3));
            let mesh = new this.THREE.Points(geometry, material);
            mesh._firstShow = true
            this.points.push(mesh)
            this.tb.add(this.tb.Object3D({ obj: mesh }))
        }
        this.animation()
    }
    animation() {
        this.points.forEach(async (item, index) => {
            if (item._firstShow) {
                item.material.visible = false
                item._firstShow = false
            }
            await setTimeout(() => {
                let uniforms = item.material.uniforms;
                //完结一次
                if (uniforms.time.value < this.height) {
                    uniforms.time.value += this.baicSpeed * this.speed;
                } else {
                    uniforms.time.value = 0;
                }
                if (!item.material.visible && this.show) {
                    item.material.visible = true
                }
            }, index * this.wavedelay)
        })
        this.requestId = requestAnimationFrame(() => {
            this.animation()
        })
    }
    //在包围型内随机产生离子
    makePointsInRectangle() {
        let minx, maxx, miny, maxy;
        let p2 = []
        this.position.forEach((item) => {
            let arr = []
            arr.push(item[0], item[1], 0)
            p2.push(arr)
        })
        let rp = this.tb.utils.lnglatsToWorld(p2)
        rp.forEach((item) => {
            if (!maxx || maxx < item.x) {
                maxx = item.x;
            }
            if (!minx || minx > item.x) {
                minx = item.x;
            }
            if (!maxy || maxy < item.y) {
                maxy = item.y;
            }
            if (!miny || miny > item.y) {
                miny = item.y;
            }
        })
        let n = 0
        let randomPoints = []
        while (n <= this.numbers) {
            let x = FlyPoints.randomNum(minx, maxx)
            let y = FlyPoints.randomNum(miny, maxy)
            n++
            let z = FlyPoints.randomNum(0, this.height)
            randomPoints.push({
                x,
                y,
                z,
            })
        }
        return randomPoints
    }
    //生成随机数
    static randomNum(minNum, maxNum) {
        switch (arguments.length) {
            case 1:
                return parseInt(Math.random() * minNum + 1, 10);
            case 2:
                return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            default:
                return 0;
        }
    }
    remove() {
        this.points.forEach((item) => {
            this.tb.remove(item);
        })
        cancelAnimationFrame(this.requestId)
    }
    //rgb2uniform
    getColorArr(str) {
        if (Array.isArray(str)) return str;
        let arr = [];
        str = str + '';
        str = str.toLowerCase().replace(/\s/g, "");
        if (/^((?:rgba)?)\(\s*([^\)]*)/.test(str)) {
            arr = str.replace(/rgba\(|\)/gi, '').split(',');
            let hex = [
                FlyPoints.pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                FlyPoints.pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                FlyPoints.pad2(Math.round(arr[2] * 1 || 0).toString(16))
            ];
            arr[0] = this._color('#' + hex.join(""));
            arr[1] = Math.max(0, Math.min(1, (arr[3] * 1 || 0)));
        } else if ('transparent' === str) {
            arr[0] = this._color();
            arr[1] = 0;
        } else {
            arr[0] = this._color(str);
            arr[1] = 1;
        }

        return arr;
    }
    _color(c) {
        return new this.THREE.Color(c);
    }
    static pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }
}

export { FlyPoints }