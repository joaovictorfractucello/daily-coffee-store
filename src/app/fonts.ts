import { Anton, Manrope } from "next/font/google";
// import localFont from "next/font/local";

// Fonte dos títulos (variável CSS --font-display).
//
// TODO(Brownland): a Brownland é a fonte de títulos escolhida, mas o arquivo ainda não está no
// projeto e o next/font/local quebra o build com arquivo ausente. Até lá usamos a Anton.
// Para ativar a Brownland:
//   1. Salve o arquivo em public/fonts/Brownland.otf
//   2. Descomente o import de localFont na linha 2
//   3. Apague o bloco "fonteTitulo = Anton(...)" abaixo
//   4. Descomente o bloco "fonteTitulo = localFont(...)" logo depois dele
//   5. Abra a página e confira os acentos dos títulos (É, Á, Ç, Ã, Ó)
export const fonteTitulo = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

// export const fonteTitulo = localFont({
//   src: "../../public/fonts/Brownland.otf",
//   display: "swap",
//   variable: "--font-display",
// });

// Fonte de texto (variável CSS --font-text): menu, botões, descrições, preços e cardápio.
export const fonteTexto = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-text",
});
