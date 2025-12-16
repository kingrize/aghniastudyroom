<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase.js";
import HeaderSection from "../components/HeaderSection.vue";
import FooterSection from "../components/FooterSection.vue";
import QuestionCard from "../components/QuestionCard.vue";
import { playPop } from "../utils/sound.js";
import { Loader2 } from "lucide-vue-next";

// --- STATE ---
const questions = ref([]);
const revealedCards = ref(new Set());
const selectedTag = ref("Semua");
const isLoading = ref(true);

// --- LOGIC: FETCH DATA ---
onMounted(async () => {
    try {
        isLoading.value = true;
        const q = query(collection(db, "courses"));
        const querySnapshot = await getDocs(q);

        let allQuestions = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.questionsList && Array.isArray(data.questionsList)) {
                allQuestions = [...allQuestions, ...data.questionsList];
            }
        });

        questions.value = allQuestions;
    } catch (error) {
        console.error("Gagal mengambil data:", error);
    } finally {
        isLoading.value = false;
    }
});

// --- LOGIC INTERAKSI ---
const toggleCard = (id) => {
    playPop();
    const newSet = new Set(revealedCards.value);
    if (newSet.has(id)) newSet.delete(id);
    else {
        newSet.clear();
        newSet.add(id);
    }
    revealedCards.value = newSet;
};

const selectFilter = (tag) => {
    playPop();
    selectedTag.value = tag;
};

// Filter Logic
const tags = computed(() => [
    "Semua",
    ...new Set(questions.value.map((q) => q.tag)),
]);

const filteredQuestions = computed(() => {
    if (selectedTag.value === "Semua") return questions.value;
    return questions.value.filter((q) => q.tag === selectedTag.value);
});
</script>

<template>
    <div
        class="min-h-screen bg-cozy-bg text-cozy-text transition-colors duration-500 pb-20"
    >
        <HeaderSection />

        <main class="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
            <div
                v-if="!isLoading && questions.length > 0"
                class="sticky top-0 z-30 bg-cozy-bg/95 backdrop-blur-xl py-4 -mx-6 px-6 md:mx-0 md:px-0 mb-8 border-b border-transparent transition-all"
            >
                <div
                    class="flex gap-3 overflow-x-auto no-scrollbar snap-x py-2"
                >
                    <button
                        v-for="tag in tags"
                        :key="tag"
                        @click="selectFilter(tag)"
                        class="snap-start px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border active:scale-95 whitespace-nowrap"
                        :class="
                            selectedTag === tag
                                ? 'bg-cozy-text text-cozy-bg border-cozy-text shadow-lg transform -translate-y-0.5'
                                : 'bg-cozy-card text-cozy-muted border-transparent hover:border-cozy-border hover:text-cozy-text'
                        "
                    >
                        {{ tag }}
                    </button>
                </div>
            </div>

            <div
                v-if="isLoading"
                class="flex flex-col items-center justify-center py-24 min-h-[40vh]"
            >
                <Loader2
                    class="w-10 h-10 text-cozy-primary animate-spin mb-4"
                />
                <p class="text-sm text-cozy-muted font-medium animate-pulse">
                    Sedang mengambil materi...
                </p>
            </div>

            <div
                v-else-if="filteredQuestions.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12"
            >
                <transition-group name="staggered-fade">
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
                v-else
                class="flex flex-col items-center justify-center py-24 min-h-[50vh] text-center"
            >
                <div class="mb-8 relative">
                    <pre
                        class="font-mono text-sm leading-[1.1] text-cozy-primary/60 animate-breathe select-none"
                    >
  /\_/\
 ( o.o )
  > ^ <
                    </pre>

                    <div
                        class="absolute inset-0 bg-cozy-primary/20 blur-3xl rounded-full animate-pulse -z-10 scale-150 opacity-30"
                    ></div>
                </div>

                <h3 class="font-display font-bold text-xl text-cozy-text mb-2">
                    Belum ada materi, Aiya.
                </h3>
                <p
                    class="text-sm text-cozy-muted max-w-xs mx-auto leading-relaxed"
                >
                    Kucing penjaga sedang menunggu Admin memasukkan soal baru.
                    Sabar ya! 🐾
                </p>
            </div>
        </main>

        <FooterSection />
    </div>
</template>

<style scoped>
/* Utility */
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* Animasi List */
.staggered-fade-enter-active,
.staggered-fade-leave-active {
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.staggered-fade-enter-from,
.staggered-fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
}
.staggered-fade-move {
    transition: transform 0.5s ease;
}

/* Animasi Kucing Bernafas (Breathing) */
/* Gerakan halus naik turun dan sedikit membesar seolah bernafas */
@keyframes breathe {
    0%,
    100% {
        transform: translateY(0) scale(1);
        opacity: 0.7;
    }
    50% {
        transform: translateY(-4px) scale(1.05);
        opacity: 1;
    }
}

.animate-breathe {
    /* Durasi 3 detik agar terlihat tenang */
    animation: breathe 3s ease-in-out infinite;
    display: inline-block; /* Agar transform scale bekerja baik */
}
</style>
