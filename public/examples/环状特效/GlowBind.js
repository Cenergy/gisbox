/*
 * @Author: 郭博阳
 * @Date: 2019-10-30 11:09:46
 * @LastEditTime: 2019-11-28 09:43:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\flyLine\fly.js
 */
// import { FlyLine } from "./FlyLine.js"
class GlowBind {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE
        this.texture = object.hasOwnProperty("texture") ? new this.THREE.TextureLoader().load(object.texture) : 0.0;
        this.color = object.hasOwnProperty("color") ? object.color : "rgba(255,138,0,1)";
        this.height = object.hasOwnProperty("height") ? object.height : 8;
        this.radius = object.hasOwnProperty("radius") ? object.radius : 20;
        this.center = object.hasOwnProperty("center") ? object.center : [0, 0];
        this.tb = object.Threebox
        this.requestId = null
        this.flyShader = {
            vertexshader: ` 
                precision mediump float;
			    precision mediump int;
                uniform float height; 
                uniform float radius; 
                attribute vec3 position;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                varying float innerAlpha;
                void main() {
                        innerAlpha = 1.5-abs(position.y) / (height/2.0);
                        float x = position.x;
                        float y = position.y;
                        float z = position.z;
                        if(y>0.0){
                            y+=height*0.027484*2.0;
                        }
                        vec3 p = vec3(x*radius,y,z*radius);
                        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                        gl_Position = projectionMatrix * mvPosition;
                }
                `,
            fragmentshader: ` 
                precision mediump float;
			    precision mediump int;
                uniform sampler2D texture;
                uniform float u_opacity;
                uniform vec3 color;
                uniform float isTexture;
                varying float innerAlpha;
                void main() {
                    float red = color.x;
                    float green = color.y;
                    float blue = color.z;
                    float redr = red/255.0;
                    float greenr = green/255.0;
                    float bluer = blue/255.0;
                    vec3 cr = vec3(redr+red*innerAlpha,greenr+green*innerAlpha,bluer+blue*innerAlpha);
                    vec4 u_color = vec4(cr,min(1.0,u_opacity*innerAlpha*2.5));
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
        let points = [];
        for (var i = 0; i < 60; i++) {
            points.push(new THREE.Vector2(1, i));
        }
        this.alpha = colorArr[1]
        let geometry = new THREE.LatheBufferGeometry(points, 1024);
        let material = new this.THREE.RawShaderMaterial({
            uniforms: {
                color: { value: colorArr[0], type: "v3" },
                texture: { value: this.texture, type: "t2" },
                u_opacity: { value: this.alpha, type: "f" },
                height: { value: this.height, type: "f" },
                radius: { value: this.radius * 0.0311, type: "f" },
                isTexture: { value: this.texture, type: "t2" },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.flyShader.vertexshader,
            fragmentShader: this.flyShader.fragmentshader,
            side: THREE.DoubleSide
        });
        let mesh = new THREE.Mesh(geometry, material);
        this.plane = mesh
        this.plane.rotateX(Math.PI / 2)
        let plane = this.tb.Object3D({ obj: this.plane }).setCoords(this.center)
        this.tb.add(plane)
    }
    setHeight(height) {
        this.height = height
        this.plane.material.uniforms.height.value = this.height;
    }
    setShow(boolean) {
        this.plane.material.visible = boolean
    }
    setColor(color) {
        this.color = color
        let colorArr = this.getColorArr(this.color);
        this.plane.material.uniforms.color.value = colorArr[0];
        this.plane.material.uniforms.u_opacity.value = colorArr[1];
    }
    setRadius(radius) {
        this.radius = radius
        this.plane.material.uniforms.radius.value = this.radius * 0.0311;
    }
    setPosition(coor) {
        this.center = coor
        this.plane.setCoords(coor)
    }
    remove() {
        this.tb.remove(this.plane)
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
                GlowBind.pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                GlowBind.pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                GlowBind.pad2(Math.round(arr[2] * 1 || 0).toString(16))
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
    //根据圆心和半径画圆
    static _getCircle(center, radius) {
        let result = []
        for (let i = 0; i < 361 * 4; i++) {
            //角度转弧度
            let hudu = i * Math.PI / 180
            let x1 = center[0] + Math.sin(hudu) * radius;
            let y1 = center[1] - Math.cos(hudu) * radius;
            result.push([x1, y1])
        }
        return result
    }
}

export { GlowBind }