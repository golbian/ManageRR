<script>
// import ProjectServices from '../services/project.service';
import EventServices from '../services/event.service';
import scheduler from "dhtmlx-scheduler";
import moment from 'moment';
  export default {
    name: 'modal',
    props: ["editedEvent"],
    data() {
        return {
            scheduler: scheduler,
            events: [],
        }
    },
    computed: {
        currentUser() {
            return this.$store.state.auth.user;
        },
        NewEvent() {
          return this.$props.editedEvent;
        }
    },
    methods: {
        updateInsitu(insitu) {
            console.log(this.NewEvent)
            if(insitu === true) {
            this.NewEvent.insitu = false
            } else {
            this.NewEvent.insitu = true
            }
        },
        submitEvent(ev) {
            ev.month = moment(ev.start_date).format("MMMM");
            ev.year = moment(ev.start_date).year();
            if(!ev.createdAt) {
                // var query = {
                //     projectId: ev.project_id,
                //     scheduleId: ev.schedule_id
                // }
                ev.user = this.currentUser.sigle;
                EventServices.create(ev).then(data => {
                })
            } else {
                EventServices.update(ev.id, ev).then(data => {
                    console.log(data)
                })
            }
            console.log(ev)
            this.close();
        },
        deleteEvent(id) {
          console.log(id)
          EventServices.delete(id).then(data => {
            console.log(data)
          })
        },
        close() {
        this.$emit('close');
      },
    },
  };
</script>
<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container"
          role="dialog"
          aria-labelledby="modalTitle"
          aria-describedby="modalDescription"
        >
          <header
            class="modal-header"
            id="modalTitle"
          >
            <slot name="header">
              <button
                type="button"
                class="btn btn-primary btn-close"
                @click="close"
                aria-label="Close modal"
              >
                <i class="fas fa-window-close"></i>
              </button>
            </slot>
          </header>
          <section
            class="modal-body"
            id="modalDescription"
          >
            <slot name="body">
            <form name="form" id="form"  class="m-5" v-on:submit.prevent="submitEvent(NewEvent)">
              <h4 class="text-center">{{NewEvent.name}}</h4>
              <div class="form-group">
                  <label for="text">Name</label>
                  <input
                      id="input_text"
                      v-model="NewEvent.name"
                      v-validate="'required|min:3|max:15'"
                      type="text"
                      class="form-control"
                      name="text"
                      />
                      <div
                      v-if="errors.has('text')"
                      class="alert-danger"
                      >{{errors.first('text')}}</div>
              </div>
              <div class="form-group">
                  <label for="client">Client</label>
                  <input
                  id="input_client"
                  v-model="NewEvent.client"
                  v-validate="'required|min:3|max:25'"
                  type="text"
                  class="form-control"
                  name="client"
                  />
                  <div
                  v-if="errors.has('client')"
                  class="alert-danger"
                  >{{errors.first('client')}}</div>
              </div>
              <div class="form-group">
                  <label for="deliverable">Livrable</label>
                  <input
                  id="input_deliverable"
                  v-model="NewEvent.deliverable"
                  v-validate="'required|min:3|max:25'"
                  type="text"
                  class="form-control"
                  name="deliverable"
                  />
                  <div
                  v-if="errors.has('deliverable')"
                  class="alert-danger"
                  >{{errors.first('deliverable')}}</div>
              </div>
              <div class="form-group roles-check row  mt-5">
                  <div class="form-group col-sm-8 text-center">
                      <label for="tps">Time Spent</label>
                      <input 
                          id="input_name"
                          v-model="NewEvent.tps"
                          type="range"
                          class="form-control"
                          name="tps"
                          min="0"
                          max="8"
                      >
                      <span><strong><input v-model="NewEvent.tps" class="text-center">
                      <p>hours</p></strong></span>
                  </div>
                  <div class="col-sm-4 mt-4">
                      <toggle-button id="input_insitu" @change="updateInsitu(NewEvent.insitu)" color="#007bff" :width="100" :height="45" :value="NewEvent.insitu" :labels="{checked: 'In-Situ', unchecked: 'In-Situ'}" />
                  </div>
              </div>
              <div class="form-group">
                  <button v-if="!NewEvent.createdAt" class="btn btn-primary btn-block">Create</button>
                  <button v-else class="btn btn-primary btn-block">Save</button>
                  <button @click="deleteEvent(NewEvent.id)" class="btn btn-danger btn-block">Delete</button>
              </div>
          </form>
            </slot>
          </section>
        </div>
      </div>
    </div>
  </transition>
</template>
<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 5em;
  left: 25em;
  width: 60%;
  height: 80%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 100%;
  height: 100%;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

</style>