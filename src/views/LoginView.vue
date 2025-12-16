<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Lock, LogIn, AlertCircle } from "lucide-vue-next";

const email = ref("");
const password = ref("");
const errorMsg = ref("");
const isLoading = ref(false);
const router = useRouter();

const handleLogin = async () => {
    isLoading.value = true;
    errorMsg.value = "";
    try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        router.push("/admin");
    } catch (err) {
        errorMsg.value = "Email atau password salah!";
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-cozy-bg px-4">
        <div
            class="w-full max-w-sm bg-cozy-card p-8 rounded-[32px] shadow-xl border border-cozy-border relative overflow-hidden"
        >
            <div
                class="absolute -top-10 -right-10 w-32 h-32 bg-cozy-primary/10 rounded-full blur-2xl"
            ></div>

            <div class="text-center mb-8 relative z-10">
                <div
                    class="w-16 h-16 bg-cozy-bg rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cozy-border shadow-sm"
                >
                    <Lock class="w-8 h-8 text-cozy-primary" />
                </div>
                <h1 class="font-display text-2xl font-bold text-cozy-text">
                    Admin Access
                </h1>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-4 relative z-10">
                <div>
                    <label
                        class="block text-xs font-bold text-cozy-muted uppercase tracking-wider mb-2 ml-1"
                        >Email</label
                    >
                    <input
                        v-model="email"
                        type="email"
                        class="w-full px-4 py-3 bg-cozy-bg border border-cozy-border rounded-xl text-cozy-text outline-none focus:border-cozy-primary transition-all"
                        required
                    />
                </div>

                <div>
                    <label
                        class="block text-xs font-bold text-cozy-muted uppercase tracking-wider mb-2 ml-1"
                        >Password</label
                    >
                    <input
                        v-model="password"
                        type="password"
                        class="w-full px-4 py-3 bg-cozy-bg border border-cozy-border rounded-xl text-cozy-text outline-none focus:border-cozy-primary transition-all"
                        required
                    />
                </div>

                <div
                    v-if="errorMsg"
                    class="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100"
                >
                    <AlertCircle class="w-4 h-4 shrink-0" /> {{ errorMsg }}
                </div>

                <button
                    type="submit"
                    :disabled="isLoading"
                    class="w-full py-3.5 bg-cozy-primary text-white rounded-xl font-bold shadow-lg shadow-cozy-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <span
                        v-if="isLoading"
                        class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></span>
                    <span v-else>Masuk Dashboard</span>
                </button>
            </form>
        </div>
    </div>
</template>
