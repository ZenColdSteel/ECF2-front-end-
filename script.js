// Configuration de l'API
const API_URL = 'http://localhost:3000/api'; // Ajustez selon votre configuration

// Cache pour les données
let chauffeursCache = [];
let vehiculesCache = [];
let assignationsCache = [];

// Fonctions d'initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Charger les données initiales en séquence
    fetchChauffeurs()
        .then(() => fetchVehicules())
        .then(() => fetchAssignations())
        .catch(error => console.error('Erreur lors du chargement des données:', error));
    
    // Définir la date par défaut à maintenant pour le formulaire d'assignation
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('assignation-date').value = now.toISOString().slice(0, 16);
    
    // Configurer les écouteurs d'événements pour les formulaires
    document.getElementById('chauffeur-form').addEventListener('submit', handleChauffeurSubmit);
    document.getElementById('vehicule-form').addEventListener('submit', handleVehiculeSubmit);
    document.getElementById('assignation-form').addEventListener('submit', handleAssignationSubmit);
});

// ===== GESTION DES CHAUFFEURS =====

// Récupérer tous les chauffeurs
async function fetchChauffeurs() {
    try {
        const response = await fetch(`${API_URL}/driver`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des chauffeurs');
        
        const result = await response.json();
        // S'assurer que chauffeursCache est un tableau
        chauffeursCache = result.chauffeurs || [];
        console.log("Chauffeurs récupérés:", chauffeursCache);
        renderChauffeursTable();
        populateChauffeurSelect();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de charger les chauffeurs');
    }
}

// Ajouter un chauffeur
async function handleChauffeurSubmit(event) {
    event.preventDefault();
    
    const nomInput = document.getElementById('chauffeur-nom');
    const permisInput = document.getElementById('chauffeur-permis');
    const disponibiliteSelect = document.getElementById('chauffeur-disponibilite');
    
    const chauffeurData = {
        nom: nomInput.value,
        permis: permisInput.value,
        disponibilite: disponibiliteSelect.value === 'true'
    };
    
    try {
        const response = await fetch(`${API_URL}/driver`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chauffeurData)
        });
        
        if (!response.ok) throw new Error('Erreur lors de l\'ajout du chauffeur');
        
        // Réinitialiser le formulaire et recharger les données
        nomInput.value = '';
        permisInput.value = '';
        disponibiliteSelect.value = 'true';
        fetchChauffeurs();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible d\'ajouter le chauffeur');
    }
}

// Supprimer un chauffeur
async function deleteChauffeur(chauffeurId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur?')) return;
    
    try {
        const response = await fetch(`${API_URL}/driver/${chauffeurId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erreur lors de la suppression du chauffeur');
        
        fetchChauffeurs();
        fetchAssignations(); // Rafraîchir les assignations également
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de supprimer le chauffeur');
    }
}

// Afficher les chauffeurs dans le tableau
function renderChauffeursTable() {
    const tbody = document.querySelector('#chauffeurs-table tbody');
    tbody.innerHTML = '';
    
    if (!Array.isArray(chauffeursCache)) {
        console.error("chauffeursCache n'est pas un tableau", chauffeursCache);
        return;
    }
    
    chauffeursCache.forEach(chauffeur => {
        const row = document.createElement('tr');
        
        const td1 = document.createElement('td');
        td1.textContent = chauffeur.chauffeur_id;
        
        const td2 = document.createElement('td');
        td2.textContent = chauffeur.nom;
        
        const td3 = document.createElement('td');
        td3.textContent = chauffeur.permis;
        
        const td4 = document.createElement('td');
        td4.textContent = chauffeur.disponibilite ? 'Disponible' : 'Non disponible';
        
        const td5 = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.classList.add('action-btn');
        deleteButton.addEventListener('click', () => deleteChauffeur(chauffeur.chauffeur_id));
        td5.appendChild(deleteButton);

        row.appendChild(td1);
        row.appendChild(td2);
        row.appendChild(td3);
        row.appendChild(td4);
        row.appendChild(td5);
        
        tbody.appendChild(row);
    });
}

// Remplir le sélecteur de chauffeurs pour l'assignation
function populateChauffeurSelect() {
    const select = document.getElementById('chauffeur-select');
    
    // Garder l'option par défaut et supprimer les autres
    select.innerHTML = '<option value="">Sélectionner un chauffeur</option>';
    
    if (!Array.isArray(chauffeursCache)) {
        console.error("chauffeursCache n'est pas un tableau", chauffeursCache);
        return;
    }
    
    // Filtrer pour n'afficher que les chauffeurs disponibles
    const chauffeursDispo = chauffeursCache.filter(chauffeur => chauffeur.disponibilite);
    
    chauffeursDispo.forEach(chauffeur => {
        const option = document.createElement('option');
        option.value = chauffeur.chauffeur_id;
        option.textContent = `${chauffeur.nom} (${chauffeur.permis})`;
        select.appendChild(option);
    });
}

// ===== GESTION DES VÉHICULES =====

// Récupérer tous les véhicules
async function fetchVehicules() {
    try {
        const response = await fetch(`${API_URL}/car`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des véhicules');
        
        const result = await response.json();
        
        // Utiliser la propriété "vehicules" ou le nom approprié dans la réponse
        vehiculesCache = result.vehicules || result.voitures || [];

        console.log("Véhicules récupérés:", vehiculesCache);
        renderVehiculesTable();
        populateVehiculeSelect();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de charger les véhicules');
    }
}

// Ajouter un véhicule
async function handleVehiculeSubmit(event) {
    event.preventDefault();
    
    const modeleInput = document.getElementById('vehicule-modele');
    const immatriculationInput = document.getElementById('vehicule-immatriculation');
    const statutSelect = document.getElementById('vehicule-statut');
    
    const vehiculeData = {
        modele: modeleInput.value,
        immatriculation: immatriculationInput.value,
        statut: statutSelect.value
    };
    
    try {
        const response = await fetch(`${API_URL}/car`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehiculeData)
        });
        
        if (!response.ok) throw new Error('Erreur lors de l\'ajout du véhicule');
        
        // Réinitialiser le formulaire et recharger les données
        modeleInput.value = '';
        immatriculationInput.value = '';
        statutSelect.value = 'Disponible';
        fetchVehicules();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible d\'ajouter le véhicule');
    }
}

// Supprimer un véhicule
async function deleteVehicule(vehiculeId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule?')) return;
    
    try {
        const response = await fetch(`${API_URL}/car/${vehiculeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erreur lors de la suppression du véhicule');
        
        fetchVehicules();
        fetchAssignations(); // Rafraîchir les assignations également
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de supprimer le véhicule');
    }
}

// Afficher les véhicules dans le tableau
function renderVehiculesTable() {
    const tbody = document.querySelector('#vehicules-table tbody');
    tbody.innerHTML = '';
    
    if (!Array.isArray(vehiculesCache)) {
        console.error("vehiculesCache n'est pas un tableau", vehiculesCache);
        return;
    }
    
    vehiculesCache.forEach(vehicule => {
        const row = document.createElement('tr');
        
        const td1 = document.createElement('td');
        td1.textContent = vehicule.vehicule_id;
        
        const td2 = document.createElement('td');
        td2.textContent = vehicule.modele;
        
        const td3 = document.createElement('td');
        td3.textContent = vehicule.immatriculation;
        
        const td4 = document.createElement('td');
        td4.textContent = vehicule.statut;
        
        const td5 = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.classList.add('action-btn');
        deleteButton.addEventListener('click', () => deleteVehicule(vehicule.vehicule_id));
        td5.appendChild(deleteButton);

        row.appendChild(td1);
        row.appendChild(td2);
        row.appendChild(td3);
        row.appendChild(td4);
        row.appendChild(td5);
        
        tbody.appendChild(row);
    });
}

// Remplir le sélecteur de véhicules pour l'assignation
function populateVehiculeSelect() {
    const select = document.getElementById('vehicule-select');
    
    // Garder l'option par défaut et supprimer les autres
    select.innerHTML = '<option value="">Sélectionner un véhicule</option>';
    
    if (!Array.isArray(vehiculesCache)) {
        console.error("vehiculesCache n'est pas un tableau", vehiculesCache);
        return;
    }
    
    // Filtrer pour n'afficher que les véhicules disponibles
    const vehiculesDispo = vehiculesCache.filter(vehicule => vehicule.statut === 'Disponible');
    
    vehiculesDispo.forEach(vehicule => {
        const option = document.createElement('option');
        option.value = vehicule.vehicule_id;
        option.textContent = `${vehicule.modele} (${vehicule.immatriculation})`;
        select.appendChild(option);
    });
}

// ===== GESTION DES ASSIGNATIONS =====

// Récupérer toutes les assignations
async function fetchAssignations() {
    try {
        // Vérifier si l'endpoint existe
        try {
            const response = await fetch(`${API_URL}/assignation`);
            if (!response.ok) throw new Error('Endpoint non disponible');
            
            const result = await response.json();
            // S'assurer que assignationsCache est un tableau
            assignationsCache = result.assignations || [];
            
            console.log("Assignations récupérées:", assignationsCache);
            renderAssignationsTable();
        } catch (error) {
            console.warn('Endpoint /assignation non disponible, création de la table vide');
            assignationsCache = [];
            renderAssignationsTable();
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Créer une assignation
async function handleAssignationSubmit(event) {
    event.preventDefault();
    
    const chauffeurSelect = document.getElementById('chauffeur-select');
    const vehiculeSelect = document.getElementById('vehicule-select');
    const dateInput = document.getElementById('assignation-date');
    
    const assignationData = {
        chauffeur_id: parseInt(chauffeurSelect.value),
        vehicule_id: parseInt(vehiculeSelect.value),
        date: new Date(dateInput.value).toISOString()
    };
    
    try {
        const response = await fetch(`${API_URL}/assignation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assignationData)
        });
        
        if (!response.ok) throw new Error('Erreur lors de l\'assignation');
        
        // Mettre à jour le statut du véhicule
        updateVehiculeStatus(assignationData.vehicule_id, 'En service');
        
        // Mettre à jour la disponibilité du chauffeur
        updateChauffeurDisponibilite(assignationData.chauffeur_id, false);
        
        // Réinitialiser le formulaire et recharger les données
        chauffeurSelect.value = '';
        vehiculeSelect.value = '';
        
        // Mettre à jour la date par défaut
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dateInput.value = now.toISOString().slice(0, 16);
        
        fetchAssignations();
        fetchChauffeurs();
        fetchVehicules();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de créer l\'assignation');
    }
}

// Mettre à jour le statut d'un véhicule
async function updateVehiculeStatus(vehiculeId, statut) {
    if (!Array.isArray(vehiculesCache)) return;
    
    const vehicule = vehiculesCache.find(v => v.vehicule_id === vehiculeId);
    if (!vehicule) return;
    
    try {
        const response = await fetch(`${API_URL}/car/${vehiculeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...vehicule,
                statut: statut
            })
        });
        
        if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut du véhicule');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Mettre à jour la disponibilité d'un chauffeur
async function updateChauffeurDisponibilite(chauffeurId, disponibilite) {
    if (!Array.isArray(chauffeursCache)) return;
    
    const chauffeur = chauffeursCache.find(c => c.chauffeur_id === chauffeurId);
    if (!chauffeur) return;
    
    try {
        const response = await fetch(`${API_URL}/driver/${chauffeurId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...chauffeur,
                disponibilite: disponibilite
            })
        });
        
        if (!response.ok) throw new Error('Erreur lors de la mise à jour de la disponibilité du chauffeur');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Supprimer une assignation
async function deleteAssignation(assignationId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette assignation?')) return;
    
    try {
        // Récupérer l'assignation avant la suppression
        const assignation = assignationsCache.find(a => a.assignation_id === assignationId);
        
        const response = await fetch(`${API_URL}/assignation/${assignationId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erreur lors de la suppression de l\'assignation');
        
        if (assignation) {
            // Mettre à jour le statut du véhicule
            updateVehiculeStatus(assignation.vehicule_id, 'Disponible');
            
            // Mettre à jour la disponibilité du chauffeur
            updateChauffeurDisponibilite(assignation.chauffeur_id, true);
        }
        
        fetchAssignations();
        fetchChauffeurs();
        fetchVehicules();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Impossible de supprimer l\'assignation');
    }
}

// Afficher les assignations dans le tableau
function renderAssignationsTable() {
    const tbody = document.querySelector('#assignations-table tbody');
    tbody.innerHTML = '';
    
    if (!Array.isArray(assignationsCache)) {
        console.error("assignationsCache n'est pas un tableau", assignationsCache);
        return;
    }
    
    assignationsCache.forEach(assignation => {
        // Trouver les informations du chauffeur et du véhicule
        const chauffeur = Array.isArray(chauffeursCache) ? 
            chauffeursCache.find(c => c.chauffeur_id === assignation.chauffeur_id) : null;
        
        const vehicule = Array.isArray(vehiculesCache) ? 
            vehiculesCache.find(v => v.vehicule_id === assignation.vehicule_id) : null;
        
        const chauffeurNom = chauffeur ? chauffeur.nom : 'Inconnu';
        const vehiculeInfo = vehicule ? `${vehicule.modele} (${vehicule.immatriculation})` : 'Inconnu';
        
        // Formater la date
        let dateFormatee = 'Date inconnue';
        try {
            if (assignation.date) {
                const date = new Date(assignation.date);
                dateFormatee = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            }
        } catch (e) {
            console.error("Erreur de formatage de date", e);
        }

        const row = document.createElement('tr');
        
        const td1 = document.createElement('td');
        td1.textContent = assignation.assignation_id;
        
        const td2 = document.createElement('td');
        td2.textContent = chauffeurNom;
        
        const td3 = document.createElement('td');
        td3.textContent = vehiculeInfo;
        
        const td4 = document.createElement('td');
        td4.textContent = dateFormatee;
        
        const td5 = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer';
        deleteButton.classList.add('action-btn');
        deleteButton.addEventListener('click', () => deleteAssignation(assignation.assignation_id));
        td5.appendChild(deleteButton);

        row.appendChild(td1);
        row.appendChild(td2);
        row.appendChild(td3);
        row.appendChild(td4);
        row.appendChild(td5);
        
        tbody.appendChild(row);
    });
}

// Exposer les fonctions pour les gestionnaires d'événements inline
window.deleteChauffeur = deleteChauffeur;
window.deleteVehicule = deleteVehicule;
window.deleteAssignation = deleteAssignation;