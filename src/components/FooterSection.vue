<script setup>
import { ref, onMounted } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Heart, Lock, LayoutDashboard } from "lucide-vue-next";

const user = ref(null);

onMounted(() => {
    onAuthStateChanged(auth, (u) => {
        user.value = u;
    });
});
</script>

<template>
    <footer
        class="w-full py-8 px-6 mt-12 border-t border-cozy-border/50 bg-cozy-bg text-center relative z-10"
    >
        <div class="max-w-md mx-auto flex flex-col items-center gap-4">
            <p
                class="text-xs font-bold text-cozy-muted/60 tracking-widest uppercase"
            >
                ( ˘ ³˘)♥ Belajar yang Rajin Ya!
            </p>

            <div
                class="flex items-center gap-2 text-[10px] text-cozy-muted/40 font-bold"
            >
                <span
                    >&copy; {{ new Date().getFullYear() }} For my love:
                    Aghnia.</span
                >

                <router-link
                    :to="user ? '/admin' : '/login'"
                    class="p-1 rounded-full hover:bg-cozy-card hover:text-cozy-primary transition-all cursor-default hover:cursor-pointer group"
                    :title="user ? 'Admin Dashboard' : 'Admin Area'"
                >
                    <LayoutDashboard v-if="user" class="w-3 h-3" />
                    <Lock
                        v-else
                        class="w-3 h-3 opacity-50 group-hover:opacity-100"
                    />
                </router-link>
            </div>
        </div>
    </footer>
</template>
