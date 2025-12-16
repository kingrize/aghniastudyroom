<script setup>
defineProps({
    isOpen: Boolean,
    title: String,
    message: String,
    confirmText: { type: String, default: "Ya, Hapus" },
    cancelText: { type: String, default: "Batal" },
    isDanger: { type: Boolean, default: false }, // Jika true, teks jadi merah
});

defineEmits(["confirm", "close"]);
</script>

<template>
    <transition name="modal">
        <div
            v-if="isOpen"
            class="fixed inset-0 z-[99999] flex items-center justify-center px-4 font-sans"
        >
            <div
                class="absolute inset-0 bg-black/30 backdrop-blur-[3px] transition-opacity"
                @click="$emit('close')"
            ></div>

            <div
                class="relative bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl w-full max-w-[300px] rounded-[20px] shadow-2xl overflow-hidden transform transition-all animate-pop-in"
            >
                <div class="p-6 text-center">
                    <h3
                        class="text-[17px] font-bold text-cozy-text mb-2 leading-snug"
                    >
                        {{ title }}
                    </h3>
                    <p class="text-[13px] text-cozy-muted leading-relaxed">
                        {{ message }}
                    </p>
                </div>

                <div
                    class="grid grid-cols-2 border-t border-gray-300/30 dark:border-gray-700/30 divide-x divide-gray-300/30 dark:divide-gray-700/30"
                >
                    <button
                        @click="$emit('close')"
                        class="py-3.5 text-[17px] font-normal text-blue-500 hover:bg-black/5 active:bg-black/10 transition-colors"
                    >
                        {{ cancelText }}
                    </button>
                    <button
                        @click="$emit('confirm')"
                        class="py-3.5 text-[17px] font-semibold hover:bg-black/5 active:bg-black/10 transition-colors"
                        :class="isDanger ? 'text-red-500' : 'text-blue-500'"
                    >
                        {{ confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
/* Animasi Pop-in ala iOS */
@keyframes popIn {
    0% {
        opacity: 0;
        transform: scale(1.1);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}
.animate-pop-in {
    animation: popIn 0.2s ease-out forwards;
}

/* Transisi Vue untuk Backdrop */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>
