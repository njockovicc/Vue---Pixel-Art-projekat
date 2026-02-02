<template>
  <div class="gallery-container">
    <h1>Moja Galerija</h1>
    <div v-if="loading">Učitavanje...</div>
    <div v-if="pictures.length === 0 && !loading">Nema crteža za prikazivanje.</div>
    <div class="pictures">
      <div v-for="picture in pictures" :key="picture.picture_id" class="picture-card">
        <div
          class="canvas"
          :style="{
            width: '300px',
            height: '300px',
            display: 'grid',
            gridTemplateColumns: `repeat(${picture.width}, 1fr)`,
            gridTemplateRows: `repeat(${picture.height}, 1fr)`
          }"
        >
          <div
            v-for="(row, x) in picture.picture_data"
            :key="x"
            class="row"
            style="display: flex; width: 100%;"
          >
            <div
              v-for="(color, y) in row"
              :key="y"
              class="cell"
              :style="{
                backgroundColor: color,
                border: '1px solid black',
                width: '100%',
                height: '100%'
              }"
            ></div>
          </div>
        </div>
        <div class="picture-info-wrapper">
          <h3 class="picture-title">{{ picture.name }}</h3>
          <p class="picture-info">
            <span class="author-link">
              {{ picture.author.username }}
            </span>
            ·
            {{ new Date(picture.created_at).toLocaleString() }}
          </p>
          <button @click="viewDrawing(picture)" class="open-drawing-btn">Otvori crtez</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';

interface Picture {
  picture_id: number;
  name: string;
  author: {
    username: string;
  };
  created_at: string;
  width: number;
  height: number;
  picture_data: string[][]; 
}

const pictures = ref<Picture[]>([]);
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();

const fetchAllPictures = async () => {
  loading.value = true;
  let page = 1;
  let allPictures: Picture[] = [];
  const limit = 10;


  if (!authStore.isLoggedIn || !authStore.user) {
    console.log("Korisnik nije ulogovan");
    pictures.value = [];
    loading.value = false;
    return;
  }

  try {
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await axios.get('https://raf-pixeldraw.aarsen.me/api/pictures/', {
        headers: {
          Authorization: `Bearer ${authStore.user.token}`,
        },
        params: {
          page: page,
          limit: limit,
        },
      });

      if (response.data.pictures && Array.isArray(response.data.pictures)) {
        const filteredPictures = response.data.pictures.filter((picture: Picture) => {
        return authStore.user && picture.author.username === authStore.user.username;
        });

        allPictures = [...allPictures, ...filteredPictures];


        hasMorePages = response.data.pictures.length === limit;
        page++;
      } else {
        hasMorePages = false;
      }
    }


    pictures.value = allPictures;

  } catch (error) {
    console.error("Greška prilikom učitavanja slika:", error);
  } finally {
    loading.value = false;
  }
};

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



onMounted(fetchAllPictures);
</script>

<style scoped>

.gallery-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

.pictures {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  padding-top: 20px;
  width: 100%;
  max-width: 1200px;
}

.picture-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(104, 13, 13, 0.1);
  padding: 15px;
  text-align: center;
}

.canvas {
  width: 100%;
  height: 100px;
  display: grid;
  grid-gap: 0.5px; /* Tanjiji razmak između ćelija */
}

.cell {
  border: 0.5px solid #bbb; /* Tanja, svetlija linija (koristi sivu boju #bbb) */
  transition: background-color 0.3s; /* Glatka promena boje pri hoveru */
}

.cell:hover {
  background-color: #ddd; /* Svetlija boja pri hoveru */
}
.picture-info-wrapper {
  text-align: center;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-grow: 1;
  gap: 10px;
}

.picture-title {
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0;
}

.picture-info {
  font-size: 12px;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.open-drawing-btn {
  background-color: #ff006f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.open-drawing-btn:hover {
  background-color: #ff006f;
}

.author-link {
  color: #ff006f;
  cursor: pointer;
}

.author-link:hover {
  color: #ff006f;
}
</style>