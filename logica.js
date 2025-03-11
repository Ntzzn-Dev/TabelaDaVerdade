let variaveis = [];
let expressao = "";
let tblDigital = [];
let digitos = { indicesNum: [], indicesOp: [], indicesComp: [], resultados: [] };

//caracteres ∧ ∨

function AddSinal(sinal){
    const txtbxTermo = document.getElementById("txtbxTermo");
    let posicao = txtbxTermo.selectionStart; 

    if (/[∨∧➝⟷⊕]/.test(txtbxTermo.value.slice(posicao - 1, posicao + 2))) {
        console.log("tem");
        return;
    }

    let novoTexto = txtbxTermo.value.slice(0, posicao) + sinal + txtbxTermo.value.slice(posicao);
    txtbxTermo.value = novoTexto;
    txtbxTermo.selectionStart = txtbxTermo.selectionEnd = posicao + 1;
    document.getElementById("txtbxTermo").focus();
}

function Verificacao(termo, indice, obj) { //se o caracter anterior ou posterior for uma letra e o caracter atual tambem, ele é retirado
    if ((/^[a-zAZ]$/.test(termo[indice - 1]) && /^[a-zA-Z]$/.test(termo[indice - 2]) || /^[a-zA-Z]$/.test(termo[indice])) || 
        (/\d/.test(termo) && /^[a-zA-Z]$/.test(termo[indice - 1])) ||
        (/^[a-zA-Z]/.test(termo) && /\d/.test(termo[indice - 1]))) 
        {
            obj.value = termo.slice(0, indice-1) + termo.slice(indice);
        }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("addAnd").addEventListener("touchstart", () => AddSinal('∧'));
    document.getElementById("generateTable").addEventListener("touchstart", pegarValor);
    document.getElementById("addOr").addEventListener("touchstart", () => AddSinal('∨'));
    document.getElementById("addImpl").addEventListener("touchstart", () => AddSinal('➝'));
    document.getElementById("addEqui").addEventListener("touchstart", () => AddSinal('⟷'));
    document.getElementById("addXOR").addEventListener("touchstart", () => AddSinal('⊕'));
    criarTopo(0);
    ajustarTabela(0, 0);
});

function pegarValor() {
    const txtbxTermo = document.getElementById("txtbxTermo");
    expressao = txtbxTermo.value;
    const resultado = separarCaracteres(expressao);

    document.getElementById("grid-container").innerHTML = "";
    document.getElementById("esquerda").innerHTML = "";
    tblDigital = [];
    variaveis = [];
    
    variaveis.push(...resultado.letras, ...resultado.termosNumericos, ...resultado.letrasnegativas, ...resultado.termosEmParenteses, ...resultado.termosnegativos, ...resultado.termosE, ...resultado.termosOU, ...resultado.termosImpl, ...resultado.termosEqui, ...resultado.termosXOR, expressao);
    console.log("Caracteres Especiais:", resultado.especiais);
    console.log("Termos negativos:", resultado.termosnegativos);
    console.log("Termos em parenteses:", resultado.termosEmParenteses);
    console.log("Termos and:", resultado.termosE);
    console.log("Termos or:", resultado.termosOU);
    console.log("Termos xor:", resultado.termosXOR);
    console.log("Termos implicantes:", resultado.termosImpl);
    console.log("Termos equivalentes:", resultado.termosEqui);
    console.log("Termos numericos:", resultado.termosNumericos);
    console.log("Caracteres negativos:", resultado.letrasnegativas);
    variaveis.sort((a, b) => a.length - b.length);

    criarTabelaDigital(resultado.letras.length, variaveis.length);
    criarTopo(variaveis.length);
    ajustarTabela(resultado.letras.length > 0 ? resultado.letras.length : "d", variaveis.length);
}

function separarCaracteres(input) {
    const caracteresEspeciais = ['∧', '∨', '➝', '⟷', '⊕'];
    let letras = [];
    let termosnegativos = [];
    let letrasnegativas = [];
    let termosE = [];
    let termosOU = [];
    let termosXOR = [];
    let termosImpl = [];
    let termosEqui = [];
    let termosEmParenteses = [];
    let especiais = [];
    let termosNumericos = [];

    let listaIndices = indicesCaracteresEspeciais(input, caracteresEspeciais);

    
    if(/\d/.test(input)){
        digitos = indicesNumeros(input);
        
        let numeros = digitos.indicesNum.map(obj => ({ ...obj }));

        digitos.indicesOp.forEach(element => {
            let var1 = 0;
            var1 = encontrarIndiceMaisProximo(numeros, element.indice, false)
            let var2 = 0;
            var2 = encontrarIndiceMaisProximo(numeros, element.indice, true)
            let dgVar1 = var1.digitos;
            let dgVar2 = var2.digitos;
            
            let indxVar2 = numeros.findIndex(t => t.indice === var2.indice);

            let resultado = 0;

            if(element.operador == "+"){
                resultado = dgVar1 + dgVar2;
            } else if(element.operador == "-"){
                resultado = dgVar1 - dgVar2;
            } else if(element.operador == "/"){
                resultado = dgVar1 / dgVar2;
            } else if(element.operador == "*"){
                resultado = dgVar1 * dgVar2;
            } else if(element.operador == "^"){
                resultado = dgVar1 ** dgVar2;
            }

            //console.log(var2);
            numeros.splice(indxVar2, 1); //retira o indice da segunda variavel se tornando apenas 1
            numeros[indxVar2 - 1].digitos = resultado;
            numeros[indxVar2 - 1].exp = var1.exp + element.operador + var2.exp;
            //console.log(numeros);
        });
        digitos.indicesComp.forEach((element, i) => {
            let var1 = element;
            var1 = encontrarIndiceMaisProximo(numeros, var1.indice, false)
            let var2 = element;
            var2 = encontrarIndiceMaisProximo(numeros, var2.indice, true)
            let dgVar1 = var1.digitos;
            let dgVar2 = var2.digitos;
            
            let resultado = false;

            if(element.comparador == "="){
                resultado = dgVar1 == dgVar2;
            } else if(element.comparador == ">"){
                resultado = dgVar1 > dgVar2;
            } else if(element.comparador == "<"){
                resultado = dgVar1 < dgVar2;
            } else if(element.comparador == "<="){
                resultado = dgVar1 <= dgVar2;
            } else if(element.comparador == ">="){
                resultado = dgVar1 >= dgVar2;
            }
            //console.log(dgVar1 +" " + dgVar2)
            termosNumericos.push(var1.exp + element.comparador + var2.exp);
            digitos.resultados[i] = resultado;
        });
    }

    for (let i = 0; i < input.length; i++) {
        if (input[i] === "~") {
            if (/[a-zA-Z]/.test(input[i + 1])) {
                letrasnegativas.push(input[i] + input[i + 1]);
            } else
            if (input[i + 1] === "(") {
                termosnegativos.push(pegarParenteses("~(", i+1, input));
            } else
            if (input[i + 1] === "[") {
                termosnegativos.push(pegarParenteses("~[", i+1, input));
            } 
        }

        if (input[i] === "(" || input[i] === "[") {
            let termo = pegarParenteses(input[i] === "(" ? "(" : "[", i, input);
            if(!termosNumericos.some(t => t.replace(/[\(\)\[\]]/g, "") === termo.replace(/[\(\)\[\]]/g, "")) && (termo.includes("∨") || termo.includes("∧") || termo.includes("➝") || termo.includes("⟷") || termo.includes("⊕")))
            {
                termosEmParenteses.push(termo);

                let indices = -1;
            
                for (let j = 0; j < termo.length; j++) {
                    if (termo[j] === "∨" || termo[j] === "∧" || termo[j] === "➝" || termo[j] === "⟷" || termo[j] === "⊕") {
                        indices = j;
                    }
                }
            
                let verdadeiroI = listaIndices.findIndex(t => t.indice === indices);
            
                if (verdadeiroI !== -1 && verdadeiroI < listaIndices.length) {
                    listaIndices[verdadeiroI].disposicao = false;
                }
            }
        }
        

        if (caracteresEspeciais.includes(input[i])) {
            especiais.push(input[i]);
        } else if (/^[a-zA-Z]$/.test(input[i]) && !letras.includes(input[i])) {
            letras.push(input[i]);
        }
    }


    let primeiraParte = listaIndices.filter((_, index) => index % 2 === 0);
    let segundaParte = listaIndices.filter((_, index) => index % 2 !== 0).reverse();

    let termo1 = "";
    let termo2 = "";
    let termo = substituirPorX(input, letras);
    termo = substituirPorX(termo, termosNumericos);

    console.log(termosNumericos);
    console.log(termo);

    primeiraParte.forEach(item => {
        let verdadeiroI = listaIndices.findIndex(t => t.indice == item.indice)
        
        listaIndices[verdadeiroI].disposicao = false;

        console.log(termo);
        let inicio = encontrarIndiceAnterior(termo, item.indice -1 ) + 1;
        let fim = encontrarIndicePosterior(termo, item.indice + 1);

        termo = rexizar(termo, inicio, fim);
        //console.log(item);
        //console.log(inicio, item.indice, fim);
        
        termo1 = input.substring(inicio, item.indice);
        termo2 = input.substring(item.indice + 1, fim);

        console.log(termo1 + " " + item.caractere + " "  + termo2);
        let termoCompleto = termo1 + item.caractere + termo2;

        if((termoCompleto.includes("(") !== termoCompleto.includes(")")) || termosOU.includes(termoCompleto) || termosE.includes(termoCompleto) || termosImpl.includes(termoCompleto) || termosEqui.includes(termoCompleto) || termosXOR.includes(termoCompleto)){
            termoCompleto = "";
        }

        if(item.caractere == '∨' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[\(\)\[\]]/g, "") === termoCompleto.replace(/[\(\)\[\]]/g, "")) && termoCompleto != ""){
            termosOU.push(termoCompleto);
        } else if(item.caractere == '∧' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[\(\)\[\]]/g, "") === termoCompleto.replace(/[\(\)\[\]]/g, "")) && termoCompleto != ""){
            termosE.push(termoCompleto);
        } else if(item.caractere == '➝' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[\(\)\[\]]/g, "") === termoCompleto.replace(/[\(\)\[\]]/g, "")) && termoCompleto != ""){ 
            termosImpl.push(termoCompleto);
        } else if(item.caractere == '⟷' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[\(\)\[\]]/g, "") === termoCompleto.replace(/[\(\)\[\]]/g, "")) && termoCompleto != ""){ 
            termosEqui.push(termoCompleto);
        } else if(item.caractere == '⊕' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[\(\)\[\]]/g, "") === termoCompleto.replace(/[\(\)\[\]]/g, "")) && termoCompleto != ""){ 
            termosXOR.push(termoCompleto);
        }
    });
    segundaParte.forEach(item => {
        let verdadeiroI = listaIndices.findIndex(t => t.indice == item.indice)
        
        listaIndices[verdadeiroI].disposicao = false;

        let inicio = encontrarIndiceAnterior(termo, item.indice -1 ) + 1;
        let fim = encontrarIndicePosterior(termo, item.indice + 1);

        termo = rexizar(termo, inicio, fim);
        
        console.log(termo);
        termo1 = input.substring(inicio, item.indice);
        termo2 = input.substring(item.indice + 1, fim);

        console.log(termo1 + " " + item.caractere + " "  + termo2);
        let termoCompleto = termo1 + item.caractere + termo2;

        if((termoCompleto.includes("(") !== termoCompleto.includes(")")) || termosOU.includes(termoCompleto) || termosE.includes(termoCompleto) || termosImpl.includes(termoCompleto) || termosEqui.includes(termoCompleto) || termosXOR.includes(termoCompleto)){
            termoCompleto = "";
        }

        if(item.caractere == '∨' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[\(\)\[\]]/g, "") === termoCompleto.replace(/[\(\)\[\]]/g, "")) && termoCompleto != ""){ 
            termosOU.push(termoCompleto);
        } else if(item.caractere == '∧' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[\(\)\[\]]/g, "") === termoCompleto.replace(/[\(\)\[\]]/g, "")) && termoCompleto != ""){ 
            termosE.push(termoCompleto);
        } else if(item.caractere == '➝' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[\(\)\[\]]/g, "") === termoCompleto.replace(/[\(\)\[\]]/g, "")) && termoCompleto != ""){ 
            termosImpl.push(termoCompleto);
        } else if(item.caractere == '⟷' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[\(\)\[\]]/g, "") === termoCompleto.replace(/[\(\)\[\]]/g, "")) && termoCompleto != ""){ 
            termosEqui.push(termoCompleto);
        } else if(item.caractere == '⊕' && (termo1 + termo2).length < input.length && !termosEmParenteses.some(t => t.replace(/[\(\)\[\]]/g, "") === termoCompleto.replace(/[\(\)\[\]]/g, "")) && termoCompleto != ""){ 
            termosXOR.push(termoCompleto);
        }
    });

    let index = termosnegativos.indexOf(expressao);
    if (index !== -1) {
        termosnegativos.splice(index, 1);
    }
    index = termosEmParenteses.indexOf(expressao);
    if (index !== -1) {
        termosEmParenteses.splice(index, 1);
    }
    index = termosE.indexOf(expressao);
    if (index !== -1) {
        termosE.splice(index, 1);
    }
    index = termosOU.indexOf(expressao);
    if (index !== -1) {
        termosOU.splice(index, 1);
    }
    index = termosNumericos.indexOf(expressao);
    if (index !== -1) {
        termosNumericos.splice(index, 1);
    }
    index = termosImpl.indexOf(expressao);
    if(index !== -1) {
        termosImpl.splice(index, 1);
    }
    index = termosEqui.indexOf(expressao);
    if(index !== -1) {
        termosEqui.splice(index, 1);
    }
    index = termosXOR.indexOf(expressao);
    if(index !== -1) {
        termosXOR.splice(index, 1);
    }

    termosnegativos.sort((a, b) => a.length - b.length);
    termosEmParenteses.sort((a, b) => a.length - b.length);
    termosE.sort((a, b) => a.length - b.length);
    termosOU.sort((a, b) => a.length - b.length);
    termosImpl.sort((a, b) => a.length - b.length);
    termosEqui.sort((a, b) => a.length - b.length);
    termosXOR.sort((a, b) => a.length - b.length);
    return {
        letras,
        termosnegativos,
        letrasnegativas,
        termosNumericos,
        termosEmParenteses,
        termosE,
        termosOU,
        termosImpl,
        termosEqui,
        termosXOR,
        especiais
    };
}

function rexizar(texto, inicio, fim) {
    return texto.substring(0, inicio) + 
           "x".repeat(fim - inicio) + 
           texto.substring(fim);
}

function encontrarIndiceMaisProximo(indicesNum, indiceDoComparador, pracima) {
    let indiceMaisProximo = null;
    let menorDiferenca = Infinity;

    for (let indice of indicesNum) {
        let diferenca = indice.indice - indiceDoComparador;

        if (pracima) {
            if (diferenca > 0 && diferenca < menorDiferenca) {
                menorDiferenca = diferenca;
                indiceMaisProximo = indice;
            }
        } else {
            if (diferenca < 0 && Math.abs(diferenca) < menorDiferenca) {
                menorDiferenca = Math.abs(diferenca);
                indiceMaisProximo = indice;
            }
        }
    }

    return indiceMaisProximo;
}

function indicesNumeros(str) {
    let indicesNum = [];
    let indicesOp = [];
    let indicesComp = [];
    let resultados = [];
    
    let regexNum = /(?<![\d)])[\(\)\[\]]*-?\d+[\(\)\[\]]*/g;
    let regexOp = /(?<=[\d)])[\^\+\-*/]/g;
    let regexComp = /[=><]+/g;
    
    let match;

    while ((match = regexNum.exec(str)) !== null) {
        indicesNum.push({ 
            indice: match.index, 
            qntDig: match[0].length, 
            digitos: parseInt(match[0].replace(/[\(\)\[\]]/g, "")),
            exp: match[0]
        });
    }

    while ((match = regexOp.exec(str)) !== null) {
        indicesOp.push({ 
            indice: match.index, 
            operador: match[0]
        });
    }

    while ((match = regexComp.exec(str)) !== null) {
        indicesComp.push({ 
            indice: match.index, 
            comparador: match[0]
        });
    }

    return { indicesNum, indicesOp, indicesComp, resultados };
}

function encontrarIndiceAnterior(str, indiceInicial, ignorados = ["x", "~", ")", "]"]) {
    let i = indiceInicial;

    while (i >= 0 && ignorados.includes(str[i])) {
        if(str[i] === ")" || str[i] === "]"){ignorados.push("⊕");ignorados.push("⟷");ignorados.push("➝");ignorados.push("∨");ignorados.push("∧");ignorados.push("(");ignorados.push("[");} 
        if((str[i] === "(" || str[i] === "[") && str[i-1] != "~"){i--; break;}
        if((str[i] === "(" || str[i] === "[") && str[i-1] == "~"){i -= 2; break;}
        i--;
    }
    
    return i;
}
function encontrarIndicePosterior(str, indiceInicial, ignorados = ["x", "~", "(", "["]) {
    let i = indiceInicial;
    
    while (i < str.length && ignorados.includes(str[i])) {
        if(str[i] === "(" || str[i] === "["){ignorados.push("⊕");ignorados.push("⟷");ignorados.push("➝");ignorados.push("∨");ignorados.push("∧");ignorados.push(")");ignorados.push("]");} 
        if(str[i] === ")" || str[i] === "]"){i++; break;} 
        i++;
    }
    
    return i;
}

function substituirPorX(str, listaPalavras) {
    let regex = new RegExp(listaPalavras.map(p => p.replace(/[.*+?^∧➝⊕⟷∨${}()|[\]\\]/g, '\\$&')).join("|"), "g");
    return str.replace(regex, match => "x".repeat(match.length));
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
            let xzdo = "x".repeat(str.length).split("");
            xzdo[i] = str[i];
            xzdo = xzdo.join("");
            indices.push({ caractere: str[i], indice: i, posicao: xzdo, disposicao: true});
        }
    }

    return indices;
}

function pegarParenteses(termoInicial, i, input){
    let contadorParenteses = 1;
    let f = i + 1;

    while (f < input.length && contadorParenteses > 0) {
        termoInicial += input[f];

        if (input[f] === "(" || input[f] === "[") contadorParenteses++;
        if (input[f] === ")" || input[f] === "]") contadorParenteses--;

        f++;
    }

    return termoInicial
}

function criarTabelaDigital(vars, cols, semCombo){
    if(!semCombo){tblDigital = gerarCombinacoes(vars);}
    tblDigital = tblDigital.map(linha => {
        while (linha.length < cols) {
            linha.push(false);
        }
        return linha;
    });

    let rows = vars === 0 ? 0 : (2 ** vars);
    rows = vars === "d" ? 1 : (2 ** vars);

    if(digitos.resultados.length > 0){
        for(let i = 0; i < digitos.resultados.length; i++){
            tblDigital[0][i] = digitos.resultados[i];
        }
    }

    for(let i = 0; i <= rows -1; i++){
        for(let j = 0; j <= cols -1; j++){
            //Negação
            if(variaveis[j].includes("~")){
                let posicao = variaveis[j].indexOf("~");
                if(posicao === 0){
                    let termo = variaveis[j].substring(posicao + 1, posicao + 2);
                    if(termo.includes("(") || termo.includes("[")){
                        termo = pegarParenteses("", 0, variaveis[j]);
                    }
                    
                    if(variaveis.some(t => t.includes(termo)))
                    {
                        let indice = variaveis.findIndex(t => t.includes(termo));
                        tblDigital[i][j] = !tblDigital[i][indice];
                    }
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
                ////console.log(item + " " + resultado  + " " + variavel);
            });
            let indx = resultado.indexOf(resultado.match(/[^x\(\)\[\]~]/g) || []);
            if(indx == 0)indx = -1;
            ////console.log(indx + " " + resultado);
            //∧∨ ぷ
            termo1 = variavel.substring(0,indx);
            termo2 = variavel.substring(indx + 1);

            if ((termo1.includes("(") !== termo1.includes(")")) || (termo1.includes("[") !== termo1.includes("]"))) {
                termo1 = termo1.replace(/[\(\)\[\]]/g, "");
            }if ((termo2.includes("(") !== termo2.includes(")")) || (termo2.includes("[") !== termo2.includes("]"))) {
                termo2 = termo2.replace(/[\(\)\[\]]/g, "");
            }
            //console.log(termo1 + " v " + termo2);
            const OUFora = variavel[indx] == "∨";
            const EFora = variavel[indx] == "∧";
            const ImplFora = variavel[indx] == "➝";
            const EquiFora = variavel[indx] == "⟷";
            const XORFora = variavel[indx] == "⊕";
            if(variaveis.some(t => t.includes(termo1)))
            {
                let indice1 = variaveis.findIndex(t => t.replace(/[\(\)\[\]]/g, "").includes(termo1.replace(/[\(\)\[\]]/g, "")));
                let indice2 = variaveis.findIndex(t => t.replace(/[\(\)\[\]]/g, "").includes(termo2.replace(/[\(\)\[\]]/g, "")));
                if(OUFora){
                    if(tblDigital[i][indice1] || tblDigital[i][indice2])
                    {
                        tblDigital[i][j] = true
                    } else {
                        tblDigital[i][j] = false
                    }
                }
                if(EFora){
                    if(tblDigital[i][indice1] && tblDigital[i][indice2])
                    {
                        tblDigital[i][j] = true
                    } else {
                        tblDigital[i][j] = false
                    }
                }
                if(ImplFora){
                    if(!tblDigital[i][indice1] || tblDigital[i][indice2])
                    {
                        tblDigital[i][j] = true
                    } else {
                        tblDigital[i][j] = false
                    }
                }
                if(EquiFora){
                    if(tblDigital[i][indice1] === tblDigital[i][indice2])
                    {
                        tblDigital[i][j] = true
                    } else {
                        tblDigital[i][j] = false
                    }
                }
                if(XORFora){
                    if(tblDigital[i][indice1] ^ tblDigital[i][indice2])
                    {
                        tblDigital[i][j] = true
                    } else {
                        tblDigital[i][j] = false
                    }
                }
            }
        }
    }

    //console.log(tblDigital);
}

function focarLinha(row){
    document.querySelectorAll(".grid-item").forEach(div => {
        const corFundo = window.getComputedStyle(div).backgroundColor;
        if( div.getAttribute("corPadrao") != div.style.backgroundColor){
            div.style.backgroundColor = div.getAttribute("corPadrao");
        } else if(div.getAttribute("numeroDaLinha") == row){
            div.style.backgroundColor = darkenColor(corFundo, 30);
        } 
    });
}

function darkenColor(rgb, fator) {
    const resultado = rgb.match(/rgb\((\d+), (\d+), (\d+)\)/);
    
    if (!resultado) return rgb;

    let r = parseInt(resultado[1]);
    let g = parseInt(resultado[2]);
    let b = parseInt(resultado[3]);

    r = Math.max(0, r - fator);
    g = Math.max(0, g - fator);
    b = Math.max(0, b - fator);

    return `rgb(${r}, ${g}, ${b})`;
}


function ajustarTabela(vars, cols){
    const gridContainer = document.getElementById("grid-container");
    
    let rows = vars === 0 ? 0 : (2 ** vars);
    rows = vars === "d" ? 1 : (2 ** vars);

    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const esquerda = document.getElementById("esquerda");
    if(vars > 0){
        esquerda.style.width = "40px";
        esquerda.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        for (let i = 1; i <= rows; i++) {
            const cell = document.createElement("div");
            cell.classList.add("grid-item");
            cell.classList.add("itemClicavel");

            cell.addEventListener("click", () => {
                focarLinha(i);
            });

            cell.textContent = "◎";
            cell.setAttribute("corPadrao", cell.style.backgroundColor);
            
            esquerda.appendChild(cell);
        }
    }

    for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= cols; j++) {
            const cell = document.createElement("div");
            cell.classList.add("grid-item");
            cell.setAttribute("numeroDaLinha", i);

            if(tblDigital[i-1][j-1]){
                cell.textContent = "V" ;
                cell.classList.add("grid-item-true");
            } 
            else {
                cell.textContent = "F" ;
                cell.classList.add("grid-item-false");
            }
            cell.setAttribute("corPadrao", cell.style.backgroundColor);
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