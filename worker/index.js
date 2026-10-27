
import { DurableObject } from "cloudflare:workers";

export class CotaDiaria extends DurableObject {
  async reservar() {
    const dia = new Date().toISOString().slice(0, 10);
    const chave = `geracoes:${dia}`;
    const limite = 20;

    return await this.ctx.storage.transaction(async (txn) => {
      const atual = (await txn.get(chave)) ?? 0;

      if (atual >= limite) {
        return {
          permitido: false,
          utilizadas: atual,
          limite,
          dia
        };
      }

      const utilizadas = atual + 1;
      await txn.put(chave, utilizadas);

      return {
        permitido: true,
        utilizadas,
        limite,
        dia
      };
    });
  }
}


const ORIGEM_PERMITIDA =
  "https://thiagofoztt-creator.github.io";

const MODELO = "gemini-2.5-flash";


async function validarTurnstile(token, env) {
  if (
    !env.TURNSTILE_SECRET_KEY ||
    typeof token !== "string" ||
    token.length < 1 ||
    token.length > 2048
  ) {
    return false;
  }

  try {
    const resposta = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token
        })
      }
    );

    if (!resposta.ok) return false;

    const resultado = await resposta.json();

    return (
      resultado.success === true &&
      resultado.hostname ===
        "thiagofoztt-creator.github.io"
    );
  } catch (erro) {
    console.error("Falha na validação Turnstile");
    return false;
  }
}


function responder(dados, status = 200, origem = null) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };

  if (origem === ORIGEM_PERMITIDA) {
    headers["Access-Control-Allow-Origin"] = origem;
    headers["Vary"] = "Origin";
  }

  return new Response(JSON.stringify(dados), {
    status,
    headers
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origem = request.headers.get("Origin");

      try {
    // Instância separada da produção
    const contador =
        env.COTA_DIARIA.getByName("gerador-teste");

        const resultado = await contador.reservar();

        return responder(
          {
            ...resultado,
            gemini: "nao_utilizado"
          },
          resultado.permitido ? 200 : 429,
          origem
        );
      } catch {
        return responder(
          { error: "Falha no teste da cota" },
          500,
          origem
        );
      }
    }

    if (
      request.method === "GET" &&
      url.pathname === "/health"
    ) {
      return responder({
        status: "ok",
        service: "css-gerador-api",
        version: "1.1.0"
      });
    }

    {
      return responder(
        {
          status: resultado.success
            ? "permitido"
            : "bloqueado",
          limite: "5 requisições por 60 segundos",
          gemini: "não utilizado"
        },
        resultado.success ? 200 : 429
      );
    }
    
    if (url.pathname !== "/api/gerar-codigo") {
      return responder(
        { error: "Endpoint indisponível" },
        404,
        origem
      );
    }

    // Permitir preflight do navegador
    if (request.method === "OPTIONS") {
      if (origem !== ORIGEM_PERMITIDA) {
        return responder(
          { error: "Origem não autorizada" },
          403
        );
      }

      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origem,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "600",
          "Vary": "Origin"
        }
      });
    }

    if (request.method !== "POST") {
      return responder(
        { error: "Método não permitido" },
        405,
        origem
      );
    }

    // Bloquear origens diferentes do site autorizado
    if (origem !== ORIGEM_PERMITIDA) {
      return responder(
        { error: "Origem não autorizada" },
        403
      );
    }

    // Geração desativada até finalizar a proteção
    
    if (!env.GEMINI_API_KEY) {
      return responder(
        { error: "Serviço de IA não configurado" },
        503,
        origem
      );
    }

    try {
      // Limite compartilhado para testes iniciais
      const limite = await env.GEMINI_RATE_LIMIT.limit({
        key: "gerador-publico"
      });

      if (!limite.success) {
        return responder(
          { error: "Limite de requisições atingido" },
          429,
          origem
        );
      }

      const tipo = request.headers.get("Content-Type") || "";

      if (!tipo.toLowerCase().includes("application/json")) {
        return responder(
          { error: "Envie JSON válido" },
          415,
          origem
        );
      }

      const corpo = await request.text();

      if (corpo.length > 2000) {
        return responder(
          { error: "Requisição muito grande" },
          413,
          origem
        );
      }

      let dados;

      try {
        dados = JSON.parse(corpo);
      } catch {
        return responder(
          { error: "JSON inválido" },
          400,
          origem
        );
      }

      const descricao = dados.descricao;

      if (
        typeof descricao !== "string" ||
        descricao.trim().length < 5 ||
        descricao.length > 500
      ) {
        return responder(
          {
            error: "A descrição deve ter entre 5 e 500 caracteres"
          },
          400,
          origem
        );
      }

      
      // Verificação obrigatória do Turnstile
      const turnstileToken = dados.turnstileToken;

      if (
        typeof turnstileToken !== "string" ||
        !turnstileToken.trim()
      ) {
        return responder(
          { error: "Verificação de segurança obrigatória" },
          403,
          origem
        );
      }

      const tokenValido = await validarTurnstile(
        turnstileToken,
        env
      );

      if (!tokenValido) {
        return responder(
          {
            error: "Verificação de segurança inválida ou expirada"
          },
          403,
          origem
        );
      }
      
      // Validar Turnstile antes de verificar a geração
      if (env.ENABLE_GENERATION !== "true") {
        return responder(
          { error: "Geração temporariamente desativada" },
          503,
          origem
        );
      }



      const prompt = `
Você é um gerador de componentes HTML e CSS.

Crie uma interface visual conforme a descrição.

Descrição:
${descricao}

Regras:
- Retorne um documento HTML completo.
- Inclua o CSS dentro de uma tag style.
- Use HTML5 e CSS moderno.
- Não inclua JavaScript.
- Não inclua scripts ou eventos inline.
- Não carregue recursos externos.
- Não inclua links para arquivos externos.
- Não use iframes.
- Não utilize imagens remotas.
- Responda somente com o HTML.
- Não utilize blocos Markdown.
`;

      // Reservar uma unidade da cota diária
      if (!env.COTA_DIARIA) {
        return responder(
          { error: "Controle de cota indisponível" },
          503,
          origem
        );
      }

      const id = env.COTA_DIARIA.idFromName(
        "gerador-global"
      );

      const contador = env.COTA_DIARIA.get(id);

      const cota = await contador.reservar();

      if (!cota.permitido) {
        return responder(
          {
            error: "Limite diário de gerações atingido",
            limite: cota.limite,
            utilizadas: cota.utilizadas
          },
          429,
          origem
        );
      }

      const resposta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096
            }
          })
        }
      );

      if (!resposta.ok) {
        console.error(
          "Falha Gemini HTTP:",
          resposta.status
        );

        return responder(
          {
            error: "Não foi possível gerar o código"
          },
          502,
          origem
        );
      }

      const resultado = await resposta.json();

      let html = (
        resultado.candidates?.[0]?.content?.parts || []
      )
        .filter(parte => !parte.thought)
        .map(parte => parte.text || "")
        .join("")
        .trim();

      html = html
        .replace(/^```(?:html)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      if (!html) {
        return responder(
          { error: "O Gemini retornou conteúdo vazio" },
          502,
          origem
        );
      }

      if (html.length > 30000) {
        return responder(
          { error: "Código gerado excedeu o limite" },
          502,
          origem
        );
      }

      // Compatível com o script.js atual
      return responder({
        choices: [
          {
            message: {
              content: html
            }
          }
        ]
      }, 200, origem);

    } catch (erro) {
      console.error(
        "Falha interna:",
        erro?.name || "Erro desconhecido"
      );

      return responder(
        { error: "Erro interno na geração" },
        500,
        origem
      );
    }
  }
};
