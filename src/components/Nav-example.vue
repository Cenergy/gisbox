<template>
  <div class="exanav">
    <div class="nav">
      <div class="nav_top">
        <div class="nav_top_left">GISBox</div>
        <div class="nav_top_right">
          <div class="docs">
            <router-link to="/document" tag="font">文档</router-link>
          </div>
          <div class="example" :style="{color:selected}" :class="{isline:isline}">
            <router-link to="/example" tag="font">示例</router-link>
          </div>
        </div>
      </div>
      <div class="nav_body">
        <div class="nav_body_title">举一些例子</div>
        <div class="nav_body_content">
          <div
            class="list"
            v-bind:class="[changeBlue==index?blue:'',hoverBlue==index?blue:'']"
            @mouseover="mouseover(index)"
            @click="click(tab,index)"
            v-for="(tab,index) in tabs"
            :key="tab.name"
          >{{tab.name}}</div>
        </div>
      </div>
    </div>
    <div class="content1">
      <iframe frameborder="0" :src="src" scrolling="no"></iframe>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import axios from "axios";
import demodata from "../../public/demo.json";
export default {
  data() {
    return {
      tabs: [],
      selected: "#444444",
      src: "",
      srcMd: "",
      isline: true,
      changeBlue: 0,
      hoverBlue: 0,
      blue: "blue"
    };
  },
  mounted() {
    this.$EventBus.$on("switchIframe", msg => {
      this.src = msg;
      this.demoselected = "#444444";
      this.demo_border_line = true;
    });

    const data = demodata.demo;
    const keys = Object.keys(data);
    for (let i = 0; i <= keys.length - 1; i += 1) {
      const name = keys[i];
      const url = data[keys[i]];
      this.tabs.push({
        name,
        url
      });
    }
    this.$EventBus.$emit("switchIframe", data[keys[0]]);
  },
  methods: {
    click(tab, index) {
      this.$EventBus.$emit("switchIframe", tab.url);
      this.activeitem = tab.name;
      this.changeBlue = index;
    },
    mouseover(index) {
      this.hoverBlue = index;
    }
  }
};
</script>
<style >
.list {
  height: 40px;
  position: relative;
  top: 50px;
  left: 10px;
  color: #444444;
  cursor: pointer;
}
.blue {
  color: #049ef4;
  text-decoration: underline;
}
.isline {
  border-bottom: 1px solid #444444;
}
.exanav {
  width: 100%;
  height: 100%;
  display: flex;
}
.nav {
  flex: 1;
  font-size: 20px;
}
.content1 {
  flex: 4;
  width: auto;
  height: auto;
  overflow: hidden;
}
.content1 iframe {
  width: 100%;
  height: 100%;
}
.nav_top {
  border-bottom: 1px solid #e8e8e8;
  height: 60px;
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
  color: #049ef4;
}
</style>