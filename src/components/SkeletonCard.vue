<template>
    <div
        class="relative bg-white/40 backdrop-blur-md rounded-[28px] p-6 border border-white/20 shadow-sm overflow-hidden"
    >
        <div
            class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"
        ></div>

        <div class="flex justify-between items-start mb-4 opacity-50">
            <div class="h-8 w-24 bg-cozy-muted/10 rounded-xl"></div>
            <div class="h-6 w-6 bg-cozy-muted/10 rounded-full"></div>
        </div>

        <div class="space-y-3 mb-6 opacity-50">
            <div class="h-6 w-3/4 bg-cozy-muted/10 rounded-lg"></div>
            <div class="h-6 w-1/2 bg-cozy-muted/10 rounded-lg"></div>
        </div>

        <div class="mt-4 flex gap-2 opacity-30">
            <div class="h-4 w-24 bg-cozy-muted/10 rounded-md"></div>
        </div>
    </div>
</template>

<style scoped>
@keyframes shimmer {
    100% {
        transform: translateX(100%);
    }
}
</style>
