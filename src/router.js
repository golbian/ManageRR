import Vue from 'vue';
import Router from "vue-router";

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes:[
        { path: '/gantt', component: ()=> import('./components/Gantt.vue')},
        { path: '/grid', component: ()=> import('./components/Grid.vue')},
        { path: '/scheduler', component: ()=> import('./components/Scheduler.vue')},
        { path: '/import', component: ()=> import('./components/Import.vue')},
        { path: '/home', component: ()=> import('./components/Home.vue')},
        { path: '/project/:id', component: ()=> import('./components/Project.vue')},
        { path: '/login', name: 'login', component: ()=> import('./components/Login.vue')},
        { path: '/register', name: 'register', component: ()=> import('./components/Register.vue')},
        { path: '/profile', name: 'profile', component: () => import('./components/Profile.vue')},
        { path: '/admin', name: 'admin', component: () => import('./components/BoardAdmin.vue')},
        { path: '/mod', name: 'moderator', component: () => import('./components/BoardModerator.vue')},
        { path: '/user', name: 'user', component: () => import('./components/BoardUser.vue')}
    ]
})