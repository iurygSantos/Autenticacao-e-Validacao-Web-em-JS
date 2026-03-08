
// IMPORTA BIBLIOTECAS
const express = require("express");
const auth = require("basic-auth");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = 3000;

// ===============================
// BASIC AUTH (segurança mínima)
// ===============================
const BASIC_USER = "admin";
const BASIC_PASS = "1234";

function basicAuthMiddleware(req, res, next)
{
    const user = auth(req);

    if (!user || user.name !== BASIC_USER || user.pass !== BASIC_PASS)
    {
        res.set("WWW-Authenticate", "Basic realm=\"Restricted\"");

        return res.status(401).json(
        {
            status: "erro",
            mensagem: "Credenciais BASIC inválidas"
        });
    }

    next();
}

// ===============================
// GERA TOKEN
// ===============================
function gerarToken()
{
    return Math.random().toString(36).substring(2);
}

// ===============================
// LER USUARIOS
// ===============================
function lerUsuarios()
{
    const dados = fs.readFileSync("acessos.txt", "utf8");
    
    return dados.split("\n");
}

// ===============================
// SALVAR TOKEN
// ===============================
function salvarToken(id, token)
{
    const linhas = lerUsuarios();
    const novasLinhas = [];

    for (let linha of linhas)
    {
        if (!linha.trim()) continue;

        let [idTxt, login, senha] = linha.split(",");

        if (idTxt === id)
        {
            novasLinhas.push(`${idTxt},${login},${senha},${token}`);
        }
        else
        {
            novasLinhas.push(linha);
        }
    }

    fs.writeFileSync("acessos.txt", novasLinhas.join("\n"));
}

// ===============================
// VALIDAR TOKEN
// ===============================
function validarToken(token)
{
    const linhas = lerUsuarios();

    for (let linha of linhas)
    {
        if (!linha.trim()) continue;

        const [id, login, senha, tokenTxt] = linha.split(",");

        if (tokenTxt && tokenTxt.trim() === token)
        {
            return { id, login };
        }
    }

    return null;
}

// ===============================
// VALIDAR LOGIN
// ===============================
function validarLogin(login, senha)
{
    const linhas = lerUsuarios();

    for (let linha of linhas)
    {
        if (!linha.trim()) continue;

        const [id, user, pass] = linha.split(",");

        if (user === login && pass === senha)
        {
            return { id, login };
        }
    }

    return null;
}

// ===============================
// ROTA PUBLICA
// ===============================
app.post("/auth", basicAuthMiddleware, (req, res) =>
{
    const { tipo, login, senha, token } = req.body;

    // tentativa via token
    if (tipo === "token")
    {
        const usuario = validarToken(token);

        if (!usuario)
        {
            return res.json({
                status: "TOKEN_INVALIDO"
            });
        }

        return res.json({
            status: "ok",
            usuario
        });
    }

    // tentativa via login/senha
    if (tipo === "login")
    {
        const usuario = validarLogin(login, senha);

        if (!usuario)
        {
            return res.json({
                status: "erro",
                mensagem: "Login inválido"
            });
        }

        const novoToken = gerarToken();

        salvarToken(usuario.id, novoToken);

        return res.json({
            status: "ok",
            token_gerado: novoToken,
            usuario
        });
    }

});

// ===============================
// ROTA PRIVADA PARA MENSAGEM
// ===============================
app.post("/mensagem", basicAuthMiddleware, (req, res) =>
{
    const { token, mensagem } = req.body;

    const usuario = validarToken(token);

    if (!usuario)
    {
        return res.json({
            status: "erro",
            mensagem: "Token inválido"
        });
    }

    const linha = `${usuario.login}: ${mensagem}\n`;

    fs.appendFileSync("mensagens.txt", linha);

    res.json({
        status: "ok",
        mensagem: "Mensagem gravada com sucesso"
    });
});

// ===============================
app.listen(PORT, () =>
{
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});