<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
} from "firebase/firestore";
import {
    LogOut,
    Sparkles,
    Save,
    Trash2,
    BookOpen,
    FileText,
    Layers,
    Loader2,
    Eraser,
    Zap,
    Settings2,
    Check,
    Wand2, // Tambah Icon Wand2 (Tongkat Sihir)
} from "lucide-vue-next";
import QuestionCard from "../components/QuestionCard.vue";
import ConfirmModal from "../components/ConfirmModal.vue";

const router = useRouter();
const isLoading = ref(false);
const isSaving = ref(false);
const isResetting = ref(false);
const isGeneratingMaterial = ref(false); // Loading state untuk materi
const showResetModal = ref(false);

// --- AI CONFIG STATE ---
const currentProvider = ref("gemini");
const selectedKeyIndex = ref(1);
const questionCount = ref(5);

const providers = {
    gemini: { name: "Gemini 2.5 Flash", icon: Sparkles, hasMultiKey: true },
    groq: { name: "Groq Llama 3", icon: Zap, hasMultiKey: false },
};

// Load API Keys
const apiKeys = {
    gemini: {},
    groq: import.meta.env.VITE_GROQ_API_KEY || "",
};

for (let i = 1; i <= 10; i++) {
    apiKeys.gemini[i] =
        import.meta.env[`VITE_GEMINI_API_KEY${i === 1 ? "" : "_" + i}`] || "";
}

// --- FORM STATE ---
const subjectTitle = ref("");
const rawMaterial = ref("");
const generatedQuestions = ref([]);

// --- HELPER: GET ACTIVE KEY ---
const getActiveKey = () => {
    return currentProvider.value === "gemini"
        ? apiKeys.gemini[selectedKeyIndex.value]
        : apiKeys.groq;
};

// --- LOGIC ---
const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
};

const openResetModal = () => (showResetModal.value = true);

const confirmResetAction = async () => {
    showResetModal.value = false;
    isResetting.value = true;
    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const deletePromises = querySnapshot.docs.map((d) =>
            deleteDoc(doc(db, "courses", d.id)),
        );
        await Promise.all(deletePromises);
        alert("✨ Database berhasil dikosongkan!");
    } catch (error) {
        alert("Gagal reset: " + error.message);
    } finally {
        isResetting.value = false;
    }
};

// --- FITUR BARU: GENERATE MATERI DARI JUDUL ---
const generateMaterialFromTitle = async () => {
    if (!subjectTitle.value)
        return alert("Isi Tag / Kategori dulu biar AI tau mau nulis apa!");

    const activeKey = getActiveKey();
    if (!activeKey)
        return alert(
            `API Key ${providers[currentProvider.value].name} kosong!`,
        );

    isGeneratingMaterial.value = true;

    // Prompt khusus untuk membuat materi kuliah
    const prompt = `
        Bertindaklah sebagai Dosen Ahli.
        Tugasmu: Tuliskan RANGKUMAN MATERI KULIAH yang padat, jelas, dan akurat tentang topik: "${subjectTitle.value}".

        Kriteria:
        1. Bahasa Indonesia.
        2. Mencakup definisi, konsep utama, dan contoh nyata.
        3. Panjang sekitar 3-4 paragraf (cukup untuk bahan flashcard).
        4. Jangan gunakan pembuka/penutup yang bertele-tele, langsung ke materi.
    `;

    try {
        let textResult = "";

        if (currentProvider.value === "gemini") {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                },
            );
            const data = await response.json();
            textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
            // Groq
            const response = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${activeKey}`,
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7,
                    }),
                },
            );
            const data = await response.json();
            textResult = data.choices?.[0]?.message?.content || "";
        }

        // Isi ke textarea
        rawMaterial.value = textResult;
    } catch (error) {
        console.error(error);
        alert("Gagal membuat materi: " + error.message);
    } finally {
        isGeneratingMaterial.value = false;
    }
};

// --- GENERATE QUESTIONS (SOAL) ---
const generateQuestions = async () => {
    if (!rawMaterial.value || !subjectTitle.value)
        return alert("Isi Judul dan Materi dulu!");

    const activeKey = getActiveKey();
    if (!activeKey) return alert(`API Key kosong!`);

    isLoading.value = true;
    generatedQuestions.value = [];

    const prompt = `
        Bertindaklah sebagai Dosen Ahli.
        TUGAS: Buat ${questionCount.value} buah Flashcard pertanyaan & jawaban cerdas berdasarkan materi: "${rawMaterial.value}".

        ATURAN JSON MURNI:
        Output WAJIB Array of Objects valid (tanpa markdown). Format:
        [
           {
             "id": 1,
             "tag": "${subjectTitle.value}",
             "icon": "Brain",
             "q": "Pertanyaan?",
             "a": "Jawaban."
           }
        ]
        Pilihan Icon String: Brain, MessageCircle, Dna, Lightbulb, Heart, Star, Zap.
    `;

    try {
        let textResult = "";

        if (currentProvider.value === "gemini") {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                },
            );
            const data = await response.json();
            textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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
                        model: "llama-3.3-70b-versatile",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7,
                    }),
                },
            );
            const data = await response.json();
            textResult = data.choices?.[0]?.message?.content || "";
        }

        textResult = textResult.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(textResult);
        generatedQuestions.value = parsed.map((item, index) => ({
            ...item,
            id: Date.now() + index,
        }));
    } catch (error) {
        console.error(error);
        alert("Gagal generate soal: " + error.message);
    } finally {
        isLoading.value = false;
    }
};

const saveToDatabase = async () => {
    if (generatedQuestions.value.length === 0) return;
    isSaving.value = true;
    try {
        await addDoc(collection(db, "courses"), {
            title: subjectTitle.value,
            createdAt: new Date(),
            questionsList: generatedQuestions.value,
        });
        alert("Berhasil disimpan! 🎉");
        subjectTitle.value = "";
        rawMaterial.value = "";
        generatedQuestions.value = [];
    } catch (error) {
        alert("Gagal menyimpan: " + error.message);
    } finally {
        isSaving.value = false;
    }
};

const removeDraft = (index) => {
    generatedQuestions.value.splice(index, 1);
};
</script>

<template>
    <div class="min-h-screen bg-cozy-bg text-cozy-text p-6 pb-24 font-sans">
        <ConfirmModal
            :isOpen="showResetModal"
            title="Hapus Semua Data?"
            message="Tindakan ini akan menghapus seluruh materi di database."
            confirmText="Hapus Semua"
            cancelText="Batal"
            :isDanger="true"
            @close="showResetModal = false"
            @confirm="confirmResetAction"
        />

        <header
            class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 pt-4 gap-4"
        >
            <div>
                <h1
                    class="font-display text-2xl md:text-3xl font-bold text-cozy-text"
                >
                    Dashboard Admin
                </h1>
                <p class="text-sm text-cozy-muted">
                    Panel Kendali Materi Belajar
                </p>
            </div>
            <div class="flex gap-3">
                <button
                    @click="openResetModal"
                    :disabled="isResetting"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50"
                >
                    <span v-if="isResetting"
                        ><Loader2 class="w-4 h-4 animate-spin"
                    /></span>
                    <span v-else class="flex items-center gap-2"
                        ><Eraser class="w-4 h-4" /> Reset DB</span
                    >
                </button>
                <button
                    @click="handleLogout"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-cozy-border text-xs font-bold text-cozy-muted hover:bg-cozy-card transition-all shadow-sm"
                >
                    <LogOut class="w-4 h-4" /> Keluar
                </button>
            </div>
        </header>

        <main class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section class="space-y-6">
                <div
                    class="bg-cozy-card p-6 rounded-[32px] shadow-sm border border-cozy-border"
                >
                    <div
                        class="flex items-center gap-2 mb-6 text-cozy-primary font-bold text-xs uppercase tracking-widest"
                    >
                        <Settings2 class="w-4 h-4" /> Konfigurasi AI
                    </div>

                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <button
                            v-for="(prov, key) in providers"
                            :key="key"
                            @click="currentProvider = key"
                            class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all active:scale-95"
                            :class="
                                currentProvider === key
                                    ? 'bg-cozy-primary/10 border-cozy-primary text-cozy-primary ring-1 ring-cozy-primary'
                                    : 'bg-cozy-bg border-cozy-border text-cozy-muted hover:border-cozy-primary/50'
                            "
                        >
                            <component :is="prov.icon" class="w-5 h-5" />
                            <span class="text-xs font-bold">{{
                                prov.name
                            }}</span>
                        </button>
                    </div>

                    <div
                        v-if="providers[currentProvider].hasMultiKey"
                        class="mb-6"
                    >
                        <label
                            class="block text-[10px] font-bold text-cozy-muted uppercase tracking-wider mb-2"
                            >Pilih Slot Key (Anti Limit)</label
                        >
                        <div class="grid grid-cols-5 gap-2">
                            <button
                                v-for="i in 10"
                                :key="i"
                                @click="selectedKeyIndex = i"
                                class="h-9 rounded-lg flex items-center justify-center text-xs font-bold border transition-all"
                                :class="
                                    selectedKeyIndex === i
                                        ? 'bg-cozy-primary text-white border-cozy-primary shadow-md'
                                        : 'bg-cozy-bg border-cozy-border text-cozy-text hover:border-cozy-primary/50'
                                "
                            >
                                {{ i }}
                                <span
                                    v-if="apiKeys.gemini[i]"
                                    class="absolute top-1 right-1 w-1.5 h-1.5 bg-green-400 rounded-full border border-white"
                                ></span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label
                                class="text-[10px] font-bold text-cozy-muted uppercase tracking-wider"
                                >Jumlah Soal</label
                            >
                            <span
                                class="text-xs font-bold text-cozy-primary bg-cozy-primary/10 px-2 py-0.5 rounded-md"
                                >{{ questionCount }} Soal</span
                            >
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            v-model="questionCount"
                            class="w-full h-2 bg-cozy-bg rounded-lg appearance-none cursor-pointer accent-cozy-primary"
                        />
                    </div>
                </div>

                <div
                    class="bg-cozy-card p-6 rounded-[32px] shadow-sm border border-cozy-border sticky top-6"
                >
                    <div
                        class="flex items-center gap-2 mb-6 text-cozy-primary font-bold text-xs uppercase tracking-widest"
                    >
                        <BookOpen class="w-4 h-4" /> Input Materi Baru
                    </div>

                    <div class="mb-4">
                        <label
                            class="block text-xs font-bold text-cozy-muted ml-2 mb-2"
                            >Tag / Kategori</label
                        >
                        <div class="flex gap-2">
                            <div
                                class="flex-1 flex items-center gap-3 px-4 py-3 bg-cozy-bg rounded-2xl border border-cozy-border focus-within:border-cozy-primary/50 transition-all"
                            >
                                <Layers class="w-5 h-5 text-cozy-muted" />
                                <input
                                    v-model="subjectTitle"
                                    type="text"
                                    placeholder="Contoh: Psikologi Faal"
                                    class="flex-1 bg-transparent outline-none text-sm font-bold text-cozy-text placeholder:font-normal"
                                />
                            </div>
                            <button
                                @click="generateMaterialFromTitle"
                                :disabled="
                                    isGeneratingMaterial || !subjectTitle
                                "
                                class="w-14 flex items-center justify-center bg-cozy-accent text-white rounded-2xl shadow-md hover:bg-yellow-400 active:scale-95 transition-all disabled:opacity-50 disabled:bg-gray-200"
                                title="Buatkan materi otomatis dari judul"
                            >
                                <Loader2
                                    v-if="isGeneratingMaterial"
                                    class="w-6 h-6 animate-spin"
                                />
                                <Wand2 v-else class="w-6 h-6" />
                            </button>
                        </div>
                        <p class="text-[10px] text-cozy-muted/60 mt-1 ml-2">
                            *Klik tongkat sihir untuk dibuatkan materi otomatis.
                        </p>
                    </div>

                    <div class="mb-6">
                        <label
                            class="block text-xs font-bold text-cozy-muted ml-2 mb-2"
                            >Teks Materi</label
                        >
                        <div class="relative">
                            <textarea
                                v-model="rawMaterial"
                                rows="12"
                                placeholder="Paste materi kuliah disini atau gunakan tombol tongkat sihir di atas..."
                                class="w-full p-4 bg-cozy-bg rounded-2xl border border-cozy-border focus:border-cozy-primary/50 outline-none text-sm leading-relaxed resize-none transition-all scrollbar-hide"
                            ></textarea>
                            <FileText
                                class="absolute top-4 right-4 w-5 h-5 text-cozy-muted/30"
                            />
                        </div>
                    </div>

                    <button
                        @click="generateQuestions"
                        :disabled="isLoading || !rawMaterial || !subjectTitle"
                        class="w-full py-4 rounded-2xl bg-gradient-to-r from-cozy-primary to-cozy-accent text-white font-bold shadow-lg shadow-cozy-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <span v-if="isLoading" class="flex items-center gap-2"
                            ><Loader2 class="w-5 h-5 animate-spin" /> Sedang
                            Berpikir...</span
                        >
                        <span v-else class="flex items-center gap-2"
                            ><Sparkles class="w-5 h-5" /> Generate
                            {{ questionCount }} Soal</span
                        >
                    </button>
                </div>
            </section>

            <section class="space-y-6">
                <div class="flex items-center justify-between px-2">
                    <div
                        class="flex items-center gap-2 text-cozy-secondary font-bold text-xs uppercase tracking-widest"
                    >
                        <Check class="w-4 h-4" /> Hasil Preview ({{
                            generatedQuestions.length
                        }})
                    </div>
                    <button
                        v-if="generatedQuestions.length > 0"
                        @click="saveToDatabase"
                        :disabled="isSaving"
                        class="text-xs font-bold text-cozy-primary hover:underline disabled:opacity-50"
                    >
                        {{ isSaving ? "Menyimpan..." : "Simpan Semua" }}
                    </button>
                </div>

                <div
                    v-if="generatedQuestions.length > 0"
                    class="space-y-4 pb-12"
                >
                    <div
                        v-for="(card, index) in generatedQuestions"
                        :key="index"
                        class="relative group"
                    >
                        <button
                            @click="removeDraft(index)"
                            class="absolute -top-2 -right-2 z-10 p-2 bg-white text-red-400 rounded-full shadow-md hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                        >
                            <Trash2 class="w-4 h-4" />
                        </button>
                        <QuestionCard :item="card" :isRevealed="true" />
                    </div>
                    <button
                        @click="saveToDatabase"
                        :disabled="isSaving"
                        class="w-full py-4 rounded-2xl bg-white border-2 border-cozy-border text-cozy-text font-bold hover:border-green-400 hover:text-green-500 hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                    >
                        <span v-if="isSaving"
                            ><Loader2 class="w-5 h-5 animate-spin"
                        /></span>
                        <span v-else class="flex items-center gap-2"
                            ><Save class="w-5 h-5" /> Simpan ke Database</span
                        >
                    </button>
                </div>

                <div
                    v-else
                    class="h-[400px] flex flex-col items-center justify-center text-center border-2 border-dashed border-cozy-border rounded-[32px] p-8 opacity-50"
                >
                    <Sparkles class="w-12 h-12 text-cozy-muted mb-4" />
                    <p class="text-sm font-medium">Siap Membuat Soal</p>
                    <p class="text-xs max-w-xs mx-auto mt-1 text-cozy-muted">
                        Atur konfigurasi AI di kiri atas, lalu masukkan materi.
                    </p>
                </div>
            </section>
        </main>
    </div>
</template>
