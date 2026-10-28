# CSS Gerador com IA

**Gerador de interfaces HTML e CSS utilizando Inteligência Artificial Generativa.**

Aplicação web desenvolvida para transformar descrições em linguagem natural em interfaces HTML e CSS, com geração automática de código e visualização instantânea no navegador.

O projeto integra **Google Gemini, Cloudflare Workers e GitHub Pages**, utilizando uma arquitetura que separa o frontend do processamento de IA.

## 🌐 Demonstração Online

**[Acessar CSS Gerador com IA](https://thiagofoztt-creator.github.io/CSS-Gerador-com-IA/)**

### Exemplo de utilização

Digite uma descrição como:

> Crie um card moderno de produto com título, descrição e botão verde.

A aplicação processa a solicitação e apresenta:

- Código HTML estruturado.
- Estilos CSS incorporados ao documento.
- Prévia visual da interface gerada.
- Opção para copiar o código.

## 🚀 Funcionalidades

- ✅ Geração automática de HTML e CSS com IA.
- ✅ Integração com Google Gemini 2.5 Flash.
- ✅ Visualização do resultado em tempo real.
- ✅ Cópia do código gerado.
- ✅ Interface responsiva.
- ✅ Validação das descrições enviadas.
- ✅ Tratamento de erros da API.
- ✅ Proteção contra solicitações automatizadas com Cloudflare Turnstile.
- ✅ Controle de requisições e cota diária.
- ✅ Separação entre frontend e backend.

## 🛠️ Tecnologias Utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript Vanilla
- Fetch API
- GitHub Pages

### Backend

- Cloudflare Workers
- JavaScript
- API REST
- Cloudflare Durable Objects
- SQLite Storage
- Cloudflare Rate Limiting

### Inteligência Artificial

- Google Gemini API
- Modelo Gemini 2.5 Flash
- Engenharia de prompts

### Ferramentas

- Git
- GitHub
- Visual Studio Code
- Cloudflare Wrangler

## 🏗️ Arquitetura do Sistema

O sistema utiliza uma arquitetura com frontend estático e backend serverless.

**Fluxo de processamento:**

1. O usuário acessa o frontend no GitHub Pages.
2. Digita a descrição da interface desejada.
3. O frontend realiza a validação básica da entrada.
4. O Cloudflare Turnstile fornece um token de verificação.
5. A solicitação é enviada ao Cloudflare Worker.
6. O Worker valida a origem, a entrada, o token e os limites de utilização.
7. O Worker consulta a Google Gemini API.
8. A resposta é devolvida ao frontend.
9. O HTML/CSS é exibido e renderizado em um iframe com sandbox.

```text
Usuário
   |
   v
GitHub Pages
   |
   v
JavaScript / Fetch API
   |
   v
Cloudflare Worker
   |
   +-- Validação de entrada
   +-- Cloudflare Turnstile
   +-- Rate Limiting
   +-- Durable Object
   |
   v
Google Gemini API
   |
   v
HTML + CSS
   |
   v
Código + Preview
```

## 🔒 Segurança e Controle de Uso

O projeto implementa diferentes mecanismos de proteção:

- Chave da API Gemini mantida no ambiente do Cloudflare Worker.
- Validação de token do Cloudflare Turnstile no servidor.
- Restrição de origem para solicitações do frontend oficial.
- Rate limit configurado para 5 requisições por 60 segundos.
- Cota global configurada para 20 gerações diárias.
- Validação de descrições entre 5 e 500 caracteres.
- Controle de ativação da geração por variável de ambiente.
- Tratamento de códigos de erro HTTP.
- Renderização do código gerado em iframe com sandbox.

Essas medidas reduzem riscos operacionais e ajudam a controlar o consumo da API, mas não substituem testes e auditorias de segurança.

## 📁 Estrutura do Projeto

```text
CSS-Gerador-com-IA/
│
├── index.html
├── style.css
├── scripts.js
├── readme.md
├── .gitignore
├── wrangler.jsonc
│
└── worker/
    └── index.js
```

**Principais arquivos:**

- `index.html`: estrutura da interface.
- `style.css`: estilização responsiva.
- `scripts.js`: interação com o usuário, chamadas à API e renderização.
- `worker/index.js`: validação, limites de utilização e integração com Gemini.
- `wrangler.jsonc`: configuração do Cloudflare Worker.
- `.gitignore`: exclusão de arquivos locais e sensíveis do versionamento.

## 💻 Executando Localmente

Clone o repositório:

```bash
git clone https://github.com/thiagofoztt-creator/CSS-Gerador-com-IA.git
```

Acesse a pasta:

```bash
cd CSS-Gerador-com-IA
```

Abra o projeto no Visual Studio Code e utilize a extensão Live Server para visualizar a interface.

**Observação:** a visualização local do frontend não garante o funcionamento da geração por IA. O Turnstile e o backend estão configurados para o domínio público do projeto. A geração completa depende da configuração e disponibilidade desses serviços.

## 🔌 API

### Consultar status do serviço

```http
GET /health
```

### Solicitar geração de código

```http
POST /api/gerar-codigo
Content-Type: application/json
```

Exemplo de estrutura da solicitação:

```json
{
  "descricao": "Crie um botão verde moderno",
  "turnstileToken": "TOKEN_VALIDO_DO_TURNSTILE"
}
```

A API exige validação de segurança e respeita os limites de utilização configurados.

## 🧠 Conhecimentos Aplicados

- Desenvolvimento frontend.
- Consumo e integração de APIs REST.
- Programação JavaScript assíncrona.
- Arquitetura serverless.
- Inteligência Artificial Generativa.
- Engenharia de prompts.
- Validação de dados.
- Segurança de aplicações web.
- Controle de consumo de serviços externos.
- Tratamento de erros HTTP.
- Integração e implantação com GitHub e Cloudflare.

## 📈 Melhorias Futuras

- Histórico de prompts e gerações.
- Biblioteca de componentes reutilizáveis.
- Exportação organizada dos arquivos HTML e CSS.
- Templates de interface.
- Seleção de temas visuais.
- Monitoramento de utilização da API.
- Testes automatizados.
- Melhorias de acessibilidade.
- Aprimoramento da experiência em dispositivos móveis.

## 👨‍💻 Autor

**Thiago de Almeida Teles**

Desenvolvimento de software, aplicações web, integração de APIs e soluções com Inteligência Artificial.

- [GitHub](https://github.com/thiagofoztt-creator)
- [LinkedIn](https://linkedin.com/in/thiago-de-almeida-teles)
- [Portfólio](https://thiagofoztt-creator.github.io/portfolio/)

---

Projeto desenvolvido para aplicação prática de conhecimentos em desenvolvimento web, arquitetura serverless e integração com Inteligência Artificial Generativa.
