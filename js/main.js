/* ============================================
   PORTFOLIO - MAIN JAVASCRIPT
   Animações, cursor, typewriter, scroll reveals
   ============================================ */

// === CURSOR PERSONALIZADO ===
(function initCursor() {
  const cursor     = document.querySelector('.cursor');
  const cursorRing = document.querySelector('.cursor-ring');
  if (!cursor || !cursorRing) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  // === MOUSE (Desktop) ===
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
    cursor.style.opacity = '1';
    cursorRing.style.opacity = '0.6';
  });

  // === TOUCH (Mobile) ===
  document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
    ringX = mouseX;
    ringY = mouseY;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    cursor.style.opacity = '1';
    cursorRing.style.opacity = '0.6';
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
    cursor.style.opacity = '1';
    cursorRing.style.opacity = '0.6';
  }, { passive: true });

  document.addEventListener('touchend', () => {
    setTimeout(() => {
      cursor.style.opacity = '0';
      cursorRing.style.opacity = '0';
    }, 800);
  });

  // Ring segue com lag suave (funciona para mouse e touch)
  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Efeito hover em links e botões
  document.querySelectorAll('a, button, .btn, .project-card, .contact-link-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width  = '20px';
      cursor.style.height = '20px';
      cursorRing.style.width  = '52px';
      cursorRing.style.height = '52px';
      cursorRing.style.opacity = '1';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width  = '12px';
      cursor.style.height = '12px';
      cursorRing.style.width  = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.opacity = '0.6';
    });
  });
})();

// === NAVEGAÇÃO MOBILE ===
(function initNav() {
  const toggle = document.querySelector('.nav__toggle');
  const links  = document.querySelector('.nav__links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  // Fechar menu ao clicar em link
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });
})();

// === BOTTOM NAV PERSISTENTE COM ANIMAÇÃO ===
function initBottomNav() {
  const bottomNav = document.querySelector('.bottom-nav');
  if (!bottomNav) return;

  /* Base fixa da página real (a bottom-nav nunca é substituída pela navegação
     SPA, então seus hrefs são sempre relativos a ESTA base original — mesmo
     depois de vários pushState mudarem window.location) */
  const initialBase = document.baseURI;

  /* Garante que está no body e não dentro do page-wrapper */
  if (bottomNav.parentElement !== document.body) {
    document.body.appendChild(bottomNav);
  }

  /* Remove indicador antigo se existir */
  const oldIndicator = bottomNav.querySelector('.bottom-nav__indicator');
  if (oldIndicator) oldIndicator.remove();

  /* Cria o indicador circular */
  const indicator = document.createElement('div');
  indicator.className = 'bottom-nav__indicator';
  bottomNav.appendChild(indicator);

  const items = Array.from(bottomNav.querySelectorAll('.bottom-nav__item'));
  let currentIndicatorX = 0;

  /* Centraliza o indicador sob o item */
  function moveIndicator(el, animate) {
    const navRect  = bottomNav.getBoundingClientRect();
    const itemRect = el.getBoundingClientRect();
    const centerX  = (itemRect.left - navRect.left) + (itemRect.width / 2) - 29;

    if (animate) {
      indicator.style.setProperty('--indicator-from', `${currentIndicatorX}px`);
      indicator.style.setProperty('--indicator-to', `${centerX}px`);
      indicator.classList.remove('is-moving');
      void indicator.offsetWidth;
      indicator.classList.add('is-moving');
    } else {
      indicator.classList.remove('is-moving');
      indicator.style.setProperty('--indicator-from', `${centerX}px`);
      indicator.style.setProperty('--indicator-to', `${centerX}px`);
    }

    indicator.style.setProperty('--indicator-x', `${centerX}px`);
    currentIndicatorX = centerX;
  }

  /* Posição inicial sem animação (resistente a medições com tamanho zero,
     o que acontece se a barra ainda estiver escondida pela tela de boot) */
  const activeItem = bottomNav.querySelector('.bottom-nav__item.active');
  if (activeItem) {
    let attempts = 0;
    function trySetInitialPosition() {
      const rect = activeItem.getBoundingClientRect();
      if (rect.width === 0 && attempts < 30) {
        attempts += 1;
        requestAnimationFrame(trySetInitialPosition);
        return;
      }
      moveIndicator(activeItem, false);
      requestAnimationFrame(() => {
        indicator.style.transition = 'left 0.55s cubic-bezier(0.34, 1.3, 0.64, 1)';
      });
    }
    requestAnimationFrame(trySetInitialPosition);
  }

  /* Intercepta cliques */
  items.forEach((item) => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      if (!href) return;
      e.preventDefault();

      /* Atualiza ativo e move indicador imediatamente (feedback visual) */
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      requestAnimationFrame(() => moveIndicator(item, true));

      /* Navegação REAL da página (não troca só um pedaço via fetch).
         A troca de conteúdo via fetch+innerHTML causava três bugs sérios:
         imagens ficando com caminho desatualizado, animações de loading
         que nunca reiniciavam, e cliques em cards que paravam de responder
         (porque os scripts da página nova nunca eram executados de novo).
         Uma navegação real corrige tudo isso de uma vez, mantendo a
         transição suave por meio do mesmo overlay usado no resto do site. */
      const resolvedUrl = new URL(href, initialBase).href;
      const overlay = document.querySelector('.page-transition');
      if (overlay) overlay.classList.add('entering');

      setTimeout(() => {
        window.location.href = resolvedUrl;
      }, 380);
    });
  });

  /* Reposiciona ao redimensionar */
  window.addEventListener('resize', () => {
    const active = bottomNav.querySelector('.bottom-nav__item.active');
    if (active) {
      requestAnimationFrame(() => moveIndicator(active, false));
    }
  });
}

/* Chama ao carregar */
initBottomNav();

/* Suporte ao botão voltar */
window.addEventListener('popstate', () => {
  window.location.reload();
});

// === BOOT SCREEN ===
(function initBootScreen() {
  const bootScreen = document.getElementById('boot-screen');
  if (!bootScreen) return;

  const bootBrand = bootScreen.querySelector('.boot-screen__line--brand');
  const logContainer = bootScreen.querySelector('.boot-screen__log');
  const progressLabel = bootScreen.querySelector('.boot-screen__label');
  const progressFill = bootScreen.querySelector('.boot-screen__progress-fill');
  const statusText = bootScreen.querySelector('.boot-screen__status');

  const sessionKey = 'portfolioBootSeen';
  const showBoot = !sessionStorage.getItem(sessionKey);

  if (!showBoot) {
    bootScreen.classList.add('boot-screen-hidden');
    bootScreen.setAttribute('aria-hidden', 'true');
    return;
  }

  document.body.classList.add('is-booting');

  function detectDevice() {
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua)) {
      if (/tablet|ipad/.test(ua)) return 'Tablet';
      return 'Mobile Device';
    }
    return 'Desktop Computer';
  }

  function detectOS() {
    const ua = navigator.userAgent;
    if (/windows nt/i.test(ua)) return 'Windows';
    if (/mac os x/i.test(ua) && !/iphone|ipad|ipod/i.test(ua)) return 'macOS';
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
    if (/linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  }

  function detectBrowser() {
    const ua = navigator.userAgent;

    // Firefox deve ser verificado ANTES do Safari
    // pois no iOS o Firefox inclui "Safari/" no UA por obrigação da Apple
    if (/firefox\//i.test(ua) || /fxios\//i.test(ua)) return 'Firefox';
    if (/edg\//i.test(ua))                             return 'Edge';
    if (/opr\//i.test(ua) || /opera/i.test(ua))        return 'Opera';
    if (/crios\//i.test(ua))                           return 'Google Chrome';
    if (/brave\//i.test(ua))                           return 'Brave';
    if (/chrome\//i.test(ua) && !/edg\//i.test(ua))   return 'Google Chrome';
    if (/safari\//i.test(ua))                          return 'Safari';
    return 'Unknown';
  }

  function detectTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light';
  }

  function detectConnection() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return conn && conn.effectiveType ? conn.effectiveType : 'Unknown';
  }

  function detectMemory() {
    return navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown';
  }

  function detectGPU() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return gl ? 'Enabled' : 'Unavailable';
    } catch (error) {
      return 'Unavailable';
    }
  }

  function typeWriter(el, text, speed = 14) {
    return new Promise(resolve => {
      let idx = 0;
      el.textContent = '';
      const cursor = document.createElement('span');
      cursor.className = 'boot-screen__cursor';
      cursor.setAttribute('aria-hidden', 'true');
      el.appendChild(cursor);

      let last = performance.now();
      function step(now) {
        if (idx < text.length && now - last >= speed) {
          el.textContent = text.slice(0, idx + 1);
          el.appendChild(cursor);
          idx += 1;
          last = now;
        }
        if (idx < text.length) {
          requestAnimationFrame(step);
        } else {
          cursor.remove();
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  function animateProgress(label, fill, status) {
    return new Promise(resolve => {
      const duration = 850;
      const start = performance.now();
      label.textContent = 'Running Environment Validation...';
      status.style.opacity = '1';
      status.textContent = '';

      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        fill.style.width = `${Math.round(progress * 100)}%`;
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          status.textContent = '✔ All Systems Identified';
          setTimeout(() => {
            status.textContent += ' • ✔ Environment Compatible';
            setTimeout(() => {
              status.textContent += ' • ✔ Performance Optimized';
              setTimeout(() => {
                status.textContent += ' • ✔ Secure Session Created';
                setTimeout(resolve, 100);
              }, 100);
            }, 100);
          }, 100);
        }
      }
      requestAnimationFrame(frame);
    });
  }

  async function runBootSequence() {
    const lines = [
      '[ Portfolio OS v3.1 ]',
      'Initializing Session...',
      'Analyzing Client Environment...'
    ];

    bootBrand.classList.add('boot-screen__line');
    for (const line of lines) {
      const lineEl = document.createElement('div');
      lineEl.className = 'boot-screen__log-line boot-screen__log-line--status';
      logContainer.appendChild(lineEl);
      await typeWriter(lineEl, line, 12);
      await new Promise(r => setTimeout(r, 40));
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const infoItems = [
      { label: 'Device', value: detectDevice() },
      { label: 'Operating System', value: detectOS() },
      { label: 'Browser', value: detectBrowser() },
      { label: 'Language', value: navigator.language || 'Unknown' },
      { label: 'Resolution', value: `${window.innerWidth} x ${window.innerHeight}` }
    ];

    if (!isMobile) {
      infoItems.splice(4, 0, { label: 'CPU Cores', value: navigator.hardwareConcurrency || 'Unknown' });
      infoItems.splice(5, 0, { label: 'Memory', value: detectMemory() });
    }

    for (const item of infoItems) {
      const lineEl = document.createElement('div');
      lineEl.className = 'boot-screen__log-line';
      logContainer.appendChild(lineEl);
      await typeWriter(lineEl, `✔ ${item.label}: ${item.value}`, 10);
      await new Promise(r => setTimeout(r, 40));
    }

    await animateProgress(progressLabel, progressFill, statusText);
    await new Promise(r => setTimeout(r, 80));
    statusText.textContent = 'ACCESS GRANTED';
    statusText.style.opacity = '1';
    await new Promise(r => setTimeout(r, 80));
    const loadingEl = document.createElement('div');
    loadingEl.className = 'boot-screen__log-line boot-screen__log-line--status';
    logContainer.appendChild(loadingEl);
    await typeWriter(loadingEl, 'Loading Portfolio...', 18);
    await new Promise(r => setTimeout(r, 300));

    bootScreen.classList.add('boot-screen-hidden');
    document.body.classList.remove('is-booting');
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    setTimeout(() => {
      bootScreen.setAttribute('aria-hidden', 'true');
      sessionStorage.setItem(sessionKey, 'true');
    }, 320);
  }

  runBootSequence();
})();

// === LINK ATIVO NA NAV === 
(function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Remove cor ativa do logo por padrão
  const logo = document.querySelector('.nav__logo');

  // Ativa links do menu desktop
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Ativa atalhos mobile e controla cor do logo
  const isHome = currentPage === 'index.html' || currentPage === '';
  const isProjetos = currentPage === 'projetos.html';
  const isContato = currentPage === 'contato.html';

  if (logo) {
    // Logo só fica verde na Home
    logo.style.color = isHome ? '#00ff88' : '#aaaaaa';
  }

  document.querySelectorAll('.nav__shortcut').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === currentPage) {
      a.classList.add('active');
      a.style.color = '#00ff88';
    } else {
      a.style.color = '#aaaaaa';
    }
  });
})();

// === TRANSIÇÃO ENTRE PÁGINAS ===
(function initPageTransitions() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Animação de entrada (página carregou)
  setTimeout(() => {
    overlay.classList.add('leaving');
    setTimeout(() => overlay.classList.remove('leaving'), 500);
  }, 50);

  // Animação de saída ao navegar
  // (itens da .bottom-nav são ignorados aqui: eles já têm seu próprio
  // sistema de navegação/transição em initBottomNav, e ter os dois juntos
  // causava uma corrida entre pushState e navegação real, quebrando links)
  document.querySelectorAll('a[href]').forEach(a => {
    if (a.closest('.bottom-nav')) return;

    const href = a.getAttribute('href');
    // Só páginas internas (não âncoras, não externas)
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    a.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.add('entering');
      setTimeout(() => {
        window.location.href = href;
      }, 480);
    });
  });
})();

// === SCROLL REVEAL ===
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.project-card)');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  els.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setTimeout(() => el.classList.add('visible'), 100);
    } else {
      observer.observe(el);
    }
  });
})();

// === PROJECT LOADING ===
(function initializeProjectLoading() {
  const loadingMessage = 'Accessing Project Database...';
  const cards = Array.from(document.querySelectorAll('.project-card'));
  if (!cards.length) return;

  cards.forEach(card => {
    if (!card.classList.contains('project-card--hidden')) {
      card.classList.add('project-card--hidden');
    }
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      if (card.dataset.projectLoadingStarted) return;

      card.dataset.projectLoadingStarted = 'true';
      obs.unobserve(card);

      const terminal = getOrCreateLoadingTerminal(card);
      runProjectLoadingSequence(terminal, card);
    });
  }, { threshold: 0.35 });

  cards.forEach(card => observer.observe(card));

  function getOrCreateLoadingTerminal(card) {
    const previous = card.previousElementSibling;
    if (previous?.classList.contains('preview-terminal')) {
      return previous;
    }

    const wrapper = ensureProjectPreviewBlock(card);
    let terminal = wrapper.querySelector('.preview-terminal');
    if (terminal) return terminal;

    terminal = createLoadingTerminal();
    wrapper.insertBefore(terminal, card);
    return terminal;
  }

  function ensureProjectPreviewBlock(card) {
    const parent = card.parentElement;
    if (parent?.classList.contains('project-preview-block')) return parent;

    const wrapper = document.createElement('div');
    wrapper.className = 'project-preview-block';
    parent.insertBefore(wrapper, card);
    wrapper.appendChild(card);
    return wrapper;
  }

  function createLoadingTerminal() {
    const terminal = document.createElement('div');
    terminal.className = 'preview-terminal';
    terminal.innerHTML = `
      <div class="preview-terminal__bar">
        <span class="terminal__dot terminal__dot--red"></span>
        <span class="terminal__dot terminal__dot--yellow"></span>
        <span class="terminal__dot terminal__dot--green"></span>
        <span class="terminal__title">system — loading</span>
      </div>
      <div class="preview-terminal__body">
        <div class="preview-terminal__line">
          <span class="preview-terminal__text"></span>
          <span class="preview-terminal__cursor" aria-hidden="true"></span>
        </div>
        <div class="preview-terminal__progress">
          <span class="preview-terminal__fill"></span>
        </div>
        <div class="preview-terminal__status"></div>
      </div>
    `;
    return terminal;
  }

  async function runProjectLoadingSequence(terminal, card) {
    const textEl = terminal.querySelector('.preview-terminal__text');
    const cursor = terminal.querySelector('.preview-terminal__cursor');
    const fill = terminal.querySelector('.preview-terminal__fill');
    const status = terminal.querySelector('.preview-terminal__status');

    await typeMessage(textEl, cursor, loadingMessage);
    await animateProgressBar(fill, status);

    status.textContent = '[ OK ]';
    status.style.opacity = '1';
    await delay(450);

    terminal.classList.add('preview-terminal--done');
    showProjectCard(card);
  }

  function typeMessage(element, cursor, message) {
    return new Promise(resolve => {
      let index = 0;
      element.textContent = '';
      if (cursor) cursor.style.opacity = '1';

      function nextChar() {
        if (index < message.length) {
          element.textContent += message[index++];
          setTimeout(nextChar, 40);
        } else {
          if (cursor) cursor.style.opacity = '0';
          setTimeout(resolve, 120);
        }
      }

      nextChar();
    });
  }

  function animateProgressBar(fill, status) {
    return new Promise(resolve => {
      const duration = 900;
      const start = performance.now();

      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        fill.style.transform = `scaleX(${progress})`;
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      }

      requestAnimationFrame(frame);
    });
  }

  function showProjectCard(card) {
    card.classList.remove('project-card--hidden');
    card.classList.add('project-card--visible');
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
})();

// === PROJECT CARD NAVIGATION ===
(function initProjectCardNavigation() {
  // Delegação de evento no document: funciona tanto para os cards que já
  // existem na página quanto para os cards criados depois via JS (ex: a
  // seção "Outros Projetos" em project.html, montada dinamicamente).
  const pathPrefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';

  document.addEventListener('click', (event) => {
    const card = event.target.closest('.project-card[data-project]');
    if (!card) return;

    const clickedLink = event.target.closest('a');
    if (clickedLink && clickedLink.classList.contains('project-link-btn')) {
      return;
    }

    const linkContainer = event.target.closest('.project-card__links');
    if (linkContainer) {
      const link = event.target.closest('a');
      if (link) return;
    }

    const projectId = card.dataset.project;
    if (!projectId) return;

    window.location.href = `${pathPrefix}project.html?project=${encodeURIComponent(projectId)}`;
  });
})();

/* ===================================================
   PROJECT DATA
   =================================================== */
const projects = {
  yolov3playerdetector: {
    id: 'yolov3playerdetector',
    title: 'YOLOv3 Player Detector',
    category: 'Software',
    subtitle: 'Detecção de objetos em tempo real com YOLOv3 Tiny e OpenCV DNN',
    about: 'Sistema de detecção de objetos em tempo real desenvolvido em C++, combinando captura de tela via Windows GDI com inferência de uma rede neural baseada no modelo YOLOv3 Tiny através do módulo OpenCV DNN. O pipeline captura continuamente uma região configurável da tela usando funções nativas do Windows (BitBlt e GetDIBits), converte os pixels diretamente para uma estrutura cv::Mat do OpenCV e realiza o pré-processamento do frame com blobFromImage, normalizando a escala e ajustando a resolução de entrada para 320x320 pixels antes de alimentar a rede neural. A inferência é executada com os arquivos de configuração e pesos do YOLOv3 Tiny, e o pós-processamento aplica filtragem por confiança seguida de Non-Maximum Suppression (NMS) para eliminar detecções redundantes antes de desenhar as bounding boxes e exibir o nível de confiança de cada objeto identificado. Um dos pontos centrais do projeto é a seleção automática de backend de processamento: o sistema testa e prioriza CUDA, depois OpenCL, com fallback automático para CPU caso nenhuma aceleração via GPU esteja disponível, garantindo compatibilidade em diferentes configurações de hardware. O projeto também inclui um contador de FPS em tempo real para acompanhar o desempenho da inferência durante a execução, e foi estruturado em módulos independentes (captura de tela, detecção e definições de configuração) para manter o código organizado e de fácil manutenção.',
    features: [
      { icon: '🎥', text: 'Captura de tela em tempo real via Windows GDI.' },
      { icon: '🧠', text: 'Inferência com YOLOv3 Tiny usando OpenCV DNN.' },
      { icon: '📦', text: 'Renderização de bounding boxes com nível de confiança.' },
      { icon: '⚙️', text: 'Filtro de confiança e Non-Maximum Suppression (NMS).' },
      { icon: '🚀', text: 'Seleção automática de backend: CUDA, OpenCL ou CPU.' },
      { icon: '📈', text: 'Contador de FPS em tempo real durante a inferência.' }
    ],
    architectureImage: 'thumb.webp',
    previewVideo: 'preview.mp4',
    thumbnail: 'thumb.webp',
    github: 'https://github.com/nolonlucas/yolov3-player-detector',
    demo: '#',
    status: 'Concluído',
    year: '2025',
    role: 'Desenvolvedor',
    techs: ['C++', 'OpenCV', 'YOLOv3', 'CUDA']
  },
  farmaciatech: {
    id: 'farmaciatech',
    title: 'FarmáciaTech',
    category: 'Website',
    subtitle: 'E-commerce ilustrativo de farmácia, com catálogo, carrinho e checkout simulado.',
    about: 'FarmáciaTech é um projeto front-end ilustrativo (HTML, CSS e JavaScript puro, sem frameworks) que simula uma farmácia online completa para fins de portfólio — não processa pagamentos reais nem vende produtos de verdade. O catálogo conta com busca com autocomplete (sugestão de termos e produtos em tempo real), filtros por categoria e cards com fallback automático de imagem. O carrinho e o login de usuário são persistidos em sessionStorage, então os dados somem ao fechar o navegador, por design. O checkout simula um fluxo real em 3 etapas — endereço, pagamento (cartão, Pix com desconto ou boleto) e confirmação — sem nenhuma integração com gateway de pagamento. O projeto também inclui um painel administrativo de estoque, com cards de indicadores, tabela filtrável por nome e um log de operações em tempo real ao ajustar quantidades.',
    features: [
      { icon: '🔍', text: 'Busca com autocomplete e sugestões de termos/produtos em tempo real.' },
      { icon: '🛒', text: 'Carrinho persistido em sessionStorage, com cálculo automático de frete.' },
      { icon: '💳', text: 'Checkout simulado em 3 etapas: cartão, Pix com desconto e boleto.' },
      { icon: '📊', text: 'Painel administrativo de estoque com log de operações ao vivo.' },
      { icon: '👤', text: 'Cadastro e login simulados, com validação completa de formulário.' },
      { icon: '🖼️', text: 'Fallback automático para emoji quando a imagem do produto falha.' }
    ],
    architectureImage: 'thumb.webp',
    previewVideo: 'preview.mp4',
    thumbnail: 'thumb.webp',
    github: 'https://farmacia-site-tau.vercel.app',
    demo: '#',
    status: 'Não finalizado',
    year: '2025',
    role: 'Desenvolvedor Front-End',
    techs: ['HTML5', 'CSS3', 'JavaScript', 'sessionStorage']
  },
  clothingstore: {
    id: 'clothingstore',
    title: 'Clothing Store',
    category: 'Website',
    subtitle: 'E-commerce de moda ilustrativo, com catálogo, carrinho e animações premium.',
    about: 'Clothing Store é um projeto front-end ilustrativo (HTML, CSS e JavaScript puro) que simula o e-commerce de uma marca de moda feminina — não vende produtos reais nem processa pagamentos. O catálogo é organizado por categorias (roupas, acessórios, linha sustentável, novidades e promoções) e cada card de produto troca automaticamente para uma foto secundária ao passar o mouse no desktop ou deslizar o dedo no mobile. O carrinho e a lista de desejos são persistidos em sessionStorage, com atualização em tempo real do contador e do total. As páginas contam com filtros por tag, uma faixa de destaques em looping (marquee) e formulário de newsletter. Toda a experiência é conduzida por animações refinadas com GSAP e ScrollTrigger — revelação de elementos no scroll com stagger orgânico, header que reage ao scroll e transições suaves entre páginas — além de rolagem suave via Lenis e feedback de toque dedicado para os cards de categoria no mobile.',
    features: [
      { icon: '🛍️', text: 'Catálogo de produtos por categoria, com filtros por tag.' },
      { icon: '🖼️', text: 'Card com troca de foto no hover (desktop) e swipe (mobile).' },
      { icon: '🛒', text: 'Carrinho e wishlist persistidos em sessionStorage.' },
      { icon: '✨', text: 'Animações de scroll com GSAP/ScrollTrigger e stagger orgânico.' },
      { icon: '🌀', text: 'Rolagem suave via Lenis e transições animadas entre páginas.' },
      { icon: '📱', text: 'Feedback de toque customizado nos cards de categoria (mobile).' }
    ],
    architectureImage: 'thumb.webp',
    previewVideo: 'preview.mp4',
    thumbnail: 'thumb.webp',
    github: 'https://clothing-store-sand-gamma.vercel.app',
    demo: '#',
    status: 'Não finalizado',
    year: '2026',
    role: 'Desenvolvedor Front-End',
    techs: ['HTML5', 'CSS3', 'JavaScript', 'GSAP', 'Lenis']
  },
  gifdisplaycontroller: {
    id: 'gifdisplaycontroller',
    title: 'GIF Display Controller',
    category: 'Software',
    subtitle: 'App desktop para controlar uma tela secundária USB e exibir GIFs animados.',
    about: 'Aplicativo desktop em Python para controlar uma Turing Smart Screen — display USB secundário comum em gabinetes de PC — via comunicação serial. O app converte GIFs animados quadro a quadro para o formato RGB565 esperado pela tela, usando NumPy para a conversão de cor e Pillow para aplicar transformações como zoom, deslocamento (offset) e rotação, com auto-rotação e centralização automática no canvas de 320x480. Os frames processados são enviados em chunks por uma porta serial (PySerial) através de uma thread dedicada de playback, com controles de play/pause/stop em tempo real. A interface, construída com CustomTkinter sobre um tema escuro customizado, conta com pré-visualização ao vivo do GIF já transformado antes do envio para a tela física, ícone na bandeja do sistema via pystray, opção de iniciar minimizado e autostart com o Windows através do registro, além de configurações persistidas em JSON (porta, baud rate, offset, zoom e rotação).',
    features: [
      { icon: '🖥️', text: 'Controle de tela secundária USB via comunicação serial.' },
      { icon: '🎞️', text: 'Conversão de GIFs animados para o formato RGB565 quadro a quadro.' },
      { icon: '🔧', text: 'Ajuste de zoom, offset e rotação com centralização automática.' },
      { icon: '👁️', text: 'Pré-visualização em tempo real antes do envio para a tela.' },
      { icon: '🧵', text: 'Playback em thread dedicada com play, pause e stop.' },
      { icon: '🚀', text: 'Autostart no Windows e ícone na bandeja do sistema.' }
    ],
    architectureImage: 'thumb.webp',
    previewVideo: 'preview.mp4',
    thumbnail: 'thumb.webp',
    github: 'https://github.com/nolonlucas/GIFS-in-3.5-Inch-IPS-USB-Scren',
    demo: '#',
    status: 'Concluído',
    year: '2024',
    role: 'Desenvolvedor Desktop',
    techs: ['Python', 'CustomTkinter', 'Pillow', 'NumPy', 'PySerial']
  },
  forzapackagepatcher: {
    id: 'forzapackagepatcher',
    title: 'Forza Package Patcher',
    category: 'Software',
    subtitle: 'Ferramentas desktop para customização de assets em jogos da franquia Forza',
    about: 'Conjunto de ferramentas desktop em Python para substituição de assets visuais (modelos, texturas e presets de iluminação) em arquivos de jogos da franquia Forza, criado durante um projeto pessoal de modding. O desafio central foi lidar com o formato de empacotamento interno do jogo, que exige integridade estrutural rígida — qualquer ferramenta convencional de compactação corrompe esses arquivos. Para isso, foram implementadas rotinas próprias de leitura e escrita binária, validação por checksum, otimização de compressão e backup automático, com interface gráfica feita em tkinter.',
    features: [
      { icon: '🧩', text: 'Leitura e escrita de estruturas binárias customizadas.' },
      { icon: '🔍', text: 'Validação de integridade dos arquivos via checksum (CRC-32).' },
      { icon: '📦', text: 'Otimização automática de compressão testando múltiplas configurações.' },
      { icon: '💾', text: 'Sistema de backup e restauração com um clique.' },
      { icon: '🖥️', text: 'Interface gráfica desktop construída com tkinter.' },
      { icon: '🛠️', text: 'Ferramentas independentes, sem dependências externas.' }
    ],
    architectureImage: 'thumb.webp',
    previewVideo: 'preview.mp4',
    thumbnail: 'thumb.webp',
    github: 'https://github.com/nolonlucas/forza-package-patcher',
    demo: '#',
    status: 'Concluído',
    year: '2025',
    role: 'Desenvolvedor',
    techs: ['Python', 'Tkinter', 'Zlib', 'Struct']
  },
  aiproofbot: {
    id: 'aiproofbot',
    title: 'AI Proof Bot',
    category: 'Software',
    subtitle: 'App desktop com IA local que lê e responde questões automaticamente.',
    about: 'AI Proof Bot é uma aplicação desktop que automatiza a resolução de questões em páginas web usando IA local, sem depender de APIs pagas ou conexão com serviços de terceiros. O sistema abre o navegador através de um perfil persistente — mantendo login e cookies salvos entre execuções —, lê o enunciado e as alternativas da questão atual e envia o conteúdo para um modelo de linguagem rodando localmente via Ollama (qwen2.5:7b), que analisa e retorna a alternativa correta para ser marcada automaticamente na página. Já vem com reconhecimento pronto para plataforma como arealme.com, em breve estará disponível para outras plataformas, o software conta com um modo de configuração manual que aprende os seletores de qualquer novo site, salvando o perfil para uso futuro. O modelo de IA é facilmente substituível por versões maiores (ex: qwen2.5:14b) para ganhar precisão em questões mais complexas.',
    features: [
      { icon: '🤖', text: 'Leitura e análise de questões com IA local rodando via Ollama (modelo Qwen2.5).' },
      { icon: '🖱️', text: 'Marcação automática da alternativa correta na própria página da prova.' },
      { icon: '🌐', text: 'Navegador com perfil persistente, mantendo login e cookies entre sessões.' },
      { icon: '⚙️', text: 'Configuração de novos sites por seletor, com perfis salvos automaticamente.' },
      { icon: '🎯', text: 'Reconhecimento pronto para arealme.com e Unicesumar, com detecção automática para outros sites.' },
      { icon: '🔄', text: 'Modelo de IA configurável — troca simples para versões maiores quando mais precisão é necessária.' }
    ],
    architectureImage: 'thumb.webp',
    previewVideo: 'preview.mp4',
    thumbnail: 'thumb.webp',
    github: 'https://github.com/nolonlucas/bot-provas-ia',
    demo: '#',
    status: 'Concluído',
    year: '2025',
    role: 'Desenvolvedor Full Stack',
    techs: ['Python', 'Ollama', 'Qwen2.5', 'Web Automation']
  },
  aivideodubber: {
    id: 'aivideodubber',
    title: 'AI Video Dubber',
    category: 'Software',
    subtitle: 'App desktop que baixa, transcreve, traduz e dubla vídeos automaticamente com IA.',
    about: 'AI Video Dubber é uma aplicação desktop (Flask + pywebview) que recebe um link de vídeo, baixa o conteúdo, transcreve a fala com IA local, traduz o roteiro e gera uma narração dublada sincronizada ao tempo original, exportando o vídeo final pronto em poucos cliques. O pipeline trata problemas comuns de dublagem automática, como queda de volume em mixagens longas e deriva de sincronia entre segmentos, processando tudo em etapas com progresso em tempo real na interface.',
    features: [
      { icon: '⬇️', text: 'Download do vídeo via yt-dlp e extração de áudio com FFmpeg.' },
      { icon: '🎙️', text: 'Transcrição local da fala com faster-whisper, sem depender de APIs pagas.' },
      { icon: '🌐', text: 'Tradução automática do roteiro em lotes, com fallback segmento a segmento.' },
      { icon: '🗣️', text: 'Narração com vozes neurais (Edge TTS) e geração paralela dos segmentos de áudio.' },
      { icon: '⏱️', text: 'Sincronia inteligente com correção de deriva entre trechos, ajustando velocidade sem estourar o tempo do vídeo.' },
      { icon: '🎚️', text: 'Mixagem em memória com pydub (overlay real de amostras), evitando perda de volume em vídeos longos.' }
    ],
    architectureImage: 'thumb.webp',
    previewVideo: 'preview.mp4',
    thumbnail: 'thumb.webp',
    github: 'https://github.com/nolonlucas/ai-video-dubber',
    demo: '#',
    status: 'Concluído',
    year: '2024',
    role: 'Desenvolvedor Software',
    techs: ['Python', 'Flask', 'Pywebview', 'Faster-Whisper', 'Edge TTS', 'FFmpeg']
  },
  instagramautocommentbot: {
    id: 'instagramautocommentbot',
    title: 'Instagram Auto Comment Bot',
    category: 'Software',
    subtitle: 'App desktop que automatiza comentários marcando seguidores no Instagram.',
    about: 'Instagram Auto Comment Bot é uma aplicação desktop (PyQt6) que automatiza o engajamento em publicações do Instagram. A partir de um Session ID, o bot autentica na conta via instagrapi, busca a lista de seguidores, embaralha os usuários e gera comentários marcando pares de @perfis automaticamente, simulando digitação real através de automação de teclado e área de transferência, com intervalos aleatórios entre ações. Toda a execução é acompanhada em tempo real por um painel com status, contador de eventos e log de atividade. O projeto inclui ainda um sistema licenciamento por chave temporária (assinada com HMAC-SHA256), com um gerador de keys separado para liberar acesso a clientes por tempo determinado.',
    features: [
      { icon: '🔑', text: 'Login automatizado via Session ID usando a biblioteca instagrapi.' },
      { icon: '👥', text: 'Coleta e embaralhamento da lista de seguidores para gerar marcações variadas.' },
      { icon: '⌨️', text: 'Comentários automáticos simulados via clipboard + automação de teclado.' },
      { icon: '⏱️', text: 'Delays aleatórios entre ações para imitar comportamento humano.' },
      { icon: '📊', text: 'Painel com status em tempo real, contador de eventos e log de atividade.' },
      { icon: '🔐', text: 'Sistema de licenciamento por key temporária assinada com HMAC-SHA256, com gerador de keys próprio.' }
    ],
    architectureImage: 'thumb.webp',
    previewVideo: 'preview.mp4',
    thumbnail: 'thumb.webp',
    github: 'https://github.com/nolonlucas/bot_instagram_auto',
    demo: '#',
    status: 'Concluído',
    year: '2024',
    role: 'Desenvolvedor Software',
    techs: ['Python', 'PyQt6', 'Instagrapi', 'HMAC']
  }
};

function configurePlayableVideo(video) {
  if (!video) return;
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.preload = 'metadata';
  video.removeAttribute('controls');
}

function safePlayVideo(video) {
  if (!video) return;
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {});
  }
}

function initProjectHeroVideo(video, project) {
  if (!video || !project) return;
  configurePlayableVideo(video);

  video.querySelectorAll('source').forEach(source => source.remove());
  video.removeAttribute('src');
  video.src = `../Assets/projects/${project.id}/${project.previewVideo}`;
  video.currentTime = 0;

  const attemptPlay = () => safePlayVideo(video);
  const onReady = () => {
    attemptPlay();
  };

  video.addEventListener('loadedmetadata', onReady, { once: true });
  video.addEventListener('canplay', onReady, { once: true });
  video.addEventListener('error', onReady, { once: true });

  video.load();

  if (video.readyState >= 3) {
    attemptPlay();
    return;
  }

  setTimeout(attemptPlay, 1200);
}

function initProjectPage() {
  const projectDetailContent = document.getElementById('project-detail-content');
  if (!projectDetailContent) return;

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('project');
  const project = projectId ? projects[projectId] : null;
  const notFound = document.getElementById('project-not-found');

  if (!project) {
    if (projectDetailContent) projectDetailContent.style.display = 'none';
    if (notFound) notFound.style.display = 'grid';
    return;
  }

  if (projectDetailContent) projectDetailContent.style.display = 'block';
  if (notFound) notFound.style.display = 'none';

  document.title = `${project.title} — [ Portfolio ]`;

  const video = document.getElementById('project-hero-video');
  const projectTitle = document.getElementById('project-title');
  const projectSubtitle = document.getElementById('project-subtitle');
  const projectMeta = document.getElementById('project-meta');
  const projectTechs = document.getElementById('project-techs');
  const projectFeatures = document.getElementById('project-features');
  const projectAbout = document.getElementById('project-about');
  const projectArchitecture = document.getElementById('project-architecture-image');
  const githubLink = document.getElementById('project-github');
  const previousButton = document.getElementById('project-previous');
  const nextButton = document.getElementById('project-next');
  const otherGrid = document.getElementById('other-projects-grid');

  if (projectTitle) projectTitle.textContent = project.title;
  if (projectSubtitle) projectSubtitle.textContent = project.subtitle;
  if (projectAbout) projectAbout.textContent = project.about;
  if (projectMeta) {
    projectMeta.innerHTML = `
      <span class="project-detail__meta-pill">${project.category}</span>
      <span class="project-detail__meta-pill">${project.status}</span>
      <span class="project-detail__meta-pill">${project.year}</span>
      <span class="project-detail__meta-pill">${project.role}</span>
    `;
  }
  if (projectTechs) {
    projectTechs.innerHTML = project.techs.map(tech => `<span class="tech-pill">${tech}</span>`).join('');
  }
  if (projectFeatures) {
    projectFeatures.innerHTML = project.features.map(feature => `
      <div class="project-detail__feature-card">
        <span class="project-detail__feature-icon">${feature.icon}</span>
        <p>${feature.text}</p>
      </div>
    `).join('');
  }
  if (projectArchitecture) {
    projectArchitecture.src = `../Assets/projects/${project.id}/${project.architectureImage}`;
    projectArchitecture.alt = `Arquitetura do projeto ${project.title}`;
  }
  if (githubLink) {
    githubLink.href = project.github || '#';
    const isWebsite = project.category === 'Website';
    githubLink.textContent = isWebsite ? 'Visitar Website' : 'GitHub';
    githubLink.setAttribute('aria-label', isWebsite ? 'Visitar Website' : 'GitHub');
  }

  if (video) {
    initProjectHeroVideo(video, project);
  }

  const ids = Object.keys(projects);
  const currentIndex = ids.indexOf(project.id);
  const previousProject = projects[ids[(currentIndex - 1 + ids.length) % ids.length]];
  const nextProject = projects[ids[(currentIndex + 1) % ids.length]];

  if (previousButton) {
    previousButton.href = `project.html?project=${encodeURIComponent(previousProject.id)}`;
  }
  if (nextButton) {
    nextButton.href = `project.html?project=${encodeURIComponent(nextProject.id)}`;
  }

  if (otherGrid) {
    const otherProjects = ids.filter(id => id !== project.id).slice(0, 3).map(id => projects[id]);
    otherGrid.innerHTML = otherProjects.map(other => {
      const categoryTag = other.category.toUpperCase();
      const techList = other.techs.map(tech => `<span class="tech-pill">${tech}</span>`).join('');
      return `
        <article class="project-card reveal" data-project="${other.id}" data-category="${other.category.toLowerCase().replace(/\s+/g, '')}">
          <div class="project-card__preview">
            <div class="project-card__media">
              <img class="project-thumb" src="../Assets/projects/${other.id}/${other.thumbnail}" alt="Thumbnail do projeto ${other.title}" loading="lazy">
              <video class="project-video" preload="metadata" muted playsinline loop>
                <source src="../Assets/projects/${other.id}/${other.previewVideo}" type="video/mp4">
              </video>
            </div>
          </div>
          <div class="project-card__body">
            <span class="project-card__tag">${categoryTag}</span>
            <h2 class="project-card__title">${other.title}</h2>
            <p class="project-card__desc">${other.subtitle}</p>
            <div class="project-card__techs">${techList}</div>
          </div>
          <div class="project-card__links">
            <a href="${other.github || '#'}" class="project-link-btn" target="_blank" rel="noopener" aria-label="${other.category === 'Website' ? 'Visitar Website' : 'Ver código'}" title="${other.category === 'Website' ? 'Visitar Website' : 'GitHub'}">${other.category === 'Website' ? '↗' : '⌥'}</a>
          </div>
        </article>
      `;
    }).join('');
  }
}

initProjectPage();

// === TYPEWRITER EFFECT ===
function typeWriter(el, texts, speed = 80, pause = 2000) {
  if (!el) return;
  let textIdx  = 0;
  let charIdx  = 0;
  let deleting = false;

  function tick() {
    const current = texts[textIdx];

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, pause);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        textIdx  = (textIdx + 1) % texts.length;
      }
    }
    setTimeout(tick, deleting ? speed / 2 : speed);
  }
  tick();
}

// === HERO ANIMATIONS (index.html) ===
(function initHero() {
  const eyebrow = document.querySelector('.hero__eyebrow');
  const title   = document.querySelector('.hero__title');
  const desc    = document.querySelector('.hero__desc');
  const buttons = document.querySelector('.hero__buttons');
  const terminal= document.querySelector('.hero__terminal');
  const typeEl  = document.querySelector('.hero__subtitle .type-text');

  // Staggered entrance
  const items = [eyebrow, title, desc, buttons].filter(Boolean);
  items.forEach((el, i) => {
    if (!el) return;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(28px)';
    setTimeout(() => {
      el.style.transition = '0.8s cubic-bezier(0.19,1,0.22,1)';
      el.style.opacity    = '1';
      el.style.transform  = 'translateY(0)';
    }, 200 + i * 120);
  });

  // Animação de entrada dos cards de projeto com delay progressivo
  const projectCards = document.querySelectorAll('.project-card');
  if (projectCards.length) {
    projectCards.forEach((card, i) => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(40px)';
      card.style.transition = 'none';
      setTimeout(() => {
        card.style.transition = '0.8s cubic-bezier(0.19,1,0.22,1)';
        card.style.opacity    = '1';
        card.style.transform  = 'translateY(0)';
      }, 400 + i * 180);
    });
  }

  if (terminal) {
    setTimeout(() => {
      terminal.style.transition = '0.8s cubic-bezier(0.19,1,0.22,1)';
      terminal.style.opacity    = '1';
      terminal.style.transform  = 'translateY(0)';
    }, 900);
  }

  if (typeEl) {
    setTimeout(() => {
      typeWriter(typeEl, [
        'Software Engineering Student_',
        'Reverse Engineering Enthusiast_',
        'Automation & AI Developer_',
        'Building Smart Solutions_'
      ]);
    }, 600);
  }
})();

// === GLITCH HOVER ===
(function initGlitch() {
  document.querySelectorAll('.glitch').forEach(el => {
    el.setAttribute('data-text', el.textContent);
  });
})();

// === CONTAGEM ANIMADA (sobre.html) ===
function animateCounter(el, target, duration = 1500) {
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    // easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = Math.floor(eased * target) + (el.dataset.suffix || '+');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

(function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target, parseInt(e.target.dataset.counter));
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

// === VALIDAÇÃO DO FORMULÁRIO (contato.html) ===
(function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name:    { el: form.querySelector('#name'),    rule: v => v.trim().length >= 2,             msg: 'Nome deve ter ao menos 2 caracteres.' },
    email:   { el: form.querySelector('#email'),   rule: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Insira um e-mail válido.' },
    subject: { el: form.querySelector('#subject'), rule: v => v.trim().length >= 3,             msg: 'Assunto deve ter ao menos 3 caracteres.' },
    message: { el: form.querySelector('#message'), rule: v => v.trim().length >= 10,            msg: 'Mensagem deve ter ao menos 10 caracteres.' }
  };

  // Validação em tempo real
  Object.values(fields).forEach(({ el, rule }) => {
    if (!el) return;
    el.addEventListener('blur', () => validateField(el, rule));
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) validateField(el, rule);
    });
  });

  function validateField(el, rule) {
    const errEl = document.getElementById(el.id + '-error');
    const fieldConf = Object.values(fields).find(f => f.el === el);
    const valid = rule(el.value);
    el.classList.toggle('error', !valid);
    if (errEl) errEl.textContent = valid ? '' : fieldConf.msg;
    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Valida todos os campos
    let allValid = true;
    Object.values(fields).forEach(({ el, rule }) => {
      if (!validateField(el, rule)) allValid = false;
    });

    if (!allValid) return;

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>> enviando...</span>';
    btn.disabled  = true;

    const errorBox = document.querySelector('.form-error-general');
    if (errorBox) errorBox.style.display = 'none';

    // Envio real via EmailJS (site estático, sem backend próprio)
    // Troque os IDs abaixo pelos gerados na sua conta em https://www.emailjs.com
    const SERVICE_ID  = 'service_vs7vbbf';
    const TEMPLATE_ID = 'template_ug2a1xy';

    if (typeof emailjs === 'undefined') {
      console.error('EmailJS não carregado. Verifique se o script do EmailJS está incluído antes de main.js.');
      btn.innerHTML = originalText;
      btn.disabled  = false;
      if (errorBox) errorBox.style.display = 'block';
      return;
    }

    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      from_name:  fields.name.el.value.trim(),
      from_email: fields.email.el.value.trim(),
      subject:    fields.subject.el.value.trim(),
      message:    fields.message.el.value.trim()
    })
    .then(() => {
      form.style.display = 'none';
      const success = document.querySelector('.form-success');
      if (success) success.classList.add('visible');
    })
    .catch((err) => {
      console.error('Erro ao enviar mensagem via EmailJS:', err);
      btn.innerHTML = originalText;
      btn.disabled  = false;
      if (errorBox) errorBox.style.display = 'block';
    });
  });
})();

// === EFEITO PARALLAX LEVE NO HERO ===
(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    const grid = document.querySelector('.grid-bg');
    if (grid) grid.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
})();

// === TERMINAL TYPING ANIMATION ===
(function initTerminalAnim() {
  const lines = document.querySelectorAll('.terminal__line[data-delay]');
  lines.forEach(line => {
    const delay = parseInt(line.dataset.delay) || 0;
    line.style.opacity = '0';
    setTimeout(() => {
      line.style.transition = '0.3s ease';
      line.style.opacity    = '1';
    }, delay);
  });
})();

/* === MATRIX RAIN (chuva de 0s e 1s) === */
(function initMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let cols, drops;
  const fontSize = 14;
  const chars = '01';
  const frameInterval = 45; // ms entre frames (~22fps, suficiente para o efeito)

  let lastFrameTime = 0;
  let rafId = null;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / fontSize);
    drops = Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff88';
    ctx.font = fontSize + 'px "Share Tech Mono", monospace';

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * drops.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  /* requestAnimationFrame em vez de setInterval: sincroniza com o navegador
     e evita empilhar timers. Continua rodando durante o scroll (é um desenho
     leve, não é isso que causava o travamento) — só pausa com a aba oculta,
     para não gastar bateria/CPU à toa em segundo plano. */
  function loop(now) {
    rafId = requestAnimationFrame(loop);

    if (document.hidden) return;
    if (now - lastFrameTime < frameInterval) return;

    lastFrameTime = now;
    draw();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) lastFrameTime = 0;
  });

  resize();
  window.addEventListener('resize', resize);
  rafId = requestAnimationFrame(loop);
})();

// ============================================
// PROJECT VIDEO PREVIEW SYSTEM
// Desktop: mouseenter/mouseleave + pointerleave
// Mobile: IntersectionObserver + LongPress + Scroll
// ============================================
(function initProjectVideoPreview() {
  // Verificar suporte a prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Desabilitar todos os vídeos se usuário preferir movimento reduzido
    return;
  }

  const projectCards = Array.from(document.querySelectorAll('.project-card'));
  if (!projectCards.length) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  let intersectionObservers = [];
  let longPressTimers = new Map();
  let activeDesktopCards = new Set(); // Track cards with active mouse

  // ========================================
  // FUNÇÃO: Para um vídeo específico
  // ========================================
  function stopProjectVideo(video) {
    if (!video) return;
    
    video.pause();
    video.currentTime = 0;
    video.classList.remove('playing');
    
    const card = video.closest('.project-card');
    if (card) {
      const thumb = card.querySelector('.project-thumb');
      if (thumb) thumb.classList.remove('hidden');
    }
  }

  // ========================================
  // FUNÇÃO: Para TODOS os vídeos
  // ========================================
  function stopAllProjectVideos() {
    projectCards.forEach(card => {
      const video = card.querySelector('.project-video');
      if (video) stopProjectVideo(video);
    });
  }

  // ========================================
  // FUNÇÃO: Reproduzir vídeo de um card
  // ========================================
  function playProjectVideo(card) {
    // Parar todos os outros vídeos
    stopAllProjectVideos();
    
    const video = card.querySelector('.project-video');
    const thumb = card.querySelector('.project-thumb');
    
    if (!video) return;

    configurePlayableVideo(video);
    safePlayVideo(video);
    video.classList.add('playing');
    if (thumb) thumb.classList.add('hidden');
  }

  // ========================================
  // DESKTOP: mouseenter / mouseleave / pointerleave
  // ========================================
  if (!isMobile) {
    projectCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        activeDesktopCards.add(card);
        playProjectVideo(card);
      });

      card.addEventListener('mouseleave', () => {
        activeDesktopCards.delete(card);
        const video = card.querySelector('.project-video');
        if (video) stopProjectVideo(video);
      });

      card.addEventListener('pointerleave', () => {
        activeDesktopCards.delete(card);
        const video = card.querySelector('.project-video');
        if (video) stopProjectVideo(video);
      });
    });
  }

  // ========================================
  // MOBILE: IntersectionObserver (60% visibility)
  // ========================================
  if (isMobile) {
    projectCards.forEach(card => {
      const observerOptions = {
        threshold: 0.6,
        rootMargin: '0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // Só ativa IntersectionObserver se não há long press ativo
          const hasActivePress = longPressTimers.has(card);
          
          if (entry.isIntersecting && !hasActivePress) {
            playProjectVideo(card);
          } else if (!entry.isIntersecting) {
            const video = card.querySelector('.project-video');
            if (video) stopProjectVideo(video);
          }
        });
      }, observerOptions);

      observer.observe(card);
      intersectionObservers.push(observer);
    });
  }

  // ========================================
  // MOBILE: LongPress Detection (350ms)
  // ========================================
  projectCards.forEach(card => {
    const media = card.querySelector('.project-card__media');
    if (!media) return;

    let longPressTimer = null;

    media.addEventListener('touchstart', (e) => {
      if (prefersReducedMotion) return;

      longPressTimer = setTimeout(() => {
        longPressTimers.set(card, true);
        playProjectVideo(card);
      }, 350);
    }, { passive: true });

    media.addEventListener('touchend', (e) => {
      if (prefersReducedMotion) return;

      if (longPressTimer) clearTimeout(longPressTimer);
      
      longPressTimers.delete(card);
      const video = card.querySelector('.project-video');
      if (video) stopProjectVideo(video);
    }, { passive: true });

    media.addEventListener('touchcancel', (e) => {
      if (prefersReducedMotion) return;

      if (longPressTimer) clearTimeout(longPressTimer);
      
      longPressTimers.delete(card);
      const video = card.querySelector('.project-video');
      if (video) stopProjectVideo(video);
    }, { passive: true });

    media.addEventListener('touchmove', () => {
      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimers.delete(card);
    }, { passive: true });
  });

  // ========================================
  // MOBILE SCROLL: Centro da tela
  // ========================================
  if (isMobile) {
    let scrollTimeout;

    function checkCenterScroll() {
      const viewportCenter = window.innerHeight / 2;

      projectCards.forEach(card => {
        // Só ativa scroll se não há long press ativo e não há mouse
        const hasActivePress = longPressTimers.has(card);
        const hasActiveMouse = activeDesktopCards.has(card);
        
        if (hasActivePress || hasActiveMouse) return;

        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distanceFromCenter = Math.abs(cardCenter - viewportCenter);

        // Se card está a menos de 100px do centro
        if (distanceFromCenter < 100) {
          playProjectVideo(card);
        } else {
          const video = card.querySelector('.project-video');
          if (video) stopProjectVideo(video);
        }
      });
    }

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkCenterScroll, 50);
    }, { passive: true });
  }

  // ========================================
  // CLEANUP: Desabilitar IntersectionObservers se redimensionar
  // ========================================
  window.addEventListener('resize', () => {
    const newIsMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (!newIsMobile && isMobile) {
      // Mudou de mobile para desktop
      intersectionObservers.forEach(obs => obs.disconnect());
      intersectionObservers = [];
      stopAllProjectVideos();
    }
  });
})();

