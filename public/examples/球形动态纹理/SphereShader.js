/*
 * @Author: 郭博阳
 * @Date: 2019-10-30 11:09:46
 * @LastEditTime: 2019-11-28 09:52:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\flyLine\fly.js
 */
class SphereShader {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE
        this.position = object.position
        this.color = object.hasOwnProperty("color") ? object.color : "rgba(255,138,0,1)";
        this.speed = object.hasOwnProperty("speed") ? object.speed : 10;
        this.radius = object.hasOwnProperty("radius") ? object.radius : 100 * 0.027484;
        this.wavenums = object.hasOwnProperty("wavenums") ? object.wavenums : 5;
        this.wavegap = object.hasOwnProperty("wavegap") ? object.wavegap : 1;
        this.faxx = object.hasOwnProperty("faxx") ? object.faxx : 5;
        this.wavecolor = object.hasOwnProperty("wavecolor") ? object.wavecolor : "rgba(255,138,0,1)";
        this.needinfinite = object.hasOwnProperty("needinfinite") ? object.needinfinite : false;
        this.needinfinite ? this.wavenums = 125 : "";
        this.animationTime = this.needinfinite ? 0.00001 : 1.0
        this.tb = object.Threebox
        this.lastscale = 1
        this.show = true
        this.shader = {
            //利用材质填充    
            fragmentshader: ` 
                precision mediump float;
			    precision mediump int;
                uniform float u_opacity;
                uniform vec3 color;
                uniform vec3 wavecolor;
                uniform float u_wavecoloropacity;
                varying float alpha;
                varying float alpha2;
                void main() {
                        vec4 wave = vec4(wavecolor,0.1+alpha*alpha2*u_wavecoloropacity);
                        vec4 u_color = vec4(color,0.1+alpha2*alpha*u_opacity);
                        if(alpha2>0.8){
                            gl_FragColor = wave;
                        }else{
                            gl_FragColor = u_color;
                        }
                }`
        }
        this.init()
    }
    init() {
        let colorArr = this.getColorArr(this.color);
        let wavecolor = this.getColorArr(this.wavecolor);
        this.shader.vertexshader =
            ` 
        precision mediump float;
        precision mediump int;    
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float u_opacity;
        uniform float time;
        uniform float radius;
        uniform float u_wavegap;
        varying float alpha;
        varying float alpha2;
        attribute vec3 position;
        void main() { 
            alpha = 1.0 - position.z / radius;
            float start = time-radius/2.0;
            float gap = (radius/10.0)*u_wavegap;
            if(position.z > start-3.0*gap && position.z < start-2.0*gap){
                alpha2 = 1.0;
        }
        `
            + this.addWave(this.wavenums) +
            `else{
                alpha2 = 0.1;
         }
         vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
        }`

        this.material = new this.THREE.RawShaderMaterial({
            uniforms: {
                color: { value: colorArr[0], type: "v3" },
                u_opacity: { value: colorArr[1], type: "f" },
                time: { value: 0.0, type: "f" },
                radius: { value: this.radius * 0.027484, type: "f" },
                wavecolor: { value: wavecolor[0], type: "v3" },
                u_wavecoloropacity: { value: wavecolor[1], type: "f" },
                u_wavegap: { value: this.wavegap, type: "f" },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.shader.vertexshader,
            fragmentShader: this.shader.fragmentshader,
            needsUpdate: true
        });
        let geometry = new this.THREE.SphereBufferGeometry(this.radius * 0.027484, 128 * this.faxx, 128 * this.faxx);
        let mesh = new this.THREE.Mesh(geometry, this.material);
        this.sphere = mesh
        let ps = this.tb.Object3D({ obj: this.sphere }).setCoords(this.position)
        this.tb.add(ps)
        this.animation()
    }
    addWave(nums) {
        let result = ``
        for (let i = -1.0; i <= nums * 2 - 4; i += 2) {
            result += `else if(position.z > start+(${i}.0*gap) && position.z < start+(${i + 1}.0*gap)){
                alpha2 = 1.0;
            }`
        }
        return result
    }
    animation() {
        let uniforms = this.sphere.material.uniforms;
        //完结一次
        if (uniforms.time.value < this.animationTime * 2.0 * this.radius * 0.027484) {
            uniforms.time.value += this.radius * 0.027484 * this.speed / 100;
        } else {
            uniforms.time.value = -3 * this.radius * 0.027484;
        }
        this.requestId = requestAnimationFrame(() => {
            this.animation()
        })
    }
    remove() {
        this.tb.remove(this.sphere)
        cancelAnimationFrame(this.requestId)
    }
    setPosition(coor) {
        this.position = coor
        this.sphere.setCoords(coor)
    }
    //设置是否循环波动
    setNeedinfinite(boolean) {
        if (boolean) {
            this.animationTime = 0.00001
            this.setWaveNums(125)
        } else {
            this.animationTime = 1.0
            this.setWaveNums(this.wavenums)
        }
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
    //设置波浪数量
    setWaveNums(nums) {
        let colorArr = this.getColorArr(this.color);
        let wavecolor = this.getColorArr(this.wavecolor);
        this.wavenums = nums
        this.shader.vertexshader =
            ` 
        precision mediump float;
        precision mediump int;    
        uniform float u_opacity;
        uniform float time;
        uniform float radius;
        uniform float u_wavegap;
        varying float alpha;
        varying float alpha2;
        void main() { 
            alpha = 1.0 - position.z / radius;
            float start = time-radius/2.0;
            float gap = (radius/10.0)*u_wavegap;
            if(position.z > start-3.0*gap && position.z < start-2.0*gap){
                alpha2 = 1.0;
        }
        `
            + this.addWave(this.wavenums) +
            `else{
                alpha2 = 0.1;
        }
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
        }`

        this.material = new this.THREE.ShaderMaterial({
            uniforms: {
                color: { value: colorArr[0], type: "v3" },
                u_opacity: { value: colorArr[1], type: "f" },
                time: { value: 0.0, type: "f" },
                radius: { value: this.radius * 0.027484, type: "f" },
                wavecolor: { value: wavecolor[0], type: "v3" },
                u_wavecoloropacity: { value: wavecolor[1], type: "f" },
                u_wavegap: { value: this.wavegap, type: "f" },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.shader.vertexshader,
            fragmentShader: this.shader.fragmentshader,
            needsUpdate: true
        });
        this.sphere.material = this.material
    }
    //设置半径
    setRadius(radius) {
        this.radius = radius
        this.sphere.material.uniforms.radius.value = this.radius * 0.027484
        this.sphere.geometry = new this.THREE.SphereBufferGeometry(this.radius * 0.027484, 128 * this.faxx, 128 * this.faxx);
    }
    //设置抗锯齿
    setFaxx(faxx) {
        this.faxx = faxx
        this.sphere.geometry = new this.THREE.SphereBufferGeometry(this.radius * 0.027484, 128 * this.faxx, 128 * this.faxx);
    }
    //设置波浪间隔
    setWaveGap(gap) {
        this.wavegap = gap
        this.sphere.material.uniforms.u_wavegap.value = this.wavegap
    }
    //设置运动速度
    setSpeed(speed) {
        this.speed = speed
    }
    //设置球颜色
    setColor(color = `rgba(0,170,255,1)`) {
        this.color = color
        let colorArr = this.getColorArr(this.color);
        this.sphere.material.uniforms.color.value = colorArr[0]
        this.sphere.material.uniforms.u_opacity.value = colorArr[1]
    }
    //设置波浪颜色
    setWaveColor(color = `rgba(0,170,255,1)`) {
        this.wavecolor = color
        let colorArr = this.getColorArr(this.wavecolor);
        this.sphere.material.uniforms.wavecolor.value = colorArr[0]
        this.sphere.material.uniforms.u_wavecoloropacity.value = colorArr[1]
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
                SphereShader.pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                SphereShader.pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                SphereShader.pad2(Math.round(arr[2] * 1 || 0).toString(16))
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

export { SphereShader }