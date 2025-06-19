<template>
  <div>
    <div
      v-if="showModal && movie"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal-content">
        <button class="close-btn" @click="closeModal">&times;</button>
        <div class="header">
          <img :src="movie.Poster" :alt="movie.Title" class="poster" />
          <div class="details">
            <h1>{{ movie.Title }}</h1>
            <p>{{ movie.Year }} • {{ movie.Runtime }} • {{ movie.Genre }}</p>
            <p>{{ movie.Plot }}</p>
            <div class="rating">
              <span>IMDb Rating: ⭐ {{ movie.imdbRating }}</span>
            </div>
          </div>
        </div>
        <div class="user-interaction">
          <RatingForm :movieId="movie.imdbID" />
          <CommentList :movieId="movie.imdbID" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchMovieDetails } from "../services/api";
import RatingForm from "../components/RatingForm.vue";
import CommentList from "../components/CommentList.vue";

export default {
  name: "movieDetails",
  components: {
    RatingForm,
    CommentList,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      movie: null,
      showModal: true,
    };
  },
  async created() {
    this.movie = await fetchMovieDetails(this.id); // Fetch movie details based on ID
  },
  methods: {
    closeModal() {
      this.showModal = false;
      this.$router.push({ name: "home" });
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(24, 24, 24, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.modal-content {
  background: #232323;
  color: #fff;
  border-radius: 16px;
  max-width: 800px;
  width: 95vw;
  padding: 2rem;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #e50914;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
}
.close-btn:hover {
  background: #b0060f;
}
.header {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}
.poster {
  width: 300px;
  height: auto;
  border-radius: 8px;
}
.details {
  flex: 1;
}
.user-interaction {
  margin-top: 40px;
}
@media (max-width: 900px) {
  .modal-content {
    padding: 1rem;
    max-width: 98vw;
  }
  .header {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .poster {
    width: 100%;
    max-width: 250px;
  }
}
</style>
