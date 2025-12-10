<script setup>
defineProps({
    item: Object,
    isRevealed: Boolean,
});

defineEmits(["toggle"]);
</script>

<template>
    <div
        class="relative bg-white rounded-2xl shadow-soft border border-white hover:border-cozy-primary/30 transition-all duration-300 overflow-hidden cursor-pointer group hover:-translate-y-1"
        @click="$emit('toggle', item.id)"
    >
        <div
            class="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-500 ease-in-out"
            :class="
                isRevealed
                    ? 'bg-cozy-primary'
                    : 'bg-gray-100 group-hover:bg-cozy-primary/40'
            "
        ></div>

        <div class="p-5 pl-8 md:p-7 md:pl-10">
            <div class="flex justify-between items-center mb-3">
                <span
                    class="px-3 py-1 bg-cozy-bg text-cozy-secondary text-[10px] font-bold rounded-lg uppercase tracking-wider border border-cozy-secondary/10"
                >
                    {{ item.tag }}
                </span>
                <span
                    class="text-lg transition-all duration-300 transform"
                    :class="
                        isRevealed
                            ? 'scale-110 rotate-0'
                            : 'opacity-40 grayscale -rotate-12'
                    "
                >
                    {{ isRevealed ? "💡" : "🔒" }}
                </span>
            </div>

            <h3
                class="font-display text-lg md:text-xl font-bold text-cozy-text mb-2 leading-relaxed"
            >
                {{ item.q }}
            </h3>

            <div
                class="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                :class="isRevealed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
            >
                <div class="overflow-hidden">
                    <div
                        class="pt-4 mt-4 border-t border-dashed border-gray-100 text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line animate-fade-in"
                    >
                        {{ item.a }}
                    </div>
                </div>
            </div>

            <div
                v-if="!isRevealed"
                class="mt-3 flex items-center gap-2 text-xs text-cozy-secondary/70 font-medium opacity-60 group-hover:opacity-100 transition-opacity"
            >
                <span>👇</span> Ketuk untuk lihat jawaban
            </div>
        </div>
    </div>
</template>

<style scoped>
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
