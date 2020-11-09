import Vue from 'vue'
import router from './router'
import App from './App.vue'
import store from './store';
import VModal from 'vue-js-modal'
import vuetify from '@/plugins/vuetify'
import ToggleButton from 'vue-js-toggle-button'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import VeeValidate from 'vee-validate';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faHome,
  faUser,
  faUserPlus,
  faSignInAlt,
  faSignOutAlt,
  faPlus,
  faPencilAlt,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

library.add(faHome, faUser, faUserPlus, faSignInAlt, faSignOutAlt, faPlus, faPencilAlt, faTimes);

Vue.config.productionTip = false;

Vue.use(VeeValidate);
Vue.use(ToggleButton)
Vue.use(VModal);
Vue.component('font-awesome-icon', FontAwesomeIcon);

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register', '/home'];
  const authRequired = !publicPages.includes(to.path);
  // const adminPage = ['/admin']
  // const adminRequired = !adminPage.includes(to.path);
  const loggedIn = localStorage.getItem('user');

  // if(localStorage.getItem('user')) {
  //   for (const role of localStorage.getItem('user').roles) {
  //     console.log(role)
  //   }
  // }

    // if(localStorage.getItem('user').roles.some(role => loggedIn.roles.includes(role))){
    //   var isAdmin = true
    // }


  // trying to access a restricted page + not logged in
  // redirect to login page
  if (authRequired && !loggedIn) {
    next('/login');
  } else {
    next();
  }

//   if (adminRequired ) {
//     next('/profile');
//   } else {
//     next();
//   }
});


new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app')
