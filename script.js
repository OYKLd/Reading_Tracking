class ReadingTracker {
    constructor() {
        this.books = this.loadBooks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Formulaire d'ajout
        const bookForm = document.getElementById('bookForm');
        if (bookForm) {
            bookForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addBook();
            });
        }

        // Filtres
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.filter);
                this.updateFilterButtons(btn);
            });
        });
    }

    // Gestion des livres
    addBook() {
        const titleInput = document.getElementById('title');
        const authorInput = document.getElementById('author');

        const title = titleInput.value.trim();
        const author = authorInput.value.trim();

        if (!title || !author) {
            this.showMessage('Veuillez remplir tous les champs', 'error');
            return;
        }

        const book = {
            id: Date.now().toString(),
            title: title,
            author: author,
            status: 'to-read',
            addedDate: new Date().toISOString()
        };

        this.books.push(book);
        this.saveBooks();
        this.render();

        // Réinitialiser le formulaire
        titleInput.value = '';
        authorInput.value = '';
        titleInput.focus();

        this.showMessage('Livre ajouté avec succès !', 'success');
    }

    updateBookStatus(bookId, newStatus) {
        const book = this.books.find(b => b.id === bookId);
        if (book) {
            book.status = newStatus;
            this.saveBooks();
            this.render();
            
            const statusMessages = {
                'to-read': 'Marqué comme "à lire"',
                'reading': 'Marqué comme "en cours de lecture"',
                'completed': 'Marqué comme "terminé"'
            };
            
            this.showMessage(statusMessages[newStatus], 'success');
        }
    }

    deleteBook(bookId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
            this.books = this.books.filter(b => b.id !== bookId);
            this.saveBooks();
            this.render();
            this.showMessage('Livre supprimé', 'info');
        }
    }

    // Rendu
    render() {
        const booksList = document.getElementById('booksList');
        const emptyState = document.getElementById('emptyState');

        const filteredBooks = this.getFilteredBooks();

        if (filteredBooks.length === 0) {
            booksList.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            booksList.style.display = 'grid';
            emptyState.style.display = 'none';
            booksList.innerHTML = filteredBooks.map(book => this.createBookCard(book)).join('');
            this.bindBookEvents();
        }
    }

    createBookCard(book) {
        const statusLabels = {
            'to-read': 'À lire',
            'reading': 'En cours',
            'completed': 'Terminé'
        };

        const nextStatus = {
            'to-read': 'reading',
            'reading': 'completed',
            'completed': 'to-read'
        };

        const nextStatusLabels = {
            'to-read': 'Commencer',
            'reading': 'Terminer',
            'completed': 'Relire'
        };

        return `
            <div class="book-card status-${book.status}" data-book-id="${book.id}">
                <div class="book-header">
                    <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
                    <p class="book-author">${this.escapeHtml(book.author)}</p>
                </div>
                <div class="book-status status-${book.status}">
                    ${statusLabels[book.status]}
                </div>
                <div class="book-actions">
                    <button class="status-btn" onclick="tracker.updateBookStatus('${book.id}', '${nextStatus[book.status]}')">
                        ${nextStatusLabels[book.status]}
                    </button>
                    <button class="delete-btn" onclick="tracker.deleteBook('${book.id}')">
                        Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    bindBookEvents() {
        // Les événements sont gérés via les attributs onclick dans le HTML
        // Cette approche est plus simple et évite les problèmes avec le DOM dynamique
    }

    // Filtres
    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    }

    updateFilterButtons(activeBtn) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    getFilteredBooks() {
        if (this.currentFilter === 'all') {
            return this.books;
        }
        return this.books.filter(book => book.status === this.currentFilter);
    }

    // Stockage local
    saveBooks() {
        try {
            localStorage.setItem('readingBooks', JSON.stringify(this.books));
        } catch (e) {
            console.error('Erreur lors de la sauvegarde:', e);
            this.showMessage('Erreur lors de la sauvegarde des données', 'error');
        }
    }

    loadBooks() {
        try {
            const saved = localStorage.getItem('readingBooks');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Erreur lors du chargement:', e);
            return [];
        }
    }

    // Utilitaires
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        // Créer un toast simple
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#82b366' : type === 'error' ? '#e74c3c' : '#88b0d3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-weight: 500;
        `;

        document.body.appendChild(toast);

        // Animation d'entrée
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto-suppression
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialiser l'application
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new ReadingTracker();
});

// Ajouter quelques styles pour les toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(toastStyles);