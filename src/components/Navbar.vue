<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'; // Ispravan put do authStore
import { useDrawingStore } from '@/stores/drawingStore';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Pristupamo Auth Store-u
const authStore = useAuthStore();
const drawingStore = useDrawingStore();
const router = useRouter();

// Koristimo computed za dinamičko praćenje stanja isLoggedIn
const isLoggedIn = computed(() => authStore.isLoggedIn);
const username = computed(() => authStore.user?.username);

// Proveravamo da li je korisnik ulogovan
onMounted(() => {
  authStore.checkLoginStatus();
});

const logout = () => {
  authStore.logout(); // Pozivamo logout akciju iz authStore
  // Preusmeravamo na Home stranicu nakon logovanja
  window.location.href = '/';
};

const resetFilter = () => {
  drawingStore.setAuthorFilter(null);
};

const goToNew = () => {
  drawingStore.resetCanvas(); // Resetuje kanvas
  router.push('/crtanje');
};
</script>

<template>
  <nav class="navbar navbar-expand-lg">
    <div class="collapse navbar-collapse justify-content-center">
      <ul class="navbar-nav d-flex flex-row align-items-center">
       
        <li class="nav-item">
          <router-link class="nav-link" to="/">
            <i class="fas fa-home"></i>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/galerija" @click="resetFilter">Gallery</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/crtanje" @click="goToNew">New</router-link>
        </li>

        <!-- Prikazuje se samo ako korisnik nije ulogovan -->
        <li class="nav-item" v-if="!isLoggedIn">
          <router-link class="nav-link" to="/login">Login</router-link>
        </li>
        <li class="nav-item" v-if="!isLoggedIn">
          <router-link class="nav-link" to="/register">Register</router-link>
        </li>

        <!-- Prikazuje se samo ako je korisnik ulogovan -->
        <li class="nav-item" v-if="isLoggedIn">
          <router-link class="nav-link" to="/pojedinacnaSlika">My Gallery</router-link>
        </li>
        <li class="nav-item" v-if="isLoggedIn">
          <span class="nav-link" @click="logout" style="user-select: none; cursor: pointer;">Logout</span>
        </li>
        <li class="nav-item" v-if="isLoggedIn">
          <span class="username">{{ username }}</span> <!-- Korisničko ime nije klikabilno -->
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  background-color: rgba(255, 0, 111, 0.8); /* Roza boja sa providnošću */
}

.navbar-nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  list-style-type: none; 
  padding: 0; 
  margin: 0; 
}

.nav-item {
  margin: 0 20px;
}

.nav-link {
  display: flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
}

.nav-link:hover {
  color: #ff66b2; /* Svetlija roze boja pri hoveru */
}

.nav-link i {
  margin-right: 5px;
}

.navbar-logo {
  height: 40px;
  width: auto;
  margin-right: 10px;
}

.username {
  color: white;
  margin-left: 10px;
}



</style>