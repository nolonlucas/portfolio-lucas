# Project Media Preview System

## 📁 Estrutura de Pastas

```
projects/
├── securedash/
│   ├── thumb.webp          (Thumbnail do projeto)
│   └── preview.mp4         (Vídeo de preview)
├── devburger/
│   ├── thumb.webp
│   └── preview.mp4
├── cyberportal/
│   ├── thumb.webp
│   └── preview.mp4
└── datasync/
    ├── thumb.webp
    └── preview.mp4
```

## 📸 Especificações de Mídia

### Thumbnails (WebP)
- **Formato**: WebP (comprimido)
- **Resolução**: 1280 x 720px (16:9)
- **Qualidade**: 85-90%
- **Tamanho máximo**: 150KB recomendado
- **Nomeação**: `thumb.webp`

### Vídeos (MP4)
- **Formato**: MP4 H.264
- **Resolução**: 1280 x 720px (16:9)
- **Duração**: 3-10 segundos (ideal)
- **Taxa de bits**: 2-4 Mbps
- **FPS**: 24 ou 30fps
- **Áudio**: Sem áudio (muted)
- **Tamanho máximo**: 5-8MB por vídeo
- **Nomeação**: `preview.mp4`

## 🎬 Como o Sistema Funciona

### Desktop
- **Hover na imagem** → Vídeo começa a reproduzir
- **Sai do hover** → Vídeo pausa e volta ao início

### Mobile
Três formas de ativação:

#### 1️⃣ IntersectionObserver (Automático)
- Quando **60% do card está visível** → Vídeo reproduz
- Quando **sai da viewport** → Vídeo pausa

#### 2️⃣ Long Press (Manual)
- **Pressione por 350ms** → Vídeo começa
- **Solte o dedo** → Vídeo pausa

#### 3️⃣ Scroll Central
- Se card está **próximo ao centro** da tela → Vídeo reproduz
- **Afasta do centro** → Vídeo pausa

## ⚙️ Configurações CSS

Localização: `css/style.css` (linhas 1035-1110)

**Transições:**
- Duration: 400ms
- Easing: cubic-bezier(0.19, 1, 0.22, 1)

**Efeitos:**
- Thumbnail: opacity 1→0
- Vídeo: opacity 0→1 + scale 1→1.03
- Suave e cinematográfica

## 🔧 Configurações JavaScript

Localização: `js/main.js` (linhas 926-1240)

**Função Principal:**
- `initProjectVideoPreview()` - Sistema completo de preview

**Funções Internas:**
- `stopAllProjectVideos()` - Para todos os vídeos
- `playProjectVideo(card)` - Reproduz vídeo do card
- `pauseProjectVideo(card)` - Pausa vídeo do card

**Comportamento:**
- Nunca mais de um vídeo por vez
- Sempre respeita `prefers-reduced-motion`
- Suporte total a mobile e desktop
- Sem bloqueio de scroll

## ♿ Acessibilidade

O sistema respeita a preferência do navegador:

```css
@media (prefers-reduced-motion: reduce) {
  /* Vídeos desabilitados */
  /* Apenas thumbnails exibidas */
}
```

## 🚀 Próximos Passos

1. **Adicionar thumbnails** (WebP 1280x720)
   ```
   Assets/projects/{projeto}/thumb.webp
   ```

2. **Adicionar vídeos** (MP4 1280x720)
   ```
   Assets/projects/{projeto}/preview.mp4
   ```

3. **Testar em Desktop**
   - Hover nos cards
   - Verificar transições suaves

4. **Testar em Mobile**
   - Long press por 350ms
   - Scroll automático
   - IntersectionObserver

5. **Testar Responsividade**
   - iPad/Tablet
   - Diferentes tamanhos de tela

## 📊 Performance

- ✅ Lazy loading de imagens
- ✅ Preload="metadata" nos vídeos
- ✅ Muted e playsinline para mobile
- ✅ Loop automático
- ✅ Zoom suave (scale 1.03)
- ✅ Transições GPU-aceleradas

## 🔍 Validação

Todos os arquivos foram validados:
- ✅ HTML sem erros
- ✅ CSS sem erros
- ✅ JavaScript sem erros
- ✅ Sem quebra de funcionalidades existentes

---

**Desenvolvido com**: HTML5 · CSS3 · JavaScript Puro
