# Description des Cas d'Utilisation - Smart Office Reservation System

Ce document fournit les descriptions textuelles détaillées pour les cas d'utilisation principaux de la plateforme.

---

## 1. Cas d’utilisation : S’authentifier

| Champ | Description |
| :--- | :--- |
| **Titre de cas d’utilisation** | S'authentifier |
| **Acteurs principaux** | Employé, Manager, Administrateur |
| **Description** | Permet à un utilisateur d'accéder aux fonctionnalités du système en vérifiant ses identifiants. |
| **Précondition** | L'utilisateur doit avoir un compte créé dans le système. |
| **Postcondition** | L'utilisateur est connecté et reçoit un jeton JWT pour ses requêtes futures. |
| **Scénarios Nominaux** | 1. L'utilisateur saisit son nom d'utilisateur et son mot de passe.<br>2. Le système vérifie les identifiants dans la base de données.<br>3. Le système génère un jeton JWT.<br>4. L'utilisateur est redirigé vers son tableau de bord selon son rôle. |
| **Exceptions** | - Identifiants incorrects : Le système affiche un message d'erreur "Identifiants invalides".<br>- Compte bloqué/inexistant : Le système refuse l'accès. |

---

## 2. Cas d’utilisation : Réserver chaises (Bureaux)

| Champ | Description |
| :--- | :--- |
| **Titre de cas d’utilisation** | Réserver chaises |
| **Acteurs principaux** | Employé |
| **Description** | Permet à un employé de réserver un bureau (chaise) pour une date spécifique. |
| **Précondition** | L'utilisateur doit être authentifié en tant qu'Employé. |
| **Postcondition** | Une réservation est enregistrée et le bureau est marqué comme occupé pour la date choisie. |
| **Scénarios Nominaux** | 1. L'utilisateur sélectionne une date sur le calendrier.<br>2. Le système affiche les bureaux disponibles.<br>3. L'utilisateur choisit un bureau spécifique.<br>4. L'utilisateur confirme la réservation.<br>5. Le système enregistre la réservation et envoie une notification de confirmation. |
| **Exceptions** | - Bureau déjà réservé : Le système affiche une erreur de conflit.<br>- Quota atteint : L'utilisateur a déjà trop de réservations pour la période. |

---

## 3. Cas d’utilisation : Déclarer des congés

| Champ | Description |
| :--- | :--- |
| **Titre de cas d’utilisation** | Déclarer des congés |
| **Acteurs principaux** | Employé |
| **Description** | Permet à un employé de déclarer des jours de congés, ce qui annule automatiquement ses réservations pour ces dates. |
| **Précondition** | L'utilisateur doit être authentifié. |
| **Postcondition** | Les jours de congés sont enregistrés et les réservations conflictuelles sont supprimées. |
| **Scénarios Nominaux** | 1. L'utilisateur accède à la section "Congés".<br>2. L'utilisateur sélectionne une ou plusieurs dates.<br>3. Le système valide les dates et enregistre les congés.<br>4. Le système libère automatiquement les bureaux/salles que l'utilisateur avait réservés pour ces dates. |
| **Exceptions** | - Date passée : Impossible de déclarer un congé pour une date déjà écoulée.<br>- Doublon : L'utilisateur a déjà déclaré un congé pour cette date. |

---

## 4. Cas d’utilisation : Réserver une salle de réunion

| Champ | Description |
| :--- | :--- |
| **Titre de cas d’utilisation** | Réserver salle de réunion |
| **Acteurs principaux** | Employé, Manager |
| **Description** | Permet de réserver une salle de réunion pour un créneau horaire précis. |
| **Précondition** | L'utilisateur est authentifié. |
| **Postcondition** | La salle est réservée pour le créneau choisi. |
| **Scénarios Nominaux** | 1. L'utilisateur sélectionne l'option "Salle de réunion".<br>2. L'utilisateur choisit une salle, une date et un créneau horaire (Début/Fin).<br>3. Le système vérifie la disponibilité de la salle.<br>4. L'utilisateur confirme la réservation.<br>5. Le système enregistre la réservation. |
| **Exceptions** | - Conflit d'horaire : La salle est déjà occupée sur une partie du créneau demandé.<br>- Durée invalide : L'heure de fin est antérieure à l'heure de début. |
