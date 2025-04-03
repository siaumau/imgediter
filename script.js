// 全域變數
let sourceImage = null;
let currentMode = 'crop'; // 'crop', 'erase', 'text'
let croppers = [];
let erasers = [];
let textBoxes = [];
let lastCropper = null; // 記住最後一個裁切框的尺寸和比例
let currentAspectRatio = 1;
let lockRatio = true;
let isDragging = false;
let dragIndex = null;
let dragType = null; // 'cropper', 'eraser', 'text'
let dragStartX, dragStartY;
let isResizing = false;
let resizeIndex = null;
let resizeType = null;
let resizeElementType = null; // 'cropper', 'eraser', 'text'
let resizeStartX, resizeStartY;
let originalWidth, originalHeight, originalX, originalY;
let currentTextBoxIndex = null;
let editCanvas = null;
let editCtx = null;

// DOM 元素
let fileInput = null;
let aspectRatioSelect = null;
let ratioWidthInput = null;
let ratioHeightInput = null;
let lockRatioCheckbox = null;
let addCropperBtn = null;
let clearCroppersBtn = null;
let cropAllBtn = null;
let downloadOriginalBtn = null;
let downloadEditedBtn = null;
let imageContainer = null;
let imageWrapper = null;
let img = null;
let eraserColorInput = null;
let eraserOpacityInput = null;
let opacityValueDisplay = null;
let addEraserBtn = null;
let clearErasersBtn = null;
let defaultFontSelect = null;
let defaultFontSizeInput = null;
let defaultFontColorInput = null;
let addTextBtn = null;
let clearTextsBtn = null;
let textEditor = null;
let fontFamilySelect = null;
let fontSizeInput = null;
let fontColorInput = null;
let fontWeightSelect = null;
let fontItalicCheckbox = null;
let fontUnderlineCheckbox = null;
let textContentTextarea = null;
let saveTextBtn = null;
let cancelTextBtn = null;
let modalOverlay = null;
let tabs = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化 DOM 元素
    fileInput = document.getElementById('file-input');
    aspectRatioSelect = document.getElementById('aspect-ratio');
    ratioWidthInput = document.getElementById('ratio-width');
    ratioHeightInput = document.getElementById('ratio-height');
    lockRatioCheckbox = document.getElementById('lock-ratio');
    addCropperBtn = document.getElementById('add-cropper');
    clearCroppersBtn = document.getElementById('clear-croppers');
    cropAllBtn = document.getElementById('crop-all');
    downloadOriginalBtn = document.getElementById('download-original');
    downloadEditedBtn = document.getElementById('download-edited');
    imageContainer = document.getElementById('image-container');
    imageWrapper = document.getElementById('image-wrapper');
    img = document.getElementById('source-image');
    eraserColorInput = document.getElementById('eraser-color');
    eraserOpacityInput = document.getElementById('eraser-opacity');
    opacityValueDisplay = document.getElementById('opacity-value');
    addEraserBtn = document.getElementById('add-eraser');
    clearErasersBtn = document.getElementById('clear-erasers');
    defaultFontSelect = document.getElementById('default-font');
    defaultFontSizeInput = document.getElementById('default-font-size');
    defaultFontColorInput = document.getElementById('default-font-color');
    addTextBtn = document.getElementById('add-text');
    clearTextsBtn = document.getElementById('clear-texts');
    textEditor = document.getElementById('text-editor');
    fontFamilySelect = document.getElementById('font-family');
    fontSizeInput = document.getElementById('font-size');
    fontColorInput = document.getElementById('font-color');
    fontWeightSelect = document.getElementById('font-weight');
    fontItalicCheckbox = document.getElementById('font-italic');
    fontUnderlineCheckbox = document.getElementById('font-underline');
    textContentTextarea = document.getElementById('text-content');
    saveTextBtn = document.getElementById('save-text');
    cancelTextBtn = document.getElementById('cancel-text');
    modalOverlay = document.getElementById('modal-overlay');
    tabs = document.querySelectorAll('.tab');
    editCanvas = document.getElementById('edit-canvas');

    // 初始化功能
    updateAspectRatio();
    updateOpacityValue();

    // 綁定選項卡切換事件
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // 綁定事件監聽器
    fileInput.addEventListener('change', handleFileChange);
    aspectRatioSelect.addEventListener('change', updateAspectRatio);
    ratioWidthInput.addEventListener('input', updateCustomRatio);
    ratioHeightInput.addEventListener('input', updateCustomRatio);
    lockRatioCheckbox.addEventListener('change', function() {
        lockRatio = this.checked;
    });
    addCropperBtn.addEventListener('click', addCropper);
    clearCroppersBtn.addEventListener('click', clearCroppers);
    cropAllBtn.addEventListener('click', cropAllAndDownload);
    downloadOriginalBtn.addEventListener('click', downloadOriginalImage);
    downloadEditedBtn.addEventListener('click', downloadEditedImage);
    eraserOpacityInput.addEventListener('input', updateOpacityValue);
    addEraserBtn.addEventListener('click', addEraser);
    clearErasersBtn.addEventListener('click', clearErasers);
    addTextBtn.addEventListener('click', addTextBox);
    clearTextsBtn.addEventListener('click', clearTextBoxes);
    saveTextBtn.addEventListener('click', saveTextContent);
    cancelTextBtn.addEventListener('click', cancelTextEditor);

    // 設置文檔級別的事件監聽器，用於拖曳和調整大小
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// 切換選項卡
function switchTab(tabName) {
    // 重置選項卡狀態
    tabs.forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // 激活選中的選項卡
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // 更新當前模式
    currentMode = tabName;
}

// 初始化編輯 Canvas
function initEditCanvas() {
    if (!sourceImage) return;

    // 設置 canvas 大小
    editCanvas.width = img.naturalWidth;
    editCanvas.height = img.naturalHeight;
    editCanvas.style.display = 'block';
    editCtx = editCanvas.getContext('2d');

    // 繪製原始圖片到 canvas
    editCtx.drawImage(img, 0, 0);
}

// 更新透明度顯示
function updateOpacityValue() {
    const value = eraserOpacityInput.value;
    opacityValueDisplay.textContent = value + '%';
}

// 確保寬高是偶數
function ensureEven(value) {
    return Math.floor(value / 2) * 2;
}

// 處理檔案選擇
function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        img.onload = function() {
            // 顯示圖片並啟用按鈕
            img.style.display = 'block';
            addCropperBtn.disabled = false;
            addEraserBtn.disabled = false;
            addTextBtn.disabled = false;
            cropAllBtn.disabled = croppers.length === 0;
            clearCroppersBtn.disabled = croppers.length === 0;
            clearErasersBtn.disabled = erasers.length === 0;
            clearTextsBtn.disabled = textBoxes.length === 0;
            downloadOriginalBtn.disabled = false;
            downloadEditedBtn.disabled = false;

            // 清除現有的編輯元素
            clearCroppers();
            clearErasers();
            clearTextBoxes();

            // 重置圖片容器
            resetImageContainer();

            // 初始化編輯 Canvas
            initEditCanvas();

            // 將 edit-canvas 設置為隱藏
            editCanvas.style.display = 'none';
        };
        img.src = event.target.result;
        sourceImage = {
            src: event.target.result,
            width: img.naturalWidth,
            height: img.naturalHeight
        };
    };
    reader.readAsDataURL(file);
}

// 重置圖片容器
function resetImageContainer() {
    imageWrapper.style.width = img.naturalWidth + 'px';
    imageWrapper.style.height = img.naturalHeight + 'px';
}

// 更新長寬比例
function updateAspectRatio() {
    const aspectRatioSelect = document.getElementById('aspect-ratio');
    const customRatioGroup = document.getElementById('custom-ratio-group');

    if (!aspectRatioSelect || !customRatioGroup) {
        console.warn('找不到必要的 DOM 元素');
        return;
    }

    const value = aspectRatioSelect.value;

    if (value === 'custom') {
        customRatioGroup.style.display = 'flex';
        updateCustomRatio();
    } else {
        customRatioGroup.style.display = 'none';
        currentAspectRatio = eval(value); // 計算比例值
    }
}

// 更新自訂比例
function updateCustomRatio() {
    let width = parseInt(ratioWidthInput.value, 10);
    let height = parseInt(ratioHeightInput.value, 10);

    // 確保寬高是偶數
    if (width % 2 !== 0) {
        width = width + 1;
        ratioWidthInput.value = width;
    }

    if (height % 2 !== 0) {
        height = height + 1;
        ratioHeightInput.value = height;
    }

    currentAspectRatio = width / height;
}

// 添加裁切框
function addCropper() {
    if (!sourceImage) return;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    let cropperWidth, cropperHeight, cropperX, cropperY;

    // 如果有上一個裁切框，則使用其尺寸和比例
    if (lastCropper) {
        cropperWidth = lastCropper.width;
        cropperHeight = lastCropper.height;
        cropperX = ensureEven(Math.min(lastCropper.x + 30, imgWidth - cropperWidth - 10));
        cropperY = ensureEven(Math.min(lastCropper.y + 30, imgHeight - cropperHeight - 10));
    } else {
        // 計算裁切框的初始大小，確保符合比例且是偶數像素
        cropperWidth = Math.min(300, imgWidth / 2);
        cropperHeight = cropperWidth / currentAspectRatio;

        // 確保裁切框的尺寸是偶數像素
        cropperWidth = ensureEven(cropperWidth);
        cropperHeight = ensureEven(cropperHeight);

        // 計算裁切框的初始位置，置中於圖片
        cropperX = ensureEven((imgWidth - cropperWidth) / 2);
        cropperY = ensureEven((imgHeight - cropperHeight) / 2);
    }

    const cropper = {
        x: cropperX,
        y: cropperY,
        width: cropperWidth,
        height: cropperHeight
    };

    croppers.push(cropper);
    lastCropper = {...cropper}; // 保存最後一個裁切框的數據

    createCropperElement(cropper, croppers.length - 1);

    // 啟用相關按鈕
    cropAllBtn.disabled = false;
    clearCroppersBtn.disabled = false;
}

// 添加去背區域
function addEraser() {
    if (!sourceImage) return;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // 計算去背框的初始大小
    const eraserWidth = Math.min(200, imgWidth / 3);
    const eraserHeight = Math.min(200, imgHeight / 3);

    // 確保尺寸是偶數像素
    const adjustedWidth = ensureEven(eraserWidth);
    const adjustedHeight = ensureEven(eraserHeight);

    // 計算去背框的初始位置，置中於圖片
    const eraserX = ensureEven((imgWidth - adjustedWidth) / 2);
    const eraserY = ensureEven((imgHeight - adjustedHeight) / 2);

    // 加上新的去背框位置偏移，避免重疊
    const offset = erasers.length * 30;
    const offsetX = ensureEven(Math.min(offset, imgWidth - adjustedWidth - 10));
    const offsetY = ensureEven(Math.min(offset, imgHeight - adjustedHeight - 10));

    const eraser = {
        x: eraserX + offsetX,
        y: eraserY + offsetY,
        width: adjustedWidth,
        height: adjustedHeight,
        color: eraserColorInput.value,
        opacity: eraserOpacityInput.value / 100
    };

    erasers.push(eraser);

    createEraserElement(eraser, erasers.length - 1);

    // 啟用相關按鈕
    clearErasersBtn.disabled = false;
    downloadEditedBtn.disabled = false;

    // 應用去背效果到編輯 Canvas
    applyEraserToCanvas(eraser);
}

// 應用去背效果到編輯 Canvas
function applyEraserToCanvas(eraser) {
    if (!editCtx) return;

    // 設置填充顏色和透明度
    const r = parseInt(eraser.color.substr(1, 2), 16);
    const g = parseInt(eraser.color.substr(3, 2), 16);
    const b = parseInt(eraser.color.substr(5, 2), 16);
    editCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${eraser.opacity})`;

    // 填充去背區域
    editCtx.fillRect(eraser.x, eraser.y, eraser.width, eraser.height);

    // 重新繪製所有文字
    redrawAllTextBoxes();
}

// 添加文字框
function addTextBox() {
    if (!sourceImage) return;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // 計算文字框的初始大小
    const textWidth = Math.min(200, imgWidth / 3);
    const textHeight = Math.min(100, imgHeight / 5);

    // 確保尺寸是偶數像素
    const adjustedWidth = ensureEven(textWidth);
    const adjustedHeight = ensureEven(textHeight);

    // 計算文字框的初始位置，置中於圖片
    const textX = ensureEven((imgWidth - adjustedWidth) / 2);
    const textY = ensureEven((imgHeight - adjustedHeight) / 2);

    // 加上新的文字框位置偏移，避免重疊
    const offset = textBoxes.length * 30;
    const offsetX = ensureEven(Math.min(offset, imgWidth - adjustedWidth - 10));
    const offsetY = ensureEven(Math.min(offset, imgHeight - adjustedHeight - 10));

    const textBox = {
        x: textX + offsetX,
        y: textY + offsetY,
        width: adjustedWidth,
        height: adjustedHeight,
        text: '輸入文字',
        fontFamily: defaultFontSelect.value,
        fontSize: parseInt(defaultFontSizeInput.value, 10),
        fontColor: defaultFontColorInput.value,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none'
    };

    textBoxes.push(textBox);

    createTextBoxElement(textBox, textBoxes.length - 1);

    // 啟用相關按鈕
    clearTextsBtn.disabled = false;
    downloadEditedBtn.disabled = false;

    // 立即打開文字編輯器
    openTextEditor(textBoxes.length - 1);
}

// 建立裁切框元素
function createCropperElement(cropper, index) {
    const cropperEl = document.createElement('div');
    cropperEl.className = 'cropper';
    cropperEl.dataset.index = index;
    cropperEl.dataset.type = 'cropper';
    cropperEl.style.left = cropper.x + 'px';
    cropperEl.style.top = cropper.y + 'px';
    cropperEl.style.width = cropper.width + 'px';
    cropperEl.style.height = cropper.height + 'px';

    // 裁切框編號
    const indexEl = document.createElement('div');
    indexEl.className = 'cropper-index';
    indexEl.textContent = index + 1;
    cropperEl.appendChild(indexEl);

    // 添加四個角的調整控點
    const corners = ['nw', 'ne', 'sw', 'se'];
    corners.forEach(corner => {
        const resizer = document.createElement('div');
        resizer.className = `resizer resizer-${corner}`;
        resizer.dataset.corner = corner;
        cropperEl.appendChild(resizer);

        // 添加調整大小的事件監聽器
        resizer.addEventListener('mousedown', function(e) {
            startResize(e, 'cropper');
        });
    });

    // 添加拖曳事件監聽器
    cropperEl.addEventListener('mousedown', function(e) {
        if (e.target.className.includes('resizer')) return;
        startDrag(e, 'cropper');
    });

    imageWrapper.appendChild(cropperEl);
}

// 建立去背區域元素
function createEraserElement(eraser, index) {
    const eraserEl = document.createElement('div');
    eraserEl.className = 'eraser';
    eraserEl.dataset.index = index;
    eraserEl.dataset.type = 'eraser';
    eraserEl.style.left = eraser.x + 'px';
    eraserEl.style.top = eraser.y + 'px';
    eraserEl.style.width = eraser.width + 'px';
    eraserEl.style.height = eraser.height + 'px';
    eraserEl.style.backgroundColor = `rgba(${parseInt(eraser.color.substr(1, 2), 16)}, ${parseInt(eraser.color.substr(3, 2), 16)}, ${parseInt(eraser.color.substr(5, 2), 16)}, ${eraser.opacity * 1})`;

    // 去背區域編號
    const indexEl = document.createElement('div');
    indexEl.className = 'eraser-index';
    indexEl.textContent = index + 1;
    eraserEl.appendChild(indexEl);

    // 添加四個角的調整控點
    const corners = ['nw', 'ne', 'sw', 'se'];
    corners.forEach(corner => {
        const resizer = document.createElement('div');
        resizer.className = `resizer resizer-${corner}`;
        resizer.dataset.corner = corner;
        eraserEl.appendChild(resizer);

        // 添加調整大小的事件監聽器
        resizer.addEventListener('mousedown', function(e) {
            startResize(e, 'eraser');
        });
    });

    // 添加拖曳事件監聽器
    eraserEl.addEventListener('mousedown', function(e) {
        if (e.target.className.includes('resizer')) return;
        startDrag(e, 'eraser');
    });

    imageWrapper.appendChild(eraserEl);
}

// 建立文字框元素
function createTextBoxElement(textBox, index) {
    const textBoxEl = document.createElement('div');
    textBoxEl.className = 'text-box';
    textBoxEl.dataset.index = index;
    textBoxEl.dataset.type = 'text';
    textBoxEl.style.left = textBox.x + 'px';
    textBoxEl.style.top = textBox.y + 'px';
    textBoxEl.style.width = textBox.width + 'px';
    textBoxEl.style.height = textBox.height + 'px';
    textBoxEl.style.fontFamily = textBox.fontFamily;
    textBoxEl.style.fontSize = textBox.fontSize + 'px';
    textBoxEl.style.color = textBox.fontColor;
    textBoxEl.style.fontWeight = textBox.fontWeight;
    textBoxEl.style.fontStyle = textBox.fontStyle;
    textBoxEl.style.textDecoration = textBox.textDecoration;

    // 文字內容
    const textContent = document.createElement('div');
    textContent.textContent = textBox.text;
    textBoxEl.appendChild(textContent);

    // 文字框編號
    const indexEl = document.createElement('div');
    indexEl.className = 'text-index';
    indexEl.textContent = index + 1;
    textBoxEl.appendChild(indexEl);

    // 添加四個角的調整控點
    const corners = ['nw', 'ne', 'sw', 'se'];
    corners.forEach(corner => {
        const resizer = document.createElement('div');
        resizer.className = `resizer resizer-${corner}`;
        resizer.dataset.corner = corner;
        textBoxEl.appendChild(resizer);

        // 添加調整大小的事件監聽器
        resizer.addEventListener('mousedown', function(e) {
            startResize(e, 'text');
        });
    });

    // 添加拖曳事件監聽器
    textBoxEl.addEventListener('mousedown', function(e) {
        if (e.target.className.includes('resizer')) return;
        startDrag(e, 'text');
    });

    // 雙擊編輯文字
    textBoxEl.addEventListener('dblclick', function() {
        openTextEditor(index);
    });

    imageWrapper.appendChild(textBoxEl);

    // 繪製文字到 Canvas
    drawTextToCanvas(textBox);
}

// 繪製文字到 Canvas
function drawTextToCanvas(textBox) {
    if (!editCtx) return;

    // 設置字體屬性
    let fontStyle = '';
    if (textBox.fontWeight === 'bold') fontStyle += 'bold ';
    if (textBox.fontStyle === 'italic') fontStyle += 'italic ';
    fontStyle += textBox.fontSize + 'px ' + textBox.fontFamily;

    editCtx.font = fontStyle;
    editCtx.fillStyle = textBox.fontColor;
    editCtx.textBaseline = 'top';

    // 繪製文字
    const lines = textBox.text.split('\n');
    const lineHeight = textBox.fontSize * 1.2;

    lines.forEach((line, i) => {
        editCtx.fillText(line, textBox.x + 5, textBox.y + 5 + (i * lineHeight));
    });

    // 添加底線（如果有）
    if (textBox.textDecoration === 'underline') {
        editCtx.beginPath();
        lines.forEach((line, i) => {
            const textWidth = editCtx.measureText(line).width;
            editCtx.moveTo(textBox.x + 5, textBox.y + 5 + ((i + 1) * lineHeight) - 2);
            editCtx.lineTo(textBox.x + 5 + textWidth, textBox.y + 5 + ((i + 1) * lineHeight) - 2);
        });
        editCtx.strokeStyle = textBox.fontColor;
        editCtx.lineWidth = 1;
        editCtx.stroke();
    }
}

// 重新繪製所有文字
function redrawAllTextBoxes() {
    if (!editCtx) return;

    textBoxes.forEach(textBox => {
        drawTextToCanvas(textBox);
    });
}

// 開啟文字編輯器
function openTextEditor(index) {
    const textBox = textBoxes[index];
    currentTextBoxIndex = index;

    // 設置文字編輯器的內容
    textContentTextarea.value = textBox.text;
    fontFamilySelect.value = textBox.fontFamily;
    fontSizeInput.value = textBox.fontSize;
    fontColorInput.value = textBox.fontColor;
    fontWeightSelect.value = textBox.fontWeight;
    fontItalicCheckbox.checked = textBox.fontStyle === 'italic';
    fontUnderlineCheckbox.checked = textBox.textDecoration === 'underline';

    // 顯示文字編輯器和遮罩
    textEditor.style.display = 'block';
    modalOverlay.style.display = 'block';
}

// 儲存文字內容
function saveTextContent() {
    if (currentTextBoxIndex === null) return;

    const textBox = textBoxes[currentTextBoxIndex];

    // 更新文字框的屬性
    textBox.text = textContentTextarea.value;
    textBox.fontFamily = fontFamilySelect.value;
    textBox.fontSize = parseInt(fontSizeInput.value, 10);
    textBox.fontColor = fontColorInput.value;
    textBox.fontWeight = fontWeightSelect.value;
    textBox.fontStyle = fontItalicCheckbox.checked ? 'italic' : 'normal';
    textBox.textDecoration = fontUnderlineCheckbox.checked ? 'underline' : 'none';

    // 更新 DOM 元素
    const textBoxEl = document.querySelector(`.text-box[data-index="${currentTextBoxIndex}"]`);
    const textContentEl = textBoxEl.querySelector('div:not(.text-index):not(.resizer)');
    textContentEl.textContent = textBox.text;
    textBoxEl.style.fontFamily = textBox.fontFamily;
    textBoxEl.style.fontSize = textBox.fontSize + 'px';
    textBoxEl.style.color = textBox.fontColor;
    textBoxEl.style.fontWeight = textBox.fontWeight;
    textBoxEl.style.fontStyle = textBox.fontStyle;
    textBoxEl.style.textDecoration = textBox.textDecoration;

    // 重新繪製編輯 Canvas
    if (editCtx) {
        // 清除舊的文字區域
        editCtx.drawImage(img, textBox.x, textBox.y, textBox.width, textBox.height,
                           textBox.x, textBox.y, textBox.width, textBox.height);

        // 重新應用所有去背效果
        erasers.forEach(eraser => {
            applyEraserToCanvas(eraser);
        });

        // 繪製新的文字
        drawTextToCanvas(textBox);
    }

    // 關閉文字編輯器
    closeTextEditor();
}

// 取消文字編輯
function cancelTextEditor() {
    closeTextEditor();
}

// 關閉文字編輯器
function closeTextEditor() {
    textEditor.style.display = 'none';
    modalOverlay.style.display = 'none';
    currentTextBoxIndex = null;
}

// 開始拖曳元素
function startDrag(e, type) {
    isDragging = true;
    dragType = type;
    dragIndex = parseInt(e.currentTarget.dataset.index, 10);
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    e.preventDefault();
}

// 開始調整大小
function startResize(e, type) {
    isResizing = true;
    resizeElementType = type;
    resizeIndex = parseInt(e.target.parentElement.dataset.index, 10);
    resizeType = e.target.dataset.corner;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;

    let element;
    if (type === 'cropper') {
        element = croppers[resizeIndex];
    } else if (type === 'eraser') {
        element = erasers[resizeIndex];
    } else if (type === 'text') {
        element = textBoxes[resizeIndex];
    }

    originalWidth = element.width;
    originalHeight = element.height;
    originalX = element.x;
    originalY = element.y;

    e.stopPropagation();
    e.preventDefault();
}

// 鼠標移動處理
function onMouseMove(e) {
    if (isDragging) {
        dragElement(e);
    } else if (isResizing) {
        resizeElement(e);
    }
}

// 鼠標釋放處理
function onMouseUp() {
    isDragging = false;
    isResizing = false;
}

// 拖曳元素
function dragElement(e) {
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    let element, domElement;

    if (dragType === 'cropper') {
        element = croppers[dragIndex];
        domElement = document.querySelector(`.cropper[data-index="${dragIndex}"]`);
    } else if (dragType === 'eraser') {
        element = erasers[dragIndex];
        domElement = document.querySelector(`.eraser[data-index="${dragIndex}"]`);
    } else if (dragType === 'text') {
        element = textBoxes[dragIndex];
        domElement = document.querySelector(`.text-box[data-index="${dragIndex}"]`);
    }

    if (!element || !domElement) return;

    // 計算新位置，確保在圖片範圍內
    let newX = Math.max(0, element.x + deltaX);
    let newY = Math.max(0, element.y + deltaY);

    // 確保不會超出圖片範圍
    if (newX + element.width > img.naturalWidth) {
        newX = img.naturalWidth - element.width;
    }

    if (newY + element.height > img.naturalHeight) {
        newY = img.naturalHeight - element.height;
    }

    // 確保座標是偶數
    newX = ensureEven(newX);
    newY = ensureEven(newY);

    // 更新元素位置
    element.x = newX;
    element.y = newY;

    // 更新 DOM 元素位置
    domElement.style.left = newX + 'px';
    domElement.style.top = newY + 'px';

    // 如果是去背區域，則更新編輯 Canvas
    if (dragType === 'eraser') {
        // 清除原有圖像
        editCtx.drawImage(img, 0, 0);

        // 重新應用所有去背效果
        erasers.forEach(e => applyEraserToCanvas(e));
    }

    // 如果是文字框，則更新 Canvas 中的文字
    if (dragType === 'text') {
        // 清除原有圖像
        editCtx.drawImage(img, 0, 0);

        // 重新應用所有去背效果
        erasers.forEach(e => applyEraserToCanvas(e));

        // 重新繪製所有文字
        redrawAllTextBoxes();
    }

    // 更新拖曳起始點
    dragStartX = e.clientX;
    dragStartY = e.clientY;
}

// 調整元素大小
function resizeElement(e) {
    const deltaX = e.clientX - resizeStartX;
    const deltaY = e.clientY - resizeStartY;

    let element, domElement;

    if (resizeElementType === 'cropper') {
        element = croppers[resizeIndex];
        domElement = document.querySelector(`.cropper[data-index="${resizeIndex}"]`);
    } else if (resizeElementType === 'eraser') {
        element = erasers[resizeIndex];
        domElement = document.querySelector(`.eraser[data-index="${resizeIndex}"]`);
    } else if (resizeElementType === 'text') {
        element = textBoxes[resizeIndex];
        domElement = document.querySelector(`.text-box[data-index="${resizeIndex}"]`);
    }

    if (!element || !domElement) return;

    let newWidth, newHeight, newX, newY;

    switch (resizeType) {
        case 'se':
            newWidth = originalWidth + deltaX;
            if (resizeElementType === 'cropper' && lockRatio) {
                newHeight = newWidth / currentAspectRatio;
            } else {
                newHeight = originalHeight + deltaY;
            }
            newX = originalX;
            newY = originalY;
            break;
        case 'sw':
            newWidth = originalWidth - deltaX;
            if (resizeElementType === 'cropper' && lockRatio) {
                newHeight = newWidth / currentAspectRatio;
            } else {
                newHeight = originalHeight + deltaY;
            }
            newX = originalX + originalWidth - newWidth;
            newY = originalY;
            break;
        case 'ne':
            newWidth = originalWidth + deltaX;
            if (resizeElementType === 'cropper' && lockRatio) {
                newHeight = newWidth / currentAspectRatio;
            } else {
                newHeight = originalHeight - deltaY;
            }
            newX = originalX;
            newY = originalY + originalHeight - newHeight;
            break;
        case 'nw':
            newWidth = originalWidth - deltaX;
            if (resizeElementType === 'cropper' && lockRatio) {
                newHeight = newWidth / currentAspectRatio;
            } else {
                newHeight = originalHeight - deltaY;
            }
            newX = originalX + originalWidth - newWidth;
            newY = originalY + originalHeight - newHeight;
            break;
    }

    // 確保尺寸合理
    newWidth = Math.max(20, Math.min(newWidth, img.naturalWidth - newX));
    newHeight = Math.max(20, Math.min(newHeight, img.naturalHeight - newY));

    // 如果是裁切框且鎖定比例，根據寬度重新計算高度
    if (resizeElementType === 'cropper' && lockRatio) {
        if (resizeType.includes('n') || resizeType.includes('s')) {
            newWidth = newHeight * currentAspectRatio;
        } else {
            newHeight = newWidth / currentAspectRatio;
        }

        // 確保尺寸不超出圖片
        if (newX + newWidth > img.naturalWidth) {
            newWidth = img.naturalWidth - newX;
            newHeight = newWidth / currentAspectRatio;
        }

        if (newY + newHeight > img.naturalHeight) {
            newHeight = img.naturalHeight - newY;
            newWidth = newHeight * currentAspectRatio;
        }
    }

    // 確保尺寸是偶數像素
    newWidth = ensureEven(newWidth);
    newHeight = ensureEven(newHeight);
    newX = ensureEven(newX);
    newY = ensureEven(newY);

    // 更新元素
    element.width = newWidth;
    element.height = newHeight;
    element.x = newX;
    element.y = newY;

    // 更新 DOM 元素
    domElement.style.width = newWidth + 'px';
    domElement.style.height = newHeight + 'px';
    domElement.style.left = newX + 'px';
    domElement.style.top = newY + 'px';

    // 如果是裁切框，更新最後一個裁切框的數據
    if (resizeElementType === 'cropper') {
        lastCropper = {...element};
    }

    // 如果是去背區域，則更新編輯 Canvas
    if (resizeElementType === 'eraser') {
        // 清除原有圖像
        editCtx.drawImage(img, 0, 0);

        // 重新應用所有去背效果
        erasers.forEach(e => applyEraserToCanvas(e));
    }

    // 如果是文字框，則更新 Canvas 中的文字
    if (resizeElementType === 'text') {
        // 清除原有圖像
        editCtx.drawImage(img, 0, 0);

        // 重新應用所有去背效果
        erasers.forEach(e => applyEraserToCanvas(e));

        // 重新繪製所有文字
        redrawAllTextBoxes();
    }
}

// 裁切全部並下載
function cropAllAndDownload() {
    if (!sourceImage || croppers.length === 0) return;

    // 創建一個壓縮包來存放多張圖片
    const zip = new JSZip();
    let counter = 0;

    // 建立一個臨時 canvas 用於裁切
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');

    // 處理每個裁切區域
    croppers.forEach((cropper, index) => {
        // 設置 canvas 大小為裁切區域大小
        tempCanvas.width = cropper.width;
        tempCanvas.height = cropper.height;

        // 繪製裁切區域到 canvas
        if (editCanvas && croppers.length > 0) {
            // 從編輯後的圖像裁切
            ctx.drawImage(
                editCanvas,
                cropper.x, cropper.y, cropper.width, cropper.height,
                0, 0, cropper.width, cropper.height
            );
        } else {
            // 從原始圖像裁切
            ctx.drawImage(
                img,
                cropper.x, cropper.y, cropper.width, cropper.height,
                0, 0, cropper.width, cropper.height
            );
        }

        // 轉換 canvas 為圖片數據
        const imageData = tempCanvas.toDataURL('image/png');

        // 將圖片數據添加到壓縮包
        const fileName = `cropped_${index + 1}.png`;

        // 處理 base64 數據
        const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
        zip.file(fileName, base64Data, {base64: true});

        counter++;

        // 當所有裁切完成，生成壓縮包並下載
        if (counter === croppers.length) {
            zip.generateAsync({type: 'blob'}).then(function(content) {
                // 下載壓縮包
                const originalFileName = fileInput.files[0].name.split('.')[0];
                const zipName = `${originalFileName}_cropped.zip`;

                // 創建下載連結
                const a = document.createElement('a');
                a.href = URL.createObjectURL(content);
                a.download = zipName;
                a.click();
            });
        }
    });
}

// 下載原始圖片
function downloadOriginalImage() {
    if (!sourceImage) return;

    const a = document.createElement('a');
    a.href = sourceImage.src;
    a.download = fileInput.files[0].name;
    a.click();
}

// 下載編輯後圖片
function downloadEditedImage() {
    if (!editCanvas) return;

    // 將 canvas 轉換為圖片數據
    const imageData = editCanvas.toDataURL('image/png');

    // 創建下載連結
    const a = document.createElement('a');
    a.href = imageData;
    const originalFileName = fileInput.files[0].name.split('.');
    originalFileName.pop(); // 移除副檔名
    a.download = `${originalFileName.join('.')}_edited.png`;
    a.click();
}

// 清除裁切框
function clearCroppers() {
    croppers = [];

    // 移除所有裁切框元素
    const cropperElements = document.querySelectorAll('.cropper');
    cropperElements.forEach(el => el.remove());

    // 禁用相關按鈕
    cropAllBtn.disabled = true;
    clearCroppersBtn.disabled = true;
}

// 清除去背區域
function clearErasers() {
    erasers = [];

    // 移除所有去背區域元素
    const eraserElements = document.querySelectorAll('.eraser');
    eraserElements.forEach(el => el.remove());

    // 禁用相關按鈕
    clearErasersBtn.disabled = true;

    // 重置編輯 Canvas
    if (editCtx && img) {
        editCtx.drawImage(img, 0, 0);

        // 重新繪製所有文字
        redrawAllTextBoxes();
    }
}

// 清除文字框
function clearTextBoxes() {
    textBoxes = [];

    // 移除所有文字框元素
    const textBoxElements = document.querySelectorAll('.text-box');
    textBoxElements.forEach(el => el.remove());

    // 禁用相關按鈕
    clearTextsBtn.disabled = true;

    // 重置編輯 Canvas
    if (editCtx && img) {
        editCtx.drawImage(img, 0, 0);

        // 重新應用所有去背效果
        erasers.forEach(eraser => {
            applyEraserToCanvas(eraser);
        });
    }
}
