<template>
<div class="docnav">
  <div class="nav">
    <div class="nav_top">
     <div class="nav_top_left">
         震有Web GIS效果展示软件
      </div>
      <div class="nav_top_right">
       <div class="docs" :style="{color:selected}" :class="{isline:isline}">
          <router-link to="/document" tag="font">docs</router-link>
       </div>
      <div class="example" >
          <router-link to="/example" tag="font">examples</router-link>
       </div>
    </div>
    <div class="nav_body">
      <div class="nav_body_title"><font>文档</font></div>
      <div class="nav_body_content">
        <div class="list"  v-bind:class="[changeBlue==index?blue:'',hoverBlue==index?blue:'']" 
         @mouseover="mouseover(index)" @click="click(tab,index)" v-for="(tab,index) in tabs" :key="tab.name">
            {{tab.name}}
            </div>
        </div>
      </div>
    </div>
  </div>
  <div class="content">
    <Markdown ref="md" :value="srcMd"  style="height:100%,width:100%"/>
  </div>
</div>

</template>
<script>
/* eslint-disable */
import axios from 'axios';
import demodata from '../../public/demo.json';
import Markdown from 'vue-meditor';

export default {
  data() {
    return {
      tabs: [],
      selected:"#444444",
      src: '',
      srcMd: '',
      seen: 'false',
      isline:true,
      changeBlue:0,
      hoverBlue:0,
      blue:'blue',
    };
  },
  mounted() {
    
    this.$EventBus.$on('textMd', (msg) => {
        this.mdselect = '#000000';
        axios.get(msg).then((response) => {　　　　　　
　　　　    this.srcMd = response.data;
           
        });
    });
    const data = demodata.documents;
    const keys = Object.keys(data);
    for (let i = 0; i <= keys.length - 1; i += 1) {
       const name = keys[i];
       const mdurl = data[keys[i]];
       this.tabs.push({
           name,
           mdurl,
       });
    }
    this.$EventBus.$emit('textMd', data[keys[0]]);

  },
  methods: {
    click(url,index) {
        this.$EventBus.$emit('textMd', url.mdurl);
        this.changeBlue = index;
    },
    mouseover(index){
        this.hoverBlue = index;
    },
  },
  components: {
      Markdown,
  },
};
</script>
<style lang="scss">
.list{
  height:40px;
  position: relative;
  top:50px;
  left:10px;
  color:#444444;
  cursor: pointer;
}
.isline{
  border-bottom:1px solid #444444;
}
.blue{
  color:#049ef4;
  text-decoration:underline;
}
.docnav{
  width:100%;
  height:1000px;
  display: flex;
}
.nav{
  flex:1;
  font-size:20px;
}
.content{
  flex:4;
  width:auto;
  height: auto;
}
.content iframe{
  width:100%;
  height: 100%;
}
.nav_top{
  border-bottom:1px solid #E8E8E8;
  height:60px;
}
.nav_top_left,
 .nav_top_right {
  display: inline-block;
  line-height: 60px;
} 
.nav_top_left {
  color: #049ef4;   
  margin-left: 10px;
  font-size: 14px;
}
 .nav_top_right {
   float: right;
   margin-right: 15px;
 }
 .nav_top_right div {
   display: inline-block;
 }
 .nav_top_right .docs {
   margin-right: 25px;
 }
 .nav_top_right .docs,
 .example {
   color: #9e9e9e;
   cursor: pointer;
}
.nav_body_title {
  color:#049ef4;
  position: relative;
  top:20px;
  left:10px;
}
.content{
  overflow: scroll;
}
.content .markdown.border{
  border:none !important;
}
 .content .markdown .markdown-toolbars{
  display: none !important;
}
.content .markdown .markdown-content .markdown-editor{
  display: none !important;
}
</style>
