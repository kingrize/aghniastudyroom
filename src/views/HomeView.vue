<script setup>
import { ref, computed, onMounted } from "vue";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase.js";
import HeaderSection from "../components/HeaderSection.vue";
import FooterSection from "../components/FooterSection.vue";
import QuestionCard from "../components/QuestionCard.vue";
import { playPop } from "../utils/sound.js";
import { Loader2, Bot } from "lucide-vue-next";

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

// --- INTERAKSI ---
const toggleCard = (id) => {
    playPop();
    const newSet = new Set(revealedCards.value);

    // Accordion Mode
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.clear();
        newSet.add(id);
    }
    revealedCards.value = newSet;
};

const selectFilter = (tag) => {
    playPop();
    selectedTag.value = tag;
};

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
        class="min-h-screen bg-cozy-bg text-cozy-text transition-colors duration-500 pb-20 font-sans"
    >
        <HeaderSection />

        <main class="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
            <div v-if="!isLoading && questions.length > 0">
                <router-link
                    to="/quiz"
                    @click="playPop"
                    class="fixed bottom-24 left-6 z-40 group"
                >
                    <div
                        class="w-14 h-14 flex items-center justify-center bg-cozy-card rounded-2xl shadow-xl shadow-cozy-shadow border border-cozy-border hover:scale-110 hover:-rotate-6 hover:border-cozy-primary transition-all duration-300 ease-spring relative overflow-hidden"
                    >
                        <div
                            class="absolute inset-0 bg-cozy-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        ></div>

                        <Bot
                            class="w-7 h-7 text-cozy-text group-hover:text-cozy-primary group-hover:animate-wiggle transition-colors relative z-10"
                        />

                        <span
                            class="absolute top-3 right-3 w-2.5 h-2.5 bg-cozy-accent rounded-full border-2 border-cozy-card animate-pulse z-10"
                        ></span>
                    </div>

                    <div
                        class="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-cozy-text text-cozy-bg text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap shadow-lg pointer-events-none"
                    >
                        Ujian Dadakan
                        <div
                            class="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-cozy-text"
                        ></div>
                    </div>
                </router-link>
            </div>

            <div
                v-if="!isLoading && questions.length > 0"
                class="sticky top-0 z-30 bg-cozy-bg/95 backdrop-blur-xl py-4 -mx-6 px-6 md:mx-0 md:px-0 mb-8 border-b border-transparent transition-all"
            >
                <div
                    class="flex gap-3 overflow-x-auto no-scrollbar snap-x py-2 justify-start md:justify-center"
                >
                    <button
                        v-for="tag in tags"
                        :key="tag"
                        @click="selectFilter(tag)"
                        class="snap-start px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border active:scale-95 whitespace-nowrap"
                        :class="
                            selectedTag === tag
                                ? 'bg-cozy-text text-cozy-bg border-cozy-text shadow-md transform -translate-y-0.5'
                                : 'bg-transparent text-cozy-muted border-transparent hover:bg-cozy-card hover:text-cozy-text'
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
                <div class="relative mb-6">
                    <div
                        class="w-12 h-12 bg-cozy-primary/10 rounded-full flex items-center justify-center animate-pulse"
                    >
                        <Loader2
                            class="w-6 h-6 text-cozy-primary animate-spin"
                        />
                    </div>
                </div>
                <p
                    class="text-xs text-cozy-muted font-bold tracking-widest animate-pulse"
                >
                    MEMUAT MATERI...
                </p>
            </div>

            <div
                v-else-if="filteredQuestions.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 gap-5 pb-12"
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
                <div class="mb-8 relative group cursor-default">
                    <pre
                        class="font-mono text-sm leading-[1.1] text-cozy-primary/60 animate-breathe select-none transition-colors group-hover:text-cozy-primary"
                    >
  /\_/\
 ( o.o )
  > ^ <
                    </pre>
                    <div
                        class="absolute inset-0 bg-cozy-primary/20 blur-3xl rounded-full animate-pulse -z-10 scale-150 opacity-30"
                    ></div>
                </div>

                <h3 class="font-display font-bold text-lg text-cozy-text mb-2">
                    Belum ada materi nih :D
                </h3>
                <p
                    class="text-xs text-cozy-muted max-w-[250px] mx-auto leading-relaxed"
                >
                    Miaww~
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

/* Animasi Spring Physics */
.ease-spring {
    transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Animasi Wiggle untuk Robot */
@keyframes wiggle {
    0%,
    100% {
        transform: rotate(0deg);
    }
    25% {
        transform: rotate(-10deg);
    }
    75% {
        transform: rotate(10deg);
    }
}
.animate-wiggle {
    animation: wiggle 0.5s ease-in-out infinite;
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

/* Animasi Kucing Bernafas */
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
    animation: breathe 3s ease-in-out infinite;
    display: inline-block;
}
</style>
