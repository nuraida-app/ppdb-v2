/**
 * Format number to Indonesian Rupiah currency
 * @param {number} number - The number to be formatted
 * @returns {string} - Formatted currency string
 */
const formatRupiah = (number) => {
  if (number === null || number === undefined) return "Rp 0";

  // Convert to number if it's a string
  const num = typeof number === "string" ? parseFloat(number) : number;

  // Check if the conversion resulted in a valid number
  if (isNaN(num)) return "Rp 0";

  // Format the number with thousands separator
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  return `Rp ${formatted}`;
};

export default formatRupiah;
