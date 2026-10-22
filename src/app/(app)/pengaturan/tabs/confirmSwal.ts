import Swal from "sweetalert2";

export const confirmSwal = async (text: string) => {
  const result = await Swal.fire({
    title: text,
    showCancelButton: true,
    confirmButtonText: "Ya, Lanjutkan",
    cancelButtonText: "Batal",
    width: "400px",
    padding: "1.5rem",
    buttonsStyling: false,
    customClass: {
      popup:
        "font-sans rounded-xl border border-gray-200 dark:border-[#2C3246] bg-white dark:bg-[#141B31] shadow-xl",
      title: "!text-lg !font-semibold text-gray-900 dark:text-white !leading-snug !m-0",
      actions: "w-full flex gap-3 mt-6 mb-0 justify-end",
      confirmButton:
        "bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap outline-none border-none",
      cancelButton:
        "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap outline-none border-none",
    },
  });
  return result.isConfirmed;
};
