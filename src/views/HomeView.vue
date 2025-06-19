<template>
  <div class="streaming-home">
    <div class="hero-banner">
      <img
        class="hero-img"
        :src="
          heroMovie && heroMovie.Poster && heroMovie.Poster !== 'N/A'
            ? heroMovie.Poster
            : 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1500&q=80'
        "
        :alt="heroMovie ? heroMovie.Title : 'Featured'"
      />
      <div class="hero-overlay">
        <h1 class="hero-title">
          {{ heroMovie ? heroMovie.Title : "Welcome to YourMovies" }}
        </h1>
        <p class="hero-desc">
          <template v-if="heroMovie">
            {{ heroMovie.Year
            }}<span v-if="heroMovie.Type"> • {{ heroMovie.Type }}</span>
          </template>
          <template v-else>
            Stream, rate, and review your favorite movies!
          </template>
        </p>
        <BaseButton
          v-if="!userStore.isAuthenticated"
          class="hero-btn"
          @click="$router.push('/register')"
          >Join Now</BaseButton
        >
      </div>
    </div>
    <section class="movie-section">
      <h2>{{ route.query.q ? "Search Results" : "Popular Movies" }}</h2>
      <div class="movie-row">
        <MovieCard
          v-for="movie in movies"
          :key="movie.imdbID"
          :movie="movie"
          @click="goToMovie(movie.imdbID)"
        />
      </div>
    </section>
    <template v-if="!route.query.q">
      <section class="movie-section" v-for="genre in genres" :key="genre.label">
        <h2>{{ genre.label }} Movies</h2>
        <div class="movie-row">
          <MovieCard
            v-for="movie in genreMovies[genre.label] || []"
            :key="movie.imdbID"
            :movie="movie"
            @click="goToMovie(movie.imdbID)"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import MovieCard from "../components/MovieCard.vue";
import BaseButton from "../components/BaseButton.vue";
import { fetchMovies } from "../services/api";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../stores/user";

const movies = ref([]);
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const heroMovie = ref(null);
const heroIndex = ref(0);
let intervalId = null;

const genres = [
  { label: "Action", query: "action" },
  { label: "Comedy", query: "comedy" },
  { label: "Romance", query: "romance" },
  { label: "Horror", query: "horror" },
  { label: "Sci-Fi", query: "sci-fi" },
];
const genreMovies = ref({});

function setHeroMovieByIndex(idx) {
  if (movies.value && movies.value.length > 0) {
    heroMovie.value = movies.value[idx % movies.value.length];
  } else {
    heroMovie.value = null;
  }
}

async function loadMovies() {
  const query = route.query.q;
  if (query) {
    movies.value = await fetchMovies(query);
  } else {
    movies.value = await fetchMovies("popular");
  }
  heroIndex.value = 0;
  setHeroMovieByIndex(heroIndex.value);
  setupHeroRotation();
}

function setupHeroRotation() {
  if (intervalId) clearInterval(intervalId);
  if (movies.value.length < 2) return;
  intervalId = setInterval(() => {
    heroIndex.value = (heroIndex.value + 1) % movies.value.length;
    setHeroMovieByIndex(heroIndex.value);
  }, 5000);
}

async function loadGenreMovies() {
  for (const genre of genres) {
    genreMovies.value[genre.label] = await fetchMovies(genre.query);
  }
}

onMounted(async () => {
  await loadMovies();
  await loadGenreMovies();
});

watch(
  () => route.query.q,
  async () => {
    await loadMovies();
  }
);

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

function goToMovie(id) {
  router.push({ name: "movieDetails", params: { id } });
}
</script>

<style scoped>
.streaming-home {
  background: #181818;
  min-height: 100vh;
  color: #fff;
}
.hero-banner {
  position: relative;
  width: 100%;
  height: 350px;
  overflow: hidden;
  margin-bottom: 2rem;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.5);
  transition: filter 0.4s, transform 0.4s;
}
.hero-banner:hover .hero-img,
.hero-banner:focus-within .hero-img {
  filter: brightness(0.7) blur(1px);
  transform: scale(1.03);
}
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 4rem;
  z-index: 2;
  transition: background 0.3s;
}
.hero-banner:hover .hero-overlay,
.hero-banner:focus-within .hero-overlay {
  background: rgba(24, 24, 24, 0.15);
}
.hero-title,
.hero-desc {
  transition: color 0.2s, text-shadow 0.2s;
}
.hero-banner:hover .hero-title,
.hero-banner:focus-within .hero-title {
  color: #e50914;
  text-shadow: 0 2px 16px #000;
}
.hero-btn {
  background: #e50914;
  color: #fff;
  font-size: 1.1rem;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.hero-btn:hover,
.hero-btn:focus {
  background: #b0060f;
  box-shadow: 0 4px 24px #e50914aa;
  outline: none;
  transform: scale(1.04);
}
.movie-section {
  padding: 0 2rem;
}
.movie-section h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}
.movie-row {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}
</style>
