console.log("Script carregado")

let botao = document.querySelector(".botao-gerar")
let botaoCopiar = document.querySelector(".botao-copiar")



let endereco = "https://css-gerador-com-ia.thiagofoztt.workers.dev/api/gerar-codigo"
  
  

// Estado para controlar se está gerando
let gerando = false

// Validar entrada do usuário
function validarEntrada(texto) {
    if (!texto.trim()) {
        return { valido: false, erro: "Digite uma descrição primeiro" }
    }

    if (texto.trim().length < 5) {
        return { valido: false, erro: "Descrição muito curta (mínimo 5 caracteres)" }
    }

    if (texto.length > 500) {
        return { valido: false, erro: "Descrição muito longa (máximo 500 caracteres)" }
    }

    return { valido: true, erro: null }
}

// Tratamento de erros da API


function tratarErroAPI(status, dados) {
    const mensagem =
        typeof dados?.error === "string"
            ? dados.error
            : dados?.error?.message;

    if (status === 503) {
        return mensagem || "Serviço temporariamente indisponível.";
    }

    if (status === 429) {
        return "Limite de requisições atingido. Tente novamente mais tarde.";
    }

    if (status === 400) {
        return mensagem || "Descrição inválida.";
    }

    if (status === 401 || status === 403) {
        return "Acesso não autorizado.";
    }

    if (status === 502) {
        return "A inteligência artificial não conseguiu gerar o código.";
    }

    return mensagem || "Erro ao gerar código. Tente novamente.";
}

async function gerarCodigo() {
    // Evitar múltiplos cliques
    if (gerando) return
  
    let textoUsuario = document.querySelector(".caixa-texto").value
    let blocoCodigo = document.querySelector(".bloco-codigo")
    let resultadoCodigo = document.querySelector(".resultado-codigo")

    // Validar entrada
    let validacao = validarEntrada(textoUsuario)
    if (!validacao.valido) {
        blocoCodigo.textContent = validacao.erro
        blocoCodigo.classList.remove("loading")
        return
    }

    // Atualizar estado
    gerando = true
    botao.disabled = true
    botao.textContent = "Gerando..."

    blocoCodigo.classList.add("loading")
    blocoCodigo.textContent = "Gerando código..."

   
try {
    // Capturar o token antes de enviar
    const token = window.turnstile?.getResponse() || "";

    if (!token) {
        blocoCodigo.classList.remove("loading");
        blocoCodigo.textContent =
            "Aguarde a verificação de segurança e tente novamente.";
        return;
    }

    const resposta = await fetch(endereco, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            descricao: textoUsuario,
            turnstileToken: token
        })
    });

    const dados = await resposta.json();

        // Validar resposta
        if (!resposta.ok) {
            blocoCodigo.classList.remove("loading")
            blocoCodigo.textContent = tratarErroAPI(resposta.status, dados)
            console.error("Erro da API:", dados)
            return
        }

        if (!dados.choices || dados.choices.length === 0) {
            blocoCodigo.classList.remove("loading")
            blocoCodigo.textContent = "Resposta inválida da API. Tente novamente."
            console.error("Resposta inválida:", dados)
            return
        }

        let resultado = dados.choices[0].message.content

        // Validar resultado
        if (!resultado || resultado.trim().length === 0) {
            blocoCodigo.classList.remove("loading")
            blocoCodigo.textContent = "A API retornou uma resposta vazia. Tente outra descrição."
            return
        }

        blocoCodigo.classList.remove("loading")
        blocoCodigo.textContent = resultado
        
        // Renderizar no iframe com tratamento de erro
        try {
            resultadoCodigo.srcdoc = resultado
        } catch (erroIframe) {
            console.error("Erro ao renderizar no iframe:", erroIframe)
            blocoCodigo.textContent = "Código gerado, mas erro ao renderizar: " + resultado
        }

    } catch (erro) {
        blocoCodigo.classList.remove("loading")
        
        // Diferenciar tipos de erro
        if (erro.name === "TypeError" && erro.message.includes("Failed to fetch")) {
            blocoCodigo.textContent = "Erro de conexão. Verifique sua internet ou se o servidor está disponível."
        } else {
            blocoCodigo.textContent = "Erro ao gerar código: " + erro.message
        }
        
        console.error("Erro completo:", erro)
    
} finally {
    gerando = false;
    botao.disabled = false;
    botao.textContent = "Gerar Código";

    // Renovar o token somente após a tentativa
    if (window.turnstile) {
        window.turnstile.reset();
    }
}
}

function copiarCodigo() {
    let blocoCodigo = document.querySelector(".bloco-codigo")
    let codigo = blocoCodigo.textContent

    // Não copiar mensagens de erro
    if (!codigo || codigo.includes("Erro") || codigo.includes("Digite")) {
        botaoCopiar.textContent = "Nada para copiar ❌"
        setTimeout(() => {
            botaoCopiar.textContent = "Copiar 📋"
        }, 2000)
        return
    }

    // Copiar para clipboard
    navigator.clipboard.writeText(codigo).then(() => {
        botaoCopiar.textContent = "Copiado ✅"
        setTimeout(() => {
            botaoCopiar.textContent = "Copiar 📋"
        }, 2000)
    }).catch((erro) => {
        console.error("Erro ao copiar:", erro)
        botaoCopiar.textContent = "Erro ao copiar ❌"
        setTimeout(() => {
            botaoCopiar.textContent = "Copiar 📋"
        }, 2000)
    })
}

// Event listeners com proteção
if (botao) {
    botao.addEventListener("click", gerarCodigo)
} else {
    console.error("Botão de gerar não encontrado!")
}

if (botaoCopiar) {
    botaoCopiar.addEventListener("click", copiarCodigo)
} else {
    console.error("Botão de copiar não encontrado!")
}

// Permitir enviar com Enter na caixa de texto
let caixaTexto = document.querySelector(".caixa-texto")
if (caixaTexto) {
    caixaTexto.addEventListener("keypress", (evento) => {
        if (evento.key === "Enter" && evento.ctrlKey) {
            gerarCodigo()
          
        }
    })
}
