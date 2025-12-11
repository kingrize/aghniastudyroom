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
    BrainCircuit,
    Cpu,
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
        text: "Halo Aiya! 👋 Mau ditemenin belajar sama siapa? Pilih otak AI favoritmu di pengaturan ya! 🐻",
    },
]);
const chatContainer = ref(null);

// --- CONFIG PROVIDER ---
const currentProvider = ref("gemini"); // Default
const selectedKeyIndex = ref(1); // Khusus Gemini

const providers = {
    gemini: {
        name: "Gemini 2.5 Flash",
        icon: "✨",
        desc: "Cerdas & Gratis (Google)",
        hasMultiKey: true,
    },
    groq: {
        name: "Groq (Llama 3.3)", // <-- Update Nama
        icon: "⚡",
        desc: "Super Cepat (Meta)",
        hasMultiKey: false,
    },
};

// LOAD API KEYS
const apiKeys = {
    gemini: {
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
    },
    groq: import.meta.env.VITE_GROQ_API_KEY || "",
};

const parseMarkdown = (text) => marked.parse(text);

// --- LOGIC KIRIM ---
const sendMessage = async () => {
    if (!userInput.value.trim()) return;

    // 1. Tentukan Key Aktif
    let activeKey = "";
    if (currentProvider.value === "gemini") {
        activeKey = apiKeys.gemini[selectedKeyIndex.value];
    } else {
        activeKey = apiKeys.groq;
    }

    // 2. Cek Ketersediaan Key
    if (!activeKey) {
        messages.value.push({
            role: "model",
            text: `⚠️ **Kunci ${providers[currentProvider.value].name} Kosong!**\nSilakan isi API Key di file .env dulu ya sayang.`,
        });
        return;
    }

    const userText = userInput.value;
    messages.value.push({ role: "user", text: userText });
    userInput.value = "";
    isLoading.value = true;
    scrollToBottom();

    // 3. Konteks System
    const systemInstruction = `
    ${contextData}
    [SISTEM] Model Aktif: ${providers[currentProvider.value].name}
    Instruksi: Jawab dengan format Markdown rapi.
  `;

    try {
        let reply = "";

        // --- JALUR GEMINI ---
        if (currentProvider.value === "gemini") {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`;
            const historyGemini = messages.value
                .slice(-6)
                .map((m) => ({
                    role: m.role === "user" ? "user" : "model",
                    parts: [{ text: m.text }],
                }));

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        { role: "user", parts: [{ text: systemInstruction }] },
                        ...historyGemini,
                        { role: "user", parts: [{ text: userText }] },
                    ],
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                if (data.error?.code === 429)
                    throw new Error(
                        "Kuota Habis! Ganti slot baterai di pengaturan ⚙️",
                    );
                throw new Error(data.error?.message || "Gemini Error");
            }
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

            // --- JALUR GROQ ---
        } else {
            const response = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${activeKey}`,
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile", // <-- UPDATE MODEL TERBARU
                        messages: [
                            { role: "system", content: systemInstruction },
                            ...messages.value.slice(-6).map((m) => ({
                                role: m.role === "model" ? "assistant" : "user",
                                content: m.text,
                            })),
                            { role: "user", content: userText },
                        ],
                        temperature: 0.7,
                    }),
                },
            );

            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error?.message || "Groq Error");
            reply = data.choices?.[0]?.message?.content;
        }

        messages.value.push({
            role: "model",
            text: reply || "Maaf, otakku nge-blank.",
        });
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
    if (chatContainer.value)
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
};

// External Call
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
            class="group relative w-16 h-16 flex items-center justify-center bg-cozy-card rounded-[20px] shadow-soft border-2 border-cozy-border hover:scale-110 hover:-rotate-6 transition-all duration-300"
        >
            <div
                class="absolute inset-0 bg-cozy-primary/10 rounded-[18px] animate-pulse"
            ></div>
            <span
                class="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform"
                >🤖</span
            >
            <span
                class="absolute -top-1 -right-1 w-4 h-4 bg-cozy-accent rounded-full border-2 border-cozy-card flex items-center justify-center"
            >
                <span
                    class="w-1.5 h-1.5 bg-cozy-card rounded-full animate-ping"
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
                class="flex items-center justify-between px-6 py-5 shrink-0 z-20 relative bg-gradient-to-r from-cozy-grad-start/5 to-cozy-grad-end/5 border-b border-cozy-border"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-full bg-cozy-bg border border-cozy-border flex items-center justify-center text-xl shadow-sm"
                    >
                        {{ providers[currentProvider].icon }}
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
                                {{ providers[currentProvider].name }}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    class="flex items-center gap-1 bg-cozy-bg/50 p-1 rounded-full border border-cozy-border/50"
                >
                    <button
                        @click="showSettings = !showSettings"
                        class="p-2 rounded-full hover:bg-cozy-card text-cozy-secondary hover:text-cozy-primary transition-all"
                        :class="{
                            'bg-cozy-primary/10 text-cozy-primary':
                                showSettings,
                        }"
                    >
                        <Settings
                            class="w-4 h-4"
                            :class="{ 'animate-spin-slow': showSettings }"
                        />
                    </button>
                    <button
                        @click="isFullscreen = !isFullscreen"
                        class="p-2 rounded-full hover:bg-cozy-card text-cozy-secondary hover:text-cozy-primary transition-all"
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
                    class="absolute top-[80px] left-4 right-4 z-30 bg-cozy-card/95 backdrop-blur-md rounded-2xl shadow-xl border border-cozy-border p-5 flex flex-col gap-5 max-h-[80%] overflow-y-auto"
                >
                    <div>
                        <h4
                            class="text-xs font-bold text-cozy-muted uppercase tracking-widest flex items-center gap-2 mb-3"
                        >
                            <BrainCircuit class="w-3 h-3 text-cozy-accent" />
                            Pilih Otak AI
                        </h4>
                        <div class="flex flex-col gap-2">
                            <button
                                v-for="(prov, key) in providers"
                                :key="key"
                                @click="currentProvider = key"
                                class="flex items-center justify-between p-3 rounded-xl border transition-all text-left group"
                                :class="
                                    currentProvider === key
                                        ? 'bg-cozy-bg border-cozy-primary ring-1 ring-cozy-primary/30'
                                        : 'bg-cozy-card border-cozy-border hover:border-cozy-secondary/50'
                                "
                            >
                                <div class="flex items-center gap-3">
                                    <span class="text-xl">{{ prov.icon }}</span>
                                    <div>
                                        <div
                                            class="font-bold text-sm text-cozy-text"
                                        >
                                            {{ prov.name }}
                                        </div>
                                        <div
                                            class="text-[10px] text-cozy-muted"
                                        >
                                            {{ prov.desc }}
                                        </div>
                                    </div>
                                </div>
                                <Check
                                    v-if="currentProvider === key"
                                    class="w-4 h-4 text-cozy-primary"
                                />
                            </button>
                        </div>
                    </div>

                    <div v-if="providers[currentProvider].hasMultiKey">
                        <h4
                            class="text-xs font-bold text-cozy-muted uppercase tracking-widest flex items-center gap-2 mb-3"
                        >
                            <Zap class="w-3 h-3 text-cozy-accent" /> Slot Energi
                            (Gemini)
                        </h4>
                        <div class="grid grid-cols-5 gap-3">
                            <button
                                v-for="i in 10"
                                :key="i"
                                @click="selectedKeyIndex = i"
                                class="group relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-300"
                                :class="
                                    selectedKeyIndex === i
                                        ? 'bg-cozy-primary/10 border-cozy-primary ring-2 ring-cozy-primary/20 scale-105'
                                        : 'bg-cozy-bg border-transparent hover:border-cozy-secondary/30 hover:bg-cozy-card'
                                "
                            >
                                <div
                                    class="w-full h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
                                    :class="[
                                        !apiKeys.gemini[i]
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-300'
                                            : selectedKeyIndex === i
                                              ? 'bg-gradient-to-br from-cozy-grad-start to-cozy-grad-end text-white shadow-md'
                                              : 'bg-cozy-card border border-cozy-border text-cozy-secondary group-hover:border-cozy-primary/30',
                                    ]"
                                >
                                    {{ i }}
                                </div>
                                <div
                                    class="w-1.5 h-1.5 rounded-full transition-colors"
                                    :class="
                                        apiKeys.gemini[i]
                                            ? selectedKeyIndex === i
                                                ? 'bg-green-400'
                                                : 'bg-cozy-secondary/40'
                                            : 'bg-red-300'
                                    "
                                ></div>
                            </button>
                        </div>
                    </div>

                    <div v-else>
                        <p
                            class="text-xs text-cozy-muted bg-cozy-bg p-3 rounded-lg border border-cozy-border"
                        >
                            ℹ️ AI ini menggunakan 1 Kunci Utama. Pastikan
                            <code>VITE_GROQ_API_KEY</code> sudah ada di .env.
                        </p>
                    </div>
                </div>
            </transition>

            <div
                ref="chatContainer"
                class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-cozy-bg relative"
            >
                <div
                    v-if="showSettings"
                    @click="showSettings = false"
                    class="absolute inset-0 bg-cozy-bg/60 z-20 backdrop-blur-[2px] transition-all"
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
                                : 'bg-cozy-card border border-cozy-border text-2xl'
                        "
                    >
                        {{ msg.role === "user" ? "👩" : "🐻" }}
                    </div>

                    <div
                        class="max-w-[85%] px-5 py-3.5 text-sm shadow-sm transition-all duration-300"
                        :class="
                            msg.role === 'user'
                                ? 'bg-cozy-user-bg text-cozy-user-text font-medium rounded-[24px] rounded-br-sm'
                                : 'bg-cozy-card text-cozy-text border border-cozy-border rounded-[24px] rounded-bl-sm prose-content'
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
                        class="w-8 h-8 rounded-full bg-cozy-card border border-cozy-border flex items-center justify-center text-lg shrink-0"
                    >
                        🐻
                    </div>
                    <div
                        class="bg-cozy-card border border-cozy-border px-4 py-3 rounded-[24px] rounded-bl-sm flex gap-1.5 items-center shadow-sm"
                    >
                        <span
                            class="w-1.5 h-1.5 bg-cozy-primary rounded-full animate-bounce"
                        ></span
                        ><span
                            class="w-1.5 h-1.5 bg-cozy-primary rounded-full animate-bounce delay-100"
                        ></span
                        ><span
                            class="w-1.5 h-1.5 bg-cozy-primary rounded-full animate-bounce delay-200"
                        ></span>
                    </div>
                </div>
            </div>

            <div
                class="p-4 bg-cozy-bg/80 backdrop-blur-sm relative z-20 border-t border-cozy-border/50"
            >
                <form
                    @submit.prevent="sendMessage"
                    class="flex items-center gap-2 bg-cozy-card p-2 pl-4 rounded-full border border-cozy-border shadow-lg shadow-cozy-shadow focus-within:ring-2 focus-within:ring-cozy-primary/20 focus-within:border-cozy-primary/50 transition-all duration-300 transform focus-within:-translate-y-1"
                >
                    <Sparkles
                        class="w-4 h-4 text-cozy-accent shrink-0 animate-pulse"
                    />
                    <input
                        v-model="userInput"
                        type="text"
                        placeholder="Tanya materi..."
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
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
}
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
.prose-content {
    line-height: 1.6;
}
.prose-content strong {
    color: var(--c-primary);
    font-weight: 700;
}
.prose-content h1,
.prose-content h2,
.prose-content h3 {
    font-weight: 700;
    margin-top: 12px;
    margin-bottom: 8px;
    color: var(--c-text);
}
.prose-content ul,
.prose-content ol {
    margin-left: 10px;
    margin-bottom: 10px;
    list-style-type: disc;
    padding-left: 1.2em;
}
.prose-content li {
    margin-bottom: 4px;
}
.prose-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 0.9em;
    background-color: var(--c-card);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.prose-content th {
    background-color: var(--c-primary);
    color: white;
    text-align: left;
    padding: 8px 12px;
    font-weight: 600;
}
.prose-content td {
    border-bottom: 1px solid var(--c-border);
    padding: 8px 12px;
    color: var(--c-text);
}
.prose-content tr:last-child td {
    border-bottom: none;
}
.prose-content p {
    margin-bottom: 0.8em;
}
.prose-content p:last-child {
    margin-bottom: 0;
}
@keyframes scaleUp {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}
.animate-scale-up {
    animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
