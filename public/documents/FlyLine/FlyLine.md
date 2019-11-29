# FlyLine
<br/>

**FlyLine是利用着色器程序实现顶点坐标和序号控制进行动画形成的一条线，它支持带高度，平滑插值**     

![avatar](documents/FlyLine/1.png "markdown")

## Example

```javascript
import { FlyLine } from './FlyLine.js'

for (let i = 1; i <= 100; i++) {
    let config = {
        //材质,增加磨砂感
        texture: './meshline.png',
        //颜色以及透明度
        color: "rgba(255,0,0,1.0)",
        //线的轨迹,支持添加高度
        position: [
            [108.18622280825014 + i * 0.01, 35.0617203368993],
            [108.19364787478332 + i * 0.01, 35.062352088785715 + i * 0.01, 10000],
            [108.20416280943596 + i * 0.01, 35.06027736168831, 15000],
            [108.21742738302652 + i * 0.01, 35.065179721566054]
        ],
        //线密度，越大则越细致
        pointnum: 500,
        //线长
        length: 100,
        //线宽
        width: 100,
        //运行速率
        speed: 2,
        //THREE对象
        THREE: THREE,
        //threeBox对象
        Threebox: tb,
    }
}
```

## Properties
<font color="#049ef4" size=3>.color(readOnly)</font>

线的颜色，格式以`rgba(255,0,0,1.0)`字符串的形式保存。直接设置无效。

<font color="#049ef4" size=3>.width(readOnly)</font>

线的宽度，正数，存储着目前线的宽度。直接设置无效。

<font color="#049ef4" size=3>.length(readOnly)</font>

线在动画时体现的长度，正数。直接设置无效。

<font color="#049ef4" size=3>.speed(readOnly)</font>

线在动画时的速度，正数。直接设置无效。

<font color="#049ef4" size=3>.pointnum(readOnly)</font>

组成线顶点的数量，正整数。直接设置无效。

<font color="#049ef4" size=3>.position(readOnly)</font>

用户传入的线原始坐标，数据结构为[[0,0,1000],[1,1,500]]。直接设置无效。

## Methods

<font color="#049ef4" size=3>.setPointNum(nums:Number>0)</font>

设置组成线顶点的数量，值越大则线越平滑，反之越粗糙。过大的值可能会引起GPU性能占用过高带来副作用。

<font color="#049ef4" size=3>.setColor(color:String)</font>

参数为`rbga([0,255],[0,255],[0,255],[0,1])`
设置线的颜色。

<font color="#049ef4" size=3>.setShow(show:Boolean)</font>

设置线是否可见,传递布尔值即可。

<font color="#049ef4" size=3>.setWidth(width:Number>0)</font>

设置线的宽度。

<font color="#049ef4" size=3>.setLength(length:Number>0)</font>

设置线动画时的长度。

<font color="#049ef4" size=3>.setSpeed(speed:Number>0)</font>

设置线在动画时的速度。

<font color="#049ef4" size=3>.remove()</font>

彻底销毁线并从内存和视图中清除，此方法不可逆。


## Source Code

```javascript
待添加

```
