// Bibliotecas
import readlineSync from 'readline-sync'; // Biblioteca para interação com o usuário no terminal
import { v4 as uuidv4 } from 'uuid'; // Biblioteca para gerar IDs únicos
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

// Classes
class Pedido { //pedido: ID único, ID do cliente, nome de usuário do cliente (introduzi), status e data do pedido
    constructor(clienteId, usernameCliente, status, dataDoPedido, tipoDePedido) {
        this.id = uuidv4();
        this.clienteId = clienteId;
        this.usernameCliente = usernameCliente;
        this.status = status;
        this.dataDoPedido = dataDoPedido;
        this.tipoDePedido = tipoDePedido; // Introduzi para categorizar os pedidos em delivery (entrega e retirada) e buffet (vai comer no restaurante)
    }
}

class Funcionario { //funcionario: ID único, nome (introduzi), CPF, email, senha e username
    constructor(nome, cpf, email, senha, username) {
        this.id = uuidv4();
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
        this.senha = senha;
        this.username = username;
    }
}

class Cliente { //cliente: ID único, nome, data de nascimento, CPF, email, endereço (introduzi), senha e username
    constructor(nome, dataDeNascimento, cpf, email, endereco, senha, username) {
        this.id = uuidv4();
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
    constructor(dataDeValidade, preco, quantidadeNoEstoque, nome, descricao, alergenos, tipoDeProduto) {
        this.id = uuidv4();
        this.dataDeValidade = dataDeValidade;
        this.preco = preco;
        this.quantidadeNoEstoque = quantidadeNoEstoque;
        this.nome = nome;
        this.descricao = descricao;
        this.alergenos = alergenos;
        this.tipoDeProduto = tipoDeProduto;
    }
}

// Carregar dados
const usersData = loadData('./users.json');
const stockData = loadData('./stock.json');
const ordersData = loadData('./orders.json');

// Classe do sistema (a classe mãe)
class Sistema {
    start() {
        let currentUser = null;

        while (true) {  // Loop principal de cadastro, login e opção de saída do programa
            if (!currentUser) {
                const action = readlineSync.question('Escolha uma opção (Login, Cadastrar, Sair): ');

                if (action === 'Login') {
                    currentUser = this.login();
                } else if (action === 'Cadastrar') {
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

    login() { // Função para login
        const username = readlineSync.question('Digite seu nome de usuário: ');
        const password = readlineSync.question('Digite sua senha: ', { hideEchoBack: true });

        const user = usersData.find(u => u.username === username);
        if (user && user.senha === password) { 
            console.log('Login bem-sucedido!');
            if (user.hasOwnProperty('dataDeNascimento')) { // Diferencia os usuários através da Data de Nascimento (um dado que só clientes inserem)
                return new Cliente(user.nome, user.dataDeNascimento, user.cpf, user.email, user.senha, user.username);
            } else {
                return new Funcionario(user.nome, user.cpf, user.email, user.senha, user.username);
            }
        } else {
            console.log('Usuário ou senha incorretos.');
            return null;
        }
    }

    register() { // Função para cadastro 
        const tipo = readlineSync.question('Escolha o tipo de usuário (funcionario, cliente): ');
    
        const nome = readlineSync.question('Digite seu nome e último sobrenome: ');
        const cpf = readlineSync.question('Digite seu CPF: ');
        const email = readlineSync.question('Digite seu email: ');
        const password = readlineSync.question('Digite a senha: ', { hideEchoBack: true }); // NÃO aparece o que digita por questões de segurança
        const username = readlineSync.question('Digite o nome de usuário: ');
    
        if (tipo === 'cliente') { // Se o tipo de usuário for cliente, adicionar a pergunta da data de nascimento e do endereço
            const dataDeNascimento = readlineSync.question('Digite sua data de nascimento: ');
            const endereco = readlineSync.question('Digite seu endereço para entrega de pedidos: '); // Corrigido
            const usuario = new Cliente(nome, dataDeNascimento, cpf, email, endereco, password, username);

            usersData.push(usuario);
            saveData('./users.json', usersData); // Salvar os dados no arquivo JSON para armazenamento
    
            console.log('Usuário cadastrado com sucesso!');
            console.log('Dados do novo usuário:', usuario); // Mostrar os dados do novo usuário

        } else if (tipo === 'funcionario') {
            const usuario = new Funcionario(nome, cpf, email, password, username);

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

        const action = readlineSync.question('Escolha uma opção: ');

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

        const action = readlineSync.question('\nEscolha uma opção: ');

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
            console.log('\nQual dado você deseja modificar?');  // Mudança feita para que ele possa escolher qual dado deseja modificar
            console.log('1. Nome');
            console.log('2. Email');
            console.log('3. Senha');
            console.log('4. CPF');
            console.log('5. Endereço');
            console.log('6. Nome de Usuário');
            console.log('7. Sair');

            const choice = readlineSync.question('Escolha uma opção: ');

            switch (choice) { // Switch case para cada opção de modificação de dados do usuário, pedindo o novo e mostrando o atual
                case '1':
                    user.nome = readlineSync.question(`Digite seu novo nome (atual: ${user.nome}): `) || user.nome;
                    console.log('Nome atualizado com sucesso!');
                    break;
                case '2':
                    user.email = readlineSync.question(`Digite seu novo email (atual: ${user.email}): `) || user.email;
                    console.log('Email atualizado com sucesso!');
                    break;
                case '3':
                    user.senha = readlineSync.question('Digite sua nova senha: ', { hideEchoBack: true }) || user.senha;
                    console.log('Senha atualizada com sucesso!');
                    break;
                case '4':
                    user.cpf = readlineSync.question(`Digite seu novo CPF (atual: ${user.cpf}): `) || user.cpf;
                    console.log('CPF atualizado com sucesso!');
                    break;
                case '5':
                    user.endereco = readlineSync.question(`Digite seu novo endereço (atual: ${user.endereco}): `) || user.endereco;
                    console.log('Endereço atualizado com sucesso!');
                    break;
                case '6':
                    user.username = readlineSync.question(`Digite seu novo nome de usuário (atual: ${user.username}): `) || user.username;
                    console.log('Nome de usuário atualizado com sucesso!');
                    break;
                case '7':
                    saveData('./users.json', usersData);
                    console.log('Saindo da modificação de dados.');
                    return;
                default:
                    console.log('Opção inválida. Tente novamente.');
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

        order.status = readlineSync.question(`Digite o novo status do pedido (atual: ${order.status}): `) || order.status;
        saveData('./orders.json', ordersData);

        console.log('Status do pedido alterado com sucesso!');
    }

    addProduct() { // Função de adição de produto pelo funcionário 
        const dataDeValidade = readlineSync.question('Digite a data de validade do produto: ');
        const preco = parseFloat(readlineSync.question('Digite o preço do produto: '));
        const quantidadeNoEstoque = parseInt(readlineSync.question('Digite a quantidade em estoque do produto: '), 10);
        const nome = readlineSync.question('Digite o nome do produto: ');
        const descricao = readlineSync.question('Digite a descrição do produto: ');
        const alergenos = readlineSync.question('Digite os alérgenos do produto (se houver): ');
        const tipoDeProduto = readlineSync.question('Digite o tipo de produto (Entradas, Prato Principal, Sobremesas, Bebidas): ');
        
        const produto = new Produto(dataDeValidade, preco, quantidadeNoEstoque, nome, descricao, alergenos, tipoDeProduto);

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

        produto.dataDeValidade = readlineSync.question(`Digite a nova data de validade do produto (atual: ${produto.dataDeValidade}): `) || produto.dataDeValidade;
        produto.preco = parseFloat(readlineSync.question(`Digite o novo preço do produto (atual: ${produto.preco}): `)) || produto.preco;
        produto.quantidadeNoEstoque = parseInt(readlineSync.question(`Digite a nova quantidade em estoque do produto (atual: ${produto.quantidadeNoEstoque}): `), 10) || produto.quantidadeNoEstoque;
        produto.nome = readlineSync.question(`Digite o novo nome do produto (atual: ${produto.nome}): `) || produto.nome;
        produto.descricao = readlineSync.question(`Digite a nova descrição do produto (atual: ${produto.descricao}): `) || produto.descricao;
        produto.alergenos = readlineSync.question(`Digite os novos alérgenos do produto (atual: ${produto.alergenos}): `) || produto.alergenos;
        produto.tipoDeProduto = readlineSync.question(`Digite o novo tipo de produto (atual: ${produto.tipoDeProduto}): `) || produto.tipoDeProduto;

        saveData('./stock.json', stockData);

        console.log('Produto editado com sucesso!');
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

    makeOrder(cliente) { // Função para fazer o pedido (cliente)
        const produtoNome = readlineSync.question('Digite o nome do produto que deseja pedir: ');
        const produto = stockData.find(p => p.nome.toLowerCase() === produtoNome.toLowerCase());
    
        if (!produto) {
            console.log('Produto não encontrado.');
            return;
        }
    
        if (produto.quantidadeNoEstoque <= 0) {
            console.log('Produto fora de estoque.');
            return;
        }
    
        const tipoDePedido = readlineSync.question('Digite o tipo de pedido (Entrega, Retirada, Restaurante): ');
    
        if (!['Entrega', 'Retirada', 'Restaurante'].includes(tipoDePedido)) {
            console.log('Tipo de pedido inválido.');
            return;
        }
    
        const pedido = new Pedido(cliente.id, cliente.username, 'Em andamento', new Date().toISOString(), tipoDePedido);
    
        ordersData.push(pedido);
        produto.quantidadeNoEstoque--;
        saveData('./orders.json', ordersData);
        saveData('./stock.json', stockData);
    
        console.log('Pedido realizado com sucesso!');
    }
    

    cancelOrder(cliente) { // Função para cancelar o pedido (cliente) 
        const orderId = readlineSync.question('Digite o ID do pedido que deseja cancelar: ');
        const orderIndex = ordersData.findIndex(o => o.id === orderId && o.clienteId === cliente.id);

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

    viewClientOrders(cliente) { // Função para visualizar os pedidos do cliente (pelo funcionário)
        const clientOrders = ordersData.filter(o => o.clienteId === cliente.id);
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