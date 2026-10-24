const formatoPreco = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// 14 -> "R$ 14,00"
export function formatarPreco(reais: number) {
  return formatoPreco.format(reais);
}

// "5511999999999" -> "(11) 99999-9999". Aceita número com ou sem o DDI 55.
export function formatarTelefone(numero: string) {
  const digitos = numero.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  const ddd = digitos.slice(0, 2);
  const resto = digitos.slice(2);
  const corte = resto.length === 9 ? 5 : 4;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

// "07:00" -> "7h", "19:30" -> "19h30"
export function formatarHora(horaMinuto: string) {
  const [hora, minuto] = horaMinuto.split(":").map(Number);
  return minuto ? `${hora}h${String(minuto).padStart(2, "0")}` : `${hora}h`;
}
