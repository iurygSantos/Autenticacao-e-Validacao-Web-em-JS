// Função principal que simula o cliente
async function autenticar() {

    let dadosValidar = 
    {
        tipoAutenticacao: "token",
        dados: {
            id: "1",
            login: "user",
            senha: "1234",
            token: "ndt9n6p2vie"
        }
    };

    console.log("\nValidando token...");

    // Primeira requisição
    let resposta = await fetch("http://localhost:3000/dados", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(dadosValidar)

    });

    let resultado = await resposta.json();

    console.log("Resposta servidor:", resultado);

    // Se servidor retornou token
    if (resultado.status === "TOKEN_INEXISTENTE") 
    {
        dadosValidar.tipoAutenticacao = "login"

        console.log("\nValidando login e senha...");

        //Atualiza token
        // dados.token = resultado.token.token;

        resposta = await fetch("http://localhost:3000/dados", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(dadosValidar)

        });

        resultado = await resposta.json();

        console.log("Resposta servidor:", resultado);

        dadosValidar.dados.token = resultado.token;

    }

}

// Executa o cliente
autenticar();