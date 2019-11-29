/* eslint-disable import/no-unresolved */
import Vue from 'vue';
import VueRouter from 'vue-router';
import Docs from '../pages/Docs.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/document',
    name: 'document',
    component: Docs,
  },
  {
    path: '/example',
    name: 'example',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../pages/Example.vue'),
  },
];

const router = new VueRouter({
  // mode: 'history',
  base: __dirname,
  routes,
});
router.beforeEach((to, from, next) => {
    if (to.path === '/') {
      next({ 
        path: '/example', // 未登录则跳转至login页面 
      });
    } else {
      next();
    }
  });
export default router;
