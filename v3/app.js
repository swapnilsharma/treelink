// Card definitions so Layer -1 arrows can cycle through experiences.
const cards = [
  {
    id: 'golf',
    backgroundImage:
      'src/img/card1.png',
    subtitle: 'POPULAR AMONG · SPORT LOVERS',
    title: 'Every Drive in Style',
    ctas: [
      'Try This Outfit on Me',
      'Change Setting to A Mini Golf Course',
      'Style this with Brown Aviators',
      'Show More Similar Looks',
      'Swap Background to City Club',
      'Add Pro Tips Overlay',
      'Send to Phone',
      'Book a Tee Time',
      'Recommend Coaches Nearby',
      'Share with Friends',
      'Save to Favorites',
      'Gift this Look',
    ],
    rails: {
      Discover: {
        type: 'story',
        items: [
          {
            id: 'g_disc_1',
            variant: 'discover',
            image:
              'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=1200&q=70',
            title: 'Golf Club Evenings',
          },
          {
            id: 'g_disc_2',
            variant: 'discover',
            image:
              'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=70',
            title: 'Sunrise Tee Time',
          },
          {
            id: 'g_disc_3',
            variant: 'discover',
            image:
              'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=70',
            title: 'Weekend Tournament',
          },
        ],
      },
      Shop: {
        type: 'product',
        items: [
          {
            id: 'g_shop_1',
            variant: 'shop',
            image:
              'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=70',
            title: 'Tailored Polo Knitwear',
            price: '$48',
            brandLogo:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/H%26M-Logo.svg/320px-H%26M-Logo.svg.png',
          },
          {
            id: 'g_shop_2',
            variant: 'shop',
            image:
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=70',
            title: 'Performance Golf Cap',
            price: '$22',
            brandLogo:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Nike_logo.svg/320px-Nike_logo.svg.png',
          },
        ],
      },
      More: {
        type: 'misc',
        items: [
          { id: 'g_more_1', variant: 'more', label: 'Share' },
          { id: 'g_more_2', variant: 'more', label: 'Report' },
          { id: 'g_more_3', variant: 'more', label: 'Save' },
        ],
      },
    },
  },
  {
    id: 'city',
    backgroundImage:
      'https://images.unsplash.com/photo-1564256075637-d29830edb258',
    subtitle: 'TRENDING · CITY LIGHTS',
    title: 'Midnight in Metropolis',
    ctas: ['Guide Me There', 'Show Matching Outfits', 'Queue Similar Vibes'],
    rails: {
      Discover: {
        type: 'story',
        items: [
          {
            id: 'c_disc_1',
            variant: 'discover',
            image:
              'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=70',
            title: 'Neon Skylines',
          },
          {
            id: 'c_disc_2',
            variant: 'discover',
            image:
              'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=70',
            title: 'Rooftop Sessions',
          },
        ],
      },
      Shop: {
        type: 'product',
        items: [
          {
            id: 'c_shop_1',
            variant: 'shop',
            image:
              'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=70',
            title: 'Reflective Jacket',
            price: '$58',
            brandLogo:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Nike_logo.svg/320px-Nike_logo.svg.png',
          },
          {
            id: 'c_shop_2',
            variant: 'shop',
            image:
              'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=70',
            title: 'Smart Glasses',
            price: '$140',
            brandLogo:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Google-flutter-logo.svg/240px-Google-flutter-logo.svg.png',
          },
        ],
      },
      More: {
        type: 'misc',
        items: [
          { id: 'c_more_1', variant: 'more', label: 'Behind the Mix' },
          { id: 'c_more_2', variant: 'more', label: 'Fan Stories' },
        ],
      },
    },
  },
  {
    id: 'festival',
    backgroundImage:
      'https://images.unsplash.com/photo-1520690214124-2405c5217036',
    subtitle: 'POPULAR · FESTIVAL FAVORITES',
    title: 'Feel the Summer Pulse',
    ctas: ['Book VIP Access', 'Style It with Neon', 'Find Friend Meetups'],
    rails: {
      Discover: {
        type: 'story',
        items: [
          {
            id: 'f_disc_1',
            variant: 'discover',
            image:
              'https://images.unsplash.com/photo-1500534310612-6e58f80d7416?auto=format&fit=crop&w=1200&q=70',
            title: 'Front Row Energy',
          },
          {
            id: 'f_disc_2',
            variant: 'discover',
            image:
              'https://images.unsplash.com/photo-1500534310612-6e58f80d7416?auto=format&fit=crop&w=1200&q=70',
            title: 'Sunset Chill',
          },
        ],
      },
      Shop: {
        type: 'product',
        items: [
          {
            id: 'f_shop_1',
            variant: 'shop',
            image:
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=70',
            title: 'Festival Shades',
            price: '$24',
            brandLogo:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Nike_logo.svg/320px-Nike_logo.svg.png',
          },
          {
            id: 'f_shop_2',
            variant: 'shop',
            image:
              'https://images.unsplash.com/photo-1458253329476-1ebb8593a652?auto=format&fit=crop&w=800&q=70',
            title: 'Holographic Jacket',
            price: '$65',
            brandLogo:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/H%26M-Logo.svg/320px-H%26M-Logo.svg.png',
          },
        ],
      },
      More: {
        type: 'misc',
        items: [
          { id: 'f_more_1', variant: 'more', label: 'Backstage' },
          { id: 'f_more_2', variant: 'more', label: 'Fan Stories' },
          { id: 'f_more_3', variant: 'more', label: 'Schedule' },
        ],
      },
    },
  },
];

// Centralized state so the navigation rules stay in a single place.
const layerOrder = [-2, -1, 0, 1];
const TAB_ORDER = ['Discover', 'Shop', 'More'];

const focusableByLayer = {
  '-2': Array.from(document.querySelectorAll('.focusable[data-layer="-2"]')),
  '-1': Array.from(document.querySelectorAll('.focusable[data-layer="-1"]')),
  '0': Array.from(document.querySelectorAll('.focusable[data-layer="0"]')),
  '1': Array.from(document.querySelectorAll('.focusable[data-layer="1"]')),
  settings: Array.from(document.querySelectorAll('.focusable[data-layer="settings"]')),
};

const INACTIVITY_TIMEOUT_MS = 5000; // Adjust this timeout to change the auto-advance delay.

const state = {
  currentLayer: 0,
  currentCardIndex: 0,
  focusIndexByLayer: {
    '-2': 0,
    '-1': 0,
    '0': 1,
    '1': 0,
  },
  selectedTabByCard: cards.reduce((acc, _, index) => {
    acc[index] = 'Discover';
    return acc;
  }, {}),
};

let bottomFocusRow = 'tabs';
let railFocusIndex = 0;
let loadingCTAIndex = null;
let completedCTAIndex = null;
let ctaTimeoutId = null;
let isSettingsOpen = false;
let settingsFocusIndex = 0;
let inactivityTimeoutId = null;
let isCardAnimating = false;

// Cached DOM references for quick render updates.
const cardLayerEls = {
  prev: document.querySelector('[data-card-slot="prev"]'),
  current: document.querySelector('[data-card-slot="current"]'),
  next: document.querySelector('[data-card-slot="next"]'),
};
const layerContainers = Array.from(document.querySelectorAll('.layer-container'));
let currentCTAViewportEl = null;
const appRootEl = document.getElementById('app-root');
const railContainerEl = document.getElementById('rail-container');
const bottomContainerEl = document.getElementById('bottom-container');
const settingsOverlayEl = document.getElementById('settings-overlay');
const settingsPanelEl = document.getElementById('settings-panel');
const settingsOptions = Array.from(document.querySelectorAll('.settings-list .settings-option'));
const tabButtons = Array.from(document.querySelectorAll('.tabs-row .tab'));

function getSelectedTab() {
  return state.selectedTabByCard[state.currentCardIndex] || 'Discover';
}

function updateLayerFocusables(layer) {
  focusableByLayer[layer] = Array.from(
    document.querySelectorAll(`.focusable[data-layer="${layer}"]`)
  );
}

function updateCTAStates() {
  const ctas = focusableByLayer['0'] || [];
  ctas.forEach((el, idx) => {
    el.classList.toggle('loading', idx === loadingCTAIndex);
    el.classList.toggle('completed', idx === completedCTAIndex);
  });
}

function scrollCTAIntoView(index) {
  if (!currentCTAViewportEl) return;
  const target = currentCTAViewportEl.querySelector(
    `.cta-tile[data-layer="0"][data-index="${index}"]`
  );
  if (!target) return;

  const padding = 12;
  const btnRect = target.getBoundingClientRect();
  const viewRect = currentCTAViewportEl.getBoundingClientRect();
  let nextScroll = null;

  if (btnRect.left < viewRect.left) {
    const delta = viewRect.left - btnRect.left + padding;
    nextScroll = Math.max(0, currentCTAViewportEl.scrollLeft - delta);
  } else if (btnRect.right > viewRect.right) {
    const delta = btnRect.right - viewRect.right + padding;
    nextScroll = currentCTAViewportEl.scrollLeft + delta;
  }

  if (nextScroll !== null && Math.abs(nextScroll - currentCTAViewportEl.scrollLeft) > 1) {
    currentCTAViewportEl.scrollTo({
      left: nextScroll,
      behavior: 'smooth',
    });
  }
}

function openSettings() {
  isSettingsOpen = true;
  settingsFocusIndex = 0;
  settingsOverlayEl.classList.add('active');
  settingsPanelEl.classList.add('active');
  if (inactivityTimeoutId) {
    clearTimeout(inactivityTimeoutId);
    inactivityTimeoutId = null;
  }
  applyFocus();
}

function closeSettings() {
  isSettingsOpen = false;
  settingsOverlayEl.classList.remove('active');
  settingsPanelEl.classList.remove('active');
  state.currentLayer = -2;
  state.focusIndexByLayer['-2'] = 0;
  applyFocus();
  resetInactivityTimer();
}

function getCardIndex(offset) {
  const total = cards.length;
  return (state.currentCardIndex + offset + total) % total;
}

function renderCardLayer(cardIndex, layerEl, isCurrent) {
  const card = cards[cardIndex];
  if (!card || !layerEl) return;

  const bgEl = layerEl.querySelector('.card-bg');
  if (bgEl) {
    bgEl.style.backgroundImage = `url("${card.backgroundImage}")`;
  }

  const labelEl = layerEl.querySelector('.hero-label');
  const titleEl = layerEl.querySelector('.hero-title');
  if (labelEl) labelEl.textContent = card.subtitle;
  if (titleEl) titleEl.textContent = card.title;

  const trayViewport = layerEl.querySelector('.cta-tray-viewport');
  const trayEl = layerEl.querySelector('.cta-tray');
  if (trayEl) {
    trayEl.innerHTML = '';
    const micBtn = document.createElement('button');
    micBtn.className = 'cta-tile cta-mic';
    micBtn.setAttribute('aria-label', 'Voice actions');
    const micImg = document.createElement('img');
    micImg.src = 'src/icn/icn-mic.svg';
    micImg.alt = '';
    micBtn.appendChild(micImg);
    if (isCurrent) {
      micBtn.classList.add('focusable');
      micBtn.dataset.layer = '0';
      micBtn.dataset.index = '0';
      micBtn.tabIndex = -1;
    } else {
      micBtn.classList.remove('focusable');
      micBtn.removeAttribute('data-layer');
      micBtn.removeAttribute('data-index');
      micBtn.removeAttribute('tabindex');
    }
    trayEl.appendChild(micBtn);

    card.ctas.forEach((label, idx) => {
      const btn = document.createElement('button');
      btn.className = 'cta-tile';
      btn.textContent = label;
      if (isCurrent) {
        btn.classList.add('focusable');
        btn.dataset.layer = '0';
        btn.dataset.index = String(idx + 1);
        btn.tabIndex = -1;
      } else {
        btn.classList.remove('focusable');
        btn.removeAttribute('data-layer');
        btn.removeAttribute('data-index');
        btn.removeAttribute('tabindex');
      }
      trayEl.appendChild(btn);
    });
  }

  if (isCurrent) {
    currentCTAViewportEl = trayViewport;
    if (currentCTAViewportEl) {
      currentCTAViewportEl.scrollLeft = 0;
    }
  }
}

function renderVisibleCards() {
  renderCardLayer(getCardIndex(-1), cardLayerEls.prev, false);
  renderCardLayer(state.currentCardIndex, cardLayerEls.current, true);
  renderCardLayer(getCardIndex(1), cardLayerEls.next, false);
  setLayerPosition(cardLayerEls.prev, 'prev', true);
  setLayerPosition(cardLayerEls.current, 'current', true);
  setLayerPosition(cardLayerEls.next, 'next', true);
  renderTabsSelection();
  renderRail();
  updateLayerFocusables('0');
  const maxIndex = (focusableByLayer['0']?.length || 1) - 1;
  state.focusIndexByLayer['0'] = Math.min(
    state.focusIndexByLayer['0'],
    Math.max(maxIndex, 0)
  );
  const maxLayer1Index = (focusableByLayer['1']?.length || 1) - 1;
  state.focusIndexByLayer['1'] = Math.min(
    state.focusIndexByLayer['1'],
    Math.max(maxLayer1Index, 0)
  );
  updateCTAStates();
}

/**
 * Visually mark which tab is selected for the active card.
 */
function renderTabsSelection() {
  const selectedTab = getSelectedTab();
  tabButtons.forEach((button) => {
    const isSelected = button.dataset.tab === selectedTab;
    button.classList.toggle('selected-tab', isSelected);
  });
}

function setSelectedTabForCurrentCard(tabName) {
  if (!tabName) return;
  state.selectedTabByCard[state.currentCardIndex] = tabName;
  railFocusIndex = 0;
  renderTabsSelection();
  renderRail();
}

function startCTALoader(index) {
  stopCTALoader();
  loadingCTAIndex = index;
  completedCTAIndex = null;
  updateCTAStates();
  ctaTimeoutId = setTimeout(() => {
    loadingCTAIndex = null;
    completedCTAIndex = index;
    updateCTAStates();
    ctaTimeoutId = null;
  }, 3000);
}

function stopCTALoader() {
  if (ctaTimeoutId) {
    clearTimeout(ctaTimeoutId);
    ctaTimeoutId = null;
  }
  loadingCTAIndex = null;
  updateCTAStates();
}

function handleSettingsKey(key) {
  const maxIndex = settingsOptions.length - 1;
  switch (key) {
    case 'ArrowUp':
      settingsFocusIndex = Math.max(settingsFocusIndex - 1, 0);
      applyFocus();
      break;
    case 'ArrowDown':
      settingsFocusIndex = Math.min(settingsFocusIndex + 1, maxIndex);
      applyFocus();
      break;
    case 'ArrowLeft':
    case 'Escape':
      closeSettings();
      break;
    case 'Enter':
      console.log('Settings action:', settingsOptions[settingsFocusIndex].textContent);
      break;
    default:
      break;
  }
}

/**
 * Render the related rail items for the selected tab.
 */
function renderRail() {
  railContainerEl.innerHTML = '';
  const card = cards[state.currentCardIndex];
  if (!card) {
    updateRailVisibility();
    return;
  }
  const tabName = getSelectedTab();
  const rail = card.rails?.[tabName];
  if (!rail || !rail.items) {
    updateRailVisibility();
    return;
  }

  rail.items.forEach((item, idx) => {
    const tile = buildRailTile(item, idx);
    railContainerEl.appendChild(tile);
  });
  railFocusIndex = Math.min(railFocusIndex, rail.items.length - 1);
  if (bottomFocusRow === 'rail') {
    highlightRailFocus();
  } else {
    clearRailFocusHighlight();
  }
  updateRailVisibility();
  updateLayerFocusables('1');
}

function buildRailTile(item, idx) {
  const baseClass = ['rail-item', 'focusable', `tile-${item.variant || 'discover'}`];
  const tile = document.createElement('div');
  tile.className = baseClass.join(' ');
  tile.dataset.layer = '1';
  tile.dataset.railIndex = idx;
  tile.tabIndex = -1;
  switch (item.variant) {
    case 'shop':
      tile.innerHTML = `
        <div class="tile-shop-image-wrapper">
          <img src="${item.image}" alt="${item.title}" />
        </div>
        <div class="tile-shop-content">
          <div class="tile-shop-title">${item.title}</div>
          <div class="tile-shop-price">${item.price || ''}</div>
        </div>
        ${
          item.brandLogo
            ? `<img class="tile-shop-brand" src="${item.brandLogo}" alt="brand logo" />`
            : ''
        }
      `;
      break;
    case 'more':
      tile.innerHTML = `<div class="tile-more-label">${item.label || 'More'}</div>`;
      break;
    case 'discover':
    default:
      tile.innerHTML = `
        <img src="${item.image}" alt="${item.title}" />
        <div class="discover-title">${item.title}</div>
      `;
      break;
  }
  return tile;
}

function resetInactivityTimer() {
  if (inactivityTimeoutId) {
    clearTimeout(inactivityTimeoutId);
  }
  if (isSettingsOpen) {
    inactivityTimeoutId = null;
    return;
  }
  inactivityTimeoutId = setTimeout(() => {
    handleCardTransition(1);
  }, INACTIVITY_TIMEOUT_MS);
}

function updateRailVisibility() {
  const shouldExpand = state.currentLayer === 1 && railContainerEl.children.length > 0;
  bottomContainerEl.classList.toggle('expanded', shouldExpand);
  appRootEl.classList.toggle('tray-open', shouldExpand);
  renderTabsSelection();
  if (!shouldExpand) {
    bottomFocusRow = 'tabs';
    railFocusIndex = 0;
    clearRailFocusHighlight();
  }
}

function highlightRailFocus() {
  if (!railContainerEl) return false;
  const items = Array.from(railContainerEl.querySelectorAll('.rail-item'));
  if (!items.length) return false;
  railFocusIndex = Math.min(Math.max(railFocusIndex, 0), items.length - 1);
  items.forEach((item, idx) => {
    if (idx === railFocusIndex) {
      item.classList.add('is-focused');
      if (typeof item.focus === 'function') {
        item.focus({ preventScroll: true });
      }
    } else {
      item.classList.remove('is-focused');
    }
  });
  return true;
}

function clearRailFocusHighlight() {
  if (!railContainerEl) return;
  railContainerEl.querySelectorAll('.rail-item').forEach((item) => {
    item.classList.remove('is-focused');
  });
}

function moveRailFocus(direction) {
  const items = Array.from(railContainerEl.querySelectorAll('.rail-item'));
  if (!items.length) return;
  railFocusIndex = Math.min(Math.max(railFocusIndex + direction, 0), items.length - 1);
  highlightRailFocus();
}

/**
 * Applies the focus styles to the active element and clears the rest.
 */
function applyFocus() {
  document.querySelectorAll('.focusable.is-focused').forEach((el) =>
    el.classList.remove('is-focused')
  );
  if (isSettingsOpen) {
    settingsOptions.forEach((opt, idx) => {
      if (idx === settingsFocusIndex) {
        opt.classList.add('is-focused');
        opt.focus({ preventScroll: true });
      }
    });
    updateLayerStates();
    updateRailVisibility();
    return;
  }
  if (state.currentLayer === 1 && bottomFocusRow === 'rail') {
    const hasRail = highlightRailFocus();
    if (!hasRail) {
      bottomFocusRow = 'tabs';
      const selectedIdx = TAB_ORDER.indexOf(getSelectedTab());
      if (selectedIdx !== -1) {
        state.focusIndexByLayer['1'] = selectedIdx;
      }
      applyFocus();
      return;
    }
  } else {
    const elements = focusableByLayer[state.currentLayer];
    const target = elements?.[state.focusIndexByLayer[state.currentLayer]];
    if (target) {
      target.classList.add('is-focused');
      if (typeof target.focus === 'function') {
        target.focus({ preventScroll: true });
      }
    }
    clearRailFocusHighlight();
  }
  updateLayerStates();
  updateRailVisibility();
  if (state.currentLayer === 0) {
    scrollCTAIntoView(state.focusIndexByLayer['0']);
  }
}

/**
 * Moves up/down between layers when DPAD vertical keys are triggered.
 * @param {number} direction -1 for up, +1 for down
 */
function moveVertical(direction) {
  const previousLayer = state.currentLayer;
  const layerIndex = layerOrder.indexOf(state.currentLayer);
  const nextIndex = Math.min(Math.max(layerIndex + direction, 0), layerOrder.length - 1);
  state.currentLayer = layerOrder[nextIndex];

  if (state.currentLayer === 1) {
    bottomFocusRow = 'tabs';
    const selectedIdx = TAB_ORDER.indexOf(getSelectedTab());
    if (selectedIdx !== -1) {
      state.focusIndexByLayer['1'] = selectedIdx;
    }
  }

  if (previousLayer === 1 && state.currentLayer !== 1) {
    bottomFocusRow = 'tabs';
    railFocusIndex = 0;
  }

  // Clamp the existing focus index to the available elements in the new layer
  const elements = focusableByLayer[state.currentLayer];
  const clampedIndex = Math.min(state.focusIndexByLayer[state.currentLayer], elements.length - 1);
  state.focusIndexByLayer[state.currentLayer] = Math.max(clampedIndex, 0);
  applyFocus();
}

/**
 * Moves within a layer when DPAD horizontal keys are triggered.
 * @param {number} direction -1 for left, +1 for right
 */
function moveHorizontal(direction) {
  const elements = focusableByLayer[state.currentLayer];
  const maxIndex = elements.length - 1;
  const nextIndex = Math.min(
    Math.max(state.focusIndexByLayer[state.currentLayer] + direction, 0),
    maxIndex
  );
  state.focusIndexByLayer[state.currentLayer] = nextIndex;

  if (state.currentLayer === 1) {
    const tabName = TAB_ORDER[nextIndex];
    if (tabName) {
      setSelectedTabForCurrentCard(tabName);
    }
  }

  applyFocus();
}

/**
 * Handle the DPAD key presses and ENTER actions.
 */
function handleKey(event) {
  if (isSettingsOpen) {
    event.preventDefault();
    handleSettingsKey(event.key);
    return;
  }
  const { key } = event;
  if (
    key === 'ArrowUp' ||
    key === 'ArrowDown' ||
    key === 'ArrowLeft' ||
    key === 'ArrowRight'
  ) {
    event.preventDefault();
  }

  switch (key) {
    case 'ArrowUp':
      if (state.currentLayer === 1) {
        if (bottomFocusRow === 'rail') {
          bottomFocusRow = 'tabs';
          railFocusIndex = 0;
          const selectedIdx = TAB_ORDER.indexOf(getSelectedTab());
          if (selectedIdx !== -1) {
            state.focusIndexByLayer['1'] = selectedIdx;
          }
          applyFocus();
          break;
        }
      }
      moveVertical(-1);
      break;
    case 'ArrowDown':
      if (state.currentLayer === 1) {
        if (bottomFocusRow === 'tabs') {
          if (railContainerEl.children.length > 0) {
            bottomFocusRow = 'rail';
            railFocusIndex = 0;
            applyFocus();
          }
          break;
        }
        break;
      }
      moveVertical(1);
      break;
    case 'ArrowLeft':
      if (state.currentLayer === 1 && bottomFocusRow === 'rail') {
        moveRailFocus(-1);
      } else {
        moveHorizontal(-1);
      }
      break;
    case 'ArrowRight':
      if (state.currentLayer === 1 && bottomFocusRow === 'rail') {
        moveRailFocus(1);
      } else {
        moveHorizontal(1);
      }
      break;
    case 'Enter': {
      const layer = state.currentLayer;
      const index = state.focusIndexByLayer[layer];
      const elements = focusableByLayer[layer];
      const target = elements[index];

      let handled = false;
      // Layer -1 arrows cycle the cards.
      if (layer === -1 && target?.dataset.nav) {
        const dir = target.dataset.nav === 'prev' ? -1 : 1;
        handled = true;
        handleCardTransition(dir);
      }

      if (layer === -2 && target?.ariaLabel === 'Settings') {
        handled = true;
        openSettings();
      }

      if (layer === 0 && typeof index === 'number') {
        handled = true;
        startCTALoader(index);
      }

      if (layer === 1) {
        handled = true;
        if (target) {
          target.classList.add('activated');
          setTimeout(() => target.classList.remove('activated'), 150);
        }
        break;
      }

      if (!handled && target) {
        target.classList.add('activated');
        // Fire a placeholder log so we can extend with real actions later.
        console.log('Activated', target.textContent.trim() || target.ariaLabel);
        setTimeout(() => target.classList.remove('activated'), 150);
      } else if (handled && target) {
        target.classList.add('activated');
        setTimeout(() => target.classList.remove('activated'), 150);
      }
      break;
    }
    default:
      break;
  }
  resetInactivityTimer();
}

/**
 * Move to the previous/next card in a circular fashion.
 * @param {number} direction -1 for previous, +1 for next
 */
function rotateCardLayerRefs(direction) {
  if (direction > 0) {
    const oldPrev = cardLayerEls.prev;
    cardLayerEls.prev = cardLayerEls.current;
    cardLayerEls.current = cardLayerEls.next;
    cardLayerEls.next = oldPrev;
  } else if (direction < 0) {
    const oldNext = cardLayerEls.next;
    cardLayerEls.next = cardLayerEls.current;
    cardLayerEls.current = cardLayerEls.prev;
    cardLayerEls.prev = oldNext;
  }
}

function cycleCard(direction) {
  const total = cards.length;
  state.currentCardIndex = (state.currentCardIndex + direction + total) % total;
  if (!state.selectedTabByCard[state.currentCardIndex]) {
    state.selectedTabByCard[state.currentCardIndex] = 'Discover';
  }
  state.focusIndexByLayer['0'] = 1;
  state.focusIndexByLayer['1'] = 0;
  bottomFocusRow = 'tabs';
  railFocusIndex = 0;
  loadingCTAIndex = null;
  completedCTAIndex = null;
  if (ctaTimeoutId) {
    clearTimeout(ctaTimeoutId);
    ctaTimeoutId = null;
  }
  rotateCardLayerRefs(direction);
  renderVisibleCards();
  applyFocus();
  resetInactivityTimer();
}

function handleCardTransition(direction) {
  if (direction === 0) {
    cycleCard(0);
    return;
  }
  if (isCardAnimating) return;
  isCardAnimating = true;

  const outgoing = cardLayerEls.current;
  const incoming = direction > 0 ? cardLayerEls.next : cardLayerEls.prev;
  if (!incoming) {
    isCardAnimating = false;
    cycleCard(direction);
    return;
  }
  const onTransitionEnd = (event) => {
    if (event.propertyName !== 'transform' || event.target !== incoming) return;
    incoming.removeEventListener('transitionend', onTransitionEnd);
    cycleCard(direction);
    isCardAnimating = false;
  };

  incoming.addEventListener('transitionend', onTransitionEnd);

  requestAnimationFrame(() => {
    setLayerPosition(outgoing, direction > 0 ? 'prev' : 'next');
    setLayerPosition(incoming, 'current');
  });
}

document.addEventListener('keydown', handleKey);
renderVisibleCards();
applyFocus();
resetInactivityTimer();
function setLayerPosition(layerEl, position, instant = false) {
  if (!layerEl) return;
  if (instant) {
    layerEl.style.transition = 'none';
  }
  layerEl.classList.remove('position-prev', 'position-current', 'position-next');
  if (position) {
    layerEl.dataset.cardSlot = position;
    layerEl.classList.add(`position-${position}`);
  }
  if (instant) {
    // Force reflow then restore transition
    layerEl.getBoundingClientRect();
    layerEl.style.transition = '';
  }
}

function updateLayerStates() {
  layerContainers.forEach((container) => {
    const id = Number(container.getAttribute('data-layer-id'));
    if (id === state.currentLayer) {
      container.classList.add('layer--active');
      container.classList.remove('layer--inactive');
    } else {
      container.classList.add('layer--inactive');
      container.classList.remove('layer--active');
    }
  });

  const layer1Container = document.querySelector('.layer-container.layer--1');
  if (layer1Container) {
    layer1Container.classList.remove('layer1--tabs-active', 'layer1--rail-active');
    if (state.currentLayer === 1) {
      if (bottomFocusRow === 'tabs') {
        layer1Container.classList.add('layer1--tabs-active');
      } else if (bottomFocusRow === 'rail') {
        layer1Container.classList.add('layer1--rail-active');
      }
    }
  }
}
