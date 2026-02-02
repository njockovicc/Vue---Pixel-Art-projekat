<script setup lang="ts">
import { useDrawingStore } from '@/stores/drawingStore';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const drawingStore = useDrawingStore();
const itemsPerPage = 9; // Podesite broj stavki po stranici
const router = useRouter();
const currentPage = ref(1);

const showDeleteConfirmation = ref(false);
const pictureIdToDelete = ref<string | null>(null);

const totalPages = computed(() => Math.ceil(drawingStore.totalDrawings / itemsPerPage));

const paginationPages = computed(() => {
  const startPage = Math.max(1, currentPage.value - 4);
  const endPage = Math.min(totalPages.value, currentPage.value + 5);
  let pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

// Funkcija za promenu stranice
const changePage = async (pageNumber: number) => {
  currentPage.value = pageNumber;
  await drawingStore.getDrawings(pageNumber, itemsPerPage);
  window.scrollTo(0, 0); // Prebacuje na vrh stranice
};

// Funkcija za učitavanje crteža na početku
onMounted(async () => {
  const query = router.currentRoute.value.query;
  if (query.author) {
    drawingStore.setAuthorFilter(query.author as string);
  } else {
    await drawingStore.getDrawings(currentPage.value, itemsPerPage); // Učitavamo crteže bez filtriranja po autoru
  }
});

const username = ref(localStorage.getItem('username'));

// Funkcija za proveru da li je trenutni korisnik autor
const isCurrentUser = (authorUsername: string) => {
  return authorUsername === username.value;
};

// Funkcija za generisanje URL-a slike
const getImageUrl = (pictureId: string) => {
  return `https://raf-pixeldraw.aarsen.me/api/pictures/${pictureId}`; // URL za slike
};

// Funkcija za filtriranje crteža po autoru
const filterByAuthor = (authorId: string) => {
  drawingStore.setAuthorFilter(authorId); // Postavljamo filter za autora
  router.push({ query: { author: authorId } }); // Dodavanje query parametra za autora
};

// Funkcija za formatiranje datuma
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

// Funkcija za otvaranje crteža u Draw stranici
const viewDrawing = (drawing: any) => {
  router.push({
    path: '/crtanje',
    query: {
      picture_id: drawing.picture_id,
      data: JSON.stringify(drawing.picture_data),
      name: drawing.name,
      author: drawing.author.username,
      created_at: drawing.created_at
    }
  });
};

// Define the types for API responses
interface ErrorData {
  code: string; // Error code returned by the API
}

interface UpdatePictureRes {
  failed: boolean; // Indicates if the update was successful
}

// Update the renameDrawing function
const renameDrawing = async (pictureId: string) => {
  const newName = prompt('Enter new name for the drawing:');
  if (newName) {
    try {
      const response = await fetch(`https://raf-pixeldraw.aarsen.me/api/pictures/${pictureId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newName })
      });

      if (!response.ok) {
        const errorData: ErrorData = await response.json();
        throw new Error(errorData.code);
      }

      const responseData: UpdatePictureRes = await response.json();
      if (responseData.failed === false) {
        alert('Drawing renamed successfully!');
      }

      await drawingStore.getDrawings(currentPage.value, itemsPerPage); // Refresh drawings
    } catch (error: any) {
      const errorMessageMap = {
        NOT_YOURS: 'You do not own this drawing.',
        NO_SUCH_ENTITY: 'The drawing does not exist.',
        INVALID_DATA: 'Invalid data provided for renaming.',
        BAD_PICTURE_DATA: 'The new name contains invalid characters or is too long.',
        NOT_AUTHENTICATED: 'You are not authenticated.'
      };

      const errorMessage = errorMessageMap[error.message] || 'Failed to rename the drawing.';
      alert(errorMessage);
    }
  }
};




// Funkcija za potvrdu brisanja crteža
const confirmDelete = (pictureId: string) => {
  showDeleteConfirmation.value = true;
  pictureIdToDelete.value = pictureId;
};

// Funkcija za brisanje crteža
const deleteDrawing = async () => {
  if (pictureIdToDelete.value) {
    try {
      const response = await fetch(`https://raf-pixeldraw.aarsen.me/api/pictures/${pictureIdToDelete.value}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMap: { [key: string]: string } = {
          NOT_YOURS: 'You do not own this drawing.',
          NO_SUCH_ENTITY: 'The drawing does not exist.',
          NOT_AUTHENTICATED: 'You are not authenticated.'
        };
        throw new Error(errorMap[errorData.code] || 'Failed to delete the drawing.');
      }

      const responseData: { failed: false } = await response.json();
      if (responseData.failed === false) {
        alert('Drawing deleted successfully!');
      }

      await drawingStore.getDrawings(currentPage.value, itemsPerPage); // Osveži crteže
      showDeleteConfirmation.value = false;
      pictureIdToDelete.value = null;
    } catch (error: any) {
      alert(error.message || 'An unexpected error occurred.');
    }
  }
};


// Funkcija za otkazivanje brisanja crteža
const cancelDelete = () => {
  showDeleteConfirmation.value = false;
  pictureIdToDelete.value = null;
};
</script>

<template>
  <div class="gallery">
    <h1> galerija</h1>
   

    <!-- Prikaz učitavanja -->
    <div v-if="drawingStore.loading" class="loading">Loading...</div>

    <!-- Poruka ako ima greške -->
    <div v-if="drawingStore.error" class="error">{{ drawingStore.error }}</div>

    <!-- Lista crteža -->
    <div class="drawings">
      <div v-for="drawing in drawingStore.drawings" :key="drawing.picture_id" class="drawing">
        <div class="pixel-art" @click="viewDrawing(drawing)" :style="{ gridTemplateColumns: `repeat(${drawing.picture_data[0].length}, 12px)` }">
          <div v-for="(row, rowIndex) in drawing.picture_data" :key="rowIndex" class="pixel-row">
            <div v-for="(color, colIndex) in row" :key="colIndex" class="pixel" :style="{ backgroundColor: color }"></div>
          </div>
        </div>
        <div class="info-container">
          <button class="view-button" @click="viewDrawing(drawing)">Prikazi</button>

            <button @click="renameDrawing(drawing.picture_id)" class="view-button">Preimenuj</button>

            <button @click="confirmDelete(drawing.picture_id)" class="view-button">Obriši</button>
          
         
          <div class="info-row">
            <span class="drawing-info">{{ drawing.name }}</span>
            <span class="drawing-info">By: 
              <span @click="filterByAuthor(drawing.author.user_id)" class="author-link">
                {{ drawing.author.username }}
              </span>
            </span>
            <span class="drawing-info">{{ formatDate(drawing.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginacija -->
    <ul class="pagination" id="pagination">
      <li v-if="currentPage > 1" class="page-item">
        <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
      </li>
      <li v-for="page in paginationPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
        <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
      </li>
      <li v-if="currentPage < totalPages" class="page-item">
        <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
      </li>
    </ul>

    <!-- Ako nema crteža -->
    <div v-if="drawingStore.drawings.length === 0">No drawings available.</div>
  </div>

  <!-- Modal za potvrdu brisanja -->
  <div v-if="showDeleteConfirmation" class="modal">
    <p>Are you sure you want to delete this drawing?</p>
    <button @click="deleteDrawing" class="view-button">Yes</button>
    <button @click="cancelDelete" class="view-button">No</button>
  </div>
</template>

<style scoped>
body {
  background-color: #ffffff; /* Svetla pozadina za celu stranicu */
  font-family: Arial, sans-serif;
  color: #343a40; /* Tamna boja teksta */
}

.navbar {
  background-color: #007bff; /* Plava pozadina za navbar */
  padding: 20px;
  text-align: center;
}

.navbar a {
  color: white;
  font-size: 1.25rem;
  text-decoration: none;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  list-style: none;
  padding: 0;
}

.pagination .page-item .page-link {
  background-color: #ffffff;
  color: #343a40;
  border: 1px solid #ff006f; /* Plavi border za paginaciju */
  padding: 10px 15px;
  border-radius: 8px;
  transition: background-color 0.3s, transform 0.2s ease-in-out;
}

.pagination .page-item.active .page-link {
  background-color: #ff006f;
  color: white;
  border-color: #ff006f;
}

.pagination .page-item:hover .page-link {
  background-color: #e0e0e0;
  color: #343a40;
  transform: scale(1.1);
}

.gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.drawings {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.drawing {
  background-color: #ffffff; /* Svetla pozadina za crteže */
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  color: #343a40;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s ease-in-out;
}

.drawing:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Senka pri hoveru */
}

.pixel-art {
  display: grid;
  gap: 0;
  justify-content: center;
  cursor: pointer;
}

.pixel-row {
  display: contents;
}

.pixel {
  width: 16px;
  height: 16px;
  border: 1px solid #bbb;
  transition: background-color 0.3s;
}

.pixel:hover {
  background-color: #ddd;
}

.info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px; /* Razmak između dugmadi */
  margin-top: 10px; /* Opcionalno, razmak kontejnera od drugih elemenata */
}

.view-button,
.delete-button {
  background-color: #ff006f;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s, transform 0.2s;
}

.view-button:hover,
.delete-button:hover {
  background-color: #ff005a; /* Blago tamnija boja pri hoveru */
  transform: scale(1.05);
}

.author-link {
  color: #ff006f;
  text-decoration: none;
}

.author-link:hover {
  text-decoration: underline;
}

.info-row {
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
  color: #555;
}

.info-row span {
  margin-right: 12px;
}

.loading,
.error {
  font-size: 1.5rem;
  color: red;
}

.actions {
  display: flex;
  gap: 10px;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  color: #343a40;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  text-align: center;
  border-radius: 10px;
}

.modal p {
  font-size: 1.2rem;
}

.modal .view-button {
  background-color: #ff006f;
  color: white;
}

</style>

