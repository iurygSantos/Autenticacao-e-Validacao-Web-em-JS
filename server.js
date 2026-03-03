// Importa o framework Express para criar o servidor
const express = require("express");

// Importa o módulo de leitura de arquivos do Node
const fs = require("fs");

// Cria a aplicação Express
const app = express();

// Define a porta do servidor
const PORT = 3000;

// Permite receber JSON nas requisições
app.use(express.json());


// Estrutura que guarda tokens em memória
const tokens = {};

function SalvarTokenNoArquivo(id, token) {

    const tempoAtual = Date.now();

    // Lê todo o arquivo login.txt
    const dados = fs.readFileSync("login.txt", "utf8");

    // Divide o arquivo em linhas
    const linhas = dados.split("\n");

    // Nova estrutura que será salva depois
    const novasLinhas = [];

    // Percorre todas as linhas do arquivo
    for (let linha of linhas) 
    {

        // Ignora linha vazia
        if (linha.trim() === "") 
        {
            novasLinhas.push(linha);
            continue;
        }

        // Separa campos por vírgula
        const partes = linha.split(",");

        const idArquivo = partes[0].trim();

        // Se for o usuário que estamos atualizando
        if (idArquivo === id) 
        {
            const login = partes[1];
            const senha = partes[2];

            // recria linha adicionando token
            novasLinhas.push(`${idArquivo},${login},${senha},${token}`);

            // // salva token + timestamp
            // novasLinhas.push(`${idArquivo},${login},${senha},${token},${tempoAtual}`);
            
        } else {

            // mantém linha original
            novasLinhas.push(linha);
        }
    }

    // Reescreve o arquivo com as alterações
    fs.writeFileSync("login.txt", novasLinhas.join("\n"));

}

// ===============================
// Função que valida TOKEN
// ===============================
function ValidarToken(id, token) 
{
    //verifica se existe token armazenado
    if (!tokens[id]) 
    {        
        return false;
    }
    else 
    {

        // Lê o arquivo usuarios.txt
        const dados = fs.readFileSync("login.txt", "utf8");
        
        // Divide por linhas
        const linhas = dados.split("\n");
        
        // Percorre cada linha
        for (let linha of linhas) 
        {
            
            // Ignora linhas vazias
            if (linha.trim() === "") continue;
            
            // Separa os campos
            const [id, usuarioArquivo, senhaArquivo, tokenArquivo] = linha.split(",");
            
            const tokenTxt  = tokenArquivo.trim();
            
            // compara token recebido com token salvo
            if ( tokenTxt === token ) 
            {                
                return true;
            }
        }
    }

    return false;
}


// ===============================
// Função que gera TOKEN simples
// ===============================
function gerarToken() 
{
    return Math.random().toString(36).substring(2);
}

// ===============================
// Função que valida LOGIN e SENHA
// ===============================
function validarUsuario(login, senha) {

    // Lê o arquivo usuarios.txt
    const dados = fs.readFileSync("login.txt", "utf8");

    // Divide por linhas
    const linhas = dados.split("\n");

    // Percorre cada linha
    for (let linha of linhas) {

        // Ignora linhas vazias
        if (linha.trim() === "") continue;

        // Separa os campos
        const [id, usuarioArquivo, senhaArquivo, tokenArquivo] = linha.split(",");

        const usuario   = usuarioArquivo.trim();
        const senhaTxt  = senhaArquivo.trim();

        // Verifica credenciais
        if (usuario === login && senhaTxt === senha) 
        {

            return {
                id: id.trim(),
                login: usuario
            };

        }
    }

    return null;
}


// ===============================
// ROTA DE AUTENTICAÇÃO
// ===============================
app.post("/dados", (req, res) => {

    // Recebe dados enviados pelo cliente
    const { tipoAutenticacao, dados } = req.body;

    const { id, login, senha, token } = dados; 
    
    // 1️⃣ Verifica se token é válido
    
    if (tipoAutenticacao === "token")
    {
        const tokenValido = ValidarToken(id, token);

        if (!tokenValido) 
        {
            console.log("Token inexistente ou inválido para usuário:", login);
            
            return res.json(
            {
                status: "TOKEN_INEXISTENTE"
            });
        }
        else 
        {
            console.log("Login autorizado via token:");
        
            return res.json(
            {
                status: "ok - validado por token",
                usuario: login
            });
        }
    }
    else 
    {
        // 2️⃣ Se token existe, valida login e senha
        const usuario = validarUsuario(login, senha);    
    
        if (!usuario) 
        {
            console.log("Login inválido:", login);
    
            return res.json(
            {
                status: "erro",
                mensagem: "Login ou senha inválidos"
            });
        }
    
        const novoToken = gerarToken();
        tokens[id]      = novoToken;
    
        // Salva token no arquivo TXT
        SalvarTokenNoArquivo(id, novoToken);
        
        console.log("Login autorizado:", usuario);
        
        return res.json(
        {
            status: "ok",
            token_gerado: novoToken,
            usuario: usuario
        });
    }
    

});


// Inicia o servidor
app.listen(PORT, () => {

    console.log(`Servidor rodando em http://localhost:${PORT}`);

});