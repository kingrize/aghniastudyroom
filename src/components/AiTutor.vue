<script setup>
import { ref, nextTick } from "vue";
import { marked } from "marked";
import { contextData } from "../data/aiContext.js";
import { playPop } from "../utils/sound.js";
import {
    Settings,
    X,
    Send,
    Sparkles,
    Zap,
    Bot,
    Check,
    Loader2,
    Heart,
    Lightbulb,
    Smile,
    ChevronLeft,
    Battery,
    BatteryCharging,
    Power,
    MessageSquare,
    BookOpen,
    GraduationCap,
    Star,
    Cloud,
} from "lucide-vue-next";

// --- STATE ---
const isOpen = ref(false);
const showSettings = ref(false);
const userInput = ref("");
const isLoading = ref(false);
const chatContainer = ref(null);
const messages = ref([
    {
        role: "model",
        text: "Halo Aiya! 👋 Aku siap bantu kamu belajar topik apa saja hari ini. Mau bahas apa?",
    },
]);

// Quick Prompts
const quickPrompts = [
    { text: "Jelaskan konsep dasar... 🧠", icon: BookOpen },
    { text: "Berikan contoh nyata... 🌍", icon: Lightbulb },
    { text: "Buatkan ringkasan singkat 📝", icon: Zap },
    { text: "Semangatin aku dong! ✨", icon: Smile },
];

// --- CONFIG ---
const currentProvider = ref("gemini");
const selectedKeyIndex = ref(1);
const isAutoKey = ref(true);
const selectedPersona = ref("friend");

const providers = {
    gemini: {
        name: "Gemini 2.5 Flash",
        icon: Sparkles,
        hasMultiKey: true,
        maxKeys: 10,
    },
    groq: { name: "Groq Llama 3", icon: Zap, hasMultiKey: false, maxKeys: 0 },
    aiml: { name: "AIML (GPT-4o)", icon: Cloud, hasMultiKey: true, maxKeys: 5 }, // UPDATE: Multi Key Aktif (5 Slot)
};

const personas = {
    friend: {
        name: "Teman Belajar",
        icon: Smile,
        desc: "Santai, pakai emoji, suportif.",
        instruction:
            "Bertindaklah sebagai sahabat akrab. Gunakan bahasa santai (aku/kamu), banyak emoji, ceria, dan sangat suportif.",
    },
    teacher: {
        name: "Dosen Sabar",
        icon: GraduationCap,
        desc: "Jelas, terstruktur, edukatif.",
        instruction:
            "Bertindaklah sebagai Dosen yang bijaksana. Jelaskan konsep dengan terstruktur, gunakan analogi, dan panggil 'Mahasiswa'.",
    },
    neutral: {
        name: "Asisten Pintar",
        icon: Bot,
        desc: "Padat, to-the-point, data.",
        instruction:
            "Bertindaklah sebagai AI Asisten yang objektif. Jawab langsung pada intinya, formal, dan fokus pada fakta.",
    },
    motivator: {
        name: "Motivator",
        icon: Star,
        desc: "Penyemangat, penuh quotes.",
        instruction:
            "Bertindaklah sebagai Motivator. Setiap jawaban harus membakar semangat, gunakan kata-kata positif!",
    },
};

// Load API Keys
const apiKeys = {
    gemini: {},
    groq: import.meta.env.VITE_GROQ_API_KEY || "",
    aiml: {}, // Wadah key AIML
};

// Load Gemini (1-10)
for (let i = 1; i <= 10; i++) {
    apiKeys.gemini[i] =
        import.meta.env[`VITE_GEMINI_API_KEY${i === 1 ? "" : "_" + i}`] || "";
}

// Load AIML (1-5)
for (let i = 1; i <= 5; i++) {
    apiKeys.aiml[i] = import.meta.env[`VITE_AIML_API_KEY_${i}`] || "";
}

const parseMarkdown = (text) => marked.parse(text);

// --- ACTIONS ---
const toggleChat = () => {
    playPop();
    isOpen.value = !isOpen.value;
};
const closeChat = () => {
    playPop();
    isOpen.value = false;
};

const usePrompt = (text) => {
    userInput.value = text;
    const inputEl = document.querySelector(
        'input[placeholder="Tanya Tutor Aiya..."]',
    );
    if (inputEl) inputEl.focus();
};

// --- LOGIC PINTAR: SEND MESSAGE ---
const sendMessage = async () => {
    if (!userInput.value.trim()) return;
    playPop();

    const userText = userInput.value;
    messages.value.push({ role: "user", text: userText });
    userInput.value = "";
    isLoading.value = true;
    scrollToBottom();

    const personaInstruction = personas[selectedPersona.value].instruction;
    const systemInstruction = `${contextData} [SISTEM] Model: ${providers[currentProvider.value].name}. [GAYA BICARA] ${personaInstruction}`;

    try {
        let reply = "";

        // HELPER: Switcher Logic
        const runMultiKeyProvider = async (providerName, apiCall) => {
            let success = false;
            let keysToTry = [];
            const max = providers[providerName].maxKeys;
            const keysObj = apiKeys[providerName];

            if (isAutoKey.value) {
                // Auto: Coba semua slot yang ada isinya
                for (let i = 1; i <= max; i++)
                    if (keysObj[i]) keysToTry.push(i);
            } else {
                // Manual: Coba slot terpilih saja
                if (keysObj[selectedKeyIndex.value])
                    keysToTry.push(selectedKeyIndex.value);
            }

            if (keysToTry.length === 0)
                throw new Error(
                    `Tidak ada API Key ${providerName} yang tersedia!`,
                );

            for (const keyIndex of keysToTry) {
                try {
                    const activeKey = keysObj[keyIndex];
                    const result = await apiCall(activeKey);
                    reply = result;
                    success = true;
                    if (isAutoKey.value) selectedKeyIndex.value = keyIndex;
                    break;
                } catch (err) {
                    console.warn(
                        `[${providerName}] Slot ${keyIndex} gagal: ${err.message}`,
                    );
                }
            }
            if (!success)
                throw new Error(`Semua slot energi ${providerName} habis!`);
        };

        // 1. JALUR GEMINI
        if (currentProvider.value === "gemini") {
            await runMultiKeyProvider("gemini", async (apiKey) => {
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [
                                {
                                    role: "user",
                                    parts: [{ text: systemInstruction }],
                                },
                                ...messages.value
                                    .slice(-6)
                                    .map((m) => ({
                                        role:
                                            m.role === "user"
                                                ? "user"
                                                : "model",
                                        parts: [{ text: m.text }],
                                    })),
                                { role: "user", parts: [{ text: userText }] },
                            ],
                        }),
                    },
                );
                const data = await res.json();
                if (!res.ok) throw new Error(data.error?.message || "Error");
                return data.candidates?.[0]?.content?.parts?.[0]?.text;
            });
        }

        // 2. JALUR GROQ
        else if (currentProvider.value === "groq") {
            const activeKey = apiKeys.groq;
            if (!activeKey) throw new Error("API Key Groq kosong.");
            const res = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${activeKey}`,
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "system", content: systemInstruction },
                            ...messages.value
                                .slice(-6)
                                .map((m) => ({
                                    role:
                                        m.role === "model"
                                            ? "assistant"
                                            : "user",
                                    content: m.text,
                                })),
                            { role: "user", content: userText },
                        ],
                        temperature: 0.7,
                    }),
                },
            );
            const data = await res.json();
            reply = data.choices?.[0]?.message?.content;
        }

        // 3. JALUR AIML (UPDATE MULTI KEY)
        else if (currentProvider.value === "aiml") {
            await runMultiKeyProvider("aiml", async (apiKey) => {
                const res = await fetch(
                    "https://api.aimlapi.com/v1/chat/completions",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: "gpt-4o",
                            messages: [
                                { role: "system", content: systemInstruction },
                                ...messages.value
                                    .slice(-6)
                                    .map((m) => ({
                                        role:
                                            m.role === "model"
                                                ? "assistant"
                                                : "user",
                                        content: m.text,
                                    })),
                                { role: "user", content: userText },
                            ],
                            max_tokens: 1000,
                        }),
                    },
                );
                const data = await res.json();
                if (!res.ok)
                    throw new Error(data.error?.message || "Error AIML");
                return data.choices?.[0]?.message?.content;
            });
        }

        messages.value.push({ role: "model", text: reply || "Maaf, error." });
    } catch (error) {
        messages.value.push({ role: "model", text: `Error: ${error.message}` });
    } finally {
        isLoading.value = false;
        scrollToBottom();
    }
};

const scrollToBottom = async () => {
    await nextTick();
    if (chatContainer.value)
        chatContainer.value.scrollTo({
            top: chatContainer.value.scrollHeight,
            behavior: "smooth",
        });
};

const handleExternalPrompt = (prompt) => {
    isOpen.value = true;
    userInput.value = prompt;
    sendMessage();
};

defineExpose({ handleExternalPrompt });
</script>

<template>
    <div
        class="fixed bottom-6 right-6 z-[9999] font-sans flex flex-col items-end gap-4 pointer-events-none"
    >
        <transition name="scale-up">
            <div
                v-if="isOpen"
                class="pointer-events-auto w-[90vw] md:w-[380px] h-[80vh] md:h-[600px] bg-cozy-bg/95 backdrop-blur-2xl shadow-2xl border border-cozy-border rounded-[36px] flex flex-col overflow-hidden origin-bottom-right relative ring-1 ring-black/5 transition-all duration-500 ease-spring"
            >
                <div
                    class="px-6 py-4 bg-cozy-bg/80 backdrop-blur-md border-b border-cozy-border flex justify-between items-center shrink-0 z-20 relative"
                >
                    <div class="flex items-center gap-3">
                        <div class="relative group">
                            <div
                                class="w-11 h-11 bg-gradient-to-tr from-cozy-primary/20 to-cozy-accent/20 rounded-full flex items-center justify-center border border-cozy-primary/20 group-hover:scale-105 transition-transform duration-300"
                            >
                                <Bot class="w-6 h-6 text-cozy-primary" />
                            </div>
                            <div
                                class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-cozy-bg flex items-center justify-center"
                                :class="
                                    isAutoKey
                                        ? 'bg-cozy-accent animate-pulse'
                                        : 'bg-cozy-primary'
                                "
                            >
                                <span
                                    v-if="isAutoKey"
                                    class="w-1 h-1 bg-white rounded-full"
                                ></span>
                            </div>
                        </div>
                        <div>
                            <h3
                                class="font-display font-bold text-cozy-text text-base leading-tight"
                            >
                                Tutor Aiya
                            </h3>
                            <div class="flex items-center gap-1.5 mt-0.5">
                                <component
                                    :is="personas[selectedPersona].icon"
                                    class="w-3 h-3 text-cozy-primary"
                                />
                                <span
                                    class="text-[10px] font-bold text-cozy-muted uppercase tracking-wider"
                                    >{{ personas[selectedPersona].name }}</span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-1">
                        <button
                            @click="
                                playPop();
                                showSettings = !showSettings;
                            "
                            class="p-2.5 rounded-full hover:bg-cozy-card text-cozy-muted hover:text-cozy-primary transition-all active:scale-90"
                        >
                            <Settings
                                class="w-5 h-5"
                                :class="{ 'animate-spin-slow': showSettings }"
                            />
                        </button>
                        <button
                            @click="closeChat"
                            class="p-2.5 rounded-full hover:bg-red-500/10 text-cozy-muted hover:text-red-500 transition-all active:scale-90"
                        >
                            <X class="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <transition name="fade">
                    <div
                        v-if="showSettings"
                        class="absolute inset-0 z-50 bg-cozy-bg flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto"
                    >
                        <div
                            class="flex items-center gap-2 mb-8 text-cozy-muted cursor-pointer hover:text-cozy-primary transition-colors group"
                            @click="
                                playPop();
                                showSettings = false;
                            "
                        >
                            <div
                                class="p-1 rounded-full bg-cozy-card border border-cozy-border group-hover:border-cozy-primary"
                            >
                                <ChevronLeft class="w-4 h-4" />
                            </div>
                            <span
                                class="text-xs font-bold uppercase tracking-widest"
                                >Kembali ke Chat</span
                            >
                        </div>

                        <div class="space-y-8">
                            <div>
                                <h4
                                    class="text-xs font-bold text-cozy-muted uppercase tracking-widest mb-3 pl-1"
                                >
                                    Gaya Bicara
                                </h4>
                                <div class="grid grid-cols-2 gap-3">
                                    <button
                                        v-for="(persona, key) in personas"
                                        :key="key"
                                        @click="
                                            playPop();
                                            selectedPersona = key;
                                        "
                                        class="flex flex-col items-start p-3 rounded-2xl border transition-all text-left relative overflow-hidden active:scale-95"
                                        :class="
                                            selectedPersona === key
                                                ? 'bg-cozy-card border-cozy-primary ring-1 ring-cozy-primary/50 shadow-sm'
                                                : 'bg-cozy-card/50 border-cozy-border hover:bg-cozy-card hover:border-cozy-primary/30'
                                        "
                                    >
                                        <div
                                            class="flex items-center gap-2 mb-1"
                                        >
                                            <component
                                                :is="persona.icon"
                                                class="w-4 h-4"
                                                :class="
                                                    selectedPersona === key
                                                        ? 'text-cozy-primary'
                                                        : 'text-cozy-muted'
                                                "
                                            />
                                            <span
                                                class="font-bold text-xs text-cozy-text"
                                                >{{ persona.name }}</span
                                            >
                                        </div>
                                        <p
                                            class="text-[9px] text-cozy-muted leading-tight"
                                        >
                                            {{ persona.desc }}
                                        </p>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4
                                    class="text-xs font-bold text-cozy-muted uppercase tracking-widest mb-3 pl-1"
                                >
                                    Otak AI
                                </h4>
                                <div class="grid grid-cols-1 gap-3">
                                    <button
                                        v-for="(prov, key) in providers"
                                        :key="key"
                                        @click="
                                            playPop();
                                            currentProvider = key;
                                        "
                                        class="flex items-center justify-between p-4 rounded-2xl border transition-all text-left relative overflow-hidden active:scale-98"
                                        :class="
                                            currentProvider === key
                                                ? 'bg-cozy-card border-cozy-primary ring-1 ring-cozy-primary/50 shadow-sm'
                                                : 'bg-cozy-card/50 border-cozy-border hover:bg-cozy-card hover:border-cozy-primary/30'
                                        "
                                    >
                                        <div
                                            class="flex items-center gap-3 z-10"
                                        >
                                            <div
                                                class="p-2 rounded-xl"
                                                :class="
                                                    currentProvider === key
                                                        ? 'bg-cozy-primary/10 text-cozy-primary'
                                                        : 'bg-cozy-bg text-cozy-muted'
                                                "
                                            >
                                                <component
                                                    :is="prov.icon"
                                                    class="w-5 h-5"
                                                />
                                            </div>
                                            <div>
                                                <div
                                                    class="font-bold text-cozy-text text-sm"
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
                                        <div
                                            v-if="currentProvider === key"
                                            class="z-10 p-1 bg-cozy-primary rounded-full text-white"
                                        >
                                            <Check class="w-3 h-3" />
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div v-if="providers[currentProvider].hasMultiKey">
                                <div
                                    class="flex justify-between items-center mb-3 pl-1"
                                >
                                    <h4
                                        class="text-xs font-bold text-cozy-muted uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <Zap class="w-3 h-3 text-cozy-accent" />
                                        Sumber Energi
                                    </h4>
                                    <button
                                        @click="
                                            playPop();
                                            isAutoKey = !isAutoKey;
                                        "
                                        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border shadow-sm active:scale-95"
                                        :class="
                                            isAutoKey
                                                ? 'bg-cozy-primary text-white border-cozy-primary'
                                                : 'bg-cozy-card text-cozy-muted border-cozy-border'
                                        "
                                    >
                                        <component
                                            :is="
                                                isAutoKey
                                                    ? BatteryCharging
                                                    : Power
                                            "
                                            class="w-3 h-3"
                                        />
                                        {{ isAutoKey ? "Otomatis" : "Manual" }}
                                    </button>
                                </div>

                                <div class="grid grid-cols-5 gap-2">
                                    <button
                                        v-for="i in providers[currentProvider]
                                            .maxKeys"
                                        :key="i"
                                        @click="
                                            playPop();
                                            selectedKeyIndex = i;
                                        "
                                        :disabled="
                                            isAutoKey ||
                                            !apiKeys[currentProvider][i]
                                        "
                                        class="h-10 rounded-xl flex items-center justify-center border transition-all relative overflow-hidden group"
                                        :class="[
                                            apiKeys[currentProvider][i]
                                                ? selectedKeyIndex === i
                                                    ? 'bg-cozy-primary text-white border-cozy-primary shadow-md scale-105'
                                                    : isAutoKey
                                                      ? 'bg-cozy-primary/10 border-cozy-primary/30 text-cozy-primary animate-pulse'
                                                      : 'bg-cozy-card border-cozy-border text-cozy-muted hover:border-cozy-primary/50 hover:text-cozy-text'
                                                : 'bg-cozy-bg border-dashed border-cozy-border/60 text-cozy-muted/30 cursor-not-allowed',
                                        ]"
                                    >
                                        <span
                                            class="text-xs font-bold relative z-10"
                                            >{{ i }}</span
                                        >
                                        <div
                                            v-if="
                                                isAutoKey &&
                                                apiKeys[currentProvider][i]
                                            "
                                            class="absolute inset-0 bg-cozy-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        ></div>
                                    </button>
                                </div>
                                <p
                                    class="text-[10px] text-cozy-muted/70 mt-2 text-center flex items-center justify-center gap-1"
                                >
                                    <span
                                        v-if="isAutoKey"
                                        class="w-1.5 h-1.5 rounded-full bg-cozy-accent animate-ping"
                                    ></span>
                                    {{
                                        isAutoKey
                                            ? `Mencari energi ${providers[currentProvider].name} terbaik...`
                                            : "Pilih slot manual."
                                    }}
                                </p>
                            </div>
                        </div>

                        <button
                            @click="
                                playPop();
                                showSettings = false;
                            "
                            class="mt-auto w-full py-4 rounded-2xl bg-cozy-card border border-cozy-border text-cozy-text font-bold text-sm hover:bg-cozy-border hover:shadow-sm transition-all active:scale-98"
                        >
                            Simpan & Tutup
                        </button>
                    </div>
                </transition>

                <div
                    ref="chatContainer"
                    class="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth relative"
                >
                    <div
                        class="absolute inset-0 bg-gradient-to-b from-cozy-primary/5 to-transparent pointer-events-none opacity-50"
                    ></div>
                    <div
                        v-if="messages.length === 0"
                        class="h-full flex flex-col items-center justify-center space-y-8 opacity-0 animate-fade-in-up fill-mode-forwards p-4 relative z-10"
                    >
                        <div class="relative">
                            <div
                                class="w-24 h-24 bg-cozy-card rounded-full flex items-center justify-center shadow-lg border border-cozy-border rotate-3 hover:rotate-0 transition-transform duration-500"
                            >
                                <Bot class="w-10 h-10 text-cozy-primary" />
                            </div>
                            <div
                                class="absolute -top-4 -right-4 bg-cozy-card px-3 py-1.5 rounded-full border border-cozy-border shadow-sm text-xs font-bold text-cozy-text animate-bounce-slow"
                            >
                                Halo! 👋
                            </div>
                        </div>
                        <div class="w-full space-y-2">
                            <p
                                class="text-xs font-bold text-cozy-muted uppercase tracking-widest text-center mb-4"
                            >
                                Mulai belajar dengan:
                            </p>
                            <div class="grid grid-cols-1 gap-2">
                                <button
                                    v-for="(prompt, idx) in quickPrompts"
                                    :key="idx"
                                    @click="usePrompt(prompt.text)"
                                    class="flex items-center gap-3 p-3.5 bg-cozy-card/80 border border-cozy-border rounded-2xl text-xs font-bold text-cozy-text shadow-sm hover:bg-cozy-card hover:border-cozy-primary/50 hover:scale-[1.02] transition-all active:scale-95 text-left group backdrop-blur-sm"
                                >
                                    <div
                                        class="p-1.5 bg-cozy-bg rounded-lg text-cozy-primary group-hover:bg-cozy-primary group-hover:text-white transition-colors"
                                    >
                                        <component
                                            :is="prompt.icon"
                                            class="w-4 h-4"
                                        />
                                    </div>
                                    {{ prompt.text }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div
                        v-for="(msg, index) in messages"
                        :key="index"
                        class="flex gap-3 w-full animate-fade-in-up relative z-10"
                        :class="
                            msg.role === 'user'
                                ? 'justify-end'
                                : 'justify-start'
                        "
                    >
                        <div
                            v-if="msg.role === 'model'"
                            class="w-8 h-8 rounded-full bg-cozy-card border border-cozy-border flex items-center justify-center shrink-0 shadow-sm self-end mb-1"
                        >
                            <Bot class="w-4 h-4 text-cozy-primary" />
                        </div>
                        <div
                            class="max-w-[85%] px-5 py-3 text-sm shadow-sm relative transition-all duration-300 hover:shadow-md"
                            :class="
                                msg.role === 'user'
                                    ? 'bg-gradient-to-br from-cozy-primary to-cozy-accent text-white font-medium rounded-[24px] rounded-br-sm'
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
                    <div
                        v-if="isLoading"
                        class="flex justify-start gap-2 relative z-10"
                    >
                        <div
                            class="w-8 h-8 rounded-full bg-cozy-card border border-cozy-border flex items-center justify-center shrink-0 self-end"
                        >
                            <Bot class="w-4 h-4 text-cozy-muted" />
                        </div>
                        <div
                            class="bg-cozy-card border border-cozy-border px-4 py-3 rounded-[24px] rounded-bl-sm shadow-sm flex gap-1.5 items-center"
                        >
                            <Loader2
                                class="w-4 h-4 text-cozy-primary animate-spin"
                            /><span class="text-xs text-cozy-muted font-medium"
                                >Mengetik...</span
                            >
                        </div>
                    </div>
                </div>

                <div
                    class="p-3 bg-cozy-bg/90 backdrop-blur-md border-t border-cozy-border z-20"
                >
                    <form
                        @submit.prevent="sendMessage"
                        class="flex items-end gap-2 bg-cozy-card p-1.5 pl-4 rounded-[28px] border border-cozy-border focus-within:border-cozy-primary/50 focus-within:ring-2 focus-within:ring-cozy-primary/10 transition-all shadow-sm"
                    >
                        <input
                            v-model="userInput"
                            type="text"
                            placeholder="Tanya Tutor Aiya..."
                            class="flex-1 bg-transparent text-sm text-cozy-text placeholder:text-cozy-muted/70 outline-none h-10 font-medium py-2"
                        /><button
                            type="submit"
                            :disabled="!userInput"
                            class="w-10 h-10 rounded-full flex items-center justify-center bg-cozy-primary text-white shadow-md disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-90 transition-all shrink-0 mb-[1px]"
                        >
                            <Send
                                class="w-4 h-4"
                                :class="{ 'ml-0.5': userInput }"
                            />
                        </button>
                    </form>
                </div>
            </div>
        </transition>

        <div class="pointer-events-auto">
            <button
                @click="toggleChat"
                class="group relative w-16 h-16 flex items-center justify-center bg-cozy-card rounded-[24px] shadow-2xl shadow-cozy-primary/20 border border-cozy-border hover:scale-110 active:scale-95 transition-all duration-300 ease-spring"
            >
                <div
                    v-if="!isOpen"
                    class="absolute inset-0 bg-cozy-primary/10 rounded-[22px] animate-pulse"
                ></div>
                <transition name="rotate" mode="out-in"
                    ><X
                        v-if="isOpen"
                        class="w-7 h-7 text-cozy-muted" /><MessageSquare
                        v-else
                        class="w-7 h-7 text-cozy-primary fill-cozy-primary/20"
                /></transition>
                <span
                    v-if="!isOpen"
                    class="absolute top-0 right-0 w-4 h-4 bg-cozy-accent rounded-full border-[2px] border-cozy-card flex items-center justify-center transform translate-x-1 -translate-y-1"
                    ><span
                        class="w-1.5 h-1.5 bg-white rounded-full animate-ping"
                    ></span
                ></span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.scale-up-enter-active,
.scale-up-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.scale-up-enter-from,
.scale-up-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
.rotate-enter-active,
.rotate-leave-active {
    transition: all 0.3s ease;
}
.rotate-enter-from {
    opacity: 0;
    transform: rotate(-90deg);
    scale: 0.5;
}
.rotate-leave-to {
    opacity: 0;
    transform: rotate(90deg);
    scale: 0.5;
}
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
.animate-fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}
.fill-mode-forwards {
    animation-fill-mode: forwards;
}
.animate-spin-slow {
    animation: spin 3s linear infinite;
}
.animate-bounce-slow {
    animation: bounce 3s infinite;
}
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
.prose-content :deep(strong) {
    color: var(--c-primary);
    font-weight: 700;
}
.prose-content :deep(p) {
    margin-bottom: 0.5em;
    line-height: 1.5;
}
.prose-content :deep(ul) {
    list-style: disc;
    padding-left: 1.2em;
    margin-bottom: 0.5em;
}
.prose-content :deep(a) {
    color: var(--c-primary);
    text-decoration: underline;
}
</style>
