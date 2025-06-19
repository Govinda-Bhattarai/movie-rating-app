<!-- src/components/BaseInput.vue -->
<template>
  <div class="input-group">
    <label v-if="label">{{ label }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="base-input"
    />
  </div>
</template>
<script setup>
defineProps({
  modelValue: String,
  label: String,
  type: { type: String, default: "text" },
  placeholder: String,
  required: Boolean,
});
</script>
<style scoped>
.input-group {
  margin-bottom: 1rem;
}
.base-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}
</style>
