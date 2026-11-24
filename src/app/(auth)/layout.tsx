// Telas de login e cadastro: sem cabeçalho, rodapé nem barra de baixo. Cada página monta a própria
// moldura com o AuthShell (foto, título e formulário).
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main id="conteudo">{children}</main>;
}
