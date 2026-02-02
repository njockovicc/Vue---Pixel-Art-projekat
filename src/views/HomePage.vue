
<template>

  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 relative overflow-hidden">
    <img 
      src=" @/assets/slika.png" 
      alt="Pixel Art Background" 
      class="absolute inset-0 object-cover w-full h-full opacity-50 transform scale-125" 
    />

    <div class="relative z-10 max-w-screen-lg w-full p-6 bg-gray-800 bg-opacity-80 rounded-lg shadow-lg text-center">
      <h1 class="text-5xl font-extrabold text-yellow-300 mb-6 animate__animated animate__fadeIn">
        Dobrodosli u Pixel Art!
      </h1>
      <p class="text-gray-200 mb-4">
        Kreirajte svoje remek-delo koristeći jednostavne alate za crtanje, birajte boje koje najviše volite i delite svoje stvaralaštvo sa svetom.
      </p>
      <router-link to="/crtanje" class="block px-6 py-3 text-lg bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition duration-200 ease-in-out mb-4">
        ZAPOCNI CRTANJE 😊
      </router-link>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <img src="@/assets/pokemon.jpg" alt="Pixel Art Example 2" class="rounded-lg shadow-lg" />
      </div>

      <div class="mt-6">
        <h2 class="text-3xl text-yellow-300">Sta je Pixel Art?</h2>
        <p class="text-gray-200 mt-2">
          Pixel art je oblik digitalne umetnosti koji koristi raster grafiku za kreiranje slika do nivoa piksela. Ima korene u ranim grafičkim prikazima na računarima i video igricama i stekao je popularnost kao jedinstveni umetnički oblik koji naglašava kreativnost.
        </p>
      </div>
      
      <div class="flex justify-center mt-4 space-x-4">
        <a href="#" class="text-gray-400 hover:text-yellow-300 transition duration-200">
          <i class="fab fa-facebook-f"></i>
        </a>
        <a href="#" class="text-gray-400 hover:text-yellow-300 transition duration-200">
          <i class="fab fa-twitter"></i>
        </a>
        <a href="#" class="text-gray-400 hover:text-yellow-300 transition duration-200">
          <i class="fab fa-instagram"></i>
        </a>
      </div>
    </div>

    <p v-if="isLoggedIn">Welcome, {{ user?.username }}!</p>
    <p v-else>Welcome, Guest!</p>
  </div>
</template>


<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';
import { ref, onMounted } from 'vue';

// Pristupamo Auth Store-u
const authStore = useAuthStore();

// Prati login status
const isLoggedIn = ref(authStore.isLoggedIn);
const user = ref(authStore.user);

onMounted(() => {
  authStore.checkLoginStatus();  // Proverava da li je korisnik već ulogovan
  isLoggedIn.value = authStore.isLoggedIn;
  user.value = authStore.user;
});
</script>
<style scoped>
h1 {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

h2 {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* Osiguraj da div zauzima celu visinu i širinu */
html, body {
  height: 100%;
  margin: 0;
}
</style>
