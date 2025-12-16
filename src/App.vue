<script setup>
import { ref, provide } from "vue";
import { RouterView } from "vue-router"; // Wajib ada
import AiTutor from "./components/AiTutor.vue";
import ThemeToggle from "./components/ThemeToggle.vue";

const aiTutorRef = ref(null);

// Fungsi pemicu AI Tutor dari kartu pertanyaan
const triggerAiExplainer = (questionText) => {
    if (aiTutorRef.value) {
        const prompt = `Jelaskan secara detail: "${questionText}".`;
        aiTutorRef.value.handleExternalPrompt(prompt);
    }
};

provide("askAi", triggerAiExplainer);
</script>

<template>
    <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
            class="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-cozy-primary/20 rounded-full blur-[100px] animate-pulse"
        ></div>
        <div
            class="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-cozy-accent/20 rounded-full blur-[100px]"
        ></div>
        <div
            class="absolute bottom-[10%] left-[20%] w-[30vw] h-[30vw] bg-cozy-secondary/20 rounded-full blur-[80px]"
        ></div>
    </div>

    <RouterView />

    <ThemeToggle />
    <AiTutor ref="aiTutorRef" />
</template>
