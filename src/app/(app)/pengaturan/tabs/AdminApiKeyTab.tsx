"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Key,
  ExternalLink,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { InstagramIcon } from "@/app/(app)/ruang-riset/components/RisetIcons";
import {
  saveAppSetting,
  deleteAppSetting,
  testInstagramSessionAction,
  saveInstagramSessionAction,
  deleteInstagramSessionAction,
  saveRapidApiKeyAction,
} from "@/app/actions/adminSettings";
import { confirmSwal } from "./confirmSwal";
import { RISET_CONFIG_KEY, InstagramRisetConfig } from "@/lib/riset-config";

export function AdminApiKeyTab({ settings }: { settings: any[] }) {
  // 1. Google Gemini API Key
  const initialApiKey =
    settings?.find((s: any) => s.key === "DEFAULT_GEMINI_API_KEY")?.value || "";
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState(initialApiKey);
  const [loadingKey, setLoadingKey] = useState(false);

  // 2. Instagram & Riset Config
  const rawRisetSetting = settings?.find((s: any) => s.key === RISET_CONFIG_KEY)?.value;
  let parsedRiset: InstagramRisetConfig = {};
  if (rawRisetSetting) {
    try {
      parsedRiset = JSON.parse(rawRisetSetting);
    } catch {}
  }

  const [instagramSessionIdInput, setInstagramSessionIdInput] = useState("");
  const [savedSessionId, setSavedSessionId] = useState(parsedRiset.instagramSessionId || "");
  const [sessionStatus, setSessionStatus] = useState<"VALID" | "EXPIRED" | "UNKNOWN">(
    (parsedRiset.sessionStatus as any) || (parsedRiset.instagramSessionId ? "UNKNOWN" : "UNKNOWN")
  );
  const [lastCheckedAt, setLastCheckedAt] = useState(parsedRiset.lastCheckedAt || "");
  const [statusError, setStatusError] = useState(parsedRiset.statusError || "");
  const [testingSession, setTestingSession] = useState(false);
  const [savingSession, setSavingSession] = useState(false);

  // 3. RapidAPI Key
  const [rapidApiKeyInput, setRapidApiKeyInput] = useState("");
  const [savedRapidApiKey, setSavedRapidApiKey] = useState(parsedRiset.rapidApiKey || "");
  const [savingRapid, setSavingRapid] = useState(false);

  // =========================================================================
  // HANDLERS: GOOGLE GEMINI KEY
  // =========================================================================
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    setLoadingKey(true);
    try {
      await saveAppSetting("DEFAULT_GEMINI_API_KEY", apiKey.trim());
      setSavedKey(apiKey.trim());
      setApiKey("");
      toast.success("Google API Key berhasil disimpan!");
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan API Key");
    } finally {
      setLoadingKey(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!(await confirmSwal("Yakin ingin menghapus Google API Key Global?"))) return;
    setLoadingKey(true);
    try {
      await deleteAppSetting("DEFAULT_GEMINI_API_KEY");
      setApiKey("");
      setSavedKey("");
      toast.success("Google API Key berhasil dihapus!");
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus API Key");
    } finally {
      setLoadingKey(false);
    }
  };

  // =========================================================================
  // HANDLERS: INSTAGRAM SESSION ID
  // =========================================================================
  const handleTestSession = async () => {
    setTestingSession(true);
    const toastId = toast.loading("Menguji koneksi ke Instagram...");
    try {
      const res = await testInstagramSessionAction();
      if (res.status === "VALID") {
        setSessionStatus("VALID");
        setStatusError("");
        setLastCheckedAt(new Date().toISOString());
        toast.success(res.message || "Session ID Aktif & Terverifikasi!", { id: toastId });
      } else if (res.status === "EXPIRED") {
        setSessionStatus("EXPIRED");
        setStatusError(res.message);
        setLastCheckedAt(new Date().toISOString());
        toast.error(res.message || "Session ID kadaluarsa / ditolak oleh Instagram!", { id: toastId });
      } else {
        setSessionStatus("UNKNOWN");
        setStatusError(res.message);
        setLastCheckedAt(new Date().toISOString());
        toast.error(res.message || "Respon Instagram tidak terduga", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || "Gagal menguji sesi Instagram", { id: toastId });
    } finally {
      setTestingSession(false);
    }
  };

  const handleSaveInstagramSession = async () => {
    if (!instagramSessionIdInput.trim()) return;
    setSavingSession(true);
    const toastId = toast.loading("Memverifikasi & menyimpan Session ID...");
    try {
      const res = await saveInstagramSessionAction(instagramSessionIdInput.trim());
      if (res.success) {
        setSavedSessionId(instagramSessionIdInput.trim());
        setInstagramSessionIdInput("");
        setLastCheckedAt(new Date().toISOString());
        if (res.testStatus === "VALID") {
          setSessionStatus("VALID");
          setStatusError("");
          toast.success("Session ID berhasil diverifikasi dan disimpan AKTIF!", { id: toastId });
        } else {
          setSessionStatus(res.testStatus as any);
          setStatusError(res.message || "");
          toast.error(res.message || "Gagal verifikasi sesi", { id: toastId, duration: 5000 });
        }
      } else {
        toast.error(res.error || "Gagal menyimpan Session ID", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan server", { id: toastId });
    } finally {
      setSavingSession(false);
    }
  };

  const handleDeleteInstagramSession = async () => {
    if (!(await confirmSwal("Yakin ingin menghapus Instagram Session ID? Ruang Riset Instagram akan dibatasi jika sesi dihapus."))) {
      return;
    }
    setSavingSession(true);
    try {
      await deleteInstagramSessionAction();
      setSavedSessionId("");
      setSessionStatus("UNKNOWN");
      setStatusError("");
      toast.success("Instagram Session ID berhasil dihapus!");
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus Session ID");
    } finally {
      setSavingSession(false);
    }
  };

  // =========================================================================
  // HANDLERS: RAPIDAPI KEY
  // =========================================================================
  const handleSaveRapidKey = async () => {
    if (!rapidApiKeyInput.trim()) return;
    setSavingRapid(true);
    try {
      await saveRapidApiKeyAction(rapidApiKeyInput.trim());
      setSavedRapidApiKey(rapidApiKeyInput.trim());
      setRapidApiKeyInput("");
      toast.success("RapidAPI Key berhasil disimpan!");
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan RapidAPI Key");
    } finally {
      setSavingRapid(false);
    }
  };

  const getMaskedKey = (key: string) => {
    if (!key) return "-";
    if (key.length <= 12) return "••••••••••••";
    return key.substring(0, 6) + "••••••••••••" + key.substring(key.length - 4);
  };

  const formatLastChecked = (isoString?: string) => {
    if (!isoString) return "Belum pernah diuji";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. ALERT BANNER: JIKA SESI INSTAGRAM EXPIRED / KADALUARSA */}
      {/* ========================================================================= */}
      {sessionStatus === "EXPIRED" && (
        <div className="border border-red-500/30 bg-red-500/10 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-red-600 dark:text-red-400 shadow-sm animate-pulse">
          <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-sm sm:text-base text-red-700 dark:text-red-300">
              Perhatian: Instagram Session ID Kadaluarsa / Ditolak Meta
            </h4>
            <p className="text-xs sm:text-sm text-red-600/90 dark:text-red-400/90 leading-relaxed">
              Instagram menolak sesi scraping yang tersimpan (terjadi redirect loop ke halaman login). Akibatnya pengguna akan melihat pesan akun tidak ditemukan di Ruang Riset Instagram. Silakan masukkan Session ID baru di bawah ini.
            </p>
            {statusError && (
              <p className="text-xs font-mono bg-red-500/10 px-2.5 py-1 rounded-md inline-block mt-1">
                Detail: {statusError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TABEL RINGKASAN STATUS KREDENSIAL SISTEM */}
      {/* ========================================================================= */}
      <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#141B31] shadow-xs">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-[#2C3246] pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-500" /> Ringkasan Kredensial Global
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Pantau status kesehatan dan validitas seluruh API Key dan Session Cookie sistem dari satu tempat.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestSession}
            disabled={testingSession || !savedSessionId}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-[#2C3246] bg-gray-50 dark:bg-[#0A1128] hover:bg-gray-100 dark:hover:bg-[#1f2947] text-gray-700 dark:text-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingSession ? "animate-spin" : ""}`} />
            <span>Uji Status Sesi IG</span>
          </button>
        </div>

        {/* Tabel Kredensial */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2C3246] text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Jenis Kredensial</th>
                <th className="py-3 px-3">Fungsi Modul</th>
                <th className="py-3 px-3">Nilai Aktif</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Terakhir Diperiksa</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2C3246]/50">
              {/* Row 1: Google Gemini API */}
              <tr className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span>Google Gemini API</span>
                </td>
                <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 text-xs">
                  AI Ruang Ngonten & Builders
                </td>
                <td className="py-3.5 px-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                  {getMaskedKey(savedKey)}
                </td>
                <td className="py-3.5 px-3">
                  {savedKey ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-white/5 text-gray-500">
                      Belum Diatur
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 text-xs">
                  {savedKey ? "Tersimpan di DB" : "-"}
                </td>
                <td className="py-3.5 px-3 text-right">
                  {savedKey && (
                    <button
                      type="button"
                      onClick={handleDeleteApiKey}
                      disabled={loadingKey}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Hapus API Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>

              {/* Row 2: Instagram Scraping Session */}
              <tr className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <span>Instagram Session ID</span>
                </td>
                <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 text-xs">
                  Scraping Ruang Riset Instagram
                </td>
                <td className="py-3.5 px-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                  {getMaskedKey(savedSessionId)}
                </td>
                <td className="py-3.5 px-3">
                  {!savedSessionId ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-white/5 text-gray-500">
                      Belum Diatur
                    </span>
                  ) : sessionStatus === "VALID" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" /> Aktif & Terverifikasi
                    </span>
                  ) : sessionStatus === "EXPIRED" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" /> Kadaluarsa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Belum Teruji
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 text-xs">
                  {formatLastChecked(lastCheckedAt)}
                </td>
                <td className="py-3.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {savedSessionId && (
                      <>
                        <button
                          type="button"
                          onClick={handleTestSession}
                          disabled={testingSession}
                          className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                          title="Uji Status Koneksi Sesi Ini"
                        >
                          <RefreshCw className={`w-4 h-4 ${testingSession ? "animate-spin" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteInstagramSession}
                          disabled={savingSession}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Hapus Session ID"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>

              {/* Row 3: RapidAPI Scraper Key (Fallback) */}
              <tr className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4" />
                  </div>
                  <span>RapidAPI Scraper Key</span>
                </td>
                <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 text-xs">
                  Fallback Riset IG (Residential Proxy)
                </td>
                <td className="py-3.5 px-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                  {getMaskedKey(savedRapidApiKey)}
                </td>
                <td className="py-3.5 px-3">
                  {savedRapidApiKey ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Terpasang
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-white/5 text-gray-400">
                      Opsional
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 text-xs">
                  {savedRapidApiKey ? "Siap Sebagai Fallback" : "-"}
                </td>
                <td className="py-3.5 px-3 text-right">
                  {savedRapidApiKey && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (await confirmSwal("Hapus RapidAPI Key?")) {
                          await saveRapidApiKeyAction("");
                          setSavedRapidApiKey("");
                          toast.success("RapidAPI Key dihapus");
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Hapus RapidAPI Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FORM KELOLA: INSTAGRAM SCRAPING SESSION ID */}
      {/* ========================================================================= */}
      <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#141B31] shadow-xs">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <InstagramIcon className="w-5 h-5 text-pink-500" /> Perbarui Instagram Session ID (Riset)
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Session ID diperlukan oleh modul Ruang Riset Instagram untuk menarik konten postingan, reels, statistik interaksi, dan outlier score secara live dari Instagram.
          </p>
        </div>

        {/* Panduan Cara Mendapatkan Session ID */}
        <div className="mb-6 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          <h4 className="font-bold text-orange-700 dark:text-orange-500 mb-2">
            Cara Mengambil Cookie Session ID dari Akun Instagram:
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
            <li>Buka browser dan login ke akun Instagram (sangat disarankan akun cadangan/tumbal).</li>
            <li>Buka <strong>Developer Tools / Inspect Element</strong> (tekan <kbd className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded font-mono">F12</kbd> atau klik kanan &rarr; Inspect).</li>
            <li>Masuk ke tab <strong>Application</strong> &rarr; pilih menu <strong>Cookies</strong> &rarr; klik <code className="text-orange-600 dark:text-orange-400 font-bold">https://www.instagram.com</code>.</li>
            <li>Cari nama cookie <strong className="font-mono bg-orange-500/10 px-1 rounded">sessionid</strong>, lalu salin (*copy*) nilai panjangnya (biasanya berawalan angka ID akun diikuti <code className="font-mono">%3A...</code>).</li>
            <li>Tempelkan (*paste*) nilai tersebut di kolom bawah, lalu klik <strong>Verifikasi & Simpan</strong>.</li>
          </ol>
        </div>

        {/* Input Form Session ID */}
        <div className="space-y-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Paste Session ID Baru
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={instagramSessionIdInput}
              onChange={(e) => setInstagramSessionIdInput(e.target.value)}
              placeholder="Contoh: 60272501137%3AtAKY3t0Aftc21s%3A8%3AAYnAfTvEt8jxe..."
              autoComplete="off"
              className="flex-1 w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#0A1128] text-gray-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleSaveInstagramSession}
              disabled={savingSession || !instagramSessionIdInput.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 shadow-sm shadow-orange-500/20 cursor-pointer shrink-0"
            >
              {savingSession ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Verifikasi & Simpan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FORM KELOLA: GOOGLE GEMINI API KEY GLOBAL */}
      {/* ========================================================================= */}
      <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#141B31] shadow-xs">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" /> Perbarui Google Gemini API Key Global
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            API Key bawaan sistem untuk melayani pembuatan konten otomatis bagi pengguna gratis atau pengguna yang belum memasukkan API Key pribadi.
          </p>
        </div>

        {/* Panduan Google AI Studio */}
        <div className="mb-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2">
            Cara Mendapatkan Google AI Studio Key:
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
            <li>
              Kunjungi portal{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>.
            </li>
            <li>Klik tombol <strong>Create API key</strong>, lalu salin kode berawalan <code className="font-mono bg-blue-500/10 px-1 rounded">AIzaSy...</code>.</li>
            <li>Tempelkan pada kolom di bawah ini dan klik Simpan.</li>
          </ol>
        </div>

        <div className="space-y-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            Paste Google Gemini Key
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              autoComplete="new-password"
              className="flex-1 w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#0A1128] text-gray-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleSaveApiKey}
              disabled={loadingKey || !apiKey.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 shadow-sm shadow-orange-500/20 cursor-pointer shrink-0"
            >
              {loadingKey ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan API Key</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FORM KELOLA: RAPIDAPI KEY (FALLBACK OPSIONAL) */}
      {/* ========================================================================= */}
      <div className="border border-gray-200 dark:border-[#2C3246] rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#141B31] shadow-xs">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-500" /> RapidAPI Instagram Scraper (Fallback Kuat)
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Opsional. Menggunakan scraper pihak ketiga berbasis residential proxy yang tahan banting terhadap pemblokiran IP cloud server. Jika diisi, sistem otomatis menggunakannya ketika Session ID gagal.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
            RapidAPI Key
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              value={rapidApiKeyInput}
              onChange={(e) => setRapidApiKeyInput(e.target.value)}
              placeholder="Paste RapidAPI Key..."
              autoComplete="off"
              className="flex-1 w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-[#2C3246] bg-gray-50/50 dark:bg-[#0A1128] text-gray-900 dark:text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleSaveRapidKey}
              disabled={savingRapid || !rapidApiKeyInput.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 shadow-sm shadow-orange-500/20 cursor-pointer shrink-0"
            >
              {savingRapid ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan RapidAPI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
