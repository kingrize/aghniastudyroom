<script setup>
import { RouterView } from "vue-router";
import AiTutor from "./components/AiTutor.vue";
</script>

<template>
    <div class="relative min-h-screen">
        <RouterView />
        <AiTutor />
    </div>
</template>
