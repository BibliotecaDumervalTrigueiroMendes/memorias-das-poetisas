/* ============================================================
   CATALOGO.JS — exibição das obras no Catálogo de Cordéis
   Lê as capas/metadados do acervo (Loja.getObras) e monta as
   fichas com os campos: Autor, Título, Edição, Editora, Local,
   Ano, Tema e Notas. Sem innerHTML para dados.
   ============================================================ */

(function () {
  'use strict';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  function el(tag, classe, texto) {
    var node = document.createElement(tag);
    if (classe) node.className = classe;
    if (texto !== undefined) node.textContent = texto;
    return node;
  }

  function valor(valorCampo) {
    return String(valorCampo || '').trim();
  }

  function valorOuNaoInformado(valorCampo) {
    var v = valor(valorCampo);
    return v || 'Não informado';
  }

  function marcarVazio(node, valorCampo) {
    if (!valor(valorCampo)) node.classList.add('obra-meta__empty');
  }

  function criarCampoDestaque(rotulo, valorCampo, classe) {
    var campo = el('p', 'obra-card__field ' + classe);
    campo.appendChild(el('span', 'obra-card__label', rotulo));
    var conteudo = el('strong', 'obra-card__value', valorOuNaoInformado(valorCampo));
    marcarVazio(conteudo, valorCampo);
    campo.appendChild(conteudo);
    return campo;
  }

  function criarTitulo(valorCampo) {
    var campo = el('h2', 'obra-card__title');
    campo.appendChild(el('span', 'obra-card__label', 'Título'));
    var conteudo = el('span', 'obra-card__title-text', valorOuNaoInformado(valorCampo));
    marcarVazio(conteudo, valorCampo);
    campo.appendChild(conteudo);
    return campo;
  }

  function criarLinhaMeta(rotulo, valorCampo, classeExtra) {
    var linha = el('div', classeExtra || '');
    linha.appendChild(el('dt', '', rotulo));
    var descricao = el('dd', '', valorOuNaoInformado(valorCampo));
    marcarVazio(descricao, valorCampo);
    linha.appendChild(descricao);
    return linha;
  }

  function criarCapa(obra) {
    var figura = el('figure', 'obra-card__cover');
    var img = document.createElement('img');
    img.src = obra.url;
    img.alt = 'Imagem da capa: ' + (valor(obra.title) || 'obra sem título');
    img.loading = 'lazy';

    img.addEventListener('error', function () {
      var aviso = el('div', 'obra-card__placeholder', 'Capa indisponível');
      figura.replaceChild(aviso, img);
    });

    figura.appendChild(img);
    figura.appendChild(el('figcaption', '', 'Imagem da capa'));
    return figura;
  }

  function criarCartao(obra) {
    var card = el('article', 'obra-card');
    card.appendChild(criarCapa(obra));

    var body = el('div', 'obra-card__body');
    body.appendChild(criarCampoDestaque('Autor', obra.author, 'obra-card__field--author'));
    body.appendChild(criarTitulo(obra.title));
    body.appendChild(criarCampoDestaque('Edição', obra.edition, 'obra-card__field--edition'));

    var meta = el('dl', 'obra-meta');
    meta.appendChild(criarLinhaMeta('Editora', obra.publisher));
    meta.appendChild(criarLinhaMeta('Local', obra.place));
    meta.appendChild(criarLinhaMeta('Ano', obra.year));
    meta.appendChild(criarLinhaMeta('Tema', obra.theme, 'obra-meta__full'));
    meta.appendChild(criarLinhaMeta('Notas', obra.notes, 'obra-meta__full'));
    body.appendChild(meta);

    card.appendChild(body);
    return card;
  }

  function initCatalogoObras() {
    var grid = $('[data-obra-grid]');
    if (!grid) return;

    var status = $('[data-obras-status]');
    var vazio = $('[data-obras-empty]');
    var obras = (typeof Loja !== 'undefined' && Loja.getObras) ? Loja.getObras() : [];

    obras = obras
      .filter(function (obra) { return obra && valor(obra.url); })
      .sort(function (a, b) {
        var porAutor = valor(a.author).localeCompare(valor(b.author), 'pt-BR');
        if (porAutor !== 0) return porAutor;
        return valor(a.title).localeCompare(valor(b.title), 'pt-BR');
      });

    grid.textContent = '';

    if (obras.length === 0) {
      grid.hidden = true;
      if (vazio) vazio.hidden = false;
      if (status) status.textContent = 'Nenhuma obra catalogada ainda.';
      return;
    }

    grid.hidden = false;
    if (vazio) vazio.hidden = true;
    if (status) {
      status.textContent = 'Exibindo ' + obras.length +
        (obras.length === 1 ? ' obra catalogada' : ' obras catalogadas');
    }

    obras.forEach(function (obra) {
      grid.appendChild(criarCartao(obra));
    });
  }

  document.addEventListener('DOMContentLoaded', initCatalogoObras);
})();
