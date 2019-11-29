/*
 * @Author: 郭博阳
 * @Date: 2019-10-30 11:09:46
 * @LastEditTime: 2019-11-25 14:25:44
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\flyLine\fly.js
 */
class FlyLine {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE
        this.texture = object.hasOwnProperty("texture") ? new this.THREE.TextureLoader().load(object.texture) : 0.0;
        this.color = object.hasOwnProperty("color") ? object.color : "rgba(255,138,0,1)";
        this.width = object.hasOwnProperty("width") ? object.width : 1;
        this.length = object.hasOwnProperty("length") ? object.length : 10;
        this.speed = object.hasOwnProperty("speed") ? object.speed : 10;
        this.repeat = object.hasOwnProperty("repeat") ? object.repeat : Infinity;
        this.times = 0
        this.position = object.position
        this.requestId = null
        this.flyShader = {
            vertexshader: ` 
                uniform float size; 
                uniform float time; 
                uniform float u_len; 
                attribute float u_index;
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
        this.material = new this.THREE.ShaderMaterial({
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
        let g = new this.THREE.Geometry();

        let geometry = new this.THREE.BufferGeometry();
        const position = [];
        const u_index = [];
        this.position.forEach(function (elem, index) {
            position.push(elem.x, elem.y, elem.z);
            u_index.push(index);
        })
        geometry.addAttribute("position", new this.THREE.Float32BufferAttribute(position, 3));
        geometry.addAttribute("u_index", new this.THREE.Float32BufferAttribute(u_index, 1));
        let mesh = new this.THREE.Points(geometry, this.material);
        this.line = mesh
        // this.scene.add(this.line);
        // this.animation()
    }
    remove() {
        this.line.material.dispose();
        this.line.geometry.dispose();
        this.line.parent.remove(this.line);
        this.line = null;
        this.times = 0
        cancelAnimationFrame(this.requestId)
    }
    //uniforms.time.value代表点位在线上运行的轨迹
    animation() {
        if (this.times >= this.repeat) {
            this.remove(this.line)
            return
        } else {
            let uniforms = this.line.material.uniforms;
            //完结一次
            if (uniforms.time.value < this.position.length) {
                uniforms.time.value += this.baicSpeed * this.speed;
            } else {
                this.times += 1;
                uniforms.time.value = -uniforms.u_len.value;
            }
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
    static pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }
    static getBaseLength(t) {
        return Math.pow(FlyLine.wholeDistance(t), .99)
    }
    //将一个线段x等分，返回等分后的每个节点
    static cutLineInXSpaces(x, firstpoint, lastpoint) {
        if (firstpoint[0] === lastpoint[0] && firstpoint[1] === lastpoint[1]) {
            return undefined
        }
        let baseLength = FlyLine.getBaseLength([firstpoint, lastpoint])
        let lenght = baseLength / Number(x)
        let result = []
        result.push(firstpoint)
        for (let i = 1; i <= x; i++) {
            let point = FlyLine.getThirdPoint(lastpoint, firstpoint, 0, lenght * i, true)
            result.push(point)
        }
        return result
    }
    //输入起始点，结束点，相对方位角的旋转角度，长度，旋转角是否翻转
    static getThirdPoint(t, o, e, r, n) {
        if (t[0] === o[0] && t[1] === o[1]) {
            return o
        }
        //计算方位角
        let g = FlyLine.getAzimuth(t, o),
            //基于方位角进行正向或反向计算
            i = n ? g + e : g - e,
            s = r * Math.cos(i),
            a = r * Math.sin(i);
        return [o[0] + s, o[1] + a]
    }
    //求两点连线和和纬线的夹角,方位角
    //方位角指的是从西经水平方向逆时针转到两点连线的角度
    static getAzimuth(t, o) {
        let e
        //求两点连线和和纬线的夹角
        let r = Math.asin(Math.abs(o[1] - t[1]) / FlyLine.distance(t, o));
        //第二个点经度纬度均大于第一个点
        if (o[1] >= t[1] && o[0] >= t[0]) {
            e = r + Math.PI
            //第二个点纬度高于第一个点，经度小于第一个点
        } else if (o[1] >= t[1] && o[0] < t[0]) {
            e = Math.PI * 2 - r
            //第二个点纬度小于第一个点，经度也小于第一个点    
        } else if (o[1] < t[1] && o[0] < t[0]) {
            e = r
        } else if (o[1] < t[1] && o[0] >= t[0])
        //第二个点纬度小于第一个点，经度大于第一个点
        {
            e = Math.PI - r
        }
        return e
    }
    static distance(t, o) {
        return Math.sqrt(Math.pow(t[0] - o[0], 2) + Math.pow(t[1] - o[1], 2))
    }
    static wholeDistance(t) {
        let o = 0
        for (let e = 0; e < t.length - 1; e++) o += FlyLine.distance(t[e], t[e + 1]);
        return o
    }
}

export { FlyLine }