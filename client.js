
// URL DA CONEXAO VIA INTERNET
const BASE_URL = "https://idella-aboral-semimythically.ngrok-free.dev";

const BASIC_USER = "admin";
const BASIC_PASS = "1234";

const LOGIN = "user";
const SENHA = "1234";
let token = "";

// ===============================
// GERAR HEADER BASIC
// ===============================
function gerarBasic()
{
    const cred = Buffer.from(`${BASIC_USER}:${BASIC_PASS}`).toString("base64");

    return `Basic ${cred}`;
}

// ===============================
async function autenticar()
{

    console.log("\nTentando autenticação por TOKEN...");

    let resposta = await fetch(`${BASE_URL}/auth`,
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json",
            "Authorization": gerarBasic()
        },
        body: JSON.stringify(
        {
            tipo: "token",
            token
        })
    });

    let dados = await resposta.json();

    console.log(dados);

    // ===============================
    // SE TOKEN INVALIDO → LOGIN
    // ===============================
    if (dados.status === "TOKEN_INVALIDO")
    {
        console.log("\nToken inválido. Fazendo login...");

        resposta = await fetch(`${BASE_URL}/auth`,
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json",
                "Authorization": gerarBasic()
            },
            body: JSON.stringify({
                tipo: "login",
                login: LOGIN,
                senha: SENHA
            })
        });

        dados = await resposta.json();

        console.log(dados);

        if (dados.status === "ok")
        {
            token = dados.token_gerado;
        }
    }

    // ===============================
    // ENVIA MENSAGEM
    // ===============================
    console.log("\nEnviando mensagem...");

    resposta = await fetch(`${BASE_URL}/mensagem`,
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json",
            "Authorization": gerarBasic()
        },
        body: JSON.stringify(
        {
            token,
            mensagem: "Mensagem enviada via internet!"
        })
    });

    dados = await resposta.json();

    console.log(dados);
}

autenticar();