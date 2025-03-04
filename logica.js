let variaveis = [];
let expressao = "";
let tblDigital = [];

document.addEventListener("DOMContentLoaded", function () {
    criarTopo(0);
    ajustarTabela(0, 0);
});

function pegarValor() {
    const txtbxQntVar = document.getElementById("txtbxQntVar");
    expressao = txtbxQntVar.value;
    const resultado = separarCaracteres(expressao);

    document.getElementById("grid-container").innerHTML = "";
    tblDigital = [];
    variaveis = [];
    
    variaveis.push(...resultado.letras, ...resultado.letrasnegativas, ...resultado.termosEmParenteses, ...resultado.termosnegativos, ...resultado.termosE, ...resultado.termosOU, expressao);
    console.log("Caracteres Especiais:", resultado.especiais);
    console.log("Termos negativos:", resultado.termosnegativos);
    console.log("Termos em parenteses:", resultado.termosEmParenteses);
    console.log("Termos and:", resultado.termosE);
    console.log("Termos or:", resultado.termosOU);
    console.log("Caracteres negativos:", resultado.letrasnegativas);

    criarTabelaDigital(resultado.letras.length, variaveis.length);
    criarTopo(variaveis.length);
    ajustarTabela(resultado.letras.length, variaveis.length);
}

function separarCaracteres(input) {
    const caracteresEspeciais = ['^', 'v'];
    let letras = [];
    let termosnegativos = [];
    let letrasnegativas = [];
    let termosE = [];
    let termosOU = [];
    let termosEmParenteses = [];
    let especiais = [];

    for (let i = 0; i < input.length; i++) {
        if (input[i] === "~") {
            if (/[a-zA-Z]/.test(input[i + 1])) {
                letrasnegativas.push(input[i] + input[i + 1]);
            } else
            if (input[i + 1] === "(") {
                termosnegativos.push(pegarParenteses("~", i, input));
            } 
        }

        if (input[i] === "(") {
            termosEmParenteses.push(pegarParenteses("(", i, input));
        }
        

        if (caracteresEspeciais.includes(input[i])) {
            especiais.push(input[i]);
        } else if (/^[a-zA-Z]$/.test(input[i]) && !letras.includes(input[i])) {
            letras.push(input[i]);
        }
    }

    let listaIndices = indicesCaracteresEspeciais(input, caracteresEspeciais);

    let primeiraParte = listaIndices.filter((_, index) => index % 2 === 0);
    let segundaParte = listaIndices.filter((_, index) => index % 2 !== 0).reverse();

    let termo1 = "";
    let termo2 = "";
    let termo = input;

    console.log(primeiraParte);
    console.log(segundaParte);

    primeiraParte.forEach((item, i) => {
        console.log(item);

        let ultimoIndice = (i - 1 >= 0 && !(listaIndices[i - 1].indice == item.indice)) 
        ? listaIndices[i].indice + 1
        : 0;
        console.log(listaIndices[i].indice + " " + listaIndices[i+1].indice);

        console.log(listaIndices[i + 1].indice + " " + item.indice);
        let proximoIndice = (i + 1 < listaIndices.length && !(listaIndices[i + 1].indice == item.indice)) 
        ? listaIndices[i + 1].indice 
        : termo.length;
        
        termo1 = termo.substring(ultimoIndice, item.indice);
        termo2 = termo.substring(item.indice + 1, proximoIndice);

        let termoCompleto = termo1 + item.caractere + termo2;

        if(item.caractere == 'v' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[()]/g, "") === termoCompleto.replace(/[()]/g, "")) ){ 
            termosOU.push(termoCompleto);
            console.log(termo1 + " " + item.caractere + " " + termo2);
            console.log(i + " " + ultimoIndice + " " + item.indice + " " + proximoIndice);
        } else if(item.caractere == '^' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[()]/g, "") === termoCompleto.replace(/[()]/g, "")) ){ 
            termosE.push(termoCompleto);
        }
    });
    let aaaa = listaIndices.reverse();
    segundaParte.forEach((item, i) => {
        console.log(item);

        let ultimoIndice = (i + 1 < aaaa.length && !(aaaa[i + 1].indice == item.indice)) 
        ? aaaa[i].indice - 1
        : 0;

        let proximoIndice = (i - 1 >= 0 && !(aaaa[i - 1].indice == item.indice)) 
        ? aaaa[i - 1].indice 
        : termo.length;
        
        //console.log(i + " " + aaaa[i].indice + " " + aaaa[i + 1].indice);
        termo1 = termo.substring(ultimoIndice, item.indice);
        termo2 = termo.substring(item.indice + 1, proximoIndice);

        let termoCompleto = termo1 + item.caractere + termo2;

        if(item.caractere == 'v' && (termo1 + termo2).length < input.length && !termosOU.some(t => t.replace(/[()]/g, "") === termoCompleto.replace(/[()]/g, "")) && !termosEmParenteses.some(t => t.replace(/[()]/g, "") === termoCompleto.replace(/[()]/g, "")) && termoCompleto != expressao && termoCompleto != ""){
            termosOU.push(termoCompleto);
        } else if(item.caractere == '^' && (termo1 + termo2).length < input.length && !termosE.some(t => t.replace(/[()]/g, "") === termoCompleto.replace(/[()]/g, "")) && !termosEmParenteses.some(t => t.replace(/[()]/g, "") === termoCompleto.replace(/[()]/g, "")) && termoCompleto != expressao && termoCompleto != ""){ 
            termosE.push(termoCompleto);
        }
        
        //console.log(ultimoIndice + " " + item.indice + " " + proximoIndice);
        //console.log(termo1 + " v " + termo2);
    });



    //~(avb)v(b^c)
    //(avb)^(bvc)^(~avc)





    

    return {
        letras,
        termosnegativos,
        letrasnegativas,
        termosEmParenteses,
        termosE,
        termosOU,
        especiais
    };
}

function primeiroEUltimoCaractereEspecial(str, especiais) {
    let primeiro = null;
    let ultimo = null;
    let primeiroIndex = Infinity;
    let ultimoIndex = -1;

    especiais.forEach(caractere => {
        let index = str.indexOf(caractere);
        let lastIndex = str.lastIndexOf(caractere);

        if (index !== -1 && index < primeiroIndex) {
            primeiroIndex = index;
            primeiro = caractere;
        }

        if (lastIndex !== -1 && lastIndex > ultimoIndex) {
            ultimoIndex = lastIndex;
            ultimo = caractere;
        }
    });

    return { primeiro, ultimo, primeiroIndex, ultimoIndex };
}
function indicesCaracteresEspeciais(str, especiais) {
    let indices = [];

    for (let i = 0; i < str.length; i++) {
        if (especiais.includes(str[i])) {
            indices.push({ caractere: str[i], indice: i });
        }
    }

    return indices;
}

function pegarParenteses(termoInicial, i, input){
    let contadorParenteses = 1;
    let f = i + 1;

    while (f < input.length && contadorParenteses > 0) {
        termoInicial += input[f];

        if (input[f] === "(") contadorParenteses++;
        if (input[f] === ")") contadorParenteses--;

        f++;
    }

    return termoInicial
}

function criarTabelaDigital(vars, cols){
    tblDigital = gerarCombinacoes(vars);
    tblDigital = tblDigital.map(linha => {
        while (linha.length < cols) {
            linha.push(false);
        }
        return linha;
    });

    let rows = vars === 0 ? 0 : (2 ** vars);

    for(let i = 0; i <= rows -1; i++){
        for(let j = 0; j <= cols -1; j++){
            //Negação
            if(variaveis[j].includes("~")){
                let posicao = variaveis[j].indexOf("~");
                if(posicao === 0){
                    let termo = variaveis[j].substring(posicao + 1, posicao + 2);
                    if(termo.includes("(")){
                        termo = pegarParenteses("", 0, variaveis[j]);
                    }
                    
                    if(variaveis.some(t => t.includes(termo)))
                    {
                        let indice = variaveis.findIndex(t => t.includes(termo));
                        tblDigital[i][j] = !tblDigital[i][indice];
                    }
                }
                else{

                }
            }
            //OU e AND
            let variavel = variaveis[j];

            const listaInvertida = variaveis.slice();
            listaInvertida.sort((a, b) => b.length - a.length);

            let resultado = variavel;
            listaInvertida.forEach(item => {
                if(item === resultado) return;
                resultado = resultado.replaceAll(item, "x".repeat(item.length));
                //console.log(item + " " + resultado  + " " + variavel);
            });
            let indx = resultado.indexOf(resultado.match(/[^x()~]/g) || []);
            if(indx == 0)indx = -1;
            //console.log(indx + " " + resultado);
            //∧∨
            termo1 = variavel.substring(0,indx);
            termo2 = variavel.substring(indx + 1);

            if (termo1.includes("(") !== termo1.includes(")")) {
                termo1 = termo1.replace(/[()]/g, "");
            }if (termo2.includes("(") !== termo2.includes(")")) {
                termo2 = termo2.replace(/[()]/g, "");
            }

            const OUFora = variavel[indx] == "v";
            const EFora = variavel[indx] == "^";
            if(variaveis.some(t => t.includes(termo1)))
            {
                let indice1 = variaveis.findIndex(t => t.includes(termo1));
                let indice2 = variaveis.findIndex(t => t.includes(termo2));
                //console.log(termo1 + " " + termo2 + " " + variavel);
                if(OUFora){
                    if(tblDigital[i][indice1] || tblDigital[i][indice2])
                    {
                        tblDigital[i][j] = true
                    }
                }
                if(EFora){
                    if(tblDigital[i][indice1] && tblDigital[i][indice2])
                    {
                        tblDigital[i][j] = true
                    }
                }
            }
        }
    }

    console.log(tblDigital);
}

function ajustarTabela(vars, cols){
    const gridContainer = document.getElementById("grid-container");
    
    let rows = vars === 0 ? 0 : (2 ** vars);

    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= cols; j++) {
            const cell = document.createElement("div");
            cell.classList.add("grid-item");

            if(tblDigital[i-1][j-1]){
                cell.textContent = "V" ;
                cell.style.backgroundColor ="#223213";
            } 
            else {
                cell.textContent = "F" ;
            }

            gridContainer.appendChild(cell);
        }
    }

    const style = window.getComputedStyle(gridContainer);
    gridContainer.style.height = parseFloat(style.gap) * (rows + 1) + 40 * (rows + 1) + "px";
}

function criarTopo(cols){
    const gridContainer = document.getElementById("grid-container");
    gridContainer.innerHTML = '';

    const tamanhos = [];
    const celulasCriadas = [];

    for (let i = 0; i <= cols - 1; i++) {
        const cell = document.createElement("div");
        cell.classList.add("grid-name");
        cell.textContent = variaveis[i];
        gridContainer.appendChild(cell);
        celulasCriadas.push(cell);
    }

    gridContainer.style.width = 2 + "px";

    setTimeout(() => {
        let tamanho = 0;
        celulasCriadas.forEach((cell, index) => {
            tamanhos.push(cell.getBoundingClientRect().width);
        });
        tamanhos.forEach((valor) => {
            tamanho += valor;
        });

        const style = window.getComputedStyle(gridContainer);
        gridContainer.style.width = tamanho + parseFloat(style.padding) + parseFloat(style.gap) * (cols - 1) + "px";
    }, 0);
}

function gerarCombinacoes(qtdVariaveis) {
    const variaveis = [true, false];
    const combinacoes = [];

    function gerarCombinacao(combinacaoAtual, nivel) {
        if (nivel === qtdVariaveis) {
            combinacoes.push(combinacaoAtual);
            return;
        }
        
        for (let i = 0; i < variaveis.length; i++) {
            gerarCombinacao([...combinacaoAtual, variaveis[i]], nivel + 1);
        }
    }

    gerarCombinacao([], 0);

    return combinacoes;
}