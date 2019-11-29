# ReflectPlanes
<br/>

**ReflectPlanes是利用着色器程序与geometry合并渲染的例子，空间换效率的方式在CPU时间完成所有顶点的组装，然后一次渲染绘制。可同时展示数万模型，不过可能需要等久一些。通过着色器叠加渲染，支持数据生成灰度图。**

![avatar](documents/ReflectPlanes/1.png "markdown")

## Example
 
```javascript
import { ReflectPlanes } from './ReflectPlanes.js'

let arr = []
for (let i = 0; i <= 11; i++) {
    arr.push({ position: [117.24986717036558+Math.random()*0.01, 31.881520767401724+Math.random()*0.01], radius: 10 })
}
let plane = new ReflectPlanes({
    //符合geojson格式的包围形
    position: [[
        [117.28713837742401, 31.861066489281313],
        [117.28859794532633, 31.862932759026748],
        [117.29162159997134, 31.862974260700412],
        [117.29186485387748, 31.881520767401724],
        [117.24986717036558, 31.88151528385238],
        [117.2453253074109, 31.873523071925845],
        [117.24347740770105, 31.867422368802295],
        [117.23534091247416, 31.869822123255403],
        [117.22547846126173, 31.869523697451598],
        [117.22006224325423, 31.863413438845257],
        [117.21503629159218, 31.863989927015254],
        [117.21442266216167, 31.860675681459867],
        [117.28733832898712, 31.86086667256967],
    ]],
    //整体符号的大小,默认为1
    size: 2,
    //整体符号间隔,默认为1,
    space: 3,
    //颜色和透明度
    color: `rgba(0,165,255,1.0)`,
    //传入灰度图点位和半径信息,也可不传
    holes: arr,
    //图元类型,支持tringle三角,circle圆形,plane方形,默认tringle
    type: 'circle',
    //THREE对象
    THREE: THREE,
    //threebox对象
    threebox: tb,
});
```

## Properties
<font color="#049ef4" size=4>.color(readOnly)</font>

平面颜色，格式以`rgba(255,0,0,1.0)`字符串的形式保存。直接设置无效。

<font color="#049ef4" size=4>.holes(readOnly)</font>

平面灰度图的数据(孔洞)，直接设置无效。数据结构为:
```javascript
[
    { 
    position:[117.24986717036558,31.881520767401724], 
    radius: 10 
    },
    ...
]
```
radius为灰度半径

<font color="#049ef4" size=4>.size(readOnly)</font>

地板符号整体的大小，正整数。直接设置无效。

<font color="#049ef4" size=4>.space(readOnly)</font>

地板符号整体间隔，正整数。直接设置无效。

<font color="#049ef4" size=4>.show(readOnly)</font>

地板是否可见。直接设置无效。

<font color="#049ef4" size=4>.position(readOnly)</font>

用户传入的原始多边形坐标。直接设置无效。

```javascript
position: [[
            [117.28713837742401, 31.861066489281313],
            [117.28859794532633, 31.862932759026748],
            [117.29162159997134, 31.862974260700412],
            [117.29186485387748, 31.881520767401724],
            [117.24986717036558, 31.88151528385238],
            [117.2453253074109, 31.873523071925845],
            [117.24347740770105, 31.867422368802295],
            [117.23534091247416, 31.869822123255403],
            [117.22547846126173, 31.869523697451598],
            [117.22006224325423, 31.863413438845257],
            [117.21503629159218, 31.863989927015254],
            [117.21442266216167, 31.860675681459867],
            [117.28733832898712, 31.86086667256967],
    ]]
```    

<font color="#049ef4" size=4>.type(readOnly)</font>

地板符号整体样式，支持`tringle` `plane` `circle` 默认 `circle`

## Methods

<font color="#049ef4" size=4>.setSize(size:Int>=1)</font>

设置地板符号整体大小，过小的值可能会消耗更多的GPU资源。

<font color="#049ef4" size=4>.setColor(color:String)</font>

参数为`rbga([0,255],[0,255],[0,255],[0,1])`
设置地板的颜色。

<font color="#049ef4" size=4>.setShow(show:Boolean)</font>

设置地板是否可见,传递布尔值即可。

<font color="#049ef4" size=4>.setType(width:Number>0)</font>

设置地板符号的类型，支持`tringle` `plane` `circle` 默认 `circle`

<font color="#049ef4" size=4>.setSpace(length:Int>=1)</font>

设置地板符号的间隔，过小的值可能会消耗更多的GPU资源。

<font color="#049ef4" size=4>.addHole(hole:Array)</font>

设置地板的灰度图数据，直接会被可视化

数据结构为

```javascript
[
    { 
    position:[117.24986717036558,31.881520767401724], 
    radius: 10 
    },
    ...
]
```
radius为灰度半径

<font color="#049ef4" size=4>.remove()</font>

彻底销毁地板并从内存和视图中清除，此方法不可逆。


## Source Code

```javascript

待添加

```
