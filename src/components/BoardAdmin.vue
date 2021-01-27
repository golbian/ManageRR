<template>
<div ref="container">
  <div id="layout_container"></div>
  <modal name="userEditModal" height="auto" :scrollable="true">
      <form name="form"  class="m-5" v-on:submit.prevent="updateUser(editUser)">
        <h4 class="text-center">Update User</h4>
          <div class="form-group">
            <label for="username">Username</label>
            <input
              v-model="editUser.username"
              v-validate="'required|min:3|max:20'"
              type="text"
              class="form-control"
              name="username"
            />
            <div
              v-if="submitted && errors.has('username')"
              class="alert-danger"
            >{{errors.first('username')}}</div>
          </div>
          <div class="form-group">
            <label for="sigle">Sigle</label>
            <input
              v-model="editUser.sigle"
              v-validate="'required|min:3|max:3'"
              type="text"
              class="form-control"
              name="sigle"
            />
            <div
              v-if="submitted && errors.has('sigle')"
              class="alert-danger"
            >{{errors.first('sigle')}}</div>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              v-model="editUser.email"
              v-validate="'required|email|max:50'"
              type="email"
              class="form-control"
              name="email"
            />
            <div
              v-if="submitted && errors.has('email')"
              class="alert-danger"
            >{{errors.first('email')}}</div>
          </div>
          <div class="form-group roles-check row mt-5 m-2">
            <ul>
              <li v-for="role in roles" :key="role._id" class="d-inline-flex ml-2 form-check">
                    <toggle-button @change="updateRole(role)" :color="setColor(role.name)" :width="100" :height="45" :margin="5" :value="setInitState(role)" :sync="true" :labels="{checked: role.name, unchecked: role.name}" />
              </li>
            </ul>
            <br>
          </div>
          <div class="form-group">
            <button class="btn btn-primary btn-block">Save</button>
          </div>
      </form>
    </modal>
    <modal  name="registerModal" height="auto" :scrollable="true">
      <register></register>
    </modal>
</div>
</template>

<script>
import register from './Register.vue';
import UserService from '../services/user.service';
import RoleService from '../services/role.service';
import {Layout as LayoutDHX} from 'dhx-suite';
import {List as ListDHX} from 'dhx-suite';
import {Combobox as ComboboxDHX} from 'dhx-suite';
import {Toolbar as ToolbarDHX} from 'dhx-suite';

export default {
  name: 'User',
  components: {
    register,
  },
  data() {
    return {
      list: null,
      roleList: null,
      comboBox: null,
      toolbar: null,
      users: [],
      roles: [],
      submitted: false,
      successful: false,
      editUser: {
        id:null,
        roles: [],
        email: null,
        sigle: null,
      },
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  created: function() {
    UserService.getAllUser().then(res => {
      for(const user of res.data) {
        user.value = user.username;
      }
      this.users = res.data;
    });

    RoleService.getAllRole().then(res => {
      this.roles = res.data;
    })
  },
  mounted() {
    var config = {
				css: "dhx_layout-cell--bordered",
				rows: [{
						cols: [
              {
                padding: 12,
                id: "combo",
                css: "dhx_layout-cell--border_bottom",
                width: "18vw",
                height: "60px",
					    },
              {
                id: "toolbar",
                css: "dhx_layout-cell--border_bottom",
                width: "15vw",
                height: "60px",
              },
              {
                id: "header_roles",
                html: "<strong>Roles</strong>",
                css: "dhx_layout-cell--border_bottom header",
                width: "50vw",
                height: "60px"
					    },
						]},
            {
                  id: "UserList",
                  css: "dhx_layout-cell--border_right",
                  width: "35vw",
                  height: "100vh"
							  },
                {
									id: "RoleList",
                  width:"50vw",
                  height: "100vh",
                  css: "scheduler"
								},
					{
						id: "footer",
						html: "Footer",
						css: "dhx_layout-cell--border_top",
						height: "60px"
					}
				]
			};

    var layout = new LayoutDHX("layout_container", config);
    this.list = new ListDHX(null, {
      template: function(item) {
        var template = "<div class='d-flex'>";
        template += "<div class='item_username w-25 ml-5 mt-4'><p>"+item.username; 
        template+="</p>"
        template += "</div>";
        template+= "<div class='item_email w-50 mt-4'><p>"
        template+= item.email
        template += "</p></div>";
        template += "<div class='d-block w-25 mt-4'>";
        for(const role of item.roles){
          if(role.name === "user") {
            template += '<div class="badge badge-pill badge-primary">Consultant</div>'
          } else if(role.name === "pm") {
            template += '<span class="badge badge-pill badge-warning ml-1">PM</span>'
          } else if(role.name === "kam") {
            template += '<span class="badge badge-pill badge-warning ml-1">KAM</span>'
          }else {
            template += '<span class="badge badge-pill badge-danger ml-1">Admin</span>'
          }
        }
        template += "</div>";
        template += "</div>";
        return template;
      },
      multiselection:true,
      itemHeight: 80,
      height: "100%",
      // dragMode: "both"
    });

    this.comboBox = new ComboboxDHX(null, {
      placeholder: 'Search a User'
    });

    this.toolbar = new ToolbarDHX(null)

    this.roleList = new ListDHX(null, {
      template: function(item) {
        var template = "<div class='list_item'>";
        template += "<div class='item_username'><p>"+item.username; 
        template+="</p><br><span class='item_email'><p>"
        template+= item.email
        template += "</p></span>";
        template += "</div>";

        return template;
      },
      itemHeight: 120,
      height: "100%",
    });

    this.list.data.map(function (item, i) {
      if (!(i % 2)) {
          list.data.update(item._id, {css: "bg-gray"})
      }
    })

    layout.getCell("toolbar").attach(this.toolbar)
    layout.getCell("combo").attach(this.comboBox)
    layout.getCell("UserList").attach(this.list)
    // layout.getCell("RoleList").attach(this.roles)

    this.comboBox.events.on("Change", (id) => {
        var filter = this.list.data.getItem(id);
        if(filter) {
          this.list.data.filter({
            by:"value" ,
            match: filter.value
          })
        }
    });
    
    this.comboBox.events.on("Open", () => {
      this.comboBox.clear()
      this.list.data.filter();
    });

    this.list.events.on("DoubleClick", (id, e) => {
      this.editUser = this.list.data.getItem(id);
      this.$modal.show('userEditModal');
    });

    this.toolbar.events.on("Click", (id,e) => {
      if(id === "new") {
        this.$modal.show("registerModal")
      } else if (id === "delete") {
        var items = this.list.data.findAll({
          by: "$selected",
          match: true
        });
        for(const item of items) {
          UserService.deleteUser(item._id).then(response => {
            console.log(response.data)
          })
        }
      }
      this.list.paint()
    });
  },
  methods: {
    updateUser(data) {
      delete data.$selected
      UserService.updateUser(this.editUser._id, data).then(response => {
        this.$modal.hide('userEditModal')
        this.list.paint()
      })
    },
    setColor(name) {
      switch(name) {
        case "admin":
        return "#dc3545"
        break;
        case "pm":
        return "#ffc107"
        break;
        case "kam":
        return "#ffc107"
        break;
        case "user":
        return "#007bff"
        break;
      }
    },
    setInitState(role) {
      var result = this.editUser.roles.find(check => check._id == role._id)
      if(result === undefined) {
        return false
      } else {
        return true
      }
    },
    updateRole(roleToUpdate) {
        var check = this.editUser.roles.find(role => role._id == roleToUpdate._id)
        if(check === undefined) {
          this.editUser.roles.push(roleToUpdate)
        } else {
          this.editUser.roles.splice(this.editUser.roles.indexOf(check), 1)
        }
    },
  },
  watch: {
    users: function() {
      this.list.data.parse(this.users);
      this.comboBox.data.parse(this.users)
      this.toolbar.data.parse([
        {
          id: "new",
          type: "button",
          icon: "dxi-plus",
          value: "new"
        },
        {
          id: "delete",
          type: "button",
          icon: "dxi-delete",
          value: "delete"
        }
    ])
    },
    // roles: function() {
    //   this.roleList.data.parse(this.roles);
    // }
  }
};
</script>
<style scoped>
@import "~dhx-suite/codebase/suite.css";
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

  .bg-gray {
    background: #faf9f9;
  }

  div.vm--modal {
    margin: 5px;
    padding: 10px;
  }
</style>
