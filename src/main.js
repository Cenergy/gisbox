import Vue from 'vue';
import App from './App.vue';
import EventBus from './eventbus/eventbus';
import router from './router';
import store from './store';

Vue.prototype.$EventBus = EventBus;
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
