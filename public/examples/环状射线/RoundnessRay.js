/*
 * @Author: 郭博阳
 * @Date: 2019-10-30 11:09:46
 * @LastEditTime: 2019-11-27 15:07:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \rd-asd:\flyLine\fly.js
 */
import { GeoUtiles } from "../GeoUtiles.js"
import { FlyLine } from "./FlyLine.js"
class RoundnessRay {
    constructor(object) {
        this.THREE = object.THREE
        this.texture = object.hasOwnProperty("texture") ? object.texture : 0.0;
        this.color = object.hasOwnProperty("color") ? object.color : "rgba(255,138,0,1)";
        this.width = object.hasOwnProperty("width") ? object.width : 100;
        this.length = object.hasOwnProperty("length") ? object.length : 100;
        this.speed = object.hasOwnProperty("speed") ? object.speed : 2;
        this.center = object.hasOwnProperty("center") ? object.center : [0, 0];
        this.radius = object.hasOwnProperty("radius") ? object.radius : 5;
        this.pointnum = object.hasOwnProperty("pointnum") ? object.pointnum : 500;
        this.gap = object.hasOwnProperty("gap") ? object.gap : 10;
        this.show = true
        this.tb = object.Threebox
        this.position = []
        this.height = object.hasOwnProperty("height") ? object.height : 2000;
        let position = GeoUtiles.getCircle(this.center, this.radius / 100000, this.gap, 1)
        for (let i = 0; i <= position.length - 1; i++) {
            position[i].push(this.height)
        }
        for (let i = 0; i <= position.length - 1; i++) {
            this.position.push([[this.center[0], this.center[1], this.height], position[i]])
        }
        this.containers = []
        this.config = {
            texture: this.texture,
            color: this.color,
            pointnum: this.pointnum,
            length: this.length,
            width: this.width,
            speed: this.speed,
            THREE: this.THREE,
            Threebox: this.tb,
        }
        this.init()
    }
    init() {
        this.position.forEach((item) => {
            let config = Object.assign(this.config, {
                position: item
            })
            this.containers.push(new FlyLine(config))
        })
    }
    remove() {
        this.containers.forEach((item) => {
            item.remove()
        })
    }
    setColor(color) {
        this.color = color
        this.containers.forEach((item) => {
            item.setColor(this.color)
        })
    }
    setShow(boolean) {
        this.show = boolean
        this.containers.forEach((item) => {
            item.setShow(boolean)
        })
    }
    setGap(gap = 1) {
        this.gap = gap
        this._updateGeometry()
    }
    setHeight(height) {
        this.height = height
        this._updateGeometry()
    }
    setRadius(radius) {
        this.radius = radius
        this._updateGeometry()
    }
    setPosition(coor) {
        this.center = coor
        this._updateGeometry()
    }
    setWidth(width) {
        this.width = width
        this.containers.forEach((item) => {
            item.setWidth(this.width)
        })
    }
    setLength(length) {
        this.length = length
        this.containers.forEach((item) => {
            item.setLength(this.length)
        })
    }
    setSpeed(speed) {
        this.speed = speed
        this.containers.forEach((item) => {
            item.setSpeed(this.speed)
        })
    }
    _updateGeometry() {
        let position = GeoUtiles.getCircle(this.center, this.radius / 100000, this.gap, 1)
        for (let i = 0; i <= position.length - 1; i++) {
            position[i].push(this.height)
        }
        this.position = []
        for (let i = 0; i <= position.length - 1; i++) {
            this.position.push([[this.center[0], this.center[1], this.height], position[i]])
        }
        this.containers.forEach((item) => {
            item.remove()
        })
        this.containers = []
        this.init()
    }
}

export { RoundnessRay }