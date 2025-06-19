<template>
  <div class="rating-form">
    <h3>Rate this movie</h3>

    <div class="stars">
      <span 
        v-for="star in 5" 
        :key="star" 
        @click="setRating(star)"
        :class="{ active: star <= rating }"
      >⭐</span>
    </div>

    <textarea v-model="comment" placeholder="Add your review..."></textarea>

    <button @click="submitRating" :disabled="!rating || loading">
      {{ loading ? 'Submitting...' : 'Submit' }}
    </button>

    <p v-if="success" style="color: green;">Thanks for your review!</p>
    <p v-if="error" style="color: red;">{{ error }}</p>
  </div>
</template>

<script>
import { submitMovieRating } from '../services/api'
import { useUserStore } from '../stores/user'
import emitter from '../eventBus'

export default {
  name: 'RatingForm',
  props: {
    movieId: {
      type: String,
      required: true
    }
  },
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  data() {
    return {
      rating: 0,
      comment: '',
      loading: false,
      success: false,
      error: null
    }
  },
  computed: {
    isAuthenticated() {
      return this.userStore.isAuthenticated
    }
  },
  methods: {
    setRating(star) {
      if (!this.isAuthenticated) {
        this.error = 'Please login to rate movies'
        return
      }
      this.rating = star
    },
    async submitRating() {
      if (!this.isAuthenticated) {
        this.error = 'Please login to submit a rating'
        return
      }

      this.loading = true
      this.success = false
      this.error = null

      try {
        await submitMovieRating({
          movieId: this.movieId,
          rating: this.rating,
          comment: this.comment,
          userId: this.userStore.user.id,
          userName: this.userStore.user.name
        })

        this.success = true
        this.rating = 0
        this.comment = ''
        emitter.emit('review-submitted')
      } catch (err) {
        console.error('Error submitting review:', err)
        this.error = err.message || 'Failed to submit your review. Please try again.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.rating-form {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.stars {
  margin: 10px 0;
  font-size: 24px;
  cursor: pointer;
}

.stars span {
  opacity: 0.5;
  transition: opacity 0.2s;
}

.stars span.active {
  opacity: 1;
}

textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
