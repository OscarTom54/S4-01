# S4-DACS-01-1 – Déploiement de solution

Implémentation vanilla d'une application web de collecte de fichiers audios
Stacks : Docker, HTML, Javascript (Node.js), CSS, Nginx

L'utilisateur renseigne son âge, son genre et le nombre de phrases qu'il souhaite lire.
Il peut ensuite prononcer chaque phrase succesivement, avec la possibilité d'écouter son enregistrement ou de mettre fin à la session prématurément.

L'application collecte uniquement le genre, l'âge, et un identifiant unique de l'utilisateur.
Les enregistrements sont stockés sur le serveur (/audios/..) et les informations en sessions.

L'enregistreur utilise l'API MediaRecorder pour générer les fichiers .wav

Le serveur est séparé en deux images dockers :
Backend sur l'image `node:18-alpine`
- Importe les fichiers server.js et package.js
- Ouvre le port 3000 pour recevoir les enregistrements
- Lance le serveur Node.js

Frontend sur l'image `nginx:stable-alpine`
- Importe un fichier de configuration nginx, qui indique au serveur quelles requêtes rediriger vers le backend
- Importe les fichiers "public" : index.html, record.html, styles.css
- Ouvre le port 80 pour recevoir le trafique HTTP

Le fichier docker-compose.yml lie les ports 3000 et 80 des containeurs aux ports 3000 et 8080 de l'hôte.



# Structure

```
.
├── audios/                  # Dossier où sont enregistrés les fichiers audios (.wav).
    ├── genre_age_timestamp_nphrase.wav
├── bdockerfile              # Dockerfile pour le backend (Node.js)
├── fdockerfile              # Dockerfile pour le frontend (Nginx)
├── docker-compose.yml       # Fichier pour lancer l'application de manière consistante dans tous les environnements
├── index.html               # Page d'acceuil, récupère l'âge le genre et le consentement puis crée un identifiant unique
├── record.html              # Page d'enregistrement des phrases
├── styles.css               # Fichier CSS communs aux deux pages HTML
├── server.js                # Serveur backend Node.js capable de recevoir et enregistrer des fichiers audios
├── nginx.conf               # Fichier de configuration Nginx afin de rediriger les requêtes d'uploads vers le backend
├── package.json             # Fichier nécéssaire pour Node.js, contient la commande afin de lancer le serveur backend
├── README.md                # Documentation du projet
├── phrases.txt              # Fichier contenant toutes les phrases, séparées par un saut de ligne
```

---

# Déploiement
Pour un déploiement contenarisé avec docker, simplement lancer la commande :
docker compose up --build

L'application sera ensuite accessible à l'adresse suivante :
http://localhost:8080

Puis pour arrêter l'application :
docker compose down

Les enregistrements seront disponibles dans le répertoire `./audios` de la machine hôte


# Phrases
Le fichier phrases.txt contient 100 phrases fournies par mon camarade Nathan Eyer.
Les phrases proposées lors d'une session sont selectionnées aléatoirement à l'envoie du formulaire.