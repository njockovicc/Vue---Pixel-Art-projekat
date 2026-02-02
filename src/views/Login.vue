<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Login</h2>
      <form @submit.prevent="handleSubmit">
        <!-- Korisničko ime -->
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Enter your username"
            :class="{'is-invalid': usernameError}"
          />
          <span v-if="usernameError" class="error-message">{{ usernameError }}</span>
        </div>

        <!-- Lozinka -->
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            :class="{'is-invalid': passwordError}"
          />
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        </div>

        <!-- Dugme za prijavu -->
        <button type="submit" :disabled="isSubmitting">Login</button>
      </form>

      <!-- Prikazivanje greške ili uspeha -->
      <p v-if="loginError" class="error-message">{{ loginError }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';

export default {
  data() {
    return {
      username: '',
      password: '',
      usernameError: '',
      passwordError: '',
      loginError: '', // Poruka greške za login
      successMessage: '', // Poruka o uspehu
      isSubmitting: false
    };
  },
  methods: {
    validateForm() {
      this.usernameError = '';
      this.passwordError = '';
      let isValid = true;

      // Validacija korisničkog imena
      if (!this.username || this.username.length < 2 || this.username.length > 32) {
        this.usernameError = 'Username must be between 2 and 32 characters long.';
        isValid = false;
      }

      // Validacija lozinke
      if (!this.password || this.password.length < 8 || this.password.length > 128) {
        this.passwordError = 'Password must be between 8 and 128 characters long.';
        isValid = false;
      }

      return isValid;
    },
    async handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.isSubmitting = true;
      this.loginError = ''; // Resetovanje greške
      this.successMessage = ''; // Resetovanje prethodne poruke o uspehu

      try {
        const response = await fetch('https://raf-pixeldraw.aarsen.me/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.code === 'INCORRECT_CREDENTIALS') {
            this.loginError = 'Incorrect username or password.';
          } else if (data.code === 'INVALID_DATA') {
            this.loginError = 'Invalid data. Please check your inputs.';
          } else {
            this.loginError = 'An error occurred. Please try again later.';
          }
          throw new Error(data.code);
        }

        // Uspešna prijava - preusmeravanje na dashboard
        this.successMessage = 'Login successful! Redirecting...';
        setTimeout(() => {
          const authStore = useAuthStore();
          authStore.login({ token: data.token, username: this.username });
          this.$router.push('/');
        }, 2000); // Preusmeravanje na dashboard nakon 2 sekunde
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>
<style scoped>
/* Novi stilovi za login formu */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f8f9fa; /* Svetla pozadina stranice */
}

.login-form {
  background: #ffffff; /* Bela pozadina za formu */
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1); /* Blaga senka za formu */
  width: 100%;
  max-width: 400px;
  color: #343a40; /* Tamna boja teksta za kontrast */
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #ff006f; /* Plava boja za naslov */
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-group {
  margin-bottom: 25px;
}

input {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #ddd; /* Svetli border za input polja */
  background: #f8f9fa; /* Svetla pozadina za input polja */
  font-size: 16px;
  color: #343a40; /* Tamna boja teksta */
  font-family: 'Poppins', sans-serif;
  outline: none;
  transition: background-color 0.3s, box-shadow 0.3s;
}

input:focus {
  background: #ffffff; /* Bela pozadina kad je input u fokusu */
  box-shadow: 0 0 10px rgba(255, 0, 187, 0.5); /* Plavi fokus */
  border-color: #ff006f; /* Plavi border kada je u fokusu */
}

button {
  width: 100%;
  padding: 12px 15px;
  background: #ff006f; /* Plavo dugme */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

button:disabled {
  background: #ddd;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

button:active:not(:disabled) {
  transform: scale(0.95);
}

.is-invalid {
  border: 2px solid #ff0066;
}

.error-message {
  color: #ff0066;
  font-size: 12px;
  margin-top: 5px;
  text-align: left;
  font-family: 'Poppins', sans-serif;
}
</style>

