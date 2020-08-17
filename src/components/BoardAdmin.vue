<template>
  <div class="container">
    <header class="jumbotron">
      <h1 class='text-center'>Attach a Project Manager to a project</h1>
      <br>
      <ul class="list-group">
        <li v-for="project in listProjects" :key="project.name" class="list-group-item">
          <a href="#"  class="d-flex ml-5 px-5 justify-content-between" v-on:click="openManagerModal(project._id)">{{project.name}}
           <span class="badge badge-primary badge-pill mr-5 px-4">{{project.pm}}</span>
          </a>
        </li>
      </ul>
    </header>
    <modal name="projectManagerModal" height="auto" :scrollable="true">
      <form name="form"  style="margin: 5px; padding: 10px;" v-on:submit.prevent="attachPM()">
        <h2 class="text-center"> Attach project manager: </h2>
          <div class="form-group">
            <ul>
              <li v-for="user in listUsers" :key="user.username" class="form-check">
              <p>
                <input type="radio" class="form-check-input" v-bind:value="user.username" v-model="projectManager">{{user.username}}
              </p>
              </li>
            </ul>
            <br>
            
            <div style="margin-top: 5px;" class="form-check">
              <h2 class="text-center"> Publish the project: </h2>
              <input style="margin-left: 20px;" type="checkbox" class="form-check-input" id="Publish" v-model="isPublished">
              <label style="margin-left: 40px;" class="form-check-label" for="Publish" v-if="isPublished"> Unpublish </label>
              <label style="margin-left: 40px;" class="form-check-label" for="Publish" v-if="!isPublished"> Publish </label>
            </div>
          </div>
          <div class="form-group">
            <button class="btn btn-primary btn-block">Save</button>
          </div>
      </form>
    </modal>
  </div>
</template>

<script>
import UserService from '../services/user.service';
import ProjectServices from '../services/project.service';

export default {
  name: 'User',
  data() {
    return {
      listProjects: [],
      listUsers: [],
      projectManager: null,
      projectId: null,
      isPublished: false,
    };
  },
  mounted() {
    UserService.getAdminBoard().then(
      response => {
        this.content = response.data;
      },
      error => {
        this.content =
          (error.response && error.response.data) ||
          error.message ||
          error.toString();
      }
    );

    ProjectServices.getAllProject().then(response => {
      this.listProjects = response.data;
      console.log(response.data)
    })

    UserService.getAllUser().then(response => {
      this.listUsers = response.data;
    })
  },
  methods: {
    openManagerModal(id) {
      this.projectId = id;
      this.$modal.show('projectManagerModal');
    },

    attachPM() {
      var data = {};
      data.pm = this.projectManager;
      data.published = this.isPublished;
      ProjectServices.attachProjectManager(this.projectId, data).then(response => {
        console.log(response)
      }).catch(err => {
        console.error(err);
      })
    }
  }
};
</script>
<style scoped>
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }

  div.vm--modal {
    margin: 5px;
    padding: 10px;
  }
</style>
