<template>
  <nav>
    <div class="nav-left">
      <router-link to="/" class="logo">
        <h1><span>your</span>movies</h1>
      </router-link>
    </div>
    <div class="nav-center">
      <input
        v-model="search"
        @keyup.enter="emitSearch"
        placeholder="Search movies..."
        class="nav-search"
      />
    </div>
    <div class="nav-right">
      <router-link to="/" exact>Home</router-link>
      <router-link v-if="!isAuthenticated" to="/login">Login</router-link>
      <router-link v-if="!isAuthenticated" to="/register">Register</router-link>
      <router-link v-if="isAuthenticated" to="/userProfile"
        >Profile</router-link
      >
      <button v-if="isAuthenticated" @click="logout">Logout</button>
    </div>
  </nav>
</template>
<script>
import { useUserStore } from "../stores/user";

export default {
  name: "navBar",
  data() {
    return {
      search: "",
    };
  },
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
  computed: {
    isAuthenticated() {
      return this.userStore.isAuthenticated;
    },
  },
  methods: {
    logout() {
      this.userStore.logout();
      this.$router.push("/");
    },
    emitSearch() {
      if (this.search.trim()) {
        this.$router.push({ name: "home", query: { q: this.search.trim() } });
        this.search = "";
      }
    },
  },
};
</script>
<style scoped>
nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #181818;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 2px solid #0cd2ec;
  z-index: 1000;
  flex-wrap: wrap;
}

.logo h1 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #fff;
  white-space: nowrap;
}

.logo h1 span {
  color: #0cd2ec;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-search {
  width: 300px;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  background: #232323;
  color: #fff;
  outline: none;
  transition: box-shadow 0.2s;
}

.nav-search:focus {
  box-shadow: 0 0 0 2px #0cd2ec;
}

.nav-right {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
}

.nav-right a,
.nav-right button {
  padding: 0.5rem 1.2rem;
  background-color: #232323;
  color: #fff;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  transition: background-color 0.3s, color 0.3s, font-size 0.2s, padding 0.2s;
  min-width: 80px;
  text-align: center;
  white-space: nowrap;
}

.nav-right a.router-link-exact-active {
  background-color: #0cd2ec;
  color: #fff;
}

.nav-right a:hover,
.nav-right button:hover,
.nav-right a:focus,
.nav-right button:focus {
  background-color: #0cd2ec;
  color: #fff;
  outline: none;
}

@media (max-width: 900px) {
  nav {
    flex-direction: column;
    align-items: stretch;
    padding: 0.5rem 0.5rem;
  }
  .nav-left,
  .nav-center,
  .nav-right {
    width: 100%;
    justify-content: center;
    align-items: center;
  }
  .nav-center {
    margin: 0.5rem 0;
  }
  .nav-search {
    width: 100%;
    min-width: 0;
    max-width: 220px;
    font-size: 0.95rem;
    padding: 0.4rem 0.7rem;
  }
  .nav-right {
    flex-wrap: nowrap;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin: 0.5rem 0;
  }
  .nav-right a,
  .nav-right button {
    font-size: 0.95rem;
    padding: 0.4rem 0.7rem;
    min-width: 60px;
  }
}

@media (max-width: 600px) {
  nav {
    flex-direction: column;
    padding: 0.3rem 0.2rem;
  }
  .logo h1 {
    font-size: 1.2rem;
  }
  .nav-search {
    max-width: 120px;
    font-size: 0.9rem;
    padding: 0.3rem 0.5rem;
  }
  .nav-right a,
  .nav-right button {
    font-size: 0.85rem;
    padding: 0.3rem 0.5rem;
    min-width: 48px;
  }
}
</style>
