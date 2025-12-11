<script setup>
import { computed, ref, inject } from "vue";
import { marked } from "marked";
import {
    Brain,
    MessageCircle,
    Dna,
    Lightbulb,
    SplitSquareHorizontal,
    Heart,
    Swords,
    Sparkles,
    BookOpen,
    Lock,
    Unlock,
    Volume2,
    Star,
    User,
    Activity,
    Users,
    Zap,
    Languages,
    Shuffle,
    Scroll,
    Search,
    PenTool,
    UserCheck,
    Coffee,
    GitMerge,
    Map,
    Eye,
    Target,
} from "lucide-vue-next";

const props = defineProps({
    item: Object,
    isRevealed: Boolean,
});

const emit = defineEmits(["toggle"]);
const isBookmarked = ref(false);

// 1. Inject Fungsi dari App.vue untuk memanggil AI Tutor
const askAi = inject("askAi");

// 2. Fungsi Bookmark
const toggleBookmark = (e) => {
    e.stopPropagation();
    isBookmarked.value = !isBookmarked.value;
};

// 3. Fungsi Tanya AI (Pemicu Chatbot)
const askGemini = (e) => {
    e.stopPropagation();
    if (askAi) {
        // Kirim pertanyaan kartu ke AI Tutor
        askAi(props.item.q);
    }
};

// 4. Fungsi Suara (Text-to-Speech) dengan Deteksi Bahasa Indonesia
const speakAnswer = (e) => {
    e.stopPropagation();

    if (!("speechSynthesis" in window)) {
        alert("Yah, browser kamu ga bisa ngomong 🥺");
        return;
    }

    const synth = window.speechSynthesis;
    synth.cancel(); // Stop suara sebelumnya

    const getIndoVoice = () => {
        const voices = synth.getVoices();
        // Prioritas 1: Google Bahasa Indonesia
        let selectedVoice = voices.find(
            (v) => v.name === "Google Bahasa Indonesia",
        );
        // Prioritas 2: Microsoft Gadis (Windows)
        if (!selectedVoice)
            selectedVoice = voices.find((v) =>
                v.name.includes("Microsoft Gadis"),
            );
        // Prioritas 3: Apapun yang berlabel ID
        if (!selectedVoice)
            selectedVoice = voices.find(
                (v) => v.lang === "id-ID" || v.lang === "id_ID",
            );
        return selectedVoice;
    };

    const speak = () => {
        const voice = getIndoVoice();
        const cleanText = props.item.a.replace(/[*#_]/g, ""); // Bersihkan simbol markdown

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "id-ID";
        if (voice) utterance.voice = voice;
        utterance.rate = 0.95; // Kecepatan sedikit lambat biar jelas
        utterance.pitch = 1.0; // Nada normal

        synth.speak(utterance);
    };

    // Chrome kadang perlu waktu muat daftar suara
    if (synth.getVoices().length === 0) {
        synth.onvoiceschanged = speak;
    } else {
        speak();
    }
};

// Icon Mapping
const iconMap = {
    Brain,
    MessageCircle,
    Dna,
    Lightbulb,
    SplitSquareHorizontal,
    Heart,
    Swords,
    Sparkles,
    BookOpen,
    User,
    Activity,
    Users,
    Zap,
    Languages,
    Shuffle,
    Scroll,
    Search,
    PenTool,
    UserCheck,
    Coffee,
    GitMerge,
    Map,
    Eye,
    Target,
};

// Render Markdown
const parsedAnswer = computed(() => marked.parse(props.item.a));
</script>

<template>
    <div
        class="relative bg-cozy-card rounded-2xl shadow-soft border border-cozy-border hover:border-cozy-primary/50 transition-all duration-300 overflow-hidden cursor-pointer group hover:-translate-y-1"
        @click="$emit('toggle', item.id)"
    >
        <div
            class="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500 ease-in-out"
            :class="
                isRevealed
                    ? 'bg-cozy-primary'
                    : 'bg-cozy-border group-hover:bg-cozy-primary/40'
            "
        ></div>

        <div class="p-5 pl-8 md:p-7 md:pl-10">
            <div class="flex justify-between items-start mb-4">
                <div class="flex flex-wrap items-center gap-2">
                    <div
                        class="flex items-center gap-2 px-3 py-1.5 bg-cozy-bg rounded-lg border border-cozy-border transition-colors duration-300"
                    >
                        <component
                            :is="iconMap[item.icon] || Brain"
                            class="w-4 h-4 text-cozy-primary"
                            stroke-width="2.5"
                        />
                        <span
                            class="text-[11px] font-bold text-cozy-muted uppercase tracking-wider"
                        >
                            {{ item.tag }}
                        </span>
                    </div>

                    <button
                        @click="toggleBookmark"
                        class="p-1.5 rounded-full hover:bg-cozy-bg transition-colors group/star"
                        title="Tandai Penting"
                    >
                        <Star
                            class="w-4 h-4 transition-all duration-300"
                            :class="
                                isBookmarked
                                    ? 'fill-cozy-accent text-cozy-accent'
                                    : 'text-cozy-border group-hover/star:text-cozy-accent'
                            "
                        />
                    </button>

                    <button
                        @click="askGemini"
                        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cozy-primary/10 text-cozy-primary text-[10px] font-bold uppercase tracking-wider hover:bg-cozy-primary hover:text-white transition-all group/ai ml-1"
                        title="Minta penjelasan detail ke AI"
                    >
                        <Sparkles
                            class="w-3.5 h-3.5 group-hover/ai:animate-spin"
                        />
                        <span>Tanya AI</span>
                    </button>
                </div>

                <span
                    class="text-cozy-muted transition-all duration-300 transform"
                    :class="
                        isRevealed
                            ? 'scale-110 opacity-100 text-cozy-primary'
                            : 'opacity-30 -rotate-12'
                    "
                >
                    <component
                        :is="isRevealed ? Unlock : Lock"
                        class="w-5 h-5"
                    />
                </span>
            </div>

            <h3
                class="font-display text-lg md:text-xl font-bold text-cozy-text mb-2 leading-relaxed transition-colors duration-300"
            >
                {{ item.q }}
            </h3>

            <div
                class="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                :class="isRevealed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
            >
                <div class="overflow-hidden">
                    <div
                        class="pt-5 mt-3 border-t border-dashed border-cozy-border relative"
                    >
                        <div
                            class="text-cozy-text/90 leading-relaxed text-sm md:text-base animate-fade-in markdown-body pr-10 transition-colors duration-300"
                            v-html="parsedAnswer"
                        ></div>

                        <button
                            @click="speakAnswer"
                            class="absolute top-5 right-0 p-2 bg-cozy-bg rounded-full text-cozy-primary hover:bg-cozy-primary hover:text-white transition-all shadow-sm active:scale-95 group/voice"
                            title="Bacakan Jawaban"
                        >
                            <Volume2
                                class="w-4 h-4 group-hover/voice:animate-pulse"
                            />
                        </button>
                    </div>
                </div>
            </div>

            <div
                v-if="!isRevealed"
                class="mt-4 flex items-center gap-2 text-xs text-cozy-muted font-medium opacity-60 group-hover:opacity-100 transition-opacity"
            >
                <span class="animate-bounce">👇</span> Ketuk untuk lihat jawaban
            </div>
        </div>
    </div>
</template>

<style>
/* Markdown Styles mengikuti Tema */
.markdown-body p {
    margin-bottom: 0.75em;
}
.markdown-body p:last-child {
    margin-bottom: 0;
}
.markdown-body strong {
    color: var(--c-primary);
    font-weight: 700;
}
.markdown-body em {
    color: var(--c-secondary);
}
.markdown-body ul {
    list-style-type: disc;
    padding-left: 1.2rem;
    margin-bottom: 0.5rem;
}
.markdown-body li {
    margin-bottom: 0.25rem;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
}
</style>
