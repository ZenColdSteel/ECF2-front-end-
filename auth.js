// Configuration de l'API
const API_URL = 'http://localhost:3000/api';

// Vérifier si l'utilisateur est connecté
function checkAuth() {
    const token = localStorage.getItem('token');
    
    // Si on est sur la page de connexion ou d'inscription et qu'on a un token, rediriger vers l'index
    if ((window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) && token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Si on n'est pas sur la page de connexion ou d'inscription et qu'on n'a pas de token, rediriger vers login
    if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html') && !token) {
        window.location.href = 'login.html';
        return;
    }
}

// Exécuter la vérification d'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', checkAuth);

// Gérer le formulaire de connexion
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        
        try {
            const response = await fetch(`${API_URL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    motDePasse: password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erreur de connexion');
            }
            
            // Stocker le token et les infos utilisateur
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            // Rediriger vers la page principale
            window.location.href = 'index.html';
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
}

// Gérer le formulaire d'inscription
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const nom = document.getElementById('nom').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('error-message');
        
        try {
            const response = await fetch(`${API_URL}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom: nom,
                    email: email,
                    motDePasse: password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erreur d\'inscription');
            }
            
            // Rediriger vers la page de connexion
            alert('Inscription réussie. Veuillez vous connecter.');
            window.location.href = 'login.html';
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Exposer la fonction logout
window.logout = logout;