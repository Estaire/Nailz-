/* Add your Application JavaScript */
Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [createPersistedState({
        storage: window.sessionStorage
  })],
  state: {
    isLoggedIn: false,
    page: 0
  },
  mutations: {
    loggedIn(state){
      this.state.isLoggedIn = true
    },
    loggedOut(state){
      this.state.isLoggedIn = false
    },
    thisPageToHome({commit}){
      this.state.page = 0
    }
  },
  actions: {
    setLoggedIn({commit}){
      commit('loggedIn')
    },
    setLoggedOut({commit}){
      commit('loggedOut')
    },
    setPageToHome({commit}){
      commit('thisPageToHome')
    }
  }
})

Vue.component('app-header', {
    template: `
    <header></header>
    `
});

Vue.component('app-footer', {
    template: `
    <footer>
        <div class="container">
        </div>
    </footer>
    `
});

const NotFound = Vue.component('not-found', {
    template: `
    <div>
        <h1>404 - Not Found</h1>
    </div>
    `,
    data: function () {
        return {}
    }
})

const Registration = Vue.component('registration', {
    template: `
    <div class="row form">
      <div class="col-md-4"></div>
      <div class="col-md-4" id="register">
        <form @submit.prevent="uploadForm" id="uploadForm" role="form" method="POST" name="form">
          <h1 class="appname">Classic Nailz</h1>
          <div>
            <input type="email" id="email" name="email" class="form-control" required>
            <span class="email-label">Email</span>
          </div>
          <div>
            <input type="text" id="firstname" name="firstname" class="form-control" required>
            <span class="fn-label">First Name</span>
          </div>
          <div>
            <input type="text" id="lastname" name="lastname" class="form-control" required>
            <span class="ln-label">Last Name</span>
          </div>
          <div>
            <input type="number" id="phone" name="phone" class="form-control" required>
            <span class="phone-label">Phone number</span>
          </div>
          <div>
            <input type="text" id="username" name="username" class="form-control" required>
            <span class="un-label">Username</span>
          </div>
          <div>
            <input type="password" id="password" name="password" class="form-control" required>
            <span class="pw-label">Password</span>
          </div>
          <button type="submit" class="btn btn-primary">Sign up</button>
        </form>
        <div class="alt">
          <span>Have an account?</span>
          <router-link to="/login">Log in</router-link>
        </div>
      </div>
      <div class="col-md-4"></div>
    </div>
    `,
    methods:{
      uploadForm: ()=>{
        let uploadForm = document.getElementById('uploadForm');
        let form_data = new FormData(uploadForm);
        fetch("/api/users/register", {
          method: "POST",
          body: form_data,
          headers: {
            'X-CSRFToken': token
          },
          credentials: 'same-origin'
        })
        .then(function(response){
          return response.json();
        })
        .then(function(jsonResponse){
          if(jsonResponse.authenticated){
            localStorage.setItem('access_token', JSON.stringify(jsonResponse.access_token))
            router.push("/instructions");
            store.dispatch('setLoggedIn')
          }
        })
        .catch(function(error){
          console.log(error);
        });
      }
    }
})

const Login = Vue.component('login', {
  template: `
    <div class="row form">
      <div class="col-md-4"></div>
      <div class="col-md-4" id="login">
        <form @submit.prevent="loginForm" id="loginForm" role="form" method="POST" name="form">
          <h1 class="appname">Classic Nailz</h1>
          <div>
            <input type="text" id="username" name="username" class="form-control" required>
            <span class="un-label">Username</span>
          </div>
          <div>
            <input type="password" id="password" name="password" class="form-control" required>
            <span class="pw-label">Password</span>
          </div>
          <button type="submit" class="btn btn-primary">Log in</button>
        </form>
        <div class="alt">
          <span>Don't have an account?</span>
          <router-link to="/register">Sign up</router-link>
        </div>
     </div>
     <div class="col-md-4"></div>
  </div>
    `,
    created(){
      store.dispatch('setLoggedOut')
    },
    methods:{
      loginForm: ()=>{
        let uploadForm = document.getElementById('loginForm');
        let form_data = new FormData(uploadForm);
        fetch('/api/auth/login', {
          method: 'POST',
          body: form_data,
          headers: {
            'X-CSRFToken': token
          },
          credentials: 'same-origin'
        })
        .then(response=>{
          return response.json()
        })
        .then(jsonResponse=>{
          if(jsonResponse.authenticated){
            localStorage.setItem('access_token', JSON.stringify(jsonResponse.access_token))
            router.push("/home")
            store.dispatch('setLoggedIn')
          }
        })
      }
    }
})

const Homepage = Vue.component('home', {
  template: `
  <div class="homepage">
    <div class="dashboard">
      <h6>DASHBOARD</h6>
      <a :href="$router.resolve({name: 'home'}).href"><button class="btn btn-light btn-lg"><i class="fas fa-calendar-week" style="font-size: 1.2rem;"></i>Schedule</button></a>
      <a :href="$router.resolve({name: 'appointments'}).href"><button class="btn btn-light btn-lg"><i class="far fa-clipboard" style="font-size: 1.4rem;"></i>Your appointments</button></a>
      <a :href="$router.resolve({name: 'logout'}).href"><button class="btn btn-light btn-lg"><i class="fas fa-door-open"></i>Log out</button></a>
    </div>
    <div class="schedule-container">
      <div class="schedule">
        <div class="month">
          <i class="fas fa-angle-left"></i>
          <div class="specific">
            <h1 class="date"></h1>
            <p class="time">No slot selected</p>
          </div>
          <i class="fas fa-angle-right"></i>
        </div>
        <div class="weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div class="time-slots">
        </div>
      </div>
    </div>
  </div>
  `,
  created: window.onload = async function(){
    await fetch('/api/schedule',{
      method: 'GET',
      headers:{
        'Authorization': 'Bearer ' +  JSON.parse(localStorage.getItem('access_token'))
      }
    })
    .then(response=>{
      return response.json();
    })
    .then(data=>{
      if(data){
        this.setPriority(data);
        this.setUser(data);
        this.setUsers(data);
        this.isCurrent(true);
        this.$forceUpdate()
      }
    });

    const date = new Date();
    const dateDisplay = document.querySelector('.date');
    const timeDisplay = document.querySelector('.time');
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const times = ["8am - 9am", "9am - 10am", "10am - 11am", "11am - 12pm", "12pm - 1pm", "1pm - 2pm", "2pm - 3pm", "3pm - 4pm", "4pm - 5pm", "5pm - 6pm"]

    dateDisplay.innerHTML = months[date.getMonth()]+" "+date.getDate()+" "+date.getFullYear();

    currentDay = date.getDay()+1;

    for(let i=1; i<=70; i++){
      let slot = document.createElement('div');
      slot.classList.add('day-'+i);
      document.querySelector('.time-slots').appendChild(slot);
      slot.addEventListener('mouseout', changeDefOut);

      if(i%7==0){
        slot.addEventListener('mouseover', changeDefOver.bind(null, (i%7)-currentDay+7, Math.round(i/7)-1));
        slot.addEventListener('click', changeColor.bind(null, i, Math.round(i/7)-1,this.priority));
      }
      else if(i%7 < currentDay && i%7!=0){
        slot.addEventListener('mouseover', changeDefOver.bind(null, (i%7)-currentDay, Math.round(i/7)-1));
        slot.classList.add('inactive');
        slot.style.backgroundColor = 'silver';
      }
      else{
        slot.addEventListener('mouseover', changeDefOver.bind(null, (i%7)-currentDay, Math.round(i/7)-1));
        slot.addEventListener('click', changeColor.bind(null, i, Math.round(i/7)-1,this.priority));
      }
    }

    for(let i=0; i<this.users.length; i++){
      let temptime = times.indexOf(this.users[i].appointmenttime);
      let tempdate = this.users[i].appointmentdate.split(" ");
      temp = parseInt(tempdate[1])-date.getDate()
      specslot = (currentDay+temp)+7*temptime
      $(".time-slots div:nth-child("+specslot+")")[0].classList.toggle("booked")
    }

    for(let i=0; i<this.user.length; i++){
      let temptime = times.indexOf(this.user[i].appointmenttime);
      let tempdate = this.user[i].appointmentdate.split(" ");
      temp = parseInt(tempdate[1])-date.getDate()
      specslot = (currentDay+temp)+7*temptime

      $(".time-slots div:nth-child("+specslot+")")[0].classList.toggle("book")
    }


    function changeDefOver(hindex, vindex, e) {
      thisDate = new Date();
      thisDate.setDate(date.getDate()+hindex);
      dateDisplay.innerHTML = months[thisDate.getMonth()]+" "+thisDate.getDate()+" "+thisDate.getFullYear();
      timeDisplay.innerHTML = times[vindex];
    }

    function changeDefOut(e) {
      dateDisplay.innerHTML = months[date.getMonth()]+" "+date.getDate()+" "+date.getFullYear();
      timeDisplay.innerHTML = "No slot selected";
    }

    function changeColor(hindex, vindex, priority, e){
      console.log(hindex);
      console.log(vindex);
      console.log(priority);
      console.log(e);
      let auth = true;
      let length = $(".time-slots div:nth-child(7n+"+hindex%7+")").length
      let hindexcopy = 0;
      let thisDate = new Date();
      let time = times[vindex];

      if(hindex%7 == 0)
        hindexcopy = (hindex%7)-currentDay+7
      else
        hindexcopy = (hindex%7)-currentDay

      thisDate.setDate(date.getDate()+hindexcopy);
      let selecteddate = months[thisDate.getMonth()]+" "+thisDate.getDate()+" "+thisDate.getFullYear();

      for(let i=0; i<length; i++){
        if($(".time-slots div:nth-child(7n+"+hindex%7+")")[i].classList.contains("book"))
          auth = false;
      }

      if(!auth && $(".time-slots div:nth-child("+hindex+")").hasClass("book") && priority!=1 && !$(".time-slots div:nth-child("+hindex+")").hasClass("inactive")){
        deleteAppointment(selecteddate, time);
        function deleteAppointment(date, time){
          fetch('/api/delete/'+date+'/'+time+'/appointment',{
            method: 'POST',
            headers:{
              'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('access_token')),
              'X-CSRFToken': token
            },
            credentials: 'same-origin'
          })
          .then(response=>{
            return response.json()
          });
        }
        e.target.classList.toggle("book");
      }
      else if(auth && !$(".time-slots div:nth-child("+hindex+")").hasClass("booked") && priority!=1 && !$(".time-slots div:nth-child("+hindex+")").hasClass("inactive")){
        bookAppointment(selecteddate, time);
        function bookAppointment(date, time){
          fetch('/api/create/'+date+'/'+time+'/appointment',{
            method: 'POST',
            headers:{
              'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('access_token')),
              'X-CSRFToken': token
            },
            credentials: 'same-origin'
          })
          .then(response=>{
            return response.json()
          });
        }
        e.target.classList.toggle("book");
      }
      else if(priority==1 && !$(".time-slots div:nth-child("+hindex+")").hasClass("booked")){
        console.log("Hello")
      }
    }
  },
  methods: {
    setUsers(data){
      this.users = data.users;
    },
    setUser(data){
      this.user = data.user;
    },
    setPriority(data){
      this.priority = data.isadmin;
    },
    isCurrent(boolean){
      this.current_user = boolean;
    }
  },
  data: function(){
      return{
        priority: 0,
        users: [],
        user: [],
        current_user: false
      }
  },
  mounted: function(){
    this.$root.$on('refresh', ()=>{
      this.$forceUpdate();
    })
  }
})

const Instructions = Vue.component('instructions', {
    template: `
    <div class="instructions">
      <div class="intro">
        <h1>Classic Nailz Jamaica</h1>
        <h5>Click on a time slot to book an appointment and click again to delete it</h5>
        <h5>It's just that simple!</h5>
        <a :href="$router.resolve({name: 'home'}).href"><h4>Let's go</h4></a>
      </div>
    </div>
    `
})

const Appointments = Vue.component('appointments',{
  template: `
    <div class="homepage">
      <div class="dashboard">
        <h6>DASHBOARD</h6>
        <a :href="$router.resolve({name: 'home'}).href"><button class="btn btn-light btn-lg"><i class="fas fa-calendar-week" style="font-size: 1.2rem;"></i>Schedule</button></a>
        <a v-if="priority==1" :href="$router.resolve({name: 'appointments'}).href"><button class="btn btn-light btn-lg"><i class="far fa-clipboard" style="font-size: 1.4rem;"></i>List of appointments</button></a>
        <a v-if="priority==0" :href="$router.resolve({name: 'appointments'}).href"><button class="btn btn-light btn-lg"><i class="far fa-clipboard" style="font-size: 1.4rem;"></i>Your appointments</button></a>
        <a :href="$router.resolve({name: 'logout'}).href"><button class="btn btn-light btn-lg"><i class="fas fa-door-open"></i>Log out</button></a>
      </div>
      <div class="appointments">
        <div v-if="user==[]" class="group">
          <h4>No appointments</h4>
          <p>Press the button below to book an appointment</p>
          <a :href="$router.resolve({name: 'home'}).href"><button class="btn btn-primary">Book an appointment</button></a>
        </div>
        <div v-if="priority==0 && user!=[]" class="list">
          <h4>Your appointments</h4>
          <p v-for="appointment in user">{{ appointment.appointmentdate }} at {{ appointment.appointmenttime }}</p>
        </div>
        <div v-if="priority==1 && user!=[]" class="admin-list">
          <h4>List of appointments</h4>
          <p v-for="appointment in users">{{ appointment.appointmentdate }} at {{ appointment.appointmenttime }}</p>
        </div>
      </div>
    </div>
  `,
  created: window.onload = async function(){
    await fetch('/api/schedule',{
      method: 'GET',
      headers:{
        'Authorization': 'Bearer ' +  JSON.parse(localStorage.getItem('access_token'))
      }
    })
    .then(response=>{
      return response.json();
    })
    .then(data=>{
      if(data){
        this.setPriority(data);
        this.setUser(data);
        this.setUsers(data);
        this.isCurrent(true);
        this.$forceUpdate()
      }
    }); 
  },
  methods: {
    setUsers(data){
      this.users = data.users;
    },
    setUser(data){
      this.user = data.user;
    },
    setPriority(data){
      this.priority = data.isadmin;
    },
    isCurrent(boolean){
      this.current_user = boolean;
    }
  },
  data: function(){
    return{
      priority: 0,
      users: [],
      user: [],
      current_user: false
    }
  },
  mounted: function(){
    this.$root.$on('refresh', ()=>{
      this.$forceUpdate()
    })
  }
})

const Logout = Vue.component('logout',{
  template: `<div></div>`,
  created:()=>{
    fetch('/api/auth/logout',{
      method: 'GET',
      headers:{
        'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('access_token'))
      }
    })
    .then(response=>{
      return response.json()
    });
    router.push({name: 'login'});
    store.dispatch('setLoggedOut')
    }
})


const router = new VueRouter({
    mode: 'history',
    routes: [
        {path: "/", component: Login},
        {path: "/register", component: Registration},
        {path: "/home", component: Homepage, name:"home"},
        {path: "/appointments", component: Appointments, name:"appointments"},
        {path: "/instructions", component: Instructions, name:"instructions"},
        {path: "/login", component: Login,  name:"login"},
        {path: "/logout", component: Logout, name:"logout"},
        {path: "*", component: NotFound}
    ]
});

// Instantiate our main Vue Instance
let app = new Vue({
    el: "#app",
    router,
    store
});