import { defineStore } from 'pinia';

interface User {
  token: string;
  username: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Ako postoji token, korisnik je ulogovan
    isLoggedIn: !!localStorage.getItem('token'), 
    user: null as User | null,  // Definišemo da user može biti ili null ili objekat sa 'token' i 'username'
  }),

  actions: {
    login(userData: User) {
      this.isLoggedIn = true;
      this.user = userData;
      localStorage.setItem('token', userData.token); // Sprema token u localStorage
    },

    logout() {
      this.isLoggedIn = false;
      this.user = null;
      localStorage.removeItem('token'); // Briše token iz localStorage
    },

    checkLoginStatus() {
      const token = localStorage.getItem('token');
      if (token) {
        this.isLoggedIn = true;
        // Možeš dodati poziv API-ja za dobijanje korisničkog podatka ako je potrebno
      }
    }
  }
});