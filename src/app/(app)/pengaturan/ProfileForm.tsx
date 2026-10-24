"use client";

import { useState } from "react";
import Image from "next/image";
import { Save, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/pengaturan";

interface ProfileFormProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
    } else {
      setMessage({ type: "error", text: result.error || "Terjadi kesalahan" });
    }

    setIsLoading(false);
  };

  return (
    <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-6 bg-white dark:bg-[#141B31]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Profil</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Informasi akun kamu.</p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-[#0A1128] border border-gray-200 dark:border-[#2C3246] shrink-0">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              U
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-gray-900 dark:text-white truncate" title={user?.name || ""}>{user?.name || "Tanpa Nama"}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate" title={user?.email || ""}>{user?.email || "Tidak ada email"}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 border-t border-gray-200 dark:border-[#2C3246] pt-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nama
          </label>
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={user?.name || ""}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#0A1128] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            defaultValue={user?.email || ""}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246]/50 bg-gray-100 dark:bg-[#0A1128]/50 text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium text-sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Email tidak dapat diubah.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Avatar URL
          </label>
          <input
            type="url"
            name="image"
            id="image"
            defaultValue={user?.image || ""}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#0A1128] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] dark:bg-[#f97316] dark:hover:bg-[#fb923c] text-white font-bold transition-all shadow-sm shadow-orange-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
