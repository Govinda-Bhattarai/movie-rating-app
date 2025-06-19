<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <BaseInput v-model="email" label="Email" type="email" required />
        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          required
        />
        <BaseButton :loading="loading" type="submit">Login</BaseButton>
        <div v-if="error" class="error-msg">{{ error }}</div>
      </form>
      <p class="switch-link">
        Don't have an account?
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import BaseInput from "../components/BaseInput.vue";
import BaseButton from "../components/BaseButton.vue";

const email = ref("");
const password = ref("");
const error = ref(null);
const loading = ref(false);
const router = useRouter();
const userStore = useUserStore();

async function handleLogin() {
  error.value = null;
  loading.value = true;
  try {
    await userStore.login(email.value, password.value);
    router.push("/userProfile");
  } catch (err) {
    error.value = err.message || "Invalid email or password";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.auth-card {
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
}
h2 {
  margin-bottom: 1.5rem;
  color: #222;
  text-align: center;
}
.error-msg {
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
}
.switch-link {
  margin-top: 1.5rem;
  text-align: center;
}
</style>
