import Swal from "sweetalert2";
import { tokens, cn } from "@/lib/design-tokens";

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
      popup: cn("font-sans", tokens.card.base, "shadow-xl"),
      title: "!text-lg !font-semibold text-gray-900 dark:text-white !leading-snug !m-0",
      actions: "w-full flex gap-3 mt-6 mb-0 justify-end",
      confirmButton: cn(tokens.button.variants.primary, "font-bold px-5 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap outline-none border-none cursor-pointer"),
      cancelButton: cn(tokens.button.variants.secondary, "font-bold px-5 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap outline-none cursor-pointer"),
    },
  });
  return result.isConfirmed;
};
