<template>
<div id="App">
    <header>
        <navBar />
    </header>
    <main style="padding-top: 80px;">
        <router-view />
    </main>
</div>
</template>

<script>
import navBar from './components/navBar.vue';
export default {
    name: "App",
    components: {
        navBar,
    },
}
</script>

<style lang="scss">
//global css can be done here
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Fira Sans', sans-serif;
}

::selection {
    background-color: rgba(66, 184, 131, 0.5); // translucent #42B883
    color: white; // optional: make selected text more readable
}

body {
    background-color: #35495E;
}

a {
    text-decoration: none;
}
</style>
