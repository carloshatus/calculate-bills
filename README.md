# Calculadora de Cédulas

Uma aplicação web simples e eficiente para auxiliar na contagem de dinheiro (cédulas e moedas) e no cálculo de troco.

## Funcionalidades

- **Contagem de Cédulas e Moedas**: Insira a quantidade de cada cédula e moeda para obter o total.
- **Cálculo em Tempo Real**: Os totais são atualizados automaticamente à medida que você digita.
- **Observações**: Adicione notas ou observações à sua contagem.
- **Calculadora de Troco**: Uma ferramenta para ajudar a determinar as notas necessárias para um determinado valor de troco, com base nas notas disponíveis.
- **Persistência de Dados**: Suas contagens e observações são salvas no `localStorage` do seu navegador, para que você não perca seu trabalho ao recarregar a página.
- **Compartilhamento**: Exporte e compartilhe sua contagem como uma imagem.
- **Progressive Web App (PWA)**: Pode ser "instalado" em dispositivos móveis para uma experiência de aplicativo nativo.

## Páginas

### 1. Calculadora Principal

A página principal onde você pode realizar a contagem de cédulas e moedas.

- Insira a quantidade de cada item.
- As somas parciais e o total geral são calculados instantaneamente.
- Adicione observações de texto livre.
- Limpe todos os campos para recomeçar.
- Dê um nome à sua contagem para fácil identificação ao compartilhar.

### 2. Trocar Notas

Acessível através do ícone de troca na calculadora principal, esta página ajuda a calcular o troco.

- Informe um valor para o qual você precisa dar troco.
- A calculadora usará as notas e moedas (de R$20 para baixo) que você informou ter na página principal para sugerir a melhor combinação para o troco.

## Tecnologias Utilizadas

- [SvelteKit](https://kit.svelte.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Svelte Icons Pack](https://github.com/Cweili/svelte-icons-pack)
- CSS puro para estilização.
- [Playwright](https://playwright.dev/) para testes End-to-End.

## Como Executar o Projeto Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/calculate-bills-v0.git
cd calculate-bills-v0
npm install
```

### Desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra seu navegador e acesse `http://localhost:5173` (ou a porta indicada no seu terminal).

## Executando Testes

O projeto inclui testes end-to-end (E2E) com Playwright e testes de unidade com Vitest.

### Testes End-to-End (E2E)

Para executar os testes E2E com Playwright:

```bash
npm test
```

### Testes de Unidade

Para executar os testes de unidade com Vitest:

```bash
npm run test:unit
```

## Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Você pode visualizar o build de produção com `npm run preview`.

> Para fazer o deploy da sua aplicação, você pode precisar instalar um [adapter](https://kit.svelte.dev/docs/adapters) para o seu ambiente de destino.