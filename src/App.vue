<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <a href class="navbar-brand" v-on:click.prevent>ManagerRR</a>
      <div class="navbar-nav mr-auto">
        <li class="nav-item">
          <router-link to="/home" class="nav-link">
            <font-awesome-icon icon="home" />Home
          </router-link>
        </li>
        <li class="nav-item">
        <router-link class="nav-link" to="/gantt">Gantt</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/grid">Grid</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/scheduler">Pointage</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/scheduler-admin">Pointings Admin</router-link>
        </li>
        <li v-if="showAdminBoard" class="nav-item">
          <router-link to="/admin" class="nav-link">Administration</router-link>
        </li>
        <li v-if="showAdminBoard" class="nav-item">
          <router-link to="/import" class="nav-link">Import</router-link>
        </li>
        <li v-if="showModeratorBoard" class="nav-item">
          <router-link to="/mod" class="nav-link">Moderator</router-link>
        </li>
        <li class="nav-item">
          <router-link v-if="currentUser" to="/user" class="nav-link">User</router-link>
        </li>
      </div>

      <div v-if="!currentUser" class="navbar-nav ml-auto">
        <li class="nav-item">
          <router-link to="/register" class="nav-link">
            <font-awesome-icon icon="user-plus" />Sign Up
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/login" class="nav-link">
            <font-awesome-icon icon="sign-in-alt" />Login
          </router-link>
        </li>
      </div>

      <div v-if="currentUser" class="navbar-nav ml-auto">
        <li class="nav-item">
          <router-link to="/profile" class="nav-link">
            <font-awesome-icon icon="user" />
            {{ currentUser.username }}
          </router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link" href v-on:click.prevent="logOut">
            <font-awesome-icon icon="sign-out-alt" />LogOut
          </a>
        </li>
      </div>
    </nav>

    <div class='app-content'>
      <router-view class='app-content'>
      </router-view>
    </div>
  </div>
</template>

<script>
import UserServices from './services/user.service';
export default {
    data() {
        return {
          user: null
        };
    },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    showAdminBoard() {
      if (this.user && this.user.roles) {
        for(const role of this.user.roles) {
          if(role.name == 'admin') {
            return true;
          }
        }
      }

      return false;
    },
    showModeratorBoard() {
      if (this.user && this.user.roles) {
        for(const role of this.user.roles) {
          if(role.name == 'moderator') {
            return true;
          }
        }
      }

      return false;
    }
  },
    mounted: function() {
    UserServices.getUser(this.currentUser.id).then(res => {
      this.user = res.data;
    })
  },
  methods: {
    logOut() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/login');
    }
  }
};
</script>
<style>

  @import "../node_modules/bootstrap/dist/css/bootstrap.css";

  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
  }

#app{
  height: 100%;
  display: flex;
  flex-direction: column;
}
.app-content{
 min-height: 80%;
}
</style>