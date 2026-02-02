<template>
  <div class="draw-container">
    <div class="tools-panel">
      <!-- Dropdown za izbor alata -->
      <div class="dropdown-wrapper">
        <select v-model="tool" class="tool-dropdown">
          <option value="pencil">Pencil</option>
          <option value="eraser">Eraser</option>
        </select>
      </div>
      <input type="color" v-model="color" class="color-picker" v-if="tool === 'pencil'" />
      <button @click="clearCanvas" class="clear-button">Clear</button>
    </div>
    <div class="size-panel">
      <label for="size-input">Canvas Size:</label>
      <input
        id="size-input"
        type="number"
        v-model.number="canvasSize"
        @change="updateCanvasSize"
        min="1"
        max="24"
        class="size-input"
      />
      <span>x{{ canvasSize }}</span>
    </div>
    <div class="canvas">
      <div v-for="row in matrix" :key="row.id" class="row">
        <div
          v-for="cell in row.cells"
          :key="cell.id"
          class="cell"
          :style="{ backgroundColor: cell.color }"
          @mousedown="startDrawing(cell)"
          @mouseover="draw(cell)"
          @mouseup="stopDrawing"
        ></div>
      </div>
    </div>
    <div class="save-panel">
      <input
        type="text"
        v-model="drawingName"
        placeholder="Enter drawing name"
        class="name-input"
      />
      <button @click="saveDrawing" class="save-button">Save</button>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    const tool = ref('pencil');
    const color = ref('#000000');
    const drawing = ref(false);
    const canvasSize = ref(20); // Podrazumevana veličina kanvasa
    const matrix = ref([]);
    const defaultColor = ref('#ffffff');
    const drawingName = ref(''); // Dodajemo promenu za naziv crteža
    const errorMessage = ref(''); // Dodajemo promenu za prikaz greške

    const createMatrix = (rows, cols) => {
      return Array.from({ length: rows }, (_, rowIndex) => ({
        id: rowIndex,
        cells: Array.from({ length: cols }, (_, cellIndex) => ({
          id: cellIndex,
          color: defaultColor.value,
        })),
      }));
    };

    const initializeMatrix = (data) => {
      if (data) {
        const parsedData = JSON.parse(data);
        canvasSize.value = parsedData.length;
        matrix.value = createMatrix(canvasSize.value, canvasSize.value);

        for (let i = 0; i < parsedData.length; i++) {
          for (let j = 0; j < parsedData[i].length; j++) {
            matrix.value[i].cells[j].color = parsedData[i][j];
          }
        }
      } else {
        matrix.value = createMatrix(canvasSize.value, canvasSize.value);
      }
    };

    const updateCanvasSize = () => {
      // Validacija veličine
      if (canvasSize.value < 1) {
        canvasSize.value = 1;
      } else if (canvasSize.value > 24) {
        canvasSize.value = 24;
      }

      // Čuvanje trenutnog sadržaja kanvasa
      const oldMatrix = matrix.value;
      const newMatrix = createMatrix(canvasSize.value, canvasSize.value);

      // Kopiranje postojećih podataka u novu matricu
      for (let i = 0; i < Math.min(oldMatrix.length, newMatrix.length); i++) {
        for (let j = 0; j < Math.min(oldMatrix[i].cells.length, newMatrix[i].cells.length); j++) {
          newMatrix[i].cells[j].color = oldMatrix[i].cells[j].color;
        }
      }

      matrix.value = newMatrix;
    };

    const startDrawing = (cell) => {
      drawing.value = true;
      draw(cell);
    };

    const draw = (cell) => {
      if (drawing.value) {
        if (tool.value === 'pencil') {
          cell.color = color.value;
        } else if (tool.value === 'eraser') {
          cell.color = defaultColor.value;
        }
      }
    };

    const stopDrawing = () => {
      drawing.value = false;
    };

    const clearCanvas = () => {
      matrix.value = createMatrix(canvasSize.value, canvasSize.value);
    };

    const resetCanvas = () => {
      canvasSize.value = 20;
      matrix.value = createMatrix(20, 20);
    };

    const saveDrawing = async () => {
    if (!drawingName.value) {
        alert('Please enter a name for the drawing.');
        return;
    }

    if (drawingName.value.length < 1 || drawingName.value.length > 40) {
        alert('The drawing name must be between 1 and 40 characters.');
        return;
    }

    const pictureData = matrix.value.map(row => row.cells.map(cell => cell.color));

    // Validate picture_data dimensions
    const size = pictureData.length;
    if (size < 1 || size > 24 || !pictureData.every(row => row.length === size)) {
        alert('The drawing must be a square matrix with dimensions between 1x1 and 24x24.');
        return;
    }

    // Validate color format (#rgb or #rrggbb)
    const colorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    for (const row of pictureData) {
        if (!row.every(color => colorRegex.test(color))) {
            alert('Each cell must contain a valid color in #rgb or #rrggbb format.');
            return;
        }
    }

    try {
        const response = await fetch('https://raf-pixeldraw.aarsen.me/api/pictures', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Authentication token
            },
            body: JSON.stringify({
                name: drawingName.value,
                picture_data: pictureData
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.code === 'INVALID_DATA') {
                alert('Invalid drawing data. Please check the name and picture data.');
            } else if (errorData.code === 'BAD_PICTURE_DATA') {
                alert('The picture data is not formatted correctly.');
            } else if (errorData.code === 'NOT_AUTHENTICATED') {
                alert('You must be logged in to save a drawing.');
            } else {
                alert(`Failed to save drawing: ${errorData.code || 'Unknown error'}`);
            }
            throw new Error(errorData.code);
        }

        const result = await response.json();
        alert('Drawing saved successfully!');
        console.log('New Picture ID:', result.picture_id);
        errorMessage.value = '';
    } catch (error) {
        console.error('Save drawing error:', error);
        errorMessage.value = error.message;
    }
};


    watch(route, (newRoute, oldRoute) => {
      if (newRoute.path === '/pojedinacnaSlika' && newRoute.query.data === undefined) {
        resetCanvas();
      }
    });

    onMounted(() => {
      const data = route.query.data;
      initializeMatrix(data);
      window.addEventListener('mouseup', stopDrawing);
    });

    return {
      tool,
      color,
      drawing,
      canvasSize,
      matrix,
      defaultColor,
      drawingName,
      errorMessage,
      createMatrix,
      initializeMatrix,
      updateCanvasSize,
      startDrawing,
      draw,
      stopDrawing,
      clearCanvas,
      resetCanvas,
      saveDrawing
    };
  },
};
</script>

<style scoped>
.draw-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 80px);
  padding: 20px;
  box-sizing: border-box;
}

.tools-panel {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.size-panel {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.size-input {
  width: 60px;
  padding: 5px;
  font-size: 16px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.size-input:focus {
  outline: none;
  border-color: #555;
}

.dropdown-wrapper {
  position: relative;
}

.tool-dropdown {
  padding: 10px 20px;
  background-color: #ff006f;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
  appearance: none;
  width: 85px;
  text-align: center;
  text-align-last: center;
}

.tool-dropdown option {
  background-color: #eb12d5;
  color: #fff;
  text-align: center;
  text-align-last: center;
}

.tool-dropdown:hover {
  background-color: #555;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.color-picker {
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: currentColor;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.clear-button {
  padding: 10px 20px;
  background-color: #ff006f;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
  width: 85px;
}

.clear-button:hover {
  background-color: #555;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.canvas {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  user-select: none;
  background-color: #ffffff;
}

.row {
  display: flex;
  user-select: none;
}

.cell {
  width: 20px;
  height: 20px;
  border: 1px solid #ddd;
  user-select: none;
}

.save-panel {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.name-input {
  width: 200px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.name-input:focus {
  outline: none;
  border-color: #555;
}

.save-button {
  padding: 10px 20px;
  background-color: #ff006f;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
}

.save-button:hover {
  background-color: #555;
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.error-message {
  color: red;
  margin-top: 10px;
}

</style>