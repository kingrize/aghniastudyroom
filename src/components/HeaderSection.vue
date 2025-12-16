<script setup>
import { computed } from "vue";
import { Sparkles } from "lucide-vue-next";

const greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 11) return "Selamat Pagi";
    if (h < 15) return "Selamat Siang";
    if (h < 18) return "Selamat Sore";
    return "Selamat Malam";
});
</script>

<template>
    <header class="pt-16 pb-8 px-6 md:px-12 max-w-6xl mx-auto">
        <div class="flex flex-col gap-3 animate-fade-in-down">
            <div
                class="flex items-center gap-2 text-cozy-primary font-bold text-xs tracking-[0.2em] uppercase opacity-80"
            >
                <span class="w-8 h-[1px] bg-cozy-primary"></span>
                <span>Ruang Belajar Aghnia</span>
            </div>

            <h1
                class="font-display text-4xl md:text-6xl font-bold text-cozy-text leading-[1.1] tracking-tight"
            >
                {{ greeting }},<br />
                <span class="text-cozy-muted opacity-50"
                    >Siap Review Materi?</span
                >
            </h1>

            <p
                class="text-cozy-muted text-sm md:text-base max-w-lg leading-relaxed mt-4 border-l-2 border-cozy-primary/30 pl-4"
            >
                Kumpulan catatan ringkas Psikologi untuk persiapan ujian lisan.
                Santai saja, pelajari satu per satu ya! 🌱
            </p>
        </div>
    </header>
</template>

<style scoped>
@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in-down {
    animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
