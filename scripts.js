document.getElementById('createButton').addEventListener('click', function() {
    document.getElementById('canvasForm').classList.remove('hidden');
});

document.getElementById('generateCanvasButton').addEventListener('click', function() {
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    
    const canvasContainer = document.getElementById('canvasContainer');
    const designCanvas = document.getElementById('designCanvas');
    
    designCanvas.width = width;
    designCanvas.height = height;

    canvasContainer.classList.remove('hidden');
    document.getElementById('canvasForm').classList.add('hidden');
    document.getElementById('toolbar').classList.remove('hidden');
});

const tools = document.querySelectorAll('.tool');
const canvasContainer = document.getElementById('designCanvasWrapper');
const errorSound = document.getElementById('errorSound');

tools.forEach(tool => {
    tool.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('shape', e.target.dataset.shape);
        if (e.target.dataset.type === 'image') {
            e.dataTransfer.setData('imageUrl', ''); // Reset imageUrl
        }
    });
});

canvasContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
});

canvasContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const shape = e.dataTransfer.getData('shape');
    const x = e.offsetX;
    const y = e.offsetY;

    if (shape === 'image') {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                createImage(event.target.result, x, y);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Lütfen bir resim dosyası sürükleyip bırakın.');
        }
    } else {
        createShape(shape, x, y);
    }
});

function createShape(shape, x, y) {
    const shapeElement = document.createElement('div');
    shapeElement.classList.add('draggable');
    shapeElement.style.left = `${x}px`;
    shapeElement.style.top = `${y}px`;

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => {
        shapeElement.remove();
    });

    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle');
    resizeHandle.innerHTML = '↔';

    shapeElement.appendChild(deleteBtn);
    shapeElement.appendChild(resizeHandle);

    switch(shape) {
        case 'square':
            shapeElement.style.width = '50px';
            shapeElement.style.height = '50px';
            shapeElement.style.backgroundColor = 'black';
            break;
        case 'circle':
            shapeElement.style.width = '50px';
            shapeElement.style.height = '50px';
            shapeElement.style.backgroundColor = 'black';
            shapeElement.style.borderRadius = '50%';
            break;
        case 'rectangle':
            shapeElement.style.width = '100px';
            shapeElement.style.height = '50px';
            shapeElement.style.backgroundColor = 'black';
            break;
    }

    makeElementDraggable(shapeElement);
    makeElementResizable(shapeElement, resizeHandle);
    canvasContainer.appendChild(shapeElement);
}

function createImage(url, x, y) {
    const imgElement = document.createElement('img');
    imgElement.classList.add('draggable');
    imgElement.style.position = 'absolute'; // Ensure absolute positioning
    imgElement.style.left = `${x}px`;
    imgElement.style.top = `${y}px`;

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => {
        imgElement.remove();
    });

    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle');
    resizeHandle.innerHTML = '↔';

    imgElement.appendChild(deleteBtn);
    imgElement.appendChild(resizeHandle);

    imgElement.src = url;
    canvasContainer.appendChild(imgElement);
    makeElementDraggable(imgElement);
    makeElementResizable(imgElement, resizeHandle);
}

function makeElementDraggable(el) {
    el.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('resize-handle') || e.target.classList.contains('delete-btn')) {
            return;
        }

        const offset = {
            left: el.offsetLeft - e.clientX,
            top: el.offsetTop - e.clientY
        };

        function mouseMoveHandler(e) {
            el.style.left = `${e.clientX + offset.left}px`;
            el.style.top = `${e.clientY + offset.top}px`;

            const rect = canvasContainer.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();

            if (elRect.left < rect.left || elRect.right > rect.right || elRect.top < rect.top || elRect.bottom > rect.bottom) {
                errorSound.play();
                el.style.left = `${rect.width / 2 - el.offsetWidth / 2}px`;
                el.style.top = `${rect.height / 2 - el.offsetHeight / 2}px`;
                reset();
            }
        }

        function reset() {
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', reset);
        }

        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', reset);
    });
}

function makeElementResizable(el, handle) {
    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(document.defaultView.getComputedStyle(el).width, 10);
        const startHeight = parseInt(document.defaultView.getComputedStyle(el).height, 10);

        function doDrag(e) {
            const newWidth = startWidth + e.clientX - startX;
            const newHeight = startHeight + e.clientY - startY;

            el.style.width = `${newWidth}px`;
            el.style.height = `${newHeight}px`;
        }

        function stopDrag() {
            window.removeEventListener('mousemove', doDrag);
            window.removeEventListener('mouseup', stopDrag);
        }

        window.addEventListener('mousemove', doDrag);
        window.addEventListener('mouseup', stopDrag);
    });
}
