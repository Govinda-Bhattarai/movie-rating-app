<template>
  <div class="comment-list">
    <h3>User Reviews</h3>
    <div v-if="comments.length > 0">
      <div v-for="comment in comments" :key="comment.id" class="comment">
        <div class="user-info">
          <img
            :src="comment.userAvatar || defaultAvatar"
            :alt="comment.user"
            class="avatar"
          />
          <div class="user-details">
            <div class="user">{{ comment.user }}</div>
            <div class="rating">Rating: {{ comment.rating }} ⭐</div>
          </div>
        </div>
        <div class="text">{{ comment.text }}</div>
        <div class="date">{{ formatDate(comment.date) }}</div>
      </div>
    </div>
    <div v-else>No reviews yet. Be the first to review!</div>
  </div>
</template>

<script>
import { fetchCommentsByMovieId } from "../services/api";
import emitter from "../eventBus";

export default {
  name: "CommentList",
  props: {
    movieId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      comments: [],
      defaultAvatar:
        "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/055f91bf-3af0-40ea-aa08-9703c4b5f150.png",
    };
  },
  methods: {
    formatDate(date) {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    async loadComments() {
      try {
        this.comments = await fetchCommentsByMovieId(this.movieId);
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    },
  },
  async mounted() {
    await this.loadComments();
  },
  watch: {
    movieId: {
      handler: "loadComments",
      immediate: true,
    },
  },
  created() {
    // Listen for review submission events
    emitter.on("review-submitted", this.loadComments);
  },
  beforeUnmount() {
    // Clean up event listener
    emitter.off("review-submitted", this.loadComments);
  },
};
</script>

<style scoped>
.comment-list {
  margin-top: 20px;
}

.comment {
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user {
  font-weight: bold;
  color: #2c3e50;
}

.rating {
  color: #42b983;
  font-size: 0.9rem;
}

.text {
  margin: 10px 0;
  line-height: 1.5;
  color: #2c3e50;
}

.date {
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
}
</style>
