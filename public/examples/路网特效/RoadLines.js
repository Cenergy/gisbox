/*
 * @Author: your name
 * @Date: 2019-11-21 14:56:41
 * @LastEditTime: 2019-11-28 09:49:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\threebox\examples\路网特效\RoadLines.js
 */
/*
 * @Author: 郭博阳
 * @Date: 2019-10-30 11:09:46
 * @LastEditTime: 2019-11-25 17:10:09
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\flyLine\fly.js
 */
class RoadLines {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE
        this.color = object.hasOwnProperty("color") ? object.color : "rgba(255,138,0,1)";
        this.width = object.hasOwnProperty("width") ? object.width : 1;
        this.length = object.hasOwnProperty("length") ? object.length : 10;
        this.speed = object.hasOwnProperty("speed") ? object.speed : 10;
        this.type = object.hasOwnProperty("type") ? object.type : 'normal';
        this.features = object.features
        this.show = true
        this.tb = object.Threebox
        this.pointsInLine = object.hasOwnProperty("pointsInLine") ? object.pointsInLine : 100;
        this.requestId = null
        this.container = []
        this.flyShader = {
            vertexshader: this._getTypehader()
            ,
            //利用材质填充    
            fragmentshader: ` 
                precision mediump float;
                precision mediump int;
                uniform float u_opacity;
                uniform vec3 color;
                varying float u_opacitys;
                void main() {
                        vec4 u_color = vec4(color,u_opacity * u_opacitys);
                        gl_FragColor = u_color;
                }`
        }
        this.init()
    }
    _getTypehader() {
        let shaderA = ` 
            precision mediump float;
            precision mediump int;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform float size; 
            uniform float time; 
            uniform float u_len; 
            uniform float u_opacity;
            attribute vec3 position;
            attribute float a_index;
            attribute float a_dashindex;
            varying float u_opacitys;
            void main() { 
        `
        let shaderB = `}`
        let dash = `
        if(a_dashindex == a_index){
            if( a_index < time + u_len && a_index > time){
                float u_scale = 1.0 - (time + u_len - a_index) /u_len;
                u_opacitys = u_scale;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = size * u_scale * 300.0 / (-mvPosition.z);
            }
        }
        `
        let normal = `
            if( a_index < time + u_len && a_index > time){
                float u_scale = 1.0 - (time + u_len - a_index) /u_len;
                u_opacitys = u_scale;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = size * u_scale * 300.0 / (-mvPosition.z);
            }
        `
        if (this.type === 'dashed') {
            return shaderA + dash + shaderB
        } else {
            return shaderA + normal + shaderB
        }

    }
    init() {
        let colorArr = this.getColorArr(this.color);
        this.features.forEach((element) => {
            let speed = this.speed * Math.random()
            let coords = element.geometry.coordinates
            let geometry = new this.THREE.BufferGeometry();
            const position = [];
            const a_index = [];
            const a_dashindex = []
            //插值操作
            let morepoints = []
            let nums = coords.length - 1
            for (let i = 0; i <= coords.length - 2; i++) {
                let temppoints = RoadLines.cutLineInXSpaces(this.pointsInLine / nums, coords[i], coords[i + 1])
                morepoints = morepoints.concat(temppoints)
            }
            let rp = this.tb.utils.lnglatsToWorld(morepoints)
            this.positionlength = rp.length
            let counter = 0
            rp.forEach((elem, index) => {
                position.push(elem.x, elem.y, elem.z);
                a_index.push(index);
                counter++
                if (counter <= this.positionlength / 10) {
                    a_dashindex.push(index);
                } else if (counter <= this.positionlength / 5) {
                    a_dashindex.push(0);
                } else {
                    a_dashindex.push(0);
                    counter = 0
                }
            })
            geometry.addAttribute("position", new this.THREE.Float32BufferAttribute(position, 3));
            geometry.addAttribute("a_index", new this.THREE.Float32BufferAttribute(a_index, 1));
            geometry.addAttribute("a_dashindex", new this.THREE.Float32BufferAttribute(a_dashindex, 1));
            let material = new this.THREE.RawShaderMaterial({
                uniforms: {
                    color: { value: colorArr[0], type: "v3" },
                    size: { value: this.width, type: "f" },
                    u_len: { value: this.length, type: "f" },
                    u_opacity: { value: colorArr[1], type: "f" },
                    time: { value: -this.length, type: "f" },
                    index: { value: 0.0, type: "f" },
                },
                transparent: true,
                depthTest: false,
                vertexShader: this.flyShader.vertexshader,
                fragmentShader: this.flyShader.fragmentshader,
            });
            let mesh = new this.THREE.Points(geometry, material);
            mesh._speed = speed
            let line = this.tb.Object3D({ obj: mesh })
            this.container.push(line)
            this.tb.add(line)
        })
        this.animation()
    }
    animation() {
        this.container.forEach((item) => {
            let uniforms = item.material.uniforms;
            //完结一次
            if (uniforms.time.value < this.positionlength) {
                uniforms.time.value += this.baicSpeed * item._speed;
            } else {
                uniforms.time.value = -uniforms.u_len.value;
            }
        })
        this.requestId = requestAnimationFrame(() => {
            this.animation()
        })
    }
    remove(){
        this.container.forEach((item)=>{
            this.tb.remove(item)
        })
    }
    setType(type) {
        this.type = type
        this.flyShader.vertexshader = this._getTypehader()
        let colorArr = this.getColorArr(this.color);
        this.container.forEach((item) => {
            item.material = new this.THREE.ShaderMaterial({
                uniforms: {
                    color: { value: colorArr[0], type: "v3" },
                    size: { value: this.width, type: "f" },
                    u_len: { value: this.length, type: "f" },
                    u_opacity: { value: colorArr[1], type: "f" },
                    time: { value: -this.length, type: "f" },
                    index: { value: 0.0, type: "f" },
                },
                transparent: true,
                depthTest: false,
                vertexShader: this.flyShader.vertexshader,
                fragmentShader: this.flyShader.fragmentshader,
            });
        })
    }
    setShow() {
        if (!this.show) {
            this.container.forEach((item) => {
                item.material.visible = true
            })
            this.show = true
        }
    }
    setHide() {
        if (this.show) {
            this.container.forEach((item) => {
                item.material.visible = false
            })
            this.show = false
        }
    }
    //设置插值密度
    setPointsInLine(nums) {
        this.pointsInLine = nums
        this.features.forEach((element, index) => {
            let coords = element.geometry.coordinates
            let geometry = new this.THREE.BufferGeometry();
            const position = [];
            const a_index = [];
            const a_dashindex = []
            //插值操作
            let morepoints = []
            let nums = coords.length - 1
            for (let i = 0; i <= coords.length - 2; i++) {
                let temppoints = RoadLines.cutLineInXSpaces(this.pointsInLine / nums, coords[i], coords[i + 1])
                morepoints = morepoints.concat(temppoints)
            }
            let rp = this.tb.utils.lnglatsToWorld(morepoints)
            this.positionlength = rp.length
            let counter = 0
            rp.forEach((elem, index) => {
                position.push(elem.x, elem.y, elem.z);
                a_index.push(index);
                counter++
                if (counter <= this.positionlength / 10) {
                    a_dashindex.push(index);
                } else if (counter <= this.positionlength / 5) {
                    a_dashindex.push(0);
                } else {
                    a_dashindex.push(0);
                    counter = 0
                }
            })
            geometry.addAttribute("position", new this.THREE.Float32BufferAttribute(position, 3));
            geometry.addAttribute("a_index", new this.THREE.Float32BufferAttribute(a_index, 1));
            geometry.addAttribute("a_dashindex", new this.THREE.Float32BufferAttribute(a_dashindex, 1));
            this.container[index].geometry.dispose()
            this.container[index].geometry = geometry
        })
    }
    //设置线宽接口
    setWidth(width = 30) {
        this.width = width
        this.container.forEach((item) => {
            item.material.uniforms.size.value = this.width
        })
    }
    //设置线颜色
    setColor(color = `rgba(0,170,255,1)`) {
        this.color = color
        let colorArr = this.getColorArr(this.color);
        this.container.forEach((item) => {
            item.material.uniforms.color.value = colorArr[0]
            item.material.uniforms.u_opacity.value = colorArr[1]
        })
    }
    //设置线长
    setLength(length = 860) {
        this.length = length
        this.container.forEach((item) => {
            item.material.uniforms.u_len.value = this.length
        })
    }
    //设置线速度
    setSpeed(speed = 10.0) {
        this.speed = speed
        this.container.forEach((item) => {
            item._speed = this.speed * Math.random()
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
                RoadLines.pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                RoadLines.pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                RoadLines.pad2(Math.round(arr[2] * 1 || 0).toString(16))
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
        return Math.pow(RoadLines.wholeDistance(t), .99)
    }
    //将一个线段x等分，返回等分后的每个节点
    static cutLineInXSpaces(x, firstpoint, lastpoint) {
        if (firstpoint[0] === lastpoint[0] && firstpoint[1] === lastpoint[1]) {
            return undefined
        }
        let baseLength = RoadLines.getBaseLength([firstpoint, lastpoint])
        let length = baseLength / Number(x)
        let result = []
        result.push(firstpoint)
        for (let i = 1; i <= x; i++) {
            let point = RoadLines.getThirdPoint(lastpoint, firstpoint, 0, length * i, true)
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
        let g = RoadLines.getAzimuth(t, o),
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
        let r = Math.asin(Math.abs(o[1] - t[1]) / RoadLines.distance(t, o));
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
        for (let e = 0; e < t.length - 1; e++) o += RoadLines.distance(t[e], t[e + 1]);
        return o
    }
}

export { RoadLines }