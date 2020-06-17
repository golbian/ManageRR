<template>
  <div class="container">
    <header class="jumbotron">
      <button v-on:click="openProjectModal()" class="btn btn-success">Add a project +</button> 
      <br>
      <br>
      <h3>{{content}}</h3>
      <br>
      <ul class="list-group">
        <li v-for="project in listProjects" :key="project.name" class="list-group-item">
          <a href="#">{{project.name}}</a>
        </li>
      </ul>
    </header>
    <modal name="newProjectModal" height="auto" :scrollable="true">
      <form name="form" v-on:submit.prevent="newProject()">
        <div>
          <div class="form-group">
            <label for="name">Name :</label>
            <input
              v-model="project.name"
              v-validate="'required|min:3|max:20'"
              type="text"
              class="form-control"
              name="name"
            />
          </div>
          <div class="form-group">
            <label for="client">Client :</label>
            <input
              v-model="project.client"
              v-validate="'required|min:3|max:20'"
              type="text"
              class="form-control"
              name="client"
            />
          </div>
          <div class="form-group">
            <label for="start">Start Date :</label>
            <input
              v-model="project.start"
              type="date"
              class="form-control"
              name="start"
            />
          </div>
          <div class="form-group">
            <label for="end">End Date :</label>
            <input
              v-model="project.end"
              type="date"
              class="form-control"
              name="end"
            />
          </div>
          <div class="form-group">
            <label for="charge">Charge :</label>
            <input
              v-model="project.charge"
              type="number"
              class="form-control"
              name="charge"
            />
          </div>
          <div class="form-group">
            <label for="budget">Budget :</label>
            <input
              v-model="project.budget"
              type="number"
              class="form-control"
              name="budget"
            />
          </div>
          <div class="form-group">
            <label for="ssTrt">ssTrt :</label>
            <input
              v-model="project.ssTrt"
              type="number"
              class="form-control"
              name="ssTrt"
            />
          </div>
          <div class="form-group">
            <button class="btn btn-primary btn-block">Add Project</button>
          </div>
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
      content: '',
      listProjects: [],
      project: {      
        name: null,
        client: null,
        statut: null,
        start: null,
        end: null,
        charge: null,
        budget: null,
        ssTrt: null,
      },
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

    ProjectServices.getAllProject().then(response =>{
      this.listProjects = response.data;
    })


  },
  methods: {
    openProjectModal() {
      this.$modal.show('newProjectModal');
      document.querySelector('.vm--modal').style.padding = '10px';
    },

    newProject() {
      var data = {};
      data.name = this.project.name;
      data.client = this.project.client;
      data.statut = 'Default';
      data.start = this.project.start;
      data.end = this.project.end;
      data.charge = this.project.charge;
      data.budget = this.project.budget;
      data.ssTrt = this.project.ssTrt;
      
      ProjectServices.createProject(data).then(response =>{
        console.log(response)
      }).catch(err =>{
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

  .vm--modal {
    padding: 10px;
  }
</style>
