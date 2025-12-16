<script setup>
import { computed, ref, inject } from "vue";
import { marked } from "marked";
import { playPop } from "../utils/sound.js";
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
    ChevronDown,
    Volume2,
} from "lucide-vue-next";

const props = defineProps({ item: Object, isRevealed: Boolean });
const emit = defineEmits(["toggle"]);
const isBookmarked = ref(false);
const askAi = inject("askAi");

const toggleBookmark = (e) => {
    e.stopPropagation();
    playPop();
    isBookmarked.value = !isBookmarked.value;
};

const askGemini = (e) => {
    e.stopPropagation();
    if (askAi) askAi(props.item.q);
};

const speakAnswer = (e) => {
    e.stopPropagation();
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(props.item.a.replace(/[*#_]/g, ""));
    u.lang = "id-ID";
    synth.speak(u);
};

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
const parsedAnswer = computed(() => marked.parse(props.item.a));
</script>

<template>
    <div
        class="group relative bg-cozy-card rounded-[32px] p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cozy-primary/5 border border-transparent hover:border-cozy-border cursor-pointer active:scale-[0.99]"
        @click="$emit('toggle', item.id)"
    >
        <div class="flex justify-between items-start mb-5">
            <div class="flex items-center gap-3">
                <div
                    class="w-12 h-12 rounded-2xl bg-cozy-bg flex items-center justify-center text-cozy-primary group-hover:bg-cozy-primary group-hover:text-white transition-colors duration-500"
                >
                    <component
                        :is="iconMap[item.icon] || Brain"
                        class="w-6 h-6"
                        stroke-width="2"
                    />
                </div>
                <span
                    class="px-3 py-1 bg-cozy-bg rounded-full text-[10px] font-bold text-cozy-muted uppercase tracking-widest border border-cozy-border"
                >
                    {{ item.tag }}
                </span>
            </div>

            <div class="flex gap-2">
                <button
                    @click="askGemini"
                    class="p-2 rounded-full hover:bg-cozy-bg text-cozy-muted hover:text-cozy-primary transition-all"
                    title="Tanya AI"
                >
                    <Sparkles class="w-5 h-5" />
                </button>
                <button
                    @click="toggleBookmark"
                    class="p-2 rounded-full hover:bg-cozy-bg transition-all"
                    :class="
                        isBookmarked
                            ? 'text-cozy-accent'
                            : 'text-cozy-muted hover:text-cozy-accent'
                    "
                >
                    <Star
                        class="w-5 h-5"
                        :class="{ 'fill-current': isBookmarked }"
                    />
                </button>
            </div>
        </div>

        <h3
            class="font-display text-xl font-bold text-cozy-text leading-snug mb-2 group-hover:text-cozy-primary transition-colors"
        >
            {{ item.q }}
        </h3>

        <div
            class="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="isRevealed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
            <div class="overflow-hidden">
                <div
                    class="pt-6 mt-2 border-t border-dashed border-cozy-border"
                >
                    <div
                        class="prose-content text-cozy-text text-base leading-relaxed opacity-90"
                        v-html="parsedAnswer"
                    ></div>
                    <div class="flex justify-end mt-6">
                        <button
                            @click="speakAnswer"
                            class="flex items-center gap-2 text-xs font-bold text-cozy-primary px-4 py-2 rounded-full bg-cozy-bg hover:bg-cozy-primary hover:text-white transition-all"
                        >
                            <Volume2 class="w-4 h-4" /> Dengar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div
            v-if="!isRevealed"
            class="mt-6 flex items-center gap-2 text-xs font-bold text-cozy-muted/40 group-hover:text-cozy-primary/70 transition-colors"
        >
            <span class="w-6 h-[2px] bg-current rounded-full"></span>
            <span>Lihat Jawaban</span>
        </div>
    </div>
</template>

<style scoped>
.prose-content :deep(strong) {
    color: var(--c-primary);
    font-weight: 700;
}
.prose-content :deep(p) {
    margin-bottom: 0.8em;
}
.prose-content :deep(ul) {
    list-style: disc;
    padding-left: 1.2em;
    margin-bottom: 0.8em;
}
</style>
