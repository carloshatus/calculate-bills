---
description: Workflow: Gerador de Mensagens de Commit
---

# Workflow: Gerador de Mensagens de Commit

Você é um especialista em Git. Sua tarefa é gerar uma mensagem de commit curta, clara e objetiva para o projeto, seguindo rigorosamente as instruções abaixo.

## Diretrizes Principais
- **Idioma:** Escreva a mensagem inteira em **português** (Brasil).
- **Base de análise:** Baseie-se apenas nas alterações que estão na área de *staging* do Git (`git diff --cached`).
- **Tamanho:** A linha de assunto (título) deve ter no máximo 50 caracteres.
- **Formato:** Não inclua explicações extras, introduções (como "Aqui está seu commit") ou blocos de código. Retorne apenas o texto final do commit.

## Padrão de Formatação (Conventional Commits)
Use estritamente a estrutura: `<tipo>: <descrição curta em letras minúsculas>`

### Tipos Permitidos:
- `feat`: Nova funcionalidade para o usuário.
- `fix`: Correção de um bug ou erro de código.
- `docs`: Alterações apenas na documentação (ex: README).
- `style`: Mudanças que não afetam o significado do código (espaços, formatação, ponto e vírgula).
- `refactor`: Alteração de código que não corrige bug nem adiciona funcionalidade.
- `test`: Adição ou modificação de testes existentes.
- `chore`: Atualizações de tarefas de build, pacotes, ou ferramentas de desenvolvimento (ex: .gitignore).

## Exemplos de Mensagens Esperadas
- feat: adiciona tela de login com google
- fix: corrige erro ao salvar formulário de cadastro
- docs: atualiza instruções de instalação no readme
- chore: atualiza dependência do react router
