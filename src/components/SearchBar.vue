<template>
  <form @submit.prevent="emitSearch" class="search-box">
    <input
      type="text"
      placeholder="What are you looking for?"
      v-model="search"
    />
    <input type="submit" value="Search" />
  </form>
</template>

<script>
export default {
  name: 'SearchBar',
  data() {
    return {
      search: ''
    };
  },
  methods: {
    emitSearch() {
      if (this.search.trim()) {
        this.$emit('search', this.search);
        this.search = '';
      }
    }
  }
};
</script>

<style scoped lang="scss">
.search-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px;

  input[type='text'],
  input[type='submit'] {
    width: 100%;
    max-width: 500px;
    font-size: 1rem;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  input[type='text'] {
    background-color: #496583;
    color: #fff;
    border: none;

    &::placeholder {
      color: #ccc;
    }
  }

  input[type='submit'] {
    background-color: #42b883;
    color: #fff;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    transition: background 0.3s;

    &:hover {
      background-color: #3b8070;
    }
  }
}
</style>
