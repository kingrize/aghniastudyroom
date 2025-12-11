<script setup>
import { ref, provide } from "vue";
import { RouterView } from "vue-router";
import AiTutor from "./components/AiTutor.vue";
import ThemeToggle from "./components/ThemeToggle.vue";

// Ref untuk mengakses komponen AiTutor
const aiTutorRef = ref(null);

// Fungsi yang akan dipanggil oleh QuestionCard
const triggerAiExplainer = (questionText) => {
    if (aiTutorRef.value) {
        // Susun prompt otomatis
        const prompt = `Jelaskan secara detail dan berikan contoh kasus nyata tentang: "${questionText}". Jawab dengan bahasa santai yang mudah dimengerti.`;

        // Panggil fungsi di dalam AiTutor
        aiTutorRef.value.handleExternalPrompt(prompt);
    }
};

// Bagikan fungsi ini ke semua anak komponen (QuestionCard)
provide("askAi", triggerAiExplainer);
</script>

<template>
    <div
        class="relative min-h-screen bg-cozy-bg text-cozy-text font-sans pb-20 selection:bg-cozy-primary selection:text-white"
    >
        <RouterView />
        <ThemeToggle />

        <AiTutor ref="aiTutorRef" />
    </div>
</template>
