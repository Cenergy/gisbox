/*
 * @Author: 郭博阳
 * @Date: 2019-10-30 11:09:46
 * @LastEditTime: 2019-11-28 09:39:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\flyLine\fly.js
 */
class HighLightBuilding {
    constructor(object) {
        this.baicSpeed = 1;
        this.THREE = object.THREE
        this.color = object.hasOwnProperty("color") ? object.color : "rgba(255,138,0,1)";
        this.outercolor = object.hasOwnProperty("outercolor") ? object.outercolor : "rgba(0,138,255,1)";
        this.needbbox = object.hasOwnProperty("needbbox") ? object.needbbox : false;
        this.needskin = object.hasOwnProperty("needskin") ? object.needskin : false;
        this.tb = object.threebox;
        this.position = object.position;
        this.skinheight = object.hasOwnProperty("skinheight") ? object.skinheight : 3;
        this.skincolor = object.hasOwnProperty("skincolor") ? object.skincolor : "rgba(255,138,0,0.2)";
        this.features = object.features
        this.height = object.hasOwnProperty("height") ? object.height : 10;
        this.outerheight = object.hasOwnProperty("outerheight") ? object.outerheight : 20;
        this.boxShader = {
            vertexshader: ` 
                precision mediump float;
                precision mediump int;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform float height; 
                uniform float changedHeight; 
                varying float innerAlpha;
                attribute vec3 position;
                void main() {
                    innerAlpha = 2.3-position.z / height;
                    float x = position.x*1.0;
                    float y = position.y*1.0;
                    float z = position.z*1.0;
                    if(z>0.0){
                        z+=changedHeight*0.027484*2.0;
                    }
                    vec3 p = vec3(x,y,z);
                    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
                `,
            fragmentshader: ` 
                precision mediump float;
                precision mediump int;
                uniform float u_opacity;
                uniform vec3 color;
                varying float innerAlpha;
                void main() {
                    float red = color.x;
                    float green = color.y;
                    float blue = color.z;
                    float redr = color.x/255.0;
                    float greenr = color.y/255.0;
                    float bluer = color.z/255.0;
                    vec3 cr = vec3(redr+red*innerAlpha,greenr+green*innerAlpha,bluer+blue*innerAlpha);
                    vec4 u_color = vec4(cr,min(1.0,0.2+u_opacity));
                    gl_FragColor = u_color;
                }`
        }
        this.outerpolygon = {
            vertexshader: `
                precision mediump float;
                precision mediump int;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform float height;
                attribute vec3 position;
                void main() {
                    float x = position.x;
                    float y = position.y;
                    float z = position.z;
                    if(z>0.0){
                        z+=height*0.027484;
                    }

                    vec3 p = vec3(x,y,z);
                    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
                `,
            fragmentshader: ` 
                precision mediump float;
                precision mediump int;
                uniform float u_opacity;
                uniform vec3 color;
                void main() {
                    vec4 u_color = vec4(color,min(1.0,u_opacity));
                    gl_FragColor = u_color;
                }`
        }
        let colorArr = this.getColorArr(this.color);
        this.boxmaterial = new this.THREE.RawShaderMaterial({
            uniforms: {
                color: { value: colorArr[0], type: "v3" },
                u_opacity: { value: colorArr[1], type: "f" },
                height: { value: this.height * 0.027484, type: "f" },
                changedHeight: { value: this.height * 0.027484, type: "f" },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.boxShader.vertexshader,
            fragmentShader: this.boxShader.fragmentshader,
        });
        let colorArr2 = this.getColorArr(this.skincolor);
        this.skinmaterial = new this.THREE.RawShaderMaterial({
            uniforms: {
                color: { value: colorArr2[0], type: "v3" },
                u_opacity: { value: colorArr2[1], type: "f" },
                height: { value: this.skinheight, type: "f" },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.outerpolygon.vertexshader,
            fragmentShader: this.outerpolygon.fragmentshader,
        });
        let colorArr3 = this.getColorArr(this.outercolor);
        this.outermaterial = new this.THREE.RawShaderMaterial({
            uniforms: {
                color: { value: colorArr3[0], type: "v3" },
                u_opacity: { value: colorArr3[1], type: "f" },
                height: { value: this.outerheight, type: "f" },
            },
            transparent: true,
            depthTest: false,
            vertexShader: this.outerpolygon.vertexshader,
            fragmentShader: this.outerpolygon.fragmentshader,
        });
        this.init()
    }
    _handlePosition(position) {
        let p = position
        let boxposition = this.tb.utils.lnglatsToWorld(p)
        return boxposition
    }
    init() {
        //本体
        let container = []
        this.features.forEach((element) => {
            let coords = element.geometry.coordinates[0]
            let box = this._addbox(coords, this.height)
            container.push(box)
        })
        let originbuilding = container[0]
        //本体
        container.forEach((item) => {
            originbuilding.merge(item)
        })
        let buffergeometry = new this.THREE.BufferGeometry();
        this.buffer = buffergeometry.fromGeometry(originbuilding)
        let mesh = new THREE.Mesh(this.buffer, this.boxmaterial);
        this.box = this.tb.Object3D({ obj: mesh })
        this.tb.add(this.box)
        //皮肤
        if (this.needskin) {
            let mesh = new THREE.Mesh(this.buffer, this.skinmaterial);
            this.skin = this.tb.Object3D({ obj: mesh })
            this.tb.add(this.skin)
        }
        //外墙
        if (this.needbbox) {
            let mesh = new THREE.Mesh(this.buffer, this.outermaterial);
            this.outerbox = this.tb.Object3D({ obj: mesh })
            this.tb.add(this.outerbox)
        }
    }
    _addbox(position, height) {
        let shape = new THREE.Shape();
        let p = this._handlePosition(position)
        shape.moveTo(p[0].x, p[0].y);
        p.forEach((item, index) => {
            if (index > 0) {
                shape.lineTo(item.x, item.y);
            }
        });
        shape.moveTo(p[p.length - 1].x, p[p.length - 1].y);
        let extrudeSettings = {
            depth: height * 0.027484,
            bevelEnabled: false,
        };
        let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        return geometry
    }
    //设置楼体颜色透明度
    setBoxColor(color) {
        let colorArr = this.getColorArr(color);
        this.box.material.uniforms.color.value = colorArr[0];
        this.box.material.uniforms.u_opacity.value = colorArr[1];
    }
    //设置包围盒颜色和透明度
    setOutBoxColor(color) {
        let colorArr = this.getColorArr(color);
        this.outerbox.material.uniforms.color.value = colorArr[0];
        this.outerbox.material.uniforms.u_opacity.value = colorArr[1];
    }
    //设置皮肤颜色和透明度
    setSkinColor(color) {
        let colorArr = this.getColorArr(color);
        this.skin.material.uniforms.color.value = colorArr[0];
        this.skin.material.uniforms.u_opacity.value = colorArr[1];
    }

    //设置楼体高度
    setBoxHeight(changedHeight) {
        this.height = changedHeight - this.height
        this.box.material.uniforms.changedHeight.value = this.height * 0.027484;
    }
    //设置包围盒高度
    setOutBoxHeight(height) {
        this.outerheight = height
        this.outerbox.material.uniforms.height.value = this.outerheight * 0.027484;
    }
    //设置皮肤高度
    setSkinHeight(height) {
        this.skinheight = height
        this.skin.material.uniforms.height.value = this.skinheight * 0.027484;
    }

    //是否显示楼体
    setBoxShow(boolean) {
        this.box.material.visible = boolean
    }
    //是否显示皮肤
    setSkinShow(boolean) {
        this.skin.material.visible = boolean
    }
    //是否显示包围盒
    setOutBoxShow(boolean) {
        this.outerbox.material.visible = boolean
    }
    //删除
    remove() {
        this.tb.remove(this.box)
        this.tb.remove(this.skin)
        this.tb.remove(this.outerbox)
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
                HighLightBuilding.pad2(Math.round(arr[0] * 1 || 0).toString(16)),
                HighLightBuilding.pad2(Math.round(arr[1] * 1 || 0).toString(16)),
                HighLightBuilding.pad2(Math.round(arr[2] * 1 || 0).toString(16))
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

export { HighLightBuilding }