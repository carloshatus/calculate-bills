# 💸 Calculadora de Cédulas & Moedas

Uma aplicação web premium, **mobile-first** e extremamente intuitiva, projetada para profissionais que precisam de agilidade e precisão na contagem de dinheiro, fechamento de caixa e cálculo de troco.

👉 **[Acesse a Versão de Produção](https://carloshatus.github.io/calculate-bills)**

## ✨ Destaques da Nova Versão (v2.0)

Esta versão passou por um **overhaul completo de UI/UX**, focando em usabilidade com uma mão, estética moderna e segurança de dados.

- 📱 **Mobile-First Real**: Layout otimizado para telas de celular, com botões táteis e áreas de toque ampliadas.
- 🎨 **Design Moderno**: Interface limpa com uso de Glassmorphism, transições suaves e paleta de cores de alto contraste.
- 🍔 **Menu Inteligente**: Sistema de menu lateral (hambúrguer) que organiza as ações e limpa a área de trabalho.
- 🛡️ **Segurança Total (Save & Clear)**: Novo fluxo de trabalho que permite salvar a contagem atual antes de limpar a tela ou restaurar dados antigos.
- 📦 **Componentes Premium**: Substituição de alertas nativos por **Modais Customizados** com feedback visual por cores.

## 🚀 Funcionalidades Principais

- **Contagem em Tempo Real**: Insira quantidades e veja o total geral (e parciais) atualizar instantaneamente.
- **Identificação por Nome**: Dê nomes personalizados às suas contagem diretamente no cabeçalho.
- **Histórico Completo**: Salve, visualize, edite nomes e restaure contagens passadas com um toque.
- **Calculadora de Troco**: Algoritmo que sugere a melhor combinação de notas/moedas com base no seu saldo atual de caixa.
- **Observações Inteligentes**: Adicione notas rápidas que são salvas e exportadas junto com a contagem.
- **Compartilhamento Visual**: Gere uma imagem profissional da sua contagem para enviar por WhatsApp ou E-mail.
- **Modo Offline (PWA)**: Instale como um aplicativo no seu celular e use mesmo sem internet.

## 🛠️ Tecnologias Utilizadas

- **Framework**: [SvelteKit](https://kit.svelte.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilização**: CSS Puro (Design System baseado em variáveis HSL)
- **Componentes**: Custom Svelte Components (Header, Modal, Totals, BillRow)
- **Ícones**: [Svelte Icons Pack](https://github.com/Cweili/svelte-icons-pack)
- **Testes**: [Playwright](https://playwright.dev/) para E2E & [Vitest](https://vitest.dev/) para Unitários.

## 💻 Como Executar Localmente

### Pré-requisitos

- Node.js (v18+)
- npm ou yarn

### Instalação e Desenvolvimento

```bash
# 1. Clone o projeto
git clone https://github.com/seu-usuario/calculate-bills-v0.git

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no seu navegador.

## 🧪 Qualidade do Código

O projeto conta com uma cobertura rigorosa de testes para garantir que os cálculos e a persistência funcionem sempre:

- **E2E**: `npm test` (Executa fluxos completos de usuário)
- **Unitários**: `npm run test:unit` (Valida lógica de moedas e tempo)

## 📦 Build para Produção

```bash
npm run build
npm run preview
```

---

_Desenvolvido por [Carlos Hatus](https://carloshatus.github.io/) com foco em velocidade, precisão e experiência do usuário._
