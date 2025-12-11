<script setup>
import { ref, nextTick, computed } from "vue";
import { marked } from "marked";
import { contextData } from "../data/aiContext.js";
import {
    Settings,
    Key,
    Check,
    Maximize2,
    Minimize2,
    X,
    Send,
    Sparkles,
    Zap,
    MessageCircle,
} from "lucide-vue-next";

// --- STATE ---
const isOpen = ref(false);
const isFullscreen = ref(false);
const showSettings = ref(false);
const userInput = ref("");
const isLoading = ref(false);
const messages = ref([
    {
        role: "model",
        text: "Halo Aiya! 👋 Siap belajar materi Biopsikologi? Tanya aku ya! 🐻",
    },
]);
const chatContainer = ref(null);

// --- KONFIGURASI 10 API KEY ---
const selectedKeyIndex = ref(1);

const apiKeys = {
    1: import.meta.env.VITE_GEMINI_API_KEY || "",
    2: import.meta.env.VITE_GEMINI_API_KEY_2 || "",
    3: import.meta.env.VITE_GEMINI_API_KEY_3 || "",
    4: import.meta.env.VITE_GEMINI_API_KEY_4 || "",
    5: import.meta.env.VITE_GEMINI_API_KEY_5 || "",
    6: import.meta.env.VITE_GEMINI_API_KEY_6 || "",
    7: import.meta.env.VITE_GEMINI_API_KEY_7 || "",
    8: import.meta.env.VITE_GEMINI_API_KEY_8 || "",
    9: import.meta.env.VITE_GEMINI_API_KEY_9 || "",
    10: import.meta.env.VITE_GEMINI_API_KEY_10 || "",
};

// URL API (Fixed ke Gemini 2.5 Flash)
const currentApiUrl = computed(() => {
    const activeKey = apiKeys[selectedKeyIndex.value];
    return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;
});

const parseMarkdown = (text) => marked.parse(text);

// --- FUNGSI KIRIM ---
const sendMessage = async () => {
    if (!userInput.value.trim()) return;

    const currentKey = apiKeys[selectedKeyIndex.value];
    if (!currentKey) {
        messages.value.push({
            role: "model",
            text: `⚠️ **Energy Cell ${selectedKeyIndex.value} Kosong!**\nSilakan isi API Key di file .env atau ganti cell lain di pengaturan ⚙️.`,
        });
        return;
    }

    const userText = userInput.value;
    messages.value.push({ role: "user", text: userText });
    userInput.value = "";
    isLoading.value = true;
    scrollToBottom();

    try {
        const promptText = `
      ${contextData}
      [SISTEM] Model: Gemini 2.5 Flash
      History: ${messages.value
          .slice(-6)
          .map((m) => `${m.role}: ${m.text}`)
          .join("\n")}
      User: ${userText}
      Instruksi: Jawab dengan format Markdown rapi.
    `;

        const response = await fetch(currentApiUrl.value, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error?.code === 429) {
                throw new Error(
                    `⚡ Energi Habis (Limit)! Ganti ke Cell ${selectedKeyIndex.value + 1} di pengaturan ⚙️`,
                );
            }
            throw new Error(data.error?.message || "Gagal menghubungi API");
        }

        const reply = data.candidates[0].content.parts[0].text;
        messages.value.push({ role: "model", text: reply });
    } catch (error) {
        messages.value.push({
            role: "model",
            text: `Duh error nih: ${error.message} 🥺`,
        });
    } finally {
        isLoading.value = false;
        scrollToBottom();
    }
};

const scrollToBottom = async () => {
    await nextTick();
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
};

// --- FUNGSI EKSTERNAL ---
const handleExternalPrompt = (prompt) => {
    isOpen.value = true;
    isFullscreen.value = true;
    userInput.value = prompt;
    sendMessage();
};

defineExpose({ handleExternalPrompt });
</script>

<template>
    <div class="fixed bottom-6 right-6 z-[9999] font-sans">
        <button
            v-if="!isOpen"
            @click="isOpen = true"
            class="group relative w-16 h-16 flex items-center justify-center bg-white rounded-[20px] shadow-soft border-2 border-white hover:scale-110 hover:-rotate-6 transition-all duration-300"
        >
            <div
                class="absolute inset-0 bg-cozy-primary/10 rounded-[18px] animate-pulse"
            ></div>
            <span
                class="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform"
                >🤖</span
            >

            <span
                class="absolute -top-1 -right-1 w-4 h-4 bg-cozy-accent rounded-full border-2 border-white flex items-center justify-center"
            >
                <span
                    class="w-1.5 h-1.5 bg-white rounded-full animate-ping"
                ></span>
            </span>
        </button>

        <div
            v-if="isOpen"
            class="bg-cozy-card/95 backdrop-blur-xl shadow-2xl border border-cozy-border overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            :class="
                isFullscreen
                    ? 'fixed inset-0 w-full h-full rounded-none z-[10000]'
                    : 'absolute bottom-20 right-0 w-[90vw] md:w-[420px] h-[650px] rounded-[32px] origin-bottom-right animate-pop-up'
            "
        >
            <div
                class="flex items-center justify-between px-6 py-5 shrink-0 z-20 relative"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-cozy-bg border border-cozy-border flex items-center justify-center text-xl shadow-sm"
                    >
                        🤖
                    </div>
                    <div class="flex flex-col">
                        <h3
                            class="font-display font-bold text-cozy-text text-base leading-none"
                        >
                            Tutor Aiya
                        </h3>
                        <div class="flex items-center gap-1.5 mt-1">
                            <span class="relative flex h-2 w-2">
                                <span
                                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                                ></span>
                                <span
                                    class="relative inline-flex rounded-full h-2 w-2 bg-green-500"
                                ></span>
                            </span>
                            <span
                                class="text-[10px] font-bold text-cozy-muted uppercase tracking-wider"
                            >
                                Online • Cell {{ selectedKeyIndex }}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    class="flex items-center gap-1 bg-cozy-bg/50 p-1 rounded-full border border-cozy-border/50"
                >
                    <button
                        @click="showSettings = !showSettings"
                        class="p-2 rounded-full hover:bg-white text-cozy-secondary hover:text-cozy-primary transition-all"
                        title="Settings"
                    >
                        <Settings
                            class="w-4 h-4"
                            :class="{ 'animate-spin-slow': showSettings }"
                        />
                    </button>
                    <button
                        @click="isFullscreen = !isFullscreen"
                        class="p-2 rounded-full hover:bg-white text-cozy-secondary hover:text-cozy-primary transition-all"
                    >
                        <component
                            :is="isFullscreen ? Minimize2 : Maximize2"
                            class="w-4 h-4"
                        />
                    </button>
                    <button
                        @click="isOpen = false"
                        class="p-2 rounded-full hover:bg-red-50 text-cozy-secondary hover:text-red-400 transition-all"
                    >
                        <X class="w-4 h-4" />
                    </button>
                </div>
            </div>

            <transition name="slide-down">
                <div
                    v-if="showSettings"
                    class="absolute top-[80px] left-4 right-4 z-30"
                >
                    <div
                        class="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-cozy-border p-5"
                    >
                        <div class="flex items-center justify-between mb-4">
                            <h4
                                class="text-xs font-bold text-cozy-muted uppercase tracking-widest flex items-center gap-2"
                            >
                                <Zap class="w-3 h-3 text-cozy-accent" /> Sumber
                                Energi
                            </h4>
                            <span
                                class="text-[10px] text-cozy-muted bg-cozy-bg px-2 py-1 rounded-md"
                            >
                                Ganti jika kuota habis
                            </span>
                        </div>

                        <div class="grid grid-cols-5 gap-3">
                            <button
                                v-for="i in 10"
                                :key="i"
                                @click="selectedKeyIndex = i"
                                class="group relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-300"
                                :class="
                                    selectedKeyIndex === i
                                        ? 'bg-cozy-primary/10 border-cozy-primary ring-2 ring-cozy-primary/20 scale-105'
                                        : 'bg-cozy-bg border-transparent hover:border-cozy-secondary/30 hover:bg-white'
                                "
                            >
                                <div
                                    class="w-full h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
                                    :class="[
                                        !apiKeys[i]
                                            ? 'bg-gray-100 text-gray-300'
                                            : selectedKeyIndex === i
                                              ? 'bg-gradient-to-br from-cozy-primary to-rose-400 text-white shadow-md'
                                              : 'bg-white border border-cozy-border text-cozy-secondary group-hover:border-cozy-primary/30',
                                    ]"
                                >
                                    {{ i }}
                                </div>

                                <div
                                    class="w-1.5 h-1.5 rounded-full transition-colors"
                                    :class="
                                        apiKeys[i]
                                            ? selectedKeyIndex === i
                                                ? 'bg-green-400'
                                                : 'bg-cozy-secondary/40'
                                            : 'bg-red-300'
                                    "
                                ></div>
                            </button>
                        </div>
                    </div>
                </div>
            </transition>

            <div
                ref="chatContainer"
                class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-gradient-to-b from-cozy-bg/50 to-cozy-bg relative"
            >
                <div
                    v-if="showSettings"
                    @click="showSettings = false"
                    class="absolute inset-0 bg-white/60 z-20 backdrop-blur-[2px] transition-all"
                ></div>

                <div
                    v-for="(msg, index) in messages"
                    :key="index"
                    class="group flex gap-3 animate-fade-up"
                    :class="
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    "
                >
                    <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 shadow-sm mt-auto mb-1"
                        :class="
                            msg.role === 'user'
                                ? 'bg-cozy-accent text-white'
                                : 'bg-white border border-cozy-border text-2xl'
                        "
                    >
                        {{ msg.role === "user" ? "👩" : "🐻" }}
                    </div>

                    <div
                        class="max-w-[85%] px-5 py-3.5 text-sm shadow-sm transition-all duration-300 hover:shadow-md"
                        :class="
                            msg.role === 'user'
                                ? 'bg-gradient-to-br from-cozy-primary to-rose-400 text-white rounded-[24px] rounded-br-sm'
                                : 'bg-white text-cozy-text border border-cozy-border rounded-[24px] rounded-bl-sm prose-content'
                        "
                    >
                        <div
                            v-if="msg.role === 'model'"
                            v-html="parseMarkdown(msg.text)"
                        ></div>
                        <div v-else>{{ msg.text }}</div>
                    </div>
                </div>

                <div v-if="isLoading" class="flex gap-3">
                    <div
                        class="w-8 h-8 rounded-full bg-white border border-cozy-border flex items-center justify-center text-lg shrink-0"
                    >
                        🐻
                    </div>
                    <div
                        class="bg-white border border-cozy-border px-4 py-3 rounded-[24px] rounded-bl-sm flex gap-1.5 items-center shadow-sm"
                    >
                        <span
                            class="w-1.5 h-1.5 bg-cozy-primary/60 rounded-full animate-bounce"
                        ></span>
                        <span
                            class="w-1.5 h-1.5 bg-cozy-primary/60 rounded-full animate-bounce delay-100"
                        ></span>
                        <span
                            class="w-1.5 h-1.5 bg-cozy-primary/60 rounded-full animate-bounce delay-200"
                        ></span>
                    </div>
                </div>
            </div>

            <div class="p-4 bg-cozy-bg/50 backdrop-blur-sm relative z-20">
                <form
                    @submit.prevent="sendMessage"
                    class="flex items-center gap-2 bg-white p-2 pl-4 rounded-full border border-cozy-border shadow-lg shadow-cozy-primary/5 focus-within:ring-2 focus-within:ring-cozy-primary/20 focus-within:border-cozy-primary/50 transition-all duration-300 transform focus-within:-translate-y-1"
                >
                    <Sparkles
                        class="w-4 h-4 text-cozy-accent shrink-0 animate-pulse"
                    />

                    <input
                        v-model="userInput"
                        type="text"
                        placeholder="Tanya materi apa saja..."
                        class="flex-1 bg-transparent text-cozy-text text-sm outline-none placeholder:text-cozy-muted/60 h-9 font-medium"
                    />

                    <button
                        type="submit"
                        :disabled="isLoading || !userInput"
                        class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:scale-95"
                        :class="
                            userInput
                                ? 'bg-cozy-primary text-white shadow-md rotate-0'
                                : 'bg-cozy-bg text-cozy-muted rotate-90'
                        "
                    >
                        <Send
                            class="w-4 h-4"
                            :class="{ 'ml-0.5': userInput }"
                        />
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<style>
/* Animasi Masuk Chatbox */
@keyframes popUp {
    0% {
        opacity: 0;
        transform: scale(0.9) translateY(40px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
.animate-pop-up {
    animation: popUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Animasi Pesan Baru */
@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-up {
    animation: fadeUp 0.3s ease-out forwards;
}

/* Animasi Settings Slide */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
}

/* Custom Scrollbar biar rapi */
::-webkit-scrollbar {
    width: 6px;
}
::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}
::-webkit-scrollbar-track {
    background: transparent;
}

/* Markdown Styles (Lebih Rapi) */
.prose-content {
    line-height: 1.6;
}
.prose-content strong {
    color: var(--c-primary);
    font-weight: 700;
}
.prose-content ul {
    padding-left: 1.2em;
    list-style-type: disc;
    margin-bottom: 0.5em;
}
.prose-content li {
    margin-bottom: 0.2em;
}
.prose-content p {
    margin-bottom: 0.8em;
}
.prose-content p:last-child {
    margin-bottom: 0;
}
</style>
