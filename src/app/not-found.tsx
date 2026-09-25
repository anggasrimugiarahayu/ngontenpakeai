import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-6xl font-black text-rn-accent font-heading">404</h1>
        <h2 className="text-2xl font-bold">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-400">
          Maaf, halaman yang kamu cari mungkin sudah dihapus, namanya berubah, atau memang tidak pernah ada.
        </p>
        <div className="pt-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center bg-rn-accent text-black font-bold px-8 py-4 rounded-xl hover:bg-rn-accent/90 transition-all shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:shadow-[0_0_30px_rgba(255,184,0,0.5)] transform hover:scale-[1.02]"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
