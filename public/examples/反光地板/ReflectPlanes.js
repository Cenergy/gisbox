/*
 * @Author: 郭博阳
 * @Date: 2019-10-30 11:09:46
 * @LastEditTime: 2019-11-28 10:05:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\flyLine\fly.js
 */
class ReflectPlanes {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE
        this.scene = object.scene
        this.tb = object.threebox
        this.position = object.position
        this.holes = object.holes
        this.size = object.size ? object.size : 1
        this.space = object.space ? object.space : 1
        this.color = object.color
        this.show = true
        this.type = object.type ? object.type : "tringle"
        this.Shader = {
            fragmentshader: ` 
                precision mediump float;
                precision mediump int;
                uniform vec3 color;
                uniform float alpha;
                varying float opacity;
                void main() {
                    float red = color.x;
                    float green = color.y;
                    float blue = color.z;
                    vec3 cr = vec3(red*opacity,green*opacity,blue*opacity);
                    vec4 u_color = vec4(cr,min(1.0,opacity-(1.0-alpha)));
                    gl_FragColor = u_color;
                }`
        }
        this.init()
    }
    _handlePosition(position) {
        let p = position
        let boxposition = this.tb.utils.lnglatsToWorld(p)
        return boxposition
    }
    _getVS(holenums) {
        const vs = ` 
                precision mediump float;
                precision mediump int;
                uniform vec3 drakcenter[${holenums}];
                uniform vec2 center;
                uniform float alpha;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                attribute vec3 position;
                varying float opacity;
                void main() {
                    opacity = 10000.0;
                    for(int i=0;i<${holenums};i++){
                        vec2 dc = vec2(drakcenter[i].x,drakcenter[i].y);
                        float dis = distance(dc,vec2(center.x+position.x,center.y+position.y));
                        float min = min(1.0,dis/float(drakcenter[i].z)+0.2);  
                        if(min<opacity){
                            opacity = min;
                        }
                    }
                    float x = position.x;
                    float y = position.y;
                    float z = position.z;
                    vec3 p = vec3(x,y,z);
                    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
                `
        const vs2 = ` 
                precision highp float;
                uniform vec2 center;
                uniform float alpha;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                attribute vec3 position;
                varying float opacity;
                void main() {
                    opacity = 1.0;
                    float x = position.x;
                    float y = position.y;
                    float z = position.z;
                    vec3 p = vec3(x,y,z);
                    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
                `
        return holenums > 0 ? vs : vs2
    }
    init() {
        let info = this._getBboxAndCenter()
        let colorArr = this.getColorArr(this.color);
        this.center = info.center
        let center = this._handlePosition([this.center])[0]
        let drakcenter = []
        if (this.holes && this.holes.length > 0) {
            this.holes.forEach((item) => {
                let hole = this.tb.utils.lnglatsToWorld([[item.position[0], item.position[1]]])[0]
                let v3 = new this.THREE.Vector3(hole.x, hole.y, item.radius)
                drakcenter.push(v3)
            })
            this.Shader.vertexshader = this._getVS(this.holes.length)
        } else {
            this.Shader.vertexshader = this._getVS(0)
        }
        let material = new this.THREE.RawShaderMaterial({
            uniforms: {
                color: { value: colorArr[0], type: "v3" },
                drakcenter: {
                    value: drakcenter, type: "v3"
                },
                center: { value: new this.THREE.Vector2(center.x, center.y), type: "v2" },
                alpha: { value: colorArr[1], type: "f" },
            },
            transparent: true,
            depthTest: true,
            vertexShader: this.Shader.vertexshader,
            fragmentShader: this.Shader.fragmentshader,
        });
        let plane1 = this.makePointsInRectangle()
        let buffergeometry = new this.THREE.BufferGeometry();
        let buffer = buffergeometry.fromGeometry(plane1)
        this.mesh = new this.THREE.Mesh(buffer, material);
        this.plane = this.tb.Object3D({ obj: this.mesh }).setCoords(this.center)
        this.tb.add(this.plane)
    }
    //修改符号大小,低性能
    setSize(size) {
        this.size = size
        this._updateGeometry()
    }
    //修改符号样式,低性能
    setType(type) {
        this.type = type
        this._updateGeometry()
    }
    //修改符号间隔,低性能
    setSpace(space) {
        this.space = space
        this._updateGeometry()
    }
    _updateGeometry() {
        let plane = this.makePointsInRectangle()
        let buffergeometry = new this.THREE.BufferGeometry();
        let buffer = buffergeometry.fromGeometry(plane)
        this.plane.geometry = buffer
    }
    setShow() {
        if (this.show === false) {
            this.init()
            this.show = true
        }
    }
    setHide() {
        if (this.show === true) {
            this.remove()
            this.show = false
        }
    }
    //修改平面颜色
    setColor(color = `rgba(255,138,0,1)`) {
        this.color = color
        let colorArr = this.getColorArr(this.color);
        this.plane.material.uniforms.color.value = colorArr[0]
        this.plane.material.uniforms.alpha.value = colorArr[1]
    }
    //制造geometry
    _addplane() {
        let unit = Math.min(this.lonlength * 0.027484, this.latlength * 0.027484) / (550 * 1 / this.size)
        let geometry
        if (this.type === 'tringle') {
            geometry = new this.THREE.CircleGeometry(unit, 3);
        } else if (this.type === 'plane') {
            geometry = new this.THREE.PlaneGeometry(unit, unit, unit);
        } else if (this.type === 'circle') {
            geometry = new this.THREE.CircleGeometry(unit, 8);
        } else {
            console.error(`不支持的类型:${this.type}`)
        }

        return geometry
    }
    //获取最大包围型和中心点
    _getBboxAndCenter() {
        let minx, maxx, miny, maxy;
        this.position[0].forEach((item) => {
            if (!maxx || maxx < item[0]) {
                maxx = item[0];
            }
            if (!minx || minx > item[0]) {
                minx = item[0];
            }
            if (!maxy || maxy < item[1]) {
                maxy = item[1];
            }
            if (!miny || miny > item[1]) {
                miny = item[1];
            }
        })
        let center = [(minx + maxx) / 2, (miny + maxy) / 2]
        this.lonlength = (maxx - minx) * 111 * 1100
        this.latlength = (maxy - miny) * 111 * 1100
        return {
            center,
            box: [minx, miny, maxx, maxy]
        }
    }
    makePointsInRectangle() {
        //1米等于0.027484笛卡尔单位
        let plane = this._addplane()
        let center = this._handlePosition([this.center])[0]
        let lonlength = this.lonlength * 0.027484
        let latlength = this.latlength * 0.027484
        let topleft = new this.THREE.Vector2(- 1 / 2 * lonlength, 1 / 2 * latlength)
        let bottomright = new this.THREE.Vector2(1 / 2 * lonlength, - 1 / 2 * latlength)
        for (let i = topleft.x; i <= bottomright.x; i += Math.min(lonlength, latlength) / (220 * 1 / this.space)) {
            for (let j = bottomright.y; j <= topleft.y; j += Math.min(lonlength, latlength) / (220 * 1 / this.space)) {
                let position = this.tb.utils.lnglatsToWorld(this.position[0])
                let p = []
                position.forEach((item) => {
                    p.push([item.x, item.y])
                })
                let ifgo = ReflectPlanes.insidePolygon(p, [center.x + i, center.y + j])
                if (ifgo) {
                    let plane1 = this._addplane()
                    plane1.translate(i, j, 0)
                    plane.merge(plane1);
                }
            }
        }
        return plane
    }
    //删除
    remove() {
        this.tb.remove(this.plane)
    }
    //添加黑色孔洞
    addHole(hole) {
        this.holes = (this.holes || []).concat(hole)
        let center = this._handlePosition([this.center])[0]
        this.Shader.vertexshader = this._getVS(this.holes.length)
        let colorArr = this.getColorArr(this.color);
        let drakcenter = []
        this.holes.forEach((item) => {
            let hole = this.tb.utils.lnglatsToWorld([[item.position[0], item.position[1]]])[0]
            let v3 = new this.THREE.Vector3(hole.x, hole.y, item.radius)
            drakcenter.push(v3)
        })
        let material = new this.THREE.RawShaderMaterial({
            uniforms: {
                color: { value: colorArr[0], type: "v3" },
                drakcenter: {
                    value: drakcenter, type: "v3"
                },
                alpha: { value: colorArr[1], type: "f" },
                center: { value: new this.THREE.Vector2(center.x, center.y), type: "v2" },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.Shader.vertexshader,
            fragmentShader: this.Shader.fragmentshader,
        });
        this.mesh.material = material
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
                ReflectPlanes.pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                ReflectPlanes.pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                ReflectPlanes.pad2(Math.round(arr[2] * 1 || 0).toString(16))
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
    //points 多边形[[[117.24764093378093, 31.874517676962256], [117.2467128426016, 31.86959981799808], [117.25175454249495, 31.868368500668353]]]
    //testPoint 测试点[117.2467128426016, 31.86959981799808]
    static insidePolygon(points, testPoint) {
        let x = testPoint[0], y = testPoint[1];
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            let xi = points[i][0], yi = points[i][1];
            let xj = points[j][0], yj = points[j][1];

            let intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }
}

export { ReflectPlanes }