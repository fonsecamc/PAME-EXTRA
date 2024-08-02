// Bibliotecas
import readlineSync from 'readline-sync'; // Biblioteca para interação com o usuário no terminal
import { v4 as uuidv4 } from 'uuid'; // Biblioteca para gerar IDs únicos
import fs from 'fs'; // Biblioteca para manipulação de arquivos

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
class Pedido { //pedido: ID único, ID do cliente, status e data do pedido
    constructor(clienteId, status, dataDoPedido) {
        this.id = uuidv4();
        this.clienteId = clienteId;
        this.status = status;
        this.dataDoPedido = dataDoPedido;
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

class Cliente { //cliente: ID único, nome, data de nascimento, CPF, email, senha e username (introduzi)
    constructor(nome, dataDeNascimento, cpf, email, senha, username) {
        this.id = uuidv4();
        this.nome = nome;
        this.dataDeNascimento = dataDeNascimento;
        this.cpf = cpf;
        this.email = email;
        this.senha = senha;
        this.username = username;
    }
}

class Produto { //produto: ID único (introduzi), data de validade, preço, quantidade em estoque, nome e descrição
    constructor(dataDeValidade, preco, quantidadeNoEstoque, nome, descricao) {
        this.id = uuidv4();
        this.dataDeValidade = dataDeValidade;
        this.preco = preco;
        this.quantidadeNoEstoque = quantidadeNoEstoque;
        this.nome = nome;
        this.descricao = descricao;
    }
}

// Carregar dados
const usersData = loadData('./users.json');
const stockData = loadData('./stock.json');
const ordersData = loadData('./orders.json');

// Classe do sistema
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
            if (user.hasOwnProperty('dataDeNascimento')) {
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
        const password = readlineSync.question('Digite a senha: ', { hideEchoBack: true });
        const username = readlineSync.question('Digite o nome de usuário: ');

        if (tipo === 'cliente') { // Se o tipo de usuário for cliente, adicionar a pergunta da data de nascimento
            const dataDeNascimento = readlineSync.question('Digite sua data de nascimento: ');
            const usuario = new Cliente(nome, dataDeNascimento, cpf, email, password, username);

            usersData.push(usuario);
            saveData('./users.json', usersData); // Salvar os dados no arquivo JSON

            console.log('Usuário cadastrado com sucesso!');
            console.log('Dados do novo usuário:', usuario);
        } else if (tipo === 'funcionario') {
            const usuario = new Funcionario(nome, cpf, email, password, username);

            usersData.push(usuario);
            saveData('./users.json', usersData); // Salvar os dados no arquivo JSON

            console.log('Usuário cadastrado com sucesso!');
            console.log('Dados do novo usuário:', usuario);
        } else {
            console.log('Tipo de usuário inválido.');
        }
    }

    funcionarioActions(funcionario) { // Funções para funcionários
        const action = readlineSync.question('Escolha uma opção (Ver Meus Dados, Modificar Meus Dados, Ver Lista de Pedidos, Ver Lista de Produtos, Ver Lista de Clientes, Mudar status do pedido, Adicionar Produto, Editar Produto, Excluir Produto, Logout): ');

        switch(action) { // Switch case para cada opção de uso do sistema pelo funcionário 
            case 'Ver Meus Dados':
                console.log(funcionario);
                break;
            case 'Modificar Meus Dados':
                this.modifyUserData(funcionario);
                break;
            case 'Ver Lista de Pedidos':
                this.viewOrders();
                break;
            case 'Ver Lista de Produtos':
                this.viewProducts();
                break;
            case 'Ver Lista de Clientes':
                this.viewClients();
                break;
            case 'Mudar status do pedido':
                this.changeOrderStatus();
                break;
            case 'Adicionar Produto':
                this.addProduct();
                break;
            case 'Editar Produto':
                this.editProduct();
                break;
            case 'Excluir Produto':
                this.deleteProduct();
                break;
            case 'Logout':
                return null;
        }

        return funcionario;
    }

    clienteActions(cliente) { // Funções para clientes
        const action = readlineSync.question('Escolha uma opção (Ver meus Dados, Modificar Meus Dados, Ver Lista de Produtos, Fazer pedido, Cancelar pedido, Ver meus pedidos, Avaliar pedido, Visualizar avaliações, Logout): ');

        switch(action) { // Switch case para cada opção de uso do sistema pelo cliente 
            case 'Ver meus Dados':
                console.log(cliente);
                break;
            case 'Modificar Meus Dados':
                this.modifyUserData(cliente);
                break;
            case 'Ver Lista de Produtos':
                this.viewProducts();
                break;
            case 'Fazer pedido':
                this.makeOrder(cliente);
                break;
            case 'Cancelar pedido':
                this.cancelOrder(cliente);
                break;
            case 'Ver meus pedidos':
                this.viewClientOrders(cliente);
                break;
            case 'Avaliar pedido':
                this.rateOrder(cliente);
                break;
            case 'Visualizar avaliações':
                this.viewRatings();
                break;
            case 'Logout':
                return null;
        }

        return cliente;
    }

    modifyUserData(user) { // Função para modificar os dados do usuário (disponível para funcionário e cliente)
        const nome = readlineSync.question(`Digite seu novo nome (deixe em branco para não modificar) [${user.nome}]: `) || user.nome;
        const email = readlineSync.question(`Digite seu novo email (deixe em branco para não modificar) [${user.email}]: `) || user.email;
        const senha = readlineSync.question(`Digite sua nova senha (deixe em branco para não modificar): `, { hideEchoBack: true }) || user.senha;

        user.nome = nome;
        user.email = email;
        user.senha = senha;

        const userIndex = usersData.findIndex(u => u.id === user.id);
        usersData[userIndex] = user;
        saveData('./users.json', usersData);

        console.log('Dados modificados com sucesso!');
    }

    viewOrders() { // Função para visualizar os pedidos
        ordersData.sort((a, b) => new Date(a.dataDoPedido) - new Date(b.dataDoPedido));
        console.log(ordersData);
    }

    viewProducts() { // Função para visualizar os produtos
        stockData.sort((a, b) => a.nome.localeCompare(b.nome));
        console.log(stockData);
    }

    viewClients() { // Função para visualizar os clientes
        const clients = usersData.filter(user => user instanceof Cliente);
        clients.sort((a, b) => a.nome.localeCompare(b.nome));
        console.log(clients);
    }

    changeOrderStatus() { // Função para alterar o status de um pedido (disponível para funcionários)
        const orderId = readlineSync.question('Digite o ID do pedido que deseja atualizar: ');
        const status = readlineSync.question('Escolha o novo status do pedido (Pendente, Adiado, Realizado, Cancelado): ');

        const order = ordersData.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            saveData('./orders.json', ordersData);
            console.log('Status do pedido atualizado com sucesso!');
        } else {
            console.log('Pedido não encontrado.');
        }
    }

    addProduct() { // Função para adicionar um novo produto (disponível para funcionários)
        const nome = readlineSync.question('Digite o nome do produto: ');
        const descricao = readlineSync.question('Digite a descrição do produto: ');
        const preco = parseFloat(readlineSync.question('Digite o preço do produto: '));
        const quantidadeNoEstoque = parseInt(readlineSync.question('Digite a quantidade no estoque: '));
        const dataDeValidade = readlineSync.question('Digite a data de validade: ');

        const produto = new Produto(dataDeValidade, preco, quantidadeNoEstoque, nome, descricao);

        stockData.push(produto);
        saveData('./stock.json', stockData);

        console.log('Produto adicionado com sucesso!');
        console.log('Dados do novo produto:', produto);
    }

    editProduct() { // Função para editar um produto existente (disponível para funcionários)
        const productId = readlineSync.question('Digite o ID do produto que deseja editar: ');

        const produto = stockData.find(p => p.id === productId);
        if (produto) {
            produto.nome = readlineSync.question(`Digite o novo nome do produto (deixe em branco para não modificar) [${produto.nome}]: `) || produto.nome;
            produto.descricao = readlineSync.question(`Digite a nova descrição do produto (deixe em branco para não modificar) [${produto.descricao}]: `) || produto.descricao;
            produto.preco = parseFloat(readlineSync.question(`Digite o novo preço do produto (deixe em branco para não modificar) [${produto.preco}]: `)) || produto.preco;
            produto.quantidadeNoEstoque = parseInt(readlineSync.question(`Digite a nova quantidade no estoque (deixe em branco para não modificar) [${produto.quantidadeNoEstoque}]: `)) || produto.quantidadeNoEstoque;
            produto.dataDeValidade = readlineSync.question(`Digite a nova data de validade (deixe em branco para não modificar) [${produto.dataDeValidade}]: `) || produto.dataDeValidade;

            saveData('./stock.json', stockData);

            console.log('Produto editado com sucesso!');
            console.log('Dados do produto editado:', produto);
        } else {
            console.log('Produto não encontrado.');
        }
    }

    deleteProduct() { // Função para excluir um produto (disponível para funcionários)
        const productId = readlineSync.question('Digite o ID do produto que deseja excluir: ');

        const productIndex = stockData.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            const produtoExcluido = stockData.splice(productIndex, 1);
            saveData('./stock.json', stockData);

            console.log('Produto excluído com sucesso!');
            console.log('Dados do produto excluído:', produtoExcluido);
        } else {
            console.log('Produto não encontrado.');
        }
    }

    makeOrder(cliente) { // Função para fazer um novo pedido (disponível para clientes)
        const produtos = stockData.map(p => `${p.nome} (ID: ${p.id}, Preço: ${p.preco}, Quantidade no estoque: ${p.quantidadeNoEstoque})`).join('\n');
        console.log('Produtos disponíveis:\n', produtos);

        const productId = readlineSync.question('Digite o ID do produto que deseja comprar: ');
        const quantidade = parseInt(readlineSync.question('Digite a quantidade que deseja comprar: '));

        const produto = stockData.find(p => p.id === productId);
        if (produto && quantidade <= produto.quantidadeNoEstoque) {
            produto.quantidadeNoEstoque -= quantidade;
            const pedido = new Pedido(cliente.id, 'Pendente', new Date().toISOString());
            ordersData.push(pedido);
            saveData('./orders.json', ordersData);
            saveData('./stock.json', stockData);

            console.log('Pedido realizado com sucesso!');
            console.log('Dados do pedido:', pedido);
        } else {
            console.log('Produto não encontrado ou quantidade indisponível.');
        }
    }

    cancelOrder(cliente) { // Função para cancelar um pedido (disponível para clientes)
        const pedidosCliente = ordersData.filter(p => p.clienteId === cliente.id && p.status === 'Pendente');
        const pedidos = pedidosCliente.map(p => `${p.id} (Status: ${p.status}, Data: ${p.dataDoPedido})`).join('\n');
        console.log('Seus pedidos pendentes:\n', pedidos);

        const orderId = readlineSync.question('Digite o ID do pedido que deseja cancelar: ');

        const pedido = ordersData.find(p => p.id === orderId && p.clienteId === cliente.id);
        if (pedido) {
            pedido.status = 'Cancelado';
            saveData('./orders.json', ordersData);

            console.log('Pedido cancelado com sucesso!');
        } else {
            console.log('Pedido não encontrado.');
        }
    }

    viewClientOrders(cliente) { // Função para visualizar os pedidos do cliente
        const pedidosCliente = ordersData.filter(p => p.clienteId === cliente.id);
        pedidosCliente.sort((a, b) => new Date(a.dataDoPedido) - new Date(b.dataDoPedido));
        console.log(pedidosCliente);
    }

    rateOrder(cliente) { // Função para avaliar um pedido (disponível para clientes)
        const pedidosCliente = ordersData.filter(p => p.clienteId === cliente.id && p.status === 'Realizado');
        const pedidos = pedidosCliente.map(p => `${p.id} (Status: ${p.status}, Data: ${p.dataDoPedido})`).join('\n');
        console.log('Seus pedidos realizados:\n', pedidos);

        const orderId = readlineSync.question('Digite o ID do pedido que deseja avaliar: ');
        const avaliacao = parseInt(readlineSync.question('Digite sua avaliação (1 a 5): '));

        const pedido = ordersData.find(p => p.id === orderId && p.clienteId === cliente.id);
        if (pedido && avaliacao >= 1 && avaliacao <= 5) {
            pedido.avaliacao = avaliacao;
            saveData('./orders.json', ordersData);

            console.log('Avaliação registrada com sucesso!');
        } else {
            console.log('Pedido não encontrado ou avaliação inválida.');
        }
    }

    viewRatings() { // Função para visualizar avaliações (disponível para clientes)
        const avaliacoes = ordersData.filter(p => p.avaliacao).map(p => `Pedido ID: ${p.id}, Avaliação: ${p.avaliacao}`).join('\n');
        console.log('Avaliações de pedidos:\n', avaliacoes);
    }
}

// Iniciar o sistema
const sistema = new Sistema();
sistema.start();