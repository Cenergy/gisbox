/*
 * @Author: 郭博阳
 * @Date: 2019-10-30 11:09:46
 * @LastEditTime: 2019-11-28 09:11:44
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\flyLine\fly.js
 */
import { GeoUtiles } from "../GeoUtiles.js"

class FlyLine {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE
        this.texture = object.hasOwnProperty("texture") ? new this.THREE.TextureLoader().load(object.texture) : 0.0;
        this.color = object.hasOwnProperty("color") ? object.color : "rgba(255,138,0,1)";
        this.width = object.hasOwnProperty("width") ? object.width : 1;
        this.length = object.hasOwnProperty("length") ? object.length : 10;
        this.speed = object.hasOwnProperty("speed") ? object.speed : 10;
        this.pointnum = object.hasOwnProperty("pointnum") ? object.pointnum : 1000;
        this.tb = object.Threebox
        this.position = object.position
        this.requestId = null
        this.flyShader = {
            vertexshader: ` 
                precision mediump float;
			    precision mediump int;
                uniform float size; 
                uniform float time; 
                uniform float u_len; 
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                attribute float u_index;
                attribute vec3 position;
                varying float u_opacitys;
                void main() { 
                    if( u_index < time + u_len && u_index > time){
                        float u_scale = 1.0 - (time + u_len - u_index) /u_len;
                        u_opacitys = u_scale;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                        gl_PointSize = size * u_scale * 100.0 / (-mvPosition.z);
                    }
                }
                `,
            //利用材质填充    
            fragmentshader: ` 
                precision mediump float;
			    precision mediump int;
                uniform sampler2D texture;
                uniform float u_opacity;
                uniform vec3 color;
                uniform float isTexture;
                varying float u_opacitys;
                void main() {
                    vec4 u_color = vec4(color,u_opacity * u_opacitys);
                    if( isTexture != 0.0 ){
                        gl_FragColor = u_color * texture2D(texture, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
                    }else{
                        gl_FragColor = u_color;
                    }
                }`
        }
        this.init()
    }
    init() {
        let colorArr = this.getColorArr(this.color);
        this.material = new this.THREE.RawShaderMaterial({
            uniforms: {
                color: { value: colorArr[0], type: "v3" },
                size: { value: this.width, type: "f" },
                texture: { value: this.texture, type: "t2" },
                u_len: { value: this.length, type: "f" },
                u_opacity: { value: colorArr[1], type: "f" },
                time: { value: -this.length, type: "f" },
                isTexture: { value: this.texture, type: "f" }
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.flyShader.vertexshader,
            fragmentShader: this.flyShader.fragmentshader,
            needsUpdate: true
        });
        let p1 = this.tb.utils.lnglatsToWorld(this.position)
        let p2 = GeoUtiles.flylines(this.THREE, p1, this.pointnum)
        let geometry = new this.THREE.BufferGeometry();
        const position = [];
        const u_index = [];
        p2.forEach(function (elem, index) {
            position.push(elem.x, elem.y, elem.z);
            u_index.push(index);
        })
        geometry.addAttribute("position", new this.THREE.Float32BufferAttribute(position, 3));
        geometry.addAttribute("u_index", new this.THREE.Float32BufferAttribute(u_index, 1));
        let mesh = new this.THREE.Points(geometry, this.material);
        this.flylines = mesh
        let l = this.tb.Object3D({ obj: this.flylines })
        this.tb.add(l)
        this.animation()
    }
    remove() {
        this.tb.remove(this.flylines)
        cancelAnimationFrame(this.requestId)
    }
    animation() {
        let uniforms = this.flylines.material.uniforms;
        //完结一次
        if (uniforms.time.value < this.pointnum+1) {
            uniforms.time.value += this.baicSpeed * this.speed;
        } else {
            uniforms.time.value = -uniforms.u_len.value;
        }
        this.requestId = requestAnimationFrame(() => {
            this.animation()
        })
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
                FlyLine.pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                FlyLine.pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                FlyLine.pad2(Math.round(arr[2] * 1 || 0).toString(16))
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
    setPointNum(num) {
        this.pointnum = num
        this._updateGeometry()
    }
    setColor(color) {
        this.color = color
        let colorArr = this.getColorArr(this.color);
        this.flylines.material.uniforms.color.value = colorArr[0];
        this.flylines.material.uniforms.u_opacity.value = colorArr[1];
    }
    setShow(boolean) {
        this.flylines.material.visible = boolean
    }
    setWidth(width) {
        this.width = width
        this.flylines.material.uniforms.size.value = this.width;
    }
    setLength(length) {
        this.length = length
        this.flylines.material.uniforms.u_len.value = this.length;
    }
    setSpeed(speed) {
        this.speed = speed
    }
    _updateGeometry() {
        let p1 = this.tb.utils.lnglatsToWorld(this.position)
        let p2 = GeoUtiles.flylines(this.THREE, p1, this.pointnum)
        let geometry = new this.THREE.BufferGeometry();
        const position = [];
        const u_index = [];
        p2.forEach(function (elem, index) {
            position.push(elem.x, elem.y, elem.z);
            u_index.push(index);
        })
        geometry.addAttribute("position", new this.THREE.Float32BufferAttribute(position, 3));
        geometry.addAttribute("u_index", new this.THREE.Float32BufferAttribute(u_index, 1));
        this.flylines.geometry = geometry
    }
    static pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }
}

export { FlyLine }


