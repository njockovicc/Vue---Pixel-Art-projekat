<template>
  <div class="register-container">
    <div class="register-form">
      <h2>Register</h2>
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

        <!-- Ponovljena Lozinka -->
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirm your password"
            :class="{'is-invalid': confirmPasswordError}"
          />
          <span v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</span>
        </div>

        <!-- Dugme za registraciju -->
        <button type="submit" :disabled="isSubmitting">
          Register
        </button>
      </form>

      <!-- Prikazivanje greške ili uspeha -->
      <p v-if="registerError" class="error-message">{{ registerError }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      usernameError: '',
      passwordError: '',
      confirmPasswordError: '',
      registerError: '',
      successMessage: '', // Poruka o uspehu
      isSubmitting: false
    };
  },
  methods: {
    validateForm() {
      this.usernameError = '';
      this.passwordError = '';
      this.confirmPasswordError = '';
      this.registerError = '';
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

      // Validacija ponovljene lozinke
      if (this.password !== this.confirmPassword) {
        this.confirmPasswordError = 'Passwords do not match.';
        isValid = false;
      }

      return isValid;
    },
    async handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.isSubmitting = true;
      this.registerError = '';
      this.successMessage = ''; // Resetovanje prethodnih poruka

      try {
        const response = await fetch('https://raf-pixeldraw.aarsen.me/api/auth/register', {
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

        console.log("Response from server:", data);

        if (!response.ok) {
          if (data.code === 'DUPLICATE_USERNAME') {
            this.registerError = 'Username is already taken.';
          } else if (data.code === 'INVALID_DATA') {
            this.registerError = 'Invalid data. Please check your inputs.';
          } else {
            this.registerError = 'An error occurred. Please try again later.';
          }
          throw new Error(data.code);
        }

        // Uspešna registracija - preusmeravanje na login stranicu
        this.successMessage = 'Registration successful! Please login.';
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000); // Preusmeri na login posle 2 sekunde
      } catch (error) {
        console.error('Registration error:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>
<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa; /* Svetla pozadina koja je slična opštoj svetloj temi */
}

.register-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  color: #343a40; /* Tamniji tekst unutar forme za bolji kontrast */
}

.register-form h2 {
  text-align: center;
  margin-bottom: 25px;
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #ff006f; /* Plavi naslov za bolji kontrast */
}

.form-group {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px;
  border-radius: 5px;
  border: 1px solid #ddd; /* Svetli border za input polja */
  background-color: #f8f9fa; /* Svetla pozadina input polja */
  font-size: 16px;
  color: #6c054f; /* Tamniji tekst u polju */
  transition: background-color 0.3s, box-shadow 0.3s;
}

input:focus {
  background-color: white; /* Bela pozadina kada je u fokusu */
  box-shadow: 0 0 10px rgba(255, 0, 102, 0.5); /* Plavi fokus */
  border-color: #ff0077; /* Plavi border kada je u fokusu */
}

button {
  width: 100%;
  padding: 12px;
  background-color: #ff0077; /* Plavo dugme */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #ff0077;
}

button:active:not(:disabled) {
  transform: scale(0.98);
}

.is-invalid {
  border-color: #ff0066;
}

.error-message {
  color: #ff0066;
  font-size: 12px;
  margin-top: 5px;
  text-align: left;
}
</style>
