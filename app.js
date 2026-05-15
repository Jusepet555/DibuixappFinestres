/*
  DibuixApp Finestres · v1.41
  Prova experimental de disseny mòbil sobre la base bona v1.36.

  Aquesta versió manté la base bona anterior i hi afegeix el mode de
  corredissa elevable bona i ajust del dibuix de porta amb marc obert,
  perquè el marc obert de la porta quedi més fidel, amb un llindar interior
  fi i continu, i afegeix la lògica del tapajuntes baix segons si la
  porta té marc inferior obert o tancat. En aquesta v1.40 es manté la interfície guiada, les cotes queden sempre visibles i els ajustos de finestra 1 fulla també passen dins les opcions bàsiques.
*/

// =========================================================
// 1. Referències del DOM
// =========================================================
const drawingArea = document.getElementById('drawingArea');
const modelInput = document.getElementById('model');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const handInput = document.getElementById('handInput');
const openInput = document.getElementById('openInput');
const openRow = document.getElementById('openRow');
const doorFrameRow = document.getElementById('doorFrameRow');
const oscilloInput = document.getElementById('oscilloInput');
const trimInput = document.getElementById('trimInput');
const trimTopInput = document.getElementById('trimTopInput');
const trimBottomInput = document.getElementById('trimBottomInput');
const trimLeftInput = document.getElementById('trimLeftInput');
const trimRightInput = document.getElementById('trimRightInput');
const trimSideOptions = document.getElementById('trimSideOptions');
const measureSummary = document.getElementById('measureSummary');
const practiceOptions = document.getElementById('practiceOptions');
const oscilloRow = document.getElementById('oscilloRow');
const singleLeafOptions = document.getElementById('singleLeafOptions');
const multiLeafOptions = document.getElementById('multiLeafOptions');
const slidingOptions = document.getElementById('slidingOptions');
const liftSlideOptions = document.getElementById('liftSlideOptions');

const leaf1Active = document.getElementById('leaf1Active');
const leaf1Hand = document.getElementById('leaf1Hand');
const leaf1Oscillo = document.getElementById('leaf1Oscillo');
const leaf2Active = document.getElementById('leaf2Active');
const leaf2Hand = document.getElementById('leaf2Hand');
const leaf2Oscillo = document.getElementById('leaf2Oscillo');
const slideOuterHardware = document.getElementById('slideOuterHardware');
const slideInnerHardware = document.getElementById('slideInnerHardware');
const slideInteriorSide = document.getElementById('slideInteriorSide');
const liftSlideInput = document.getElementById('liftSlideInput');
const doorBottomFrameInput = document.getElementById('doorBottomFrameInput');
const mainLayout = document.getElementById('mainLayout');
const previewPanel = document.getElementById('previewPanel');
const stepMeasures = document.getElementById('stepMeasures');


// =========================================================
// 2. Constants i mides per defecte
// =========================================================
const MIN_MEASURE = 100;
const MAX_MEASURE = 6000;
const DEFAULT_W = 590;
const DEFAULT_H = 590;
const DOOR_DEFAULT_W = 900;
const DOOR_DEFAULT_H = 2100;
const PRACTICABLE2_DEFAULT_W = 1000;
const PRACTICABLE2_DEFAULT_H = 1000;
const SLIDING2_DEFAULT_W = 1000;
const SLIDING2_DEFAULT_H = 1000;
const LIFT_SLIDE_MIN_W = 2500;
const LIFT_SLIDE_MIN_H = 2000;


// =========================================================
// 3. Utilitats de mides i normalització
// =========================================================
function parseMeasure(value, fallback) {
  const cleaned = String(value).replace(',', '.').replace(/[^0-9.]/g, '');
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.max(Math.round(parsed), MIN_MEASURE), MAX_MEASURE);
}

function normalizeMeasureInput(input, fallback) {
  const value = String(input.value).trim();
  if (value === '') return;
  input.value = parseMeasure(value, fallback);
}

function getMeasureDefaults() {
  if (modelInput.value === 'door') {
    return { width: DOOR_DEFAULT_W, height: DOOR_DEFAULT_H };
  }
  if (modelInput.value === 'practicable2') {
    return { width: PRACTICABLE2_DEFAULT_W, height: PRACTICABLE2_DEFAULT_H };
  }
  if (modelInput.value === 'sliding2') {
    return { width: SLIDING2_DEFAULT_W, height: SLIDING2_DEFAULT_H };
  }
  return { width: DEFAULT_W, height: DEFAULT_H };
}

function getMeasuresForDrawing() {
  const defaults = getMeasureDefaults();
  return {
    realWidth: parseMeasure(widthInput.value, defaults.width),
    realHeight: parseMeasure(heightInput.value, defaults.height)
  };
}

function canUseLiftSlide(realWidth, realHeight) {
  return realWidth > LIFT_SLIDE_MIN_W && realHeight > LIFT_SLIDE_MIN_H;
}

function isLiftSlideAllowedForCurrentInputs() {
  const { realWidth, realHeight } = getMeasuresForDrawing();
  return modelInput.value === 'sliding2' && canUseLiftSlide(realWidth, realHeight);
}


// =========================================================
// 4. Valors per defecte segons model
// =========================================================
function applyTrimDefaultsForDoor() {
  trimTopInput.checked = true;
  trimLeftInput.checked = true;
  trimRightInput.checked = true;
  trimBottomInput.checked = false;
}

function applyDoorMeasureDefaults() {
  widthInput.value = DOOR_DEFAULT_W;
  heightInput.value = DOOR_DEFAULT_H;
  doorBottomFrameInput.value = 'open';
}

function applyPracticable2Defaults() {
  widthInput.value = PRACTICABLE2_DEFAULT_W;
  heightInput.value = PRACTICABLE2_DEFAULT_H;
  leaf1Active.checked = false;
  leaf1Hand.value = 'left';
  leaf1Oscillo.checked = false;
  leaf2Active.checked = true;
  leaf2Hand.value = 'right';
  leaf2Oscillo.checked = true;
}

function applySliding2Defaults() {
  widthInput.value = SLIDING2_DEFAULT_W;
  heightInput.value = SLIDING2_DEFAULT_H;
  slideOuterHardware.value = 'ungler';
  slideInnerHardware.value = 'handle';
  slideInteriorSide.value = 'right';
  liftSlideInput.checked = false;
}


// =========================================================
// 5. Visibilitat i estat dels controls
// =========================================================
function updateOpenFieldAppearance() {
  if (modelInput.value === 'door' && openInput.value === 'exterior') {
    openInput.classList.add('open-exterior');
  } else {
    openInput.classList.remove('open-exterior');
  }
}

function updateDoorTrimControls() {
  const isDoorOpenBottom = modelInput.value === 'door' && doorBottomFrameInput.value === 'open';
  trimBottomInput.disabled = isDoorOpenBottom;
  if (isDoorOpenBottom) trimBottomInput.checked = false;
}


function placePreviewForViewport() {
  if (!previewPanel || !stepMeasures || !mainLayout) return;
  const isMobile = window.matchMedia('(max-width: 850px)').matches;
  if (isMobile) {
    if (stepMeasures.nextElementSibling !== previewPanel) {
      stepMeasures.after(previewPanel);
    }
  } else if (mainLayout.lastElementChild !== previewPanel) {
    mainLayout.appendChild(previewPanel);
  }
}

function updateOptionGroupsForCurrentModel() {
  const optionGroups = Array.from(document.querySelectorAll('.option-group'));
  optionGroups.forEach((group) => {
    const summaryText = (group.querySelector('summary')?.textContent || '').trim();
    if (summaryText === 'Tapajuntes') {
      group.classList.remove('mobile-hidden-group');
      return;
    }

    const stack = group.querySelector('.option-stack');
    if (!stack) {
      group.classList.remove('mobile-hidden-group');
      return;
    }

    const directBlocks = Array.from(stack.children).filter((child) => child.nodeType === 1);
    const hasVisibleBlock = directBlocks.some((child) => !child.classList.contains('hidden'));
    group.classList.toggle('mobile-hidden-group', !hasVisibleBlock);
  });

  trimSideOptions.classList.toggle('disabled-note', trimBottomInput.disabled && trimInput.checked);
}

function updateControlVisibility() {
  const model = modelInput.value;
  const isPracticable1 = model === 'practicable';
  const isPracticable2 = model === 'practicable2';
  const isSliding2 = model === 'sliding2';
  const isDoor = model === 'door';
  const usesSingleControls = isPracticable1 || isDoor;
  const liftSlideAllowed = isLiftSlideAllowedForCurrentInputs();

  singleLeafOptions.classList.toggle('hidden', !usesSingleControls);
  practiceOptions.classList.toggle('hidden', !isDoor);
  oscilloRow.classList.toggle('hidden', !isPracticable1);
  openRow.classList.toggle('hidden', !isDoor);
  doorFrameRow.classList.toggle('hidden', !isDoor);
  multiLeafOptions.classList.toggle('hidden', !isPracticable2);
  slidingOptions.classList.toggle('hidden', !isSliding2);
  liftSlideOptions.classList.toggle('hidden', !liftSlideAllowed);
  trimSideOptions.classList.toggle('hidden', !trimInput.checked);
  updateDoorTrimControls();
  updateOptionGroupsForCurrentModel();

  if (!liftSlideAllowed) liftSlideInput.checked = false;

  leaf1Oscillo.disabled = !leaf1Active.checked;
  leaf2Oscillo.disabled = !leaf2Active.checked;
  if (!leaf1Active.checked) leaf1Oscillo.checked = false;
  if (!leaf2Active.checked) leaf2Oscillo.checked = false;
}


// =========================================================
// 6. Helpers tècnics de dibuix
// =========================================================
function getHingeCount(realHeight, isDoor = false) {
  if (isDoor) return 4;
  return realHeight <= 1500 ? 2 : 3;
}

function getHingePositions(y, h, hingeH, hingeCount, outerInset = 18) {
  const topPos = y + outerInset + 28;
  const bottomPos = y + h - outerInset - hingeH - 28;
  if (hingeCount === 2) return [topPos, bottomPos];
  if (hingeCount === 4) return [topPos, y + h * 0.34 - hingeH / 2, y + h * 0.66 - hingeH / 2, bottomPos];
  return [topPos, y + h / 2 - hingeH / 2, bottomPos];
}


// =========================================================
// 7. Lectura de dades i preparació del dibuix
// =========================================================
function getDrawingData() {
  const { realWidth, realHeight } = getMeasuresForDrawing();
  const dims = true;
  const model = modelInput.value;
  const isFixed = model === 'fixed';
  const isPracticable = model === 'practicable';
  const isPracticable2 = model === 'practicable2';
  const isSliding2 = model === 'sliding2';
  const isDoor = model === 'door';
  const hasOscillo = isPracticable && oscilloInput.checked;
  const doorBottomFrame = isDoor ? doorBottomFrameInput.value : 'closed';
  const doorHasOpenBottomFrame = isDoor && doorBottomFrame === 'open';
  const trimTop = trimInput.checked && trimTopInput.checked;
  const trimBottom = trimInput.checked && trimBottomInput.checked && !doorHasOpenBottomFrame;
  const trimLeft = trimInput.checked && trimLeftInput.checked;
  const trimRight = trimInput.checked && trimRightInput.checked;
  const hasTrim = trimTop || trimBottom || trimLeft || trimRight;
  const hand = handInput.value;
  const opening = isDoor ? openInput.value : 'interior';

  const leafConfigs = isPracticable2 ? [
    { id: 'left', active: leaf1Active.checked, hand: leaf1Hand.value, oscillo: leaf1Active.checked && leaf1Oscillo.checked },
    { id: 'right', active: leaf2Active.checked, hand: leaf2Hand.value, oscillo: leaf2Active.checked && leaf2Oscillo.checked }
  ] : [];

  const liftSlideAllowed = isSliding2 && canUseLiftSlide(realWidth, realHeight);
  const slidingConfig = isSliding2 ? {
    outerHardware: slideOuterHardware.value,
    innerHardware: slideInnerHardware.value,
    interiorSide: slideInteriorSide.value,
    isLiftSlide: liftSlideAllowed && liftSlideInput.checked,
    liftSlideAllowed
  } : null;

  const maxDrawW = 430;
  const maxDrawH = 430;
  const scale = Math.min(maxDrawW / realWidth, maxDrawH / realHeight);
  const w = realWidth * scale;
  const h = realHeight * scale;

  const trimVisual = hasTrim ? Math.max(14, Math.min(28, Math.round(Math.min(w, h) * 0.08))) : 0;
  const marginLeft = dims ? 95 : 35;
  const marginTop = dims ? 65 : 35;
  const marginRight = dims ? 50 : 35;
  const marginBottom = dims ? 85 : 35;

  const svgW = w + marginLeft + marginRight + trimVisual * 2;
  const svgH = h + marginTop + marginBottom + trimVisual * 2;
  const x = marginLeft + trimVisual;
  const y = marginTop + trimVisual;

  return {
    realWidth, realHeight, dims, model,
    isFixed, isPracticable, isPracticable2, isSliding2, isDoor,
    hasOscillo, hasTrim, trimTop, trimBottom, trimLeft, trimRight,
    hand, opening, doorBottomFrame, leafConfigs, slidingConfig,
    w, h, x, y, svgW, svgH, trimVisual
  };
}


// =========================================================
// 8. Peces comunes SVG: tapajuntes, cotes i ferratges
// =========================================================
function makeTrimMarkup(data) {
  const { hasTrim, trimTop, trimBottom, trimLeft, trimRight, x, y, w, h, trimVisual } = data;
  if (!hasTrim) return '';
  const parts = [];
  if (trimTop) parts.push(`<polygon class="svg-trim-piece" points="${trimLeft ? x - trimVisual : x},${y - trimVisual} ${trimRight ? x + w + trimVisual : x + w},${y - trimVisual} ${x + w},${y} ${x},${y}" />`);
  if (trimBottom) parts.push(`<polygon class="svg-trim-piece" points="${x},${y + h} ${x + w},${y + h} ${trimRight ? x + w + trimVisual : x + w},${y + h + trimVisual} ${trimLeft ? x - trimVisual : x},${y + h + trimVisual}" />`);
  if (trimLeft) parts.push(`<polygon class="svg-trim-piece" points="${x - trimVisual},${trimTop ? y - trimVisual : y} ${x},${y} ${x},${y + h} ${x - trimVisual},${trimBottom ? y + h + trimVisual : y + h}" />`);
  if (trimRight) parts.push(`<polygon class="svg-trim-piece" points="${x + w},${y} ${x + w + trimVisual},${trimTop ? y - trimVisual : y} ${x + w + trimVisual},${trimBottom ? y + h + trimVisual : y + h} ${x + w},${y + h}" />`);
  return parts.join('');
}

function makeDimMarkup(data) {
  const { dims, x, y, w, h, realWidth, realHeight } = data;
  if (!dims) return '';
  return `
    <line class="svg-guide" x1="${x}" y1="${y + h}" x2="${x}" y2="${y + h + 45}" />
    <line class="svg-guide" x1="${x + w}" y1="${y + h}" x2="${x + w}" y2="${y + h + 45}" />
    <line class="svg-dim" x1="${x}" y1="${y + h + 38}" x2="${x + w}" y2="${y + h + 38}" />
    <text class="svg-text" x="${x + w / 2}" y="${y + h + 70}" text-anchor="middle">H = ${realWidth}</text>

    <line class="svg-guide" x1="${x}" y1="${y}" x2="${x - 45}" y2="${y}" />
    <line class="svg-guide" x1="${x}" y1="${y + h}" x2="${x - 45}" y2="${y + h}" />
    <line class="svg-dim" x1="${x - 38}" y1="${y}" x2="${x - 38}" y2="${y + h}" />
    <text class="svg-text" x="${x - 62}" y="${y + h / 2}" transform="rotate(-90 ${x - 62} ${y + h / 2})" text-anchor="middle">V = ${realHeight}</text>
  `;
}

function makeSimpleHandle(x, y, plateOnLeft = true) {
  const plateW = 8;
  const plateH = 42;
  const plateX = plateOnLeft ? x - 12 : x + 4;
  const plateY = y - plateH / 2;
  const leverW = 14;
  const leverH = 4;
  const leverX = plateOnLeft ? plateX + plateW - 2 : plateX - leverW + 2;
  const leverY = y - leverH / 2;
  return `
    <rect class="svg-handle-outline" x="${plateX}" y="${plateY}" width="${plateW}" height="${plateH}" rx="1.2" />
    <rect class="svg-door-lever" x="${leverX}" y="${leverY}" width="${leverW}" height="${leverH}" rx="1.5" />
  `;
}

function makeLiftSlideHandle(x, y) {
  const plateW = 8;
  const plateH = 42;
  const plateX = x - plateW / 2;
  const plateY = y - plateH / 2;
  const stemW = 6;
  const stemH = 40;
  const stemX = x - stemW / 2;
  const stemY = plateY - stemH + 6;
  return `
    <rect class="svg-handle-outline" x="${plateX}" y="${plateY}" width="${plateW}" height="${plateH}" rx="1.2" />
    <rect class="svg-door-lever" x="${stemX}" y="${stemY}" width="${stemW}" height="${stemH}" rx="1.4" />
  `;
}

function makeUngler(x, y, side = 'right') {
  const w = 5;
  const h = 24;
  const baseX = side === 'right' ? x - w : x;
  const notchW = 2;
  const notchX = side === 'right' ? baseX + 1 : baseX + w - notchW - 1;
  return `
    <rect class="svg-ungler" x="${baseX}" y="${y - h / 2}" width="${w}" height="${h}" rx="0.8" />
    <rect class="svg-ungler-cut" x="${notchX}" y="${y - h / 2 + 4}" width="${notchW}" height="${h - 8}" rx="0.5" />
  `;
}


// =========================================================
// 9. Renderitzat de models
// =========================================================
function renderSinglePracticable(data) {
  const { x, y, w, h, hand, isDoor, hasOscillo, realHeight, opening, doorBottomFrame } = data;
  const outerInset = 18;
  const innerInset = isDoor ? 36 : 42;
  const glassInset = isDoor ? 52 : 58;
  const hingeX = hand === 'right' ? x + w - innerInset : x + innerInset;
  const handleX = hand === 'right' ? x + innerInset : x + w - innerInset;
  const topY = y + innerInset;
  const bottomY = y + h - innerInset;
  const midY = y + h / 2;
  const topCenterY = y + innerInset * 0.55;
  const doorHandleY = y + h * 0.56;
  const hasClosedDoorFrame = isDoor && doorBottomFrame === 'closed';

  const diagonal = `<path class="svg-open-hand" d="M ${hingeX} ${topY} L ${handleX} ${midY} L ${hingeX} ${bottomY}" />`;
  const tilt = !isDoor && hasOscillo
    ? `<path class="svg-open-tilt" d="M ${x + innerInset} ${bottomY} L ${x + w / 2} ${topCenterY} L ${x + w - innerInset} ${bottomY}" />`
    : '';

  const handleMarkup = isDoor
    ? (() => {
        const plateOnLeft = handleX < x + w / 2;
        const handle = makeSimpleHandle(handleX, doorHandleY, plateOnLeft);
        const plateX = plateOnLeft ? handleX - 12 : handleX + 4;
        const plateY = doorHandleY - 42 / 2;
        const lockW = 7;
        const lockH = 10;
        const lockX = plateX + (8 - lockW) / 2;
        const lockY = plateY + 42 + 8;
        return `
          ${handle}
          <rect class="svg-lock-outline" x="${lockX}" y="${lockY}" width="${lockW}" height="${lockH}" rx="1.2" />
          <circle class="svg-lock-core" cx="${lockX + lockW / 2}" cy="${lockY + lockH / 2}" r="1.5" />
        `;
      })()
    : (() => {
        const handleOuterW = 12;
        const handleOuterH = 36;
        const handleInnerW = 4;
        const handleInnerH = 16;
        const outerX = handleX < x + w / 2 ? handleX - 14 : handleX + 2;
        const outerY = midY - handleOuterH / 2;
        const innerX = outerX + (handleOuterW - handleInnerW) / 2;
        const innerY = midY - handleInnerH / 2;
        return `
          <rect class="svg-handle-outline" x="${outerX}" y="${outerY}" width="${handleOuterW}" height="${handleOuterH}" />
          <rect class="svg-handle-detail" x="${innerX}" y="${innerY}" width="${handleInnerW}" height="${handleInnerH}" />
        `;
      })();

  const hingeCount = getHingeCount(realHeight, isDoor);
  const hingeW = 8;
  const hingeH = 24;
  const hingeXPos = hand === 'right' ? x + w - outerInset - hingeW / 2 : x + outerInset - hingeW / 2;
  const hingesMarkup = (isDoor && opening === 'exterior') ? '' : getHingePositions(y, h, hingeH, hingeCount, outerInset).map((hingeY) => `
    <rect class="svg-hinge" x="${hingeXPos}" y="${hingeY}" width="${hingeW}" height="${hingeH}" rx="1.5" />
  `).join('');

  const closedThresholdMarkup = hasClosedDoorFrame
    ? `<line class="svg-threshold" x1="${x + outerInset}" y1="${y + h - outerInset}" x2="${x + w - outerInset}" y2="${y + h - outerInset}" />`
    : '';

  const frameMarkup = isDoor
    ? (hasClosedDoorFrame
        ? `
          <rect class="svg-frame" x="${x}" y="${y}" width="${w}" height="${h}" />
          <rect class="svg-inner" x="${x + outerInset}" y="${y + outerInset}" width="${w - outerInset * 2}" height="${h - outerInset * 2}" />
        `
        : `
          <path class="svg-frame-open" d="M ${x} ${y + h} L ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h}" />
                    <path class="svg-inner-open" d="M ${x + outerInset} ${y + h} L ${x + outerInset} ${y + outerInset} L ${x + w - outerInset} ${y + outerInset} L ${x + w - outerInset} ${y + h}" />
          <line class="svg-inner-open-bottom" x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" />
        `)
    : `
      <rect class="svg-frame" x="${x}" y="${y}" width="${w}" height="${h}" />
      <rect class="svg-inner" x="${x + outerInset}" y="${y + outerInset}" width="${w - outerInset * 2}" height="${h - outerInset * 2}" />
    `;

  return `
    ${frameMarkup}
    <rect class="svg-glass" x="${x + glassInset}" y="${y + glassInset}" width="${w - glassInset * 2}" height="${h - glassInset * 2}" />
    ${closedThresholdMarkup}
    ${diagonal}
    ${tilt}
    ${handleMarkup}
    ${hingesMarkup}
  `;
}

function renderFixed(data) {
  const { x, y, w, h } = data;
  const outerInset = 18;
  const glassInset = 58;
  return `
    <rect class="svg-frame" x="${x}" y="${y}" width="${w}" height="${h}" />
    <rect class="svg-inner" x="${x + outerInset}" y="${y + outerInset}" width="${w - outerInset * 2}" height="${h - outerInset * 2}" />
    <rect class="svg-glass" x="${x + glassInset}" y="${y + glassInset}" width="${w - glassInset * 2}" height="${h - glassInset * 2}" />
  `;
}

function renderMultiLeafPracticable(data) {
  const { x, y, w, h, realHeight, leafConfigs } = data;
  const outerInset = 18;
  const sashFrame = 4;
  const sashGap = 8;
  const groupX = x + outerInset;
  const groupY = y + outerInset;
  const groupW = w - outerInset * 2;
  const groupH = h - outerInset * 2;
  const leafW = (groupW - sashGap) / 2;
  const glassInset = 18;
  const hingeW = 8;
  const hingeH = 22;
  const hingeCount = getHingeCount(realHeight, false);

  const leafRects = [
    { x: groupX, y: groupY, w: leafW, h: groupH },
    { x: groupX + leafW + sashGap, y: groupY, w: leafW, h: groupH }
  ];

  const leafMarkup = leafRects.map((leafRect, i) => {
    const cfg = leafConfigs[i];
    const lx = leafRect.x;
    const ly = leafRect.y;
    const lw = leafRect.w;
    const lh = leafRect.h;
    const leafInset = 18;
    const glassX = lx + glassInset;
    const glassY = ly + glassInset;
    const glassW = lw - glassInset * 2;
    const glassH = lh - glassInset * 2;
    const hingeX = cfg.hand === 'right' ? lx + lw - leafInset : lx + leafInset;
    const handleX = cfg.hand === 'right' ? lx + leafInset : lx + lw - leafInset;
    const topY = ly + leafInset;
    const bottomY = ly + lh - leafInset;
    const midY = ly + lh / 2;
    const topCenterY = ly + leafInset * 0.55;
    const diagonal = `<path class="svg-open-hand" d="M ${hingeX} ${topY} L ${handleX} ${midY} L ${hingeX} ${bottomY}" />`;
    const tilt = cfg.active && cfg.oscillo ? `<path class="svg-open-tilt" d="M ${lx + leafInset} ${bottomY} L ${lx + lw / 2} ${topCenterY} L ${lx + lw - leafInset} ${bottomY}" />` : '';
    const handleMarkup = cfg.active ? (() => {
      const handleOuterW = 12;
      const handleOuterH = 36;
      const handleInnerW = 4;
      const handleInnerH = 16;
      const outerX = handleX < lx + lw / 2 ? handleX - 14 : handleX + 2;
      const outerY = midY - handleOuterH / 2;
      const innerX = outerX + (handleOuterW - handleInnerW) / 2;
      const innerY = midY - handleInnerH / 2;
      return `<rect class="svg-handle-outline" x="${outerX}" y="${outerY}" width="${handleOuterW}" height="${handleOuterH}" /><rect class="svg-handle-detail" x="${innerX}" y="${innerY}" width="${handleInnerW}" height="${handleInnerH}" />`;
    })() : '';
    const hingeXPos = cfg.hand === 'right' ? lx + lw - leafInset - hingeW / 2 : lx + leafInset - hingeW / 2;
    const hingesMarkup = getHingePositions(ly, lh, hingeH, hingeCount, 10).map((hingeY) => `<rect class="svg-hinge" x="${hingeXPos}" y="${hingeY}" width="${hingeW}" height="${hingeH}" rx="1.5" />`).join('');

    return `
      <rect class="svg-sash" x="${lx}" y="${ly}" width="${lw}" height="${lh}" />
      <rect class="svg-sash-inner" x="${lx + sashFrame}" y="${ly + sashFrame}" width="${lw - sashFrame * 2}" height="${lh - sashFrame * 2}" />
      <rect class="svg-glass" x="${glassX}" y="${glassY}" width="${glassW}" height="${glassH}" />
      ${diagonal}
      ${tilt}
      ${handleMarkup}
      ${hingesMarkup}
    `;
  }).join('');

  return `<rect class="svg-frame" x="${x}" y="${y}" width="${w}" height="${h}" />${leafMarkup}`;
}

function renderSliding2(data) {
  const { x, y, w, h, slidingConfig } = data;
  const frameInset = 16;
  const frameInnerInset = 10;
  const outerX = x + frameInset;
  const outerY = y + frameInset;
  const outerW = w - frameInset * 2;
  const outerH = h - frameInset * 2;
  const trackX = outerX + frameInnerInset;
  const trackY = outerY + frameInnerInset;
  const trackW = outerW - frameInnerInset * 2;
  const trackH = outerH - frameInnerInset * 2;
  const overlap = Math.max(12, trackW * 0.035);
  const sashW = (trackW / 2) + overlap / 2;
  const sashH = trackH - 8;
  const sashY = trackY + 4;
  const leftX = trackX + 2;
  const rightX = trackX + trackW - sashW - 2;
  const sashInset = 8;
  const glassInset = 13;
  const arrowY = sashY + sashH / 2;
  const interiorSide = slidingConfig.interiorSide || 'right';
  const isLiftSlide = Boolean(slidingConfig.isLiftSlide);

  function slidingArrow(cx, dir) {
    const len = Math.min(52, sashW * 0.32);
    const x1 = dir === 'right' ? cx - len / 2 : cx + len / 2;
    const x2 = dir === 'right' ? cx + len / 2 : cx - len / 2;
    return `<line class="svg-slide-arrow" x1="${x1}" y1="${arrowY}" x2="${x2}" y2="${arrowY}" marker-end="url(#arrowGray)" />`;
  }

  function hardwareMarkup(side, kind) {
    const cy = sashY + sashH / 2;
    if (kind === 'none') return '';
    const handleX = side === 'left' ? leftX + 8 : rightX + sashW - 8;
    if (kind === 'handle') {
      return isLiftSlide
        ? makeLiftSlideHandle(handleX, cy)
        : (side === 'left'
            ? makeSimpleHandle(leftX + 8, cy, true)
            : makeSimpleHandle(rightX + sashW - 8, cy, false));
    }
    return side === 'left'
      ? makeUngler(leftX + 4, cy, 'left')
      : makeUngler(rightX + sashW - 4, cy, 'right');
  }

  function leafMarkup(side, isInterior, hardwareKind) {
    const leafX = side === 'left' ? leftX : rightX;
    const dir = side === 'left' ? 'right' : 'left';
    const rectClass = isInterior ? 'svg-sash-front' : 'svg-sash';
    return `
      <rect class="${rectClass}" x="${leafX}" y="${sashY}" width="${sashW}" height="${sashH}" />
      <rect class="svg-sash-inner" x="${leafX + sashInset}" y="${sashY + sashInset}" width="${sashW - sashInset * 2}" height="${sashH - sashInset * 2}" />
      <rect class="svg-glass-soft" x="${leafX + glassInset}" y="${sashY + glassInset}" width="${sashW - glassInset * 2}" height="${sashH - glassInset * 2}" />
      ${hardwareMarkup(side, hardwareKind)}
      ${slidingArrow(leafX + sashW / 2, dir)}
    `;
  }

  const leftIsInterior = interiorSide === 'left';
  const leftLeaf = leafMarkup('left', leftIsInterior, leftIsInterior ? slidingConfig.innerHardware : slidingConfig.outerHardware);
  const rightLeaf = leafMarkup('right', !leftIsInterior, leftIsInterior ? slidingConfig.outerHardware : slidingConfig.innerHardware);
  const lowerAccent = isLiftSlide
    ? `<rect class="svg-lift-base" x="${x + 2}" y="${y + h - 8.5}" width="${w - 4}" height="6.5" rx="1.1" /><line class="svg-lift-base-line" x1="${x + 2}" y1="${y + h - 8.5}" x2="${x + w - 2}" y2="${y + h - 8.5}" />`
    : "";

  return `
    <rect class="svg-frame" x="${x}" y="${y}" width="${w}" height="${h}" />
    <rect class="svg-inner" x="${outerX}" y="${outerY}" width="${outerW}" height="${outerH}" />
    ${leftIsInterior ? rightLeaf + leftLeaf : leftLeaf + rightLeaf}
    ${lowerAccent}
  `;
}


// =========================================================
// 10. Pintar vista prèvia i exportar SVG
// =========================================================
function drawWindow() {
  updateControlVisibility();
  updateOpenFieldAppearance();
  const data = getDrawingData();
  const { realWidth, realHeight, svgW, svgH, isFixed, isPracticable2, isSliding2 } = data;

  measureSummary.textContent = `H=${realWidth} mm · V=${realHeight} mm`;

  const bodyMarkup = isFixed
    ? renderFixed(data)
    : isPracticable2
      ? renderMultiLeafPracticable(data)
      : isSliding2
        ? renderSliding2(data)
        : renderSinglePracticable(data);

  const trimMarkup = makeTrimMarkup(data);
  const dimMarkup = makeDimMarkup(data);

  const svgStyles = `
    .svg-trim-piece { fill: #f8fafb; stroke: #1f2b37; stroke-width: 2.6; stroke-linejoin: miter; }
    .svg-frame { fill: #f8fafb; stroke: #1f2b37; stroke-width: 5.6; }
    .svg-inner { fill: none; stroke: #3a4651; stroke-width: 2.3; }
    .svg-frame-open { fill: none; stroke: #1f2b37; stroke-width: 5.6; stroke-linecap: square; stroke-linejoin: miter; }
    .svg-inner-open { fill: none; stroke: #3a4651; stroke-width: 2.3; stroke-linecap: square; stroke-linejoin: miter; }
    .svg-inner-open-bottom { stroke: #2f3943; stroke-width: 1.8; }
    .svg-sash { fill: #ffffff; stroke: #2f3943; stroke-width: 2.4; }
    .svg-sash-front { fill: #ffffff; stroke: #2f3943; stroke-width: 2.4; }
    .svg-sash-inner { fill: none; stroke: #3f4a55; stroke-width: 1.6; }
    .svg-glass { fill: #d9efff; stroke: #7fa7bd; stroke-width: 2; }
    .svg-glass-soft { fill: #d9efff; stroke: #7fa7bd; stroke-width: 1.6; }
    .svg-open-hand { fill: none; stroke: #245c84; stroke-width: 3; stroke-dasharray: 8 6; }
    .svg-open-tilt { fill: none; stroke: #3f9b4f; stroke-width: 3; stroke-dasharray: 5 5; }
    .svg-slide-arrow { stroke: #6a6a6a; stroke-width: 1.8; }
    .svg-lift-base { fill: #1f2b37; stroke: none; }
    .svg-lift-base-line { stroke: #1f2b37; stroke-width: 3.2; }
    .svg-dim { stroke: #111; stroke-width: 2; marker-start: url(#arrow); marker-end: url(#arrow); }
    .svg-guide { stroke: #111; stroke-width: 1.8; stroke-dasharray: 6 4; opacity: 1; }
    .svg-text { fill: #111; font-family: Arial, Helvetica, sans-serif; font-size: 22px; font-weight: 700; }
    .svg-handle-outline { fill: #fbfbfa; stroke: #1f2b37; stroke-width: 1.6; }
    .svg-handle-detail { fill: #1f2b37; }
    .svg-door-lever { fill: #1f2b37; }
    .svg-lock-outline { fill: #fbfbfa; stroke: #1f2b37; stroke-width: 1.7; }
    .svg-lock-core { fill: #1f2b37; }
    .svg-hinge { fill: #fbfbfa; stroke: #1f2b37; stroke-width: 1.8; }
    .svg-threshold { stroke: #1f2b37; stroke-width: 2.2; }
    .svg-ungler { fill: #ffffff; stroke: #1f2b37; stroke-width: 1.3; }
    .svg-ungler-cut { fill: #1f2b37; }
  `;

  const svg = `
    <svg id="windowSvg" xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
      <style>${svgStyles}</style>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse" markerUnits="strokeWidth">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#111" />
        </marker>
        <marker id="arrowGray" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto" markerUnits="strokeWidth">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6a6a6a" />
        </marker>
      </defs>
      <rect x="0" y="0" width="${svgW}" height="${svgH}" fill="#fbfbfa" />
      ${trimMarkup}
      ${bodyMarkup}
      ${dimMarkup}
    </svg>
  `;

  drawingArea.innerHTML = svg;
}

function downloadSvg() {
  const defaults = getMeasureDefaults();
  normalizeMeasureInput(widthInput, defaults.width);
  normalizeMeasureInput(heightInput, defaults.height);
  drawWindow();

  const svg = document.getElementById('windowSvg');
  if (!svg) return;
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svg);
  if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
    source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  source = `<?xml version="1.0" encoding="UTF-8"?>\n${source}`;
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const baseModel = modelInput.value === 'fixed'
    ? 'fixe'
    : modelInput.value === 'door'
      ? 'porta'
      : modelInput.value === 'practicable2'
        ? 'practicable-2fulles'
        : modelInput.value === 'sliding2'
          ? 'corredissa-2fulles'
          : (oscilloInput.checked ? 'practicable-oscillo' : 'practicable');
  link.href = url;
  link.download = `dibuixapp-${baseModel}-${parseMeasure(widthInput.value, defaults.width)}x${parseMeasure(heightInput.value, defaults.height)}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


// =========================================================
// 11. Esdeveniments de la interfície
// =========================================================
document.getElementById('generateBtn').addEventListener('click', () => {
  const defaults = getMeasureDefaults();
  normalizeMeasureInput(widthInput, defaults.width);
  normalizeMeasureInput(heightInput, defaults.height);
  drawWindow();
});
document.getElementById('downloadBtn').addEventListener('click', downloadSvg);
document.getElementById('printBtn').addEventListener('click', () => {
  const defaults = getMeasureDefaults();
  normalizeMeasureInput(widthInput, defaults.width);
  normalizeMeasureInput(heightInput, defaults.height);
  drawWindow();
  window.print();
});

[widthInput, heightInput].forEach((el) => {
  el.addEventListener('input', drawWindow);
  el.addEventListener('blur', () => {
    const defaults = getMeasureDefaults();
    normalizeMeasureInput(widthInput, defaults.width);
    normalizeMeasureInput(heightInput, defaults.height);
    drawWindow();
  });
});

modelInput.addEventListener('change', () => {
  if (modelInput.value === 'door') {
    applyDoorMeasureDefaults();
    if (trimInput.checked) applyTrimDefaultsForDoor();
  } else if (modelInput.value === 'practicable2') {
    applyPracticable2Defaults();
  } else if (modelInput.value === 'sliding2') {
    applySliding2Defaults();
  }
  drawWindow();
});

trimInput.addEventListener('change', () => {
  if (trimInput.checked && modelInput.value === 'door') {
    applyTrimDefaultsForDoor();
  }
  drawWindow();
});

[handInput, openInput, oscilloInput, trimTopInput, trimBottomInput, trimLeftInput, trimRightInput,
 leaf1Active, leaf1Hand, leaf1Oscillo, leaf2Active, leaf2Hand, leaf2Oscillo, slideOuterHardware, slideInnerHardware, slideInteriorSide, liftSlideInput, doorBottomFrameInput].forEach((el) => {
  el.addEventListener('input', drawWindow);
  el.addEventListener('change', drawWindow);
});

window.addEventListener('resize', () => {
  placePreviewForViewport();
});

placePreviewForViewport();
drawWindow();
