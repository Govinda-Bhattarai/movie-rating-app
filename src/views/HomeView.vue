<template>
  <div class="streaming-home">
   <div
  class="hero-banner"
  @click="heroMovie && goToMovie(heroMovie.imdbID)"
  style="cursor: pointer"
>
  <img
    :class="{ 'hero-img': true, 'fade-out': isFading }"
    :src="heroMovieSrc"
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
      @click.stop="$router.push('/register')"
    >
      Join Now
    </BaseButton>

    <div class="hero-controls">
      <button @click.stop="prevHero" class="nav-btn">⏪</button>
      <button @click.stop="nextHero" class="nav-btn">⏩</button>
    </div>
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
import MovieCard from "../components/MovieCard.vue";
import BaseButton from "../components/BaseButton.vue";
import { fetchMovies } from "../services/api";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../stores/user";
import { ref, computed, onMounted, watch, onUnmounted } from "vue";


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
const isFading = ref(false);

const heroMovieSrc = computed(() => {
  if (heroMovie.value && heroMovie.value.Poster && heroMovie.value.Poster !== "N/A") {
    return heroMovie.value.Poster;
  }
  return "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1500&q=80";
});

function fadeToNextMovie(newIndex) {
  isFading.value = true;
  setTimeout(() => {
    heroIndex.value = newIndex % movies.value.length;
    setHeroMovieByIndex(heroIndex.value);
    isFading.value = false;
  }, 300);
}

function nextHero() {
  clearInterval(intervalId);
  fadeToNextMovie(heroIndex.value + 1);
  setupHeroRotation();
}

function prevHero() {
  clearInterval(intervalId);
  fadeToNextMovie((heroIndex.value - 1 + movies.value.length) % movies.value.length);
  setupHeroRotation();
}


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
    // movies.value = await fetchMovies("2024");
    const currentYear = new Date().getFullYear(); //Get current year like "2025"
    movies.value = await fetchMovies(currentYear.toString()); // Search movies by year
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
  }, 2000);
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

/* HERO BANNER STYLING */
.hero-banner {
  position: relative;
  width: 100%;
  height: 70vh; /* Full screen height */
  overflow: hidden;
  margin-bottom: 2rem;
}

.hero-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  /* filter: brightness(0.5); */
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
  padding: 4rem;
  z-index: 2;
  background: linear-gradient(
    to top,
    rgba(24, 24, 24, 0.9) 0%,
    rgba(24, 24, 24, 0.1) 100%
  );
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #fff;
  transition: color 0.2s, text-shadow 0.2s;
}

.hero-desc {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: #ddd;
}

.hero-banner:hover .hero-title,
.hero-banner:focus-within .hero-title {
  color: #0cd2ec;
  text-shadow: 0 2px 16px #000;
}

.hero-btn {
  background: #0cd2ec;
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
  background: #1a6cffcc;
  box-shadow: 0 4px 24px #1a6cffcc;
  outline: none;
  transform: scale(1.04);
}

/* MOVIE SECTIONS */
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

/* RESPONSIVENESS */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-desc {
    font-size: 1rem;
  }

  .hero-overlay {
    padding: 2rem;
    align-items: center;
    text-align: center;
  }

  .hero-btn {
    font-size: 1rem;
    padding: 0.5rem 1.5rem;
  }
}
.hero-controls {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  gap: 1rem;
  z-index: 3;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.nav-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

</style>
