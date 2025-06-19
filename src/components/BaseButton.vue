[eslint] 
/Users/govindabhattarai/Desktop/MOVIE_RATING_APP/movie-raring-app/src/components/MovieCard.vue
  14:7  error  'props' is assigned a value but never used  no-unused-vars
<!-- src/components/BaseButton.vue -->
<template>
    <button :disabled="loading" class="base-btn">
      <span v-if="loading">Loading...</span>
      <span v-else><slot /></span>
    </button>
  </template>
  <script setup>
defineProps({ loading: Boolean, type: { type: String, default: "button" } });
  </script>
  <style scoped>
  .base-btn {
    width: 100%;
    padding: 0.75rem;
    background: #42b983;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
  }
.base-btn:disabled {
  background: #b2dfdb;
  cursor: not-allowed;
}
  </style>
