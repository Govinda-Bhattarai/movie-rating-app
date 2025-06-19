<template>
  <div class="stream-movie-card" @click="$emit('click')" tabindex="0">
    <img :src="movie.Poster" :alt="movie.Title" class="stream-poster" />
    <div class="stream-info">
      <h3>{{ movie.Title }}</h3>
      <p>{{ movie.Year }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({ movie: Object });
</script>

<style scoped>
.stream-movie-card {
  min-width: 180px;
  background: #232323;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  outline: none;
}
.stream-movie-card:hover,
.stream-movie-card:focus {
  transform: scale(1.07);
  box-shadow: 0 4px 24px rgba(229, 9, 20, 0.3);
  border: 2px solid #e50914;
}
.stream-poster {
  width: 100%;
  height: 270px;
  object-fit: cover;
}
.stream-info {
  padding: 0.75rem;
  color: #fff;
}
.stream-info h3 {
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
}
.stream-info p {
  color: #b3b3b3;
  font-size: 0.95rem;
  margin: 0;
}
</style>
