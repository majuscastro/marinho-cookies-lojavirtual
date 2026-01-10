// --- 1. CONFIGURAÇÃO INICIAL E CARROSSEL ---
document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinho();
    
    // Inicia Carrossel apenas se estiver na Home
    if (document.querySelector('.slide')) {
        setInterval(rotateSlides, 3000);
    }

    // Inicializa Filtro de Pesquisa se estiver na Home
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', filtrarCookies);
    }
    
    // Calcula totais no checkout se estiver na página de checkout
    if(document.getElementById('checkout-total')) {
        atualizarResumoCheckout();
        document.getElementById('installments').addEventListener('change', atualizarParcelas);
    }
});

let currentSlide = 0;
function rotateSlides() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

// --- 2. LÓGICA DO CARRINHO (LOCALSTORAGE) ---
let cart = JSON.parse(localStorage.getItem('marinhoCart')) || {};
let valorFrete = parseFloat(localStorage.getItem('marinhoFrete')) || 0;

function salvarCarrinho() {
    localStorage.setItem('marinhoCart', JSON.stringify(cart));
    localStorage.setItem('marinhoFrete', valorFrete);
    carregarCarrinho(); // Atualiza a visualização
}

function adicionarAoCarrinho(nome, preco) {
    if (cart[nome]) cart[nome].qtd++;
    else cart[nome] = { preco, qtd: 1 };
    
    salvarCarrinho();
    alert(`${nome} adicionado ao carrinho!`);
    
    // Efeito visual no ícone
    const icon = document.getElementById('cart-icon-container');
    if(icon) {
        icon.classList.remove('pulse-animation');
        void icon.offsetWidth;
        icon.classList.add('pulse-animation');
    }
}

function carregarCarrinho() {
    const list = document.getElementById('cart-items-list');
    const totalDisp = document.getElementById('total-price');
    const freteDisp = document.getElementById('frete-val');
    const count = document.getElementById('cart-count');
    
    if (!list) return;

    list.innerHTML = '';
    let subtotal = 0, qtdTotal = 0;
    
    Object.keys(cart).forEach(nome => {
        const item = cart[nome];
        subtotal += item.preco * item.qtd;
        qtdTotal += item.qtd;

        // Criamos o HTML do item com o botão de remover (X)
        list.innerHTML += `
            <div class="line cart-item-row">
                <div class="item-info">
                    <button class="btn-remove" onclick="removerDoCarrinho('${nome}')">
                        <i class="fas fa-times"></i>
                    </button>
                    <span>${nome} (x${item.qtd})</span>
                </div>
                <span>R$ ${(item.preco * item.qtd).toFixed(2)}</span>
            </div>`;
    });
    
    if (qtdTotal === 0) {
        list.innerHTML = '<p class="empty-cart">Carrinho vazio</p>';
        valorFrete = 0;
    }

    const totalFinal = subtotal + valorFrete;
    if (freteDisp) freteDisp.innerText = `R$ ${valorFrete.toFixed(2)}`;
    if (totalDisp) totalDisp.innerText = `R$ ${totalFinal.toFixed(2)}`;
    if (count) count.innerText = qtdTotal;
}
// --- 3. FILTRO DE PESQUISA ---
function filtrarCookies() {
    let termo = document.getElementById('search-input').value.toLowerCase();
    let cards = document.querySelectorAll('.cookie-card');
    
    cards.forEach(card => {
        let nome = card.querySelector('h3').innerText.toLowerCase();
        if (nome.includes(termo)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// --- 4. CÁLCULO DE FRETE EFICIENTE ---
function calcularFrete() {
    const cep = document.getElementById('cep-input').value;
    const feedback = document.getElementById('cep-feedback') || alert; // Usa alert se não tiver div de feedback
    
    if (cep.length >= 8) {
        const digitoInicial = parseInt(cep.charAt(0));
        
        // Lógica de simulação de distância/custo
        if (digitoInicial === 0) {
            valorFrete = 0; // SP Capital / Grande SP (Simulação)
            alert("Frete Grátis para sua região!");
        } else if (digitoInicial >= 1 && digitoInicial <= 2) {
            valorFrete = 12.50; // Sudeste próximo
            alert("Frete calculado: R$ 12,50");
        } else if (digitoInicial >= 3 && digitoInicial <= 5) {
            valorFrete = 18.00; // MG, ES, Sul
            alert("Frete calculado: R$ 18,00");
        } else {
            valorFrete = 28.90; // Norte/Nordeste/Centro-Oeste
            alert("Frete calculado: R$ 28,90");
        }
        
        salvarCarrinho();
    } else {
        alert("Digite um CEP válido com 8 números.");
    }
}

// --- 5. LÓGICA DO CHECKOUT ---
function atualizarResumoCheckout() {
    const lista = document.getElementById('checkout-list');
    const totalEl = document.getElementById('checkout-total');
    const selectParcelas = document.getElementById('installments');
    
    let subtotal = 0;
    lista.innerHTML = '';
    
    Object.keys(cart).forEach(nome => {
        const item = cart[nome];
        subtotal += item.preco * item.qtd;
        lista.innerHTML += `<li>${nome} x${item.qtd} - R$ ${(item.preco * item.qtd).toFixed(2)}</li>`;
    });
    
    const totalFinal = subtotal + valorFrete;
    totalEl.innerText = totalFinal.toFixed(2);
    
    // Popular parcelamento
    selectParcelas.innerHTML = '';
    for(let i=1; i<=5; i++) {
        let texto = "";
        let valorParcela = 0;
        
        if (i <= 2) {
            valorParcela = totalFinal / i;
            texto = `${i}x de R$ ${valorParcela.toFixed(2)} sem juros`;
        } else {
            // Juros simples de 5% para simulação
            let comJuros = totalFinal * 1.05;
            valorParcela = comJuros / i;
            texto = `${i}x de R$ ${valorParcela.toFixed(2)} (Total: R$ ${comJuros.toFixed(2)})`;
        }
        
        let option = document.createElement('option');
        option.value = i;
        option.text = texto;
        selectParcelas.appendChild(option);
    }
}

function atualizarParcelas() {
    // Função placeholder caso queira exibir detalhes da parcela selecionada
    console.log("Parcela alterada");
}

function processarPedido(e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    alert(`Obrigado ${nome}!\nSeu pedido foi realizado com sucesso.\nEnviaremos os detalhes para seu e-mail.`);
    
    // Limpar carrinho e redirecionar
    cart = {};
    valorFrete = 0;
    salvarCarrinho();
    window.location.href = 'index.html';
}

// --- 6. CHAT ---
function enviarMensagemChat() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    
    if (input.value.trim() !== "") {
        messages.innerHTML += `<p class="user-msg">${input.value}</p>`;
        const msgUser = input.value.toLowerCase();
        input.value = "";
        
        setTimeout(() => {
            let resposta = "Em breve um atendente humano irá te responder.";
            if (msgUser.includes("devolu")) resposta = "Consulte nossa página de Devoluções clicando em Política de Devolução ao lado.";
            if (msgUser.includes("frete")) resposta = "Nosso frete varia por região. Digite seu CEP no carrinho para calcular.";
             if (msgUser.includes("troca")) resposta = "Consulte nossa página de Devoluções clicando em Política de Devolução ao lado.";
            
            messages.innerHTML += `<p class="bot-msg">${resposta}</p>`;
            messages.scrollTop = messages.scrollHeight;
        }, 800);
        messages.scrollTop = messages.scrollHeight;
    }
}

// Função para remover um item específico do carrinho
function removerDoCarrinho(nome) {
    if (cart[nome]) {
        // Remove a propriedade do objeto
        delete cart[nome];
        
        // Se o carrinho ficar vazio, resetamos o frete
        if (Object.keys(cart).length === 0) {
            valorFrete = 0;
        }
        
        // Salva no LocalStorage e atualiza a tela
        salvarCarrinho();
    }

}
