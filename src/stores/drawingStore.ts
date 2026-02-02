import { defineStore } from 'pinia';

export const useDrawingStore = defineStore('crtanje', {
  state: () => ({
    drawings: [] as Array<any>, // Crteži (array objekata)
    loading: false, // Flag za učitavanje
    error: null as string | null, // Greška pri učitavanju
    totalDrawings: 0, // Ukupno crteža
    currentAuthorFilter: null as string | null, // Trenutni filter za autora
  }),

  actions: {
    // Funkcija za učitavanje crteža sa mogućnošću filtriranja po autoru
    async getDrawings(page = 1, limit = 9, author: string | null = null) {
      this.loading = true;
      this.error = null;

      try {
        let url = `https://raf-pixeldraw.aarsen.me/api/pictures?page=${page}&limit=${limit}`;
        if (author) {
          url += `&author=${author}`;
        }

        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Accept': 'application/json', // Osigurava prihvatanje JSON odgovora
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('Fetching URL:', url); // Log za URL koji šaljete API-ju

        const response = await fetch(url, { headers });

        if (!response.ok) {
          throw new Error(`Failed to fetch drawings. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Log za API odgovor

        if (!data.pictures || data.pictures.length === 0) {
          this.error = 'No drawings available.';
          this.totalDrawings = 0;
        } else {
          this.drawings = data.pictures; // Ažurira listu crteža za trenutnu stranicu
          this.totalDrawings = data.total || 0;
        }
        return { drawings: this.drawings, total: this.totalDrawings };
      } catch (err) {
        const error = err as Error;
        console.error('Failed to load drawings:', error);
        this.error = `An error occurred while loading drawings: ${error.message}`;
        return { drawings: [], total: 0 };
      } finally {
        this.loading = false;
      }
    },

    // Postavljanje filtera za autora
    setAuthorFilter(authorId: string | null) {
      this.currentAuthorFilter = authorId; // Postavljamo ID autora za filtriranje
      this.getDrawings(1, 9, authorId); // Ponovno učitavanje crteža sa novim filterom
    },

    // Funkcija za promenu imena crteža
    async renameDrawing(pictureId: string, newName: string) {
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // Osigurava prihvatanje JSON odgovora
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`https://raf-pixeldraw.aarsen.me/api/pictures/${pictureId}`, {
          method: 'PATCH', // API koristi PATCH za ažuriranje
          headers,
          body: JSON.stringify({ name: newName }),
        });

        if (!response.ok) {
          throw new Error(`Failed to rename drawing. Status: ${response.status}`);
        }

        // Ažuriranje lokalne kopije crteža
        this.drawings = this.drawings.map(drawing =>
          drawing.picture_id === pictureId ? { ...drawing, name: newName } : drawing
        );
      } catch (error) {
        console.error('Failed to rename drawing:', error);
      }
    },

    // Funkcija za brisanje crteža
    async deleteDrawing(pictureId: string) {
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Accept': 'application/json', // Osigurava prihvatanje JSON odgovora
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`https://raf-pixeldraw.aarsen.me/api/pictures/${pictureId}`, {
          method: 'DELETE',
          headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to delete drawing. Status: ${response.status}`);
        }

        // Uklanjanje crteža iz lokalne kopije
        this.drawings = this.drawings.filter(drawing => drawing.picture_id !== pictureId);
      } catch (error) {
        console.error('Failed to delete drawing:', error);
      }
    },

    // Funkcija za resetovanje kanvasa
    resetCanvas() {
      // Logika za resetovanje kanvasa
      this.drawings = []; // Postavlja crteže na prazan niz
    },
  },
});