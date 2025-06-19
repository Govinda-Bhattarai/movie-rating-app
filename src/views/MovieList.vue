<template>
  <div class="movie-list">
    <SearchBar @search="handleSearch" />
    <div class="movies">
      <MovieCard
        v-for="movie in filteredMovies"
        :key="movie.imdbID"
        :movie="movie"
        @click="goToMovie(movie.imdbID)"
      />
    </div>
  </div>
</template>

<script>
import MovieCard from "../components/MovieCard.vue";
import SearchBar from "../components/SearchBar.vue";
import { fetchMovies } from "@/services/api"; // ✅ Use curly braces

export default {
  name: "MovieList",
  components: {
    MovieCard,
    SearchBar,
  },
  data() {
    return {
      movies: [],
    };
  },
  computed: {
    filteredMovies() {
      return (this.movies || []).filter((m) => m && m.imdbID);
    },
  },
  async created() {
    this.movies = await fetchMovies("popular"); // Fetch popular movies on component creation
  },
  methods: {
    async handleSearch(query) {
      this.movies = await fetchMovies(query); // Fetch movies based on search query
    },
    goToMovie(id) {
      this.$router.push({ name: "movieDetails", params: { id } });
    },
  },
};
</script>

<style scoped>
.movies {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
</style>
