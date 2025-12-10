<script setup>
import { ref, computed } from "vue";
import { questions } from "../data/questions";
import HeaderSection from "../components/HeaderSection.vue";
import FooterSection from "../components/FooterSection.vue";
import QuestionCard from "../components/QuestionCard.vue";

const revealedCards = ref(new Set());
const toggleCard = (id) => {
    if (revealedCards.value.has(id)) {
        revealedCards.value.delete(id);
    } else {
        revealedCards.value.add(id);
    }
};

const selectedTag = ref("Semua");
const tags = computed(() => ["Semua", ...new Set(questions.map((q) => q.tag))]);

const filteredQuestions = computed(() => {
    if (selectedTag.value === "Semua") return questions;
    return questions.filter((q) => q.tag === selectedTag.value);
});
</script>

<template>
    <div class="min-h-screen">
        <HeaderSection />

        <main class="max-w-3xl mx-auto px-4 md:px-6">
            <div class="flex flex-wrap gap-2 justify-center mb-8">
                <button
                    v-for="tag in tags"
                    :key="tag"
                    @click="selectedTag = tag"
                    class="px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-300 border"
                    :class="
                        selectedTag === tag
                            ? 'bg-cozy-primary text-white border-cozy-primary shadow-lg shadow-cozy-primary/20'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-cozy-primary/50 hover:text-cozy-primary'
                    "
                >
                    {{ tag.replace(/[\u{1F600}-\u{1F6FF}]/gu, "") }}
                </button>
            </div>

            <div class="space-y-4">
                <transition-group name="list">
                    <QuestionCard
                        v-for="q in filteredQuestions"
                        :key="q.id"
                        :item="q"
                        :isRevealed="revealedCards.has(q.id)"
                        @toggle="toggleCard"
                    />
                </transition-group>
            </div>

            <div
                v-if="filteredQuestions.length === 0"
                class="text-center py-10 text-gray-400"
            >
                Belum ada materi di kategori ini.
            </div>
        </main>

        <FooterSection />
    </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
    transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
</style>
