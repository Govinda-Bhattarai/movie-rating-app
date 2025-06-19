<template>
  <div class="profile-container" v-if="user">
    <div class="profile-card">
      <img
        :src="user.avatar || defaultAvatar"
        class="profile-avatar"
        alt="User avatar"
      />
      <div v-if="!editing">
        <div class="profile-details-view">
          <h2>{{ user.name }}</h2>
          <p class="profile-email">{{ user.email }}</p>
          <p class="profile-date">
            Member since: {{ formatDate(user.joinDate) }}
          </p>
        </div>
        <BaseButton class="update-btn" @click="editing = true"
          >Update Details</BaseButton
        >
      </div>
      <div v-else>
        <form
          v-if="!authenticated"
          class="auth-form"
          @submit.prevent="authenticate"
        >
          <div class="profile-field">
            <label for="auth-password">Enter Password to Edit</label>
            <input
              id="auth-password"
              v-model="authPassword"
              type="password"
              required
            />
          </div>
          <BaseButton type="submit" :loading="authenticating"
            >Authenticate</BaseButton
          >
          <p v-if="authError" class="error-msg">{{ authError }}</p>
          <BaseButton
            type="button"
            @click="cancelEdit"
            style="background: #444; margin-top: 0.5rem"
            >Cancel</BaseButton
          >
        </form>
        <div v-else>
          <form class="profile-details-form" @submit.prevent="saveProfile">
            <div class="profile-field">
              <label for="name">Name</label>
              <input id="name" v-model="editUser.name" type="text" required />
            </div>
            <div class="profile-field">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="editUser.email"
                type="email"
                required
              />
            </div>
            <div class="profile-field">
              <label>Member since:</label>
              <span>{{ formatDate(user.joinDate) }}</span>
            </div>
            <BaseButton type="submit" :loading="saving"
              >Save Changes</BaseButton
            >
            <BaseButton
              type="button"
              @click="cancelEdit"
              style="background: #444; margin-top: 0.5rem"
              >Cancel</BaseButton
            >
            <p v-if="profileSuccess" class="success-msg">Profile updated!</p>
            <p v-if="profileError" class="error-msg">{{ profileError }}</p>
          </form>
          <form class="change-password-form" @submit.prevent="changePassword">
            <h4>Change Password</h4>
            <div class="profile-field">
              <label for="current">Current Password</label>
              <input
                id="current"
                v-model="passwordForm.current"
                type="password"
                required
              />
            </div>
            <div class="profile-field">
              <label for="new">New Password</label>
              <input
                id="new"
                v-model="passwordForm.new"
                type="password"
                required
              />
            </div>
            <div class="profile-field">
              <label for="confirm">Confirm New Password</label>
              <input
                id="confirm"
                v-model="passwordForm.confirm"
                type="password"
                required
              />
            </div>
            <BaseButton type="submit" :loading="changingPassword"
              >Change Password</BaseButton
            >
            <p v-if="passwordSuccess" class="success-msg">Password changed!</p>
            <p v-if="passwordError" class="error-msg">{{ passwordError }}</p>
          </form>
        </div>
      </div>
      <BaseButton @click="logout">Logout</BaseButton>
    </div>
    <div class="rated-movies">
      <h3>Your Rated Movies</h3>
      <div v-if="ratedMovies.length" class="movies-grid">
        <div
          v-for="movie in ratedMovies"
          :key="movie.imdbID"
          class="rated-movie-card"
        >
          <MovieCard :movie="movie" @click="goToMovie(movie.imdbID)" />
          <div class="user-rating-review">
            <div v-if="ratingsByMovie[movie.imdbID]">
              <span class="user-rating"
                >Your Rating:
                <b>{{ ratingsByMovie[movie.imdbID].rating }}</b> ⭐</span
              >
              <div
                v-if="ratingsByMovie[movie.imdbID].review"
                class="user-review"
              >
                <span>Your Review:</span>
                <p>{{ ratingsByMovie[movie.imdbID].review }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-msg">You haven't rated any movies yet.</div>
    </div>
  </div>
  <div v-else class="profile-loading">Loading profile...</div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import MovieCard from "../components/MovieCard.vue";
import BaseButton from "../components/BaseButton.vue";

const userStore = useUserStore();
const router = useRouter();
const user = computed(() => userStore.user);
const ratedMoviesRaw = ref([]);
const defaultAvatar =
  "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/055f91bf-3af0-40ea-aa08-9703c4b5f150.png";

const ratedMovies = computed(() =>
  (ratedMoviesRaw.value || []).filter((m) => m && m.imdbID)
);

// New: Store ratings and reviews by imdbID
const ratingsByMovie = ref({});

const editing = ref(false);
const authenticated = ref(false);
const authPassword = ref("");
const authenticating = ref(false);
const authError = ref("");

const editUser = ref({ name: "", email: "" });
const saving = ref(false);
const profileSuccess = ref(false);
const profileError = ref("");

const passwordForm = ref({ current: "", new: "", confirm: "" });
const changingPassword = ref(false);
const passwordSuccess = ref(false);
const passwordError = ref("");

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function logout() {
  userStore.logout();
  router.push("/login");
}
function goToMovie(imdbID) {
  if (!imdbID) return;
  router.push({ name: "movieDetails", params: { id: imdbID } });
}
function cancelEdit() {
  editing.value = false;
  authenticated.value = false;
  authPassword.value = "";
  authError.value = "";
  profileError.value = "";
  passwordError.value = "";
  passwordForm.value = { current: "", new: "", confirm: "" };
  if (user.value) {
    editUser.value = { name: user.value.name, email: user.value.email };
  }
}
onMounted(async () => {
  if (user.value?.id) {
    // Fetch all ratings for this user
    const response = await fetch(
      `http://localhost:3000/ratings?userId=${user.value.id}`
    );
    const ratings = await response.json();
    ratedMoviesRaw.value = ratings.map((r) => r.movie);
    // Map ratings and reviews by imdbID
    ratingsByMovie.value = {};
    for (const r of ratings) {
      ratingsByMovie.value[r.movieId] = { rating: r.rating, review: null };
    }
    // Fetch reviews for this user
    const reviewsRes = await fetch(
      `http://localhost:3000/reviews?userId=${user.value.id}`
    );
    const reviews = await reviewsRes.json();
    for (const review of reviews) {
      if (ratingsByMovie.value[review.movieId]) {
        ratingsByMovie.value[review.movieId].review = review.text;
      }
    }
  }
  if (user.value) {
    editUser.value = { name: user.value.name, email: user.value.email };
  }
});
async function authenticate() {
  authenticating.value = true;
  authError.value = "";
  // Simulate password check (replace with real check in production)
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (
    authPassword.value === "password" ||
    authPassword.value === user.value?.password
  ) {
    authenticated.value = true;
    authPassword.value = "";
  } else {
    authError.value = "Incorrect password.";
  }
  authenticating.value = false;
}
async function saveProfile() {
  saving.value = true;
  profileSuccess.value = false;
  profileError.value = "";
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    userStore.user.name = editUser.value.name;
    userStore.user.email = editUser.value.email;
    profileSuccess.value = true;
    setTimeout(() => {
      profileSuccess.value = false;
      cancelEdit();
    }, 1200);
  } catch (e) {
    profileError.value = "Failed to update profile.";
  } finally {
    saving.value = false;
  }
}
async function changePassword() {
  passwordSuccess.value = false;
  passwordError.value = "";
  changingPassword.value = true;
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordError.value = "Passwords do not match.";
    changingPassword.value = false;
    return;
  }
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    passwordSuccess.value = true;
    passwordForm.value = { current: "", new: "", confirm: "" };
  } catch (e) {
    passwordError.value = "Failed to change password.";
  } finally {
    changingPassword.value = false;
    setTimeout(() => (passwordSuccess.value = false), 2000);
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #181818;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  color: #fff;
}
.profile-card {
  background: #232323;
  padding: 2rem 2.5rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  color: #fff;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
  min-width: 340px;
  max-width: 400px;
}
.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 3px solid #e50914;
}
.profile-details-view {
  text-align: center;
  margin-bottom: 1.5rem;
}
.profile-details-view h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}
.profile-details-view .profile-email {
  color: #b3b3b3;
  margin-bottom: 0.5rem;
}
.profile-details-view .profile-date {
  color: #888;
  margin-bottom: 1.5rem;
}
.update-btn {
  background: #e50914;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.update-btn:hover,
.update-btn:focus {
  background: #b0060f;
  box-shadow: 0 4px 24px #e50914aa;
  outline: none;
  transform: scale(1.04);
}
.profile-details-form,
.change-password-form,
.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.profile-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.profile-field label {
  font-size: 0.95rem;
  color: #b3b3b3;
}
.profile-field input {
  background: #181818;
  color: #fff;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
.profile-field input:focus {
  border: 1.5px solid #e50914;
}
.success-msg {
  color: #42b983;
  font-size: 0.95rem;
  margin-top: 0.5rem;
}
.error-msg {
  color: #e50914;
  font-size: 0.95rem;
  margin-top: 0.5rem;
}
.change-password-form h4 {
  color: #fff;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}
.profile-card button,
.profile-card .base-btn {
  background: #e50914;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.profile-card button:hover,
.profile-card .base-btn:hover,
.profile-card button:focus,
.profile-card .base-btn:focus {
  background: #b0060f;
  box-shadow: 0 4px 24px #e50914aa;
  outline: none;
  transform: scale(1.04);
}
.rated-movies {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}
.rated-movies h3 {
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.movies-grid {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}
.empty-msg {
  color: #b3b3b3;
  text-align: center;
  margin-top: 1.5rem;
}
.profile-loading {
  text-align: center;
  padding: 3rem;
  color: #b3b3b3;
  font-size: 1.2rem;
}
.rated-movie-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 200px;
  max-width: 220px;
}
.user-rating-review {
  margin-top: 0.5rem;
  background: #232323;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  color: #fff;
  width: 100%;
  font-size: 0.98rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.user-rating {
  color: #e50914;
  font-weight: 600;
}
.user-review {
  margin-top: 0.3rem;
  color: #b3b3b3;
  font-size: 0.97rem;
}
.user-review span {
  color: #fff;
  font-weight: 500;
}
</style>
