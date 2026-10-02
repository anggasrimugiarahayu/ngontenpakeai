"use client";

import { useState } from "react";
import Image from "next/image";
import { updateProfile } from "./actions";

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
    <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-[#121214]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Profil</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Informasi akun kamu.</p>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 shrink-0">
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
        <div className="space-y-2 border-t border-gray-200 dark:border-white/5 pt-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nama
          </label>
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={user?.name || ""}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
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
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 cursor-not-allowed"
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
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-6 py-2.5 md:py-2 rounded-lg bg-orange-700/80 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
