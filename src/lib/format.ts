const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// 14 -> "R$ 14,00"
export function formatPrice(priceInReais: number) {
  return priceFormatter.format(priceInReais);
}

// "5511999999999" -> "(11) 99999-9999". Aceita número com ou sem o DDI 55.
export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  const areaCode = digits.slice(0, 2);
  const rest = digits.slice(2);
  const cut = rest.length === 9 ? 5 : 4;
  return `(${areaCode}) ${rest.slice(0, cut)}-${rest.slice(cut)}`;
}

// "07:00" -> "7h", "19:30" -> "19h30"
export function formatTime(hourMinute: string) {
  const [hour, minute] = hourMinute.split(":").map(Number);
  return minute ? `${hour}h${String(minute).padStart(2, "0")}` : `${hour}h`;
}
