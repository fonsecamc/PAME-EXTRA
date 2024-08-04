// Bibliotecas
import readlineSync from 'readline-sync'; // Biblioteca para interação com o usuário no terminal
import fs from 'fs'; // Biblioteca para manipulação de arquivos (File System Module)

// Função para carregar dados de um arquivo JSON
function loadData(file) {
    if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
    return [];
}

// Função para salvar dados em um arquivo JSON
function saveData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Carregar dados
const usersData = loadData('./users.json');
const stockData = loadData('./stock.json');
const ordersData = loadData('./orders.json');

// Expressões regulares para validação de dados (datas, cpf e email)
const cpfRegex = /^\d{11}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dataNascimentoRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const dataValidadeRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

// Função para validar a data de nascimento
function isValidDate(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date && (date.getMonth() + 1) === month && date.getDate() === day && date.getFullYear() === year;
}

// Função para obter o próximo ID disponível com base nos dados existentes
function getNextId(data) {
    if (data.length === 0) return '1'; // Se não houver dados, começa com ID 1
    return (Math.max(...data.map(item => parseInt(item.id, 10))) + 1).toString();
}

// Função para gerar IDs para usuários
function gerarIDuser() {
    return getNextId(usersData);
}

// Função para gerar IDs para produtos
function gerarIDproduto() {
    return getNextId(stockData);
}

function gerarIDpedido() {
    return getNextId(ordersData);
}

// Classes
class Pedido { //pedido: ID único, ID do cliente, nome de usuário do cliente (introduzi), status e data do pedido
    constructor(id, clienteId, status, dataDoPedido, tipoDePedido) {
        this.id = id;
        this.clienteId = clienteId;
        this.status = status;
        this.dataDoPedido = dataDoPedido;
        this.tipoDePedido = tipoDePedido; // Introduzi para categorizar os pedidos em delivery (entrega e retirada) e buffet (vai comer no restaurante)
    }
}

class Funcionario { //funcionario: ID único, nome (introduzi), CPF, email, senha e username
    constructor(id, nome, cpf, email, senha, username) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
        this.senha = senha;
        this.username = username;
    }
}

class Cliente { //cliente: ID único, nome, data de nascimento, CPF, email, endereço (introduzi), senha e username
    constructor(id, nome, dataDeNascimento, cpf, email, endereco, senha, username) {
        this.id = id;
        this.nome = nome;
        this.dataDeNascimento = dataDeNascimento;
        this.cpf = cpf;
        this.email = email;
        this.endereco = endereco;
        this.senha = senha;
        this.username = username;
    }
}

class Produto { //produto: ID único (introduzi), data de validade, preço, quantidade em estoque, nome, descrição, alergenos (introduzi) e tipoDeProduto (introduzi para categorizar os produtos)
    constructor(id, dataDeValidade, preco, quantidadeNoEstoque, nome, descricao, alergenos, tipoDeProduto) {
        this.id = id;
        this.dataDeValidade = dataDeValidade;
        this.preco = preco;
        this.quantidadeNoEstoque = quantidadeNoEstoque;
        this.nome = nome;
        this.descricao = descricao;
        this.alergenos = alergenos;
        this.tipoDeProduto = tipoDeProduto;
    }
}

// Classe do sistema (a classe mãe)
class Sistema {
    start() {
        let currentUser = null;

        while (true) {  // Loop principal de cadastro, login e opção de saída do programa
            if (!currentUser) {
                console.log('\nBem-vindo ao sistema!'); // Mudança feita para que ele possa escolher entre login e cadastro
                console.log('1. Login');
                console.log('2. Cadastrar');
                console.log('3. Sair');

                const action = readlineSync.question('Escolha uma opção (nº): ');

                if (action === '1') {
                    currentUser = this.login();
                } else if (action === '2') {
                    this.register();
                } else {
                    console.log('Saindo do programa...');
                    break;
                }
            } else {
                if (currentUser instanceof Funcionario) {
                    currentUser = this.funcionarioActions(currentUser);
                } else if (currentUser instanceof Cliente) {
                    currentUser = this.clienteActions(currentUser);
                }
            }
        }
    }

    login() {
        const username = readlineSync.question('Digite seu nome de usuário: ');
        const password = readlineSync.question('Digite sua senha: ', { hideEchoBack: true });
    
        const user = usersData.find(u => u.username === username);
        if (user && user.senha === password) {
            console.log('Login bem-sucedido!');
            if (user.hasOwnProperty('dataDeNascimento')) { // Verifica se é um cliente
                return new Cliente(user.id, user.nome, user.dataDeNascimento, user.cpf, user.email, user.endereco, user.senha, user.username);
            } else {
                return new Funcionario(user.id, user.nome, user.cpf, user.email, user.senha, user.username);
            }
        } else {
            console.log('Usuário ou senha incorretos.');
            return null;
        }
    }    

    register() { // Função para cadastro 
        console.log('\nEscolha o novo status do produto: ');
        console.log('1. Funcionário');
        console.log('2. Cliente');

        const choice = readlineSync.question('Escolha uma opção (nº): '); // adicionada para escrever menos 

        let tipo; // Variável para armazenar o tipo de usuário

        switch (choice) {
            case '1':
                tipo = 'funcionario';
                break;
            case '2':
                tipo = 'cliente';
                break;
            default:
                console.log('Tipo de usuário inválido.');
                return;
        }
    
        const nome = readlineSync.question('Digite seu nome e último sobrenome: ');
        if (!nome.includes(' ')) { // Checando se colocou sobrenome
            console.log('Nome deve conter pelo menos um sobrenome.');
            return;
        }

        const cpf = readlineSync.question('Digite seu CPF (somente números): ');
        if (!cpfRegex.test(cpf)) { // Checando se o CPF é válido
            console.log('CPF inválido. Deve conter exatamente 11 dígitos.');
            return;
        }

        const email = readlineSync.question('Digite seu email: ');
        if (!emailRegex.test(email)) { // Checando se o email é válido
            console.log('Email inválido.');
            return;
        }

        const password = readlineSync.question('Digite a senha: ', { hideEchoBack: true }); // NÃO aparece o que digita por questões de segurança
        const username = readlineSync.question('Digite o nome de usuário: ');
    
        if (tipo === 'cliente') { // Se o tipo de usuário for cliente, adicionar a pergunta da data de nascimento e do endereço
            
            const dataDeNascimento = readlineSync.question('Digite sua data de nascimento (DD/MM/YYYY): ');
            if (!dataNascimentoRegex.test(dataDeNascimento) || !isValidDate(dataDeNascimento)) {
                console.log('Data de nascimento inválida. Use o formato DD/MM/YYYY.');
                return;
            }

            const endereco = readlineSync.question('Digite seu endereço para entrega de pedidos: '); // Corrigido
            const usuario = new Cliente(gerarIDuser(), nome, dataDeNascimento, cpf, email, endereco, password, username);

            usersData.push(usuario);
            saveData('./users.json', usersData); // Salvar os dados no arquivo JSON para armazenamento
    
            console.log('Usuário cadastrado com sucesso!');
            console.log('Dados do novo usuário:', usuario); // Mostrar os dados do novo usuário

        } else if (tipo === 'funcionario') {
            const usuario = new Funcionario(gerarIDuser(), nome, cpf, email, password, username);

            usersData.push(usuario);
            saveData('./users.json', usersData); // Salvar os dados no arquivo JSON para armazenamento
    
            console.log('Usuário cadastrado com sucesso!');
            console.log('Dados do novo usuário:', usuario);
        } else {
            console.log('Tipo de usuário inválido.');
        }
    }    

    funcionarioActions(funcionario) { // Funções para funcionários
        console.log('\nO que deseja fazer hoje?'); // Mudança feita para que ele possa escolher qual dado deseja modificar
        console.log('1. Ver Meus Dados');
        console.log('2. Modificar Meus Dados');
        console.log('3. Ver Lista de Pedidos');
        console.log('4. Ver Lista de Produtos');
        console.log('5. Ver Lista de Clientes');
        console.log('6. Mudar status do pedido');
        console.log('7. Adicionar Produto');
        console.log('8. Editar Produto');
        console.log('9. Excluir Produto');
        console.log('10. Logout');

        const action = readlineSync.question('Escolha uma opção (nº): ');

        switch(action) { // Switch case para cada opção de uso do sistema pelo funcionário (métodos)
            case '1':
                console.log(funcionario);
                break;
            case '2':
                this.modifyUserData(funcionario);
                break;
            case '3':
                this.viewOrders();
                break;
            case '4':
                this.viewProducts();
                break;
            case '5':
                this.viewClients();
                break;
            case '6':
                this.changeOrderStatus();
                break;
            case '7':
                this.addProduct();
                break;
            case '8':
                this.editProduct();
                break;
            case '9':
                this.deleteProduct();
                break;
            case '10':
                return null;
        }

        return funcionario;
    }

    clienteActions(cliente) { // Funções para clientes
        console.log('\nO que deseja fazer hoje?');  // Mudança feita para que ele possa escolher qual dado deseja modificar
        console.log('1. Ver meus Dados');
        console.log('2. Modificar Meus Dados');
        console.log('3. Ver Lista de Produtos');
        console.log('4. Fazer pedido');
        console.log('5. Cancelar pedido');
        console.log('6. Ver meus pedidos');
        console.log('7. Avaliar pedido');
        console.log('8. Visualizar avaliações');
        console.log('9. Logout');

        const action = readlineSync.question('\nEscolha uma opção (nº): ');

        switch(action) { // Switch case para cada opção de uso do sistema pelo cliente 
            case '1':
                console.log(cliente);
                break;
            case '2':
                this.modifyUserData(cliente);
                break;
            case '3':
                this.viewProducts();
                break;
            case '4':
                this.makeOrder(cliente);
                break;
            case '5':
                this.cancelOrder(cliente);
                break;
            case '6':
                this.viewClientOrders(cliente);
                break;
            case '7':
                this.rateOrder(cliente);
                break;
            case '8':
                this.viewRatings();
                break;
            case '9':
                return null;
        }

        return cliente;
    }

    modifyUserData(user) { // Função para modificar os dados do usuário
        while (true) {
            

            if (user.hasOwnProperty('dataDeNascimento')) { // Se o usuário for cliente, adicionar a pergunta da data de nascimento e do endereço
                console.log('\nQual dado você deseja modificar?');  // Mudança feita para que ele possa escolher qual dado deseja modificar
                console.log('1. Nome');
                console.log('2. Email');
                console.log('3. Senha');
                console.log('4. CPF');
                console.log('5. Nome de Usuário');
                console.log('6. Endereço');
                console.log('7. Data de Nascimento');
                console.log('8. Sair');

                const choice = readlineSync.question('Escolha uma opção: ');

                switch (choice) { // Switch case para cada opção de modificação de dados do usuário, pedindo o novo e mostrando o atual
                    case '1':
                        user.nome = readlineSync.question(`Digite seu novo nome (atual: ${user.nome}): `) || user.nome;
                        console.log('Nome atualizado com sucesso!');
                        break;
                    case '2':
                        user.email = readlineSync.question(`Digite seu novo email (atual: ${user.email}): `) || user.email;
                        console.log('Email atualizado com sucesso!');
                        if (!emailRegex.test(user.email)) { // Checando se o email é válido
                            console.log('Email inválido.');
                            return;
                        }
                        break;
                    case '3':
                        user.senha = readlineSync.question('Digite sua nova senha: ', { hideEchoBack: true }) || user.senha;
                        console.log('Senha atualizada com sucesso!');
                        break;
                    case '4':
                        user.cpf = readlineSync.question(`Digite seu novo CPF (atual: ${user.cpf}): `) || user.cpf;
                        console.log('CPF atualizado com sucesso!');
                        if (!cpfRegex.test(user.cpf)) { // Checando se o CPF é válido
                            console.log('CPF inválido. Deve conter exatamente 11 dígitos.');
                            return;
                        }
                        break;
                    case '5':
                        user.username = readlineSync.question(`Digite seu novo nome de usuário (atual: ${user.username}): `) || user.username;
                        console.log('Nome de usuário atualizado com sucesso!');
                        break;
                    case '6':
                        user.endereco = readlineSync.question(`Digite seu novo endereço (atual: ${user.endereco}): `) || user.endereco;
                        console.log('Endereço atualizado com sucesso!');
                        break;
                    case '7':
                        user.dataDeNascimento = readlineSync.question(`Digite sua nova data de nascimento (atual: ${user.dataDeNascimento}): `) || user.dataDeNascimento;
                        console.log('Data de Nascimento atualizada com sucesso!');
                        if (!dataNascimentoRegex.test(user.dataDeNascimento) || !isValidDate(dataDeNascimento)) { // Checando se a data de nascimento é válida
                            console.log('Data de Nascimento inválida. Use o formato DD/MM/YYYY.');
                            return;
                        }
                        break;
                    case '8':
                        saveData('./users.json', usersData);
                        console.log('Saindo da modificação de dados.');
                        return;
                    default:
                        console.log('Opção inválida. Tente novamente.');
                }
            }
            else {
                console.log('\nQual dado você deseja modificar?');  // Mudança feita para que ele possa escolher qual dado deseja modificar
                console.log('1. Nome');
                console.log('2. Email');
                console.log('3. Senha');
                console.log('4. CPF');
                console.log('5. Nome de Usuário');
                console.log('6. Sair');

                const choice = readlineSync.question('Escolha uma opção: ');

                switch (choice) { // Switch case para cada opção de modificação de dados do usuário, pedindo o novo e mostrando o atual
                    case '1':
                        user.nome = readlineSync.question(`Digite seu novo nome (atual: ${user.nome}): `) || user.nome;
                        console.log('Nome atualizado com sucesso!');
                        break;
                    case '2':
                        user.email = readlineSync.question(`Digite seu novo email (atual: ${user.email}): `) || user.email;
                        console.log('Email atualizado com sucesso!');
                        if (!emailRegex.test(user.email)) { // Checando se o email é válido
                            console.log('Email inválido.');
                            return;
                        }
                        break;
                    case '3':
                        user.senha = readlineSync.question('Digite sua nova senha: ', { hideEchoBack: true }) || user.senha;
                        console.log('Senha atualizada com sucesso!');
                        break;
                    case '4':
                        user.cpf = readlineSync.question(`Digite seu novo CPF (atual: ${user.cpf}): `) || user.cpf;
                        console.log('CPF atualizado com sucesso!');
                        if (!cpfRegex.test(user.cpf)) { // Checando se o CPF é válido
                            console.log('CPF inválido. Deve conter exatamente 11 dígitos.');
                            return;
                        }
                        break;
                    case '5':
                        user.username = readlineSync.question(`Digite seu novo nome de usuário (atual: ${user.username}): `) || user.username;
                        console.log('Nome de usuário atualizado com sucesso!');
                        break;
                    case '6':
                        saveData('./users.json', usersData);
                        console.log('Saindo da modificação de dados.');
                        return;
                    default:
                        console.log('Opção inválida. Tente novamente.');
                }
            }

            const userIndex = usersData.findIndex(u => u.id === user.id);
            usersData[userIndex] = user;
            saveData('./users.json', usersData);
        }
    }

    viewOrders() { // Função para visualizar os pedidos
        console.log('Lista de Pedidos:');
        console.log(ordersData);
    }

    viewProducts() { // Função para visualizar os produtos 
        console.log('Lista de Produtos:');
        console.log(stockData);
    }

    viewClients() { 
        console.log('Lista de Clientes:');
        const clientes = usersData.filter(u => u.dataDeNascimento !== undefined);
        console.log(clientes);
    }    

    changeOrderStatus() { // Função para mudar o status do pedido
        const orderId = readlineSync.question('Digite o ID do pedido que deseja alterar: ');
        const order = ordersData.find(o => o.id === orderId);

        if (!order) { // Se o pedido não for encontrado
            console.log('Pedido não encontrado.');
            return;
        }

        console.log('Escolha o novo status do produto: ');
        console.log('1. Cancelado');
        console.log('2. Pedido pendente');
        console.log('3. Realizado');
        console.log('4. Pedido Adiado');
        console.log('5. Sair');

        const choice = readlineSync.question('Escolha uma opção (nº): ');

        let status; // Variável para armazenar o status do pedido

        switch (choice) {
            case '1':
                order.status = 'Cancelado';
                break;
            case '2':
                order.status = 'Pedido pendente';
                break;
            case '3':
                order.status = 'Realizado';
                break;
            case '4':
                order.status = 'Pedido Adiado';
                break;
            case '5':
                console.log('Saindo da modificação de status. Ele permancerá o mesmo');
                return;
            default:
                console.log('Opção inválida. Tente novamente.');
        }

        saveData('./orders.json', ordersData);

        console.log('Status do pedido alterado com sucesso!');
    }

    addProduct() { // Função de adição de produto pelo funcionário 
        const dataDeValidade = readlineSync.question('Digite a data de validade do produto: ');
        if (!dataValidadeRegex.test(dataDeValidade) || !isValidDate(dataDeValidade)) {
            console.log('Data de Validade inválida. Use o formato DD/MM/YYYY.');
            return;
        }

        const preco = parseFloat(readlineSync.question('Digite o preço do produto: '));
        const quantidadeNoEstoque = parseInt(readlineSync.question('Digite a quantidade em estoque do produto: '), 10);
        const nome = readlineSync.question('Digite o nome do produto: ');
        const descricao = readlineSync.question('Digite a descrição do produto: ');
        const alergenos = readlineSync.question('Digite os alérgenos do produto (se houver): ');
        
        console.log('/nEscolha o tipo de produto: ');
        console.log('1. Entrada');
        console.log('2. Prato principal');
        console.log('3. Sobremesa');
        console.log('4. Bebida');

        const choice = readlineSync.question('Escolha uma opção (nº): ');

        let tipoDeProduto; // Variável para armazenar o tipo de produto

        switch (choice) { // Switch case para cada opção de modificação de dados do usuário, pedindo o novo e mostrando o atual
            case '1':
                tipoDeProduto = 'Entrada';
                break;
            case '2':
                tipoDeProduto = 'Prato Principal';
                break;
            case '3':
                tipoDeProduto = 'Sobremesa';
                break;
            case '4':
                tipoDeProduto = 'Bebidas';
                break;
            default:
                console.log('Opção inválida. Tente novamente.'); // Caso a opção seja inválida
        }

        const produto = new Produto(gerarIDproduto(), dataDeValidade, preco, quantidadeNoEstoque, nome, descricao, alergenos, tipoDeProduto);

        stockData.push(produto);
        saveData('./stock.json', stockData);

        console.log('Produto adicionado com sucesso!');
    }

    editProduct() { // Função para editar o produto
        const produtoId = readlineSync.question('Digite o ID do produto que deseja editar: ');
        const produto = stockData.find(p => p.id === produtoId);

        if (!produto) {
            console.log('Produto não encontrado.');
            return;
        }

        console.log('\nQual dado você deseja modificar?');  // Mudança feita para que ele possa escolher qual dado deseja modificar
        console.log('1. Data de Validade');
        console.log('2. Preço');
        console.log('3. Quantidade em Estoque');
        console.log('4. Nome');
        console.log('5. Descrição');
        console.log('6. Alergenos');
        console.log('7. Tipo de Produto');
        console.log('8. Sair');

        const choice = readlineSync.question('Escolha uma opção: ');

        switch (choice) { // Switch case para cada opção de modificação de dados do usuário, pedindo o novo e mostrando o atual
            case '1':
                produto.dataDeValidade = readlineSync.question(`Digite a nova data de validade do produto (atual: ${produto.dataDeValidade}): `) || produto.dataDeValidade;
                if (!dataValidadeRegex.test(dataDeValidade) || !isValidDate(dataDeValidade)) {
                    console.log('Data de Validade inválida. Use o formato DD/MM/YYYY.');
                    return;
                }
                console.log('Data de Validade atualizada com sucesso!');
                break;
            case '2':
                produto.preco = parseFloat(readlineSync.question(`Digite o novo preço do produto (atual: ${produto.preco}): `)) || produto.preco;
                console.log('Preço atualizado com sucesso!');
                break;
            case '3':
                produto.quantidadeNoEstoque = parseInt(readlineSync.question(`Digite a nova quantidade em estoque do produto (atual: ${produto.quantidadeNoEstoque}): `), 10) || produto.quantidadeNoEstoque;
                console.log('Quantidade em Estoque atualizada com sucesso!');
                break;
            case '4':
                produto.nome = readlineSync.question(`Digite o novo nome do produto (atual: ${produto.nome}): `) || produto.nome;
                console.log('Nome atualizado com sucesso!');
                break;
            case '5':
                produto.descricao = readlineSync.question(`Digite a nova descrição do produto (atual: ${produto.descricao}): `) || produto.descricao;
                console.log('Descrição atualizada com sucesso!');
                break;
            case '6':
                produto.alergenos = readlineSync.question(`Digite os novos alérgenos do produto (atual: ${produto.alergenos}): `) || produto.alergenos;
                console.log('Alergenos atualizados com sucesso!');
                break;
            case '7':
                console.log('Escolha o tipo de produto: ');
                console.log('1. Entrada');
                console.log('2. Prato principal');
                console.log('3. Sobremesa');
                console.log('4. Bebidas');

                const choice = readlineSync.question('Escolha uma opção (nº): ');

                switch (choice) { // Switch case para cada opção de modificação de dados do usuário, pedindo o novo e mostrando o atual
                    case '1':
                        produto.tipoDeProduto = 'Entrada';
                        break;
                    case '2':
                        produto.tipoDeProduto = 'Prato Principal';
                        break;
                    case '3':
                        produto.tipoDeProduto = 'Sobremesa';
                        break;
                    case '4':
                        produto.tipoDeProduto = 'Bebida';
                        break;
            case '8':
                saveData('./stock.json', stockData);
                console.log('Saindo da modificação de dados.');
                return;
            default:
                console.log('Opção inválida. Tente novamente.');
            }

        const produtoIndex = stockData.findIndex(p => p.id === produtoId);
        stockData[produtoIndex] = produto;
        

        saveData('./stock.json', stockData);

        console.log('Produto editado com sucesso!');
        }
    }

    deleteProduct() { // Função para excluir o produto (seja por falta no estoque ou outros motivos do funcionário)
        const produtoId = readlineSync.question('Digite o ID do produto que deseja excluir: ');
        const produtoIndex = stockData.findIndex(p => p.id === produtoId);

        if (produtoIndex === -1) {
            console.log('Produto não encontrado.');
            return;
        }

        stockData.splice(produtoIndex, 1);
        saveData('./stock.json', stockData);

        console.log('Produto excluído com sucesso!');
    }

    // Função para fazer o pedido
    makeOrder(cliente) {
        const produtoId = readlineSync.question('Digite o id que deseja pedir: ');
        const produtoIndex = stockData.findIndex(p => p.id === produtoId);
        
        if (produtoIndex === -1) {
            console.log('Produto não encontrado.');
            return;
        }

        const produto = stockData[produtoIndex];

        if (produto.quantidadeNoEstoque <= 0) {
            console.log('Produto fora de estoque.');
            return;
        }

        console.log('Escolha o tipo de pedido: ');
        console.log('1. Entrega');
        console.log('2. Retirada');
        console.log('3. Irei comer no restaurante');
        console.log('4. Cancelar');

        const choice = readlineSync.question('Escolha uma opção (nº): ');

        let tipoDePedido; // Variável para armazenar o tipo de pedido

        switch (choice) {
            case '1':
                tipoDePedido = 'Entrega';
                break;
            case '2':
                tipoDePedido = 'Retirada';
                break;
            case '3':
                tipoDePedido = 'Restaurante';
                break;
            case '4':
                console.log('Pedido cancelado.');
                return;
            default:
                console.log('Opção inválida. Tente novamente.');
                return;
        }
    
        const pedido = {
            id: gerarIDpedido(),
            clienteId: cliente.id, 
            status: 'Pedido pendente',     // Status inicial do pedido
            data: new Date().toISOString(),
            tipoDePedido: tipoDePedido,
            produtoId: produtoId,
            quantidade: 1
        };

        ordersData.push(pedido);
        produto.quantidadeNoEstoque--;

        saveData('./orders.json', ordersData);
        saveData('./stock.json', stockData);

        console.log('Pedido realizado com sucesso!');
    }
    

    cancelOrder(cliente) { // Função para cancelar o pedido (cliente) 
        const orderId = readlineSync.question('Digite o ID do pedido que deseja cancelar: ');
        const orderIndex = stockData.findIndex(p => p.id === orderId);

        if (orderIndex === -1) {
            console.log('Pedido não encontrado ou não pertence ao cliente.');
            return;
        }

        const produtoId = readlineSync.question('Digite o ID do produto do pedido: ');
        const produto = stockData.find(p => p.id === produtoId);

        if (produto) {
            produto.quantidadeNoEstoque++;
            saveData('./stock.json', stockData);
        }

        ordersData.splice(orderIndex, 1);
        saveData('./orders.json', ordersData);

        console.log('Pedido cancelado com sucesso!');
    }

    viewClientOrders(cliente) { // Função para visualizar os pedidos do cliente (ordem cronológica)
        // Filtra os pedidos do cliente
        const clientOrders = ordersData.filter(o => o.clienteId === cliente.id);
    
        // Ordena os pedidos por data (cronologicamente)
        clientOrders.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
    
        // Exibe os pedidos ordenados
        console.log('Seus pedidos:', clientOrders);
    }

    rateOrder(cliente) { // Função para avaliar o pedido (cliente) --> importante para feedback e visualiação de preferências do cliente
        const orderId = readlineSync.question('Digite o ID do pedido que deseja avaliar: ');
        const order = ordersData.find(o => o.id === orderId && o.clienteId === cliente.id);

        if (!order) {
            console.log('Pedido não encontrado ou não pertence ao cliente.');
            return;
        }

        const rating = parseInt(readlineSync.question('Digite a sua avaliação (1 a 5): '), 10);

        if (rating < 1 || rating > 5) {
            console.log('Avaliação inválida.');
            return;
        }

        order.rating = rating;
        saveData('./orders.json', ordersData);

        console.log('Pedido avaliado com sucesso!');
    }

    viewRatings() { // Função para visualizar as avaliações dos pedidos
        const ratedOrders = ordersData.filter(o => o.hasOwnProperty('rating'));
        console.log('Avaliações dos pedidos:', ratedOrders);
    }
}

// Inicialização do sistema
const sistema = new Sistema();
sistema.start();