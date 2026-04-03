# 💸 Calculadora de Cédulas & Moedas

Uma aplicação web premium, **mobile-first** e extremamente intuitiva, projetada para profissionais que precisam de agilidade e precisão na contagem de dinheiro, fechamento de caixa e cálculo de troco.

👉 **[Acesse a Versão de Produção](https://carloshatus.github.io/calculate-bills)**

## ✨ Destaques da Nova Versão (v2.0)

Esta versão passou por um **overhaul completo de UI/UX**, focando em usabilidade com uma mão, estética moderna e segurança de dados.

- 📱 **Mobile-First Real**: Layout otimizado para telas de celular, com botões táteis e áreas de toque ampliadas.
- 🎨 **Design Moderno**: Interface limpa com uso de Glassmorphism, transições suaves e paleta de cores de alto contraste.
- 🍔 **Menu Inteligente**: Sistema de menu lateral organizado para maximizar a área de trabalho.
- 🛡️ **Segurança de Dados Avançada**: Fluxo de "Save & Clear" e "Backup-before-Restore" que garante que você nunca perca uma contagem acidentalmente.
- 📦 **Arquitetura Escalável**: Lógica de negócio centralizada em `Services` (History, Storage) para fácil manutenção.
- 🎨 **Consistência Visual**: Padronização rigorosa de ícones e cores para ações globais (Restaurar, Limpar, Compartilhar).

## 🚀 Funcionalidades Principais

- **Contagem em Tempo Real**: Insira quantidades e veja o total geral atualizar instantaneamente.
- **Identificação Personalizada**: Gerencie múltiplos cálculos dando nomes a cada um.
- **Histórico Inteligente**: Salve, pesquise, edite nomes e visualize detalhes de contagens passadas.
- **Restauração Segura**: Recupere qualquer contagem do histórico com opção de backup automático da contagem atual.
- **Compartilhamento Profissional**: Gere e compartilhe imagens de alta qualidade das suas contagens.
- **Modo Offline (PWA)**: Totalmente funcional sem internet, com persistência local robusta.

## 🛠️ Tecnologias Utilizadas

- **Framework**: [SvelteKit](https://kit.svelte.dev/) (v1.20) & [TypeScript](https://www.typescriptlang.org/) (v5.1)
- **Build Tool**: [Vite](https://vitejs.dev/) (v4.5)
- **Estilização**: Design System Baseado em Variáveis HSL (Custom CSS)
- **Segurança**: Dependências fixadas e auditadas para garantir estabilidade e proteção contra XSS.
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
