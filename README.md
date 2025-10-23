# Dashboard Excel to JSON Converter

Une application Next.js qui convertit des fichiers Excel en JSON structuré, optimisé pour l'utilisation avec MongoDB et Mongoose.

## 🚀 Fonctionnalités

- **Importation Excel** : Support des fichiers .xlsx et .xls
- **Détection automatique** : Reconnaissance automatique des types de données (étudiants, entreprises, encadreurs)
- **Interface moderne** : Interface utilisateur moderne avec shadcn/ui
- **Recherche et filtrage** : Recherche dans les données et filtrage par type
- **Export JSON** : Génération de JSON structuré prêt pour MongoDB
- **Prévisualisation** : Visualisation des données dans des tableaux organisés

## 📋 Types de données supportés

### Étudiants
- Nom, Prénom, Spécialisation
- Société, Encadreur (optionnel)
- Email, Téléphone (optionnel)
- Statut (actif/diplôme/abandonné)

### Entreprises
- Nom, Secteur
- Adresse, Contact (optionnel)
- Email, Téléphone (optionnel)
- Nombre de stagiaires

### Encadreurs
- Nom, Prénom, Spécialisation
- Email, Téléphone (optionnel)
- Nombre d'étudiants

## 🛠️ Installation

```bash
# Cloner le repository
git clone <repository-url>
cd dash

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
src/
├── app/                 # Pages Next.js
├── components/          # Composants React
│   ├── ui/             # Composants UI shadcn
│   ├── data-table.tsx  # Tableau de données
│   ├── excel-uploader.tsx # Uploader Excel
│   ├── json-preview.tsx   # Prévisualisation JSON
│   └── usage-instructions.tsx # Instructions
├── lib/
│   ├── excel-parser.ts # Parser Excel principal
│   └── utils.ts        # Utilitaires
└── api/
    └── excelTraitement.tsx # API de traitement Excel
```

## 🔧 Utilisation

1. **Importation** : Cliquez sur "Importer Excel" et sélectionnez votre fichier
2. **Vérification** : Consultez les onglets pour vérifier les données importées
3. **Export** : Utilisez l'onglet JSON pour copier ou télécharger le JSON généré
4. **MongoDB** : Le JSON est prêt pour être utilisé avec Mongoose

## 📊 Format JSON généré

```json
{
  "students": [
    {
      "id": "student_2024_1",
      "nom": "Dupont",
      "prenom": "Jean",
      "specialisation": "Informatique",
      "annee": "2024",
      "societe": "Microsoft",
      "encadreur": "Sarah Martin",
      "email": "jean.dupont@email.com",
      "telephone": "0123456789",
      "statut": "actif"
    }
  ],
  "companies": [...],
  "supervisors": [...],
  "summary": {
    "totalStudents": 8,
    "totalCompanies": 8,
    "totalSupervisors": 8,
    "yearsCovered": ["2024"]
  }
}
```

## 📝 Fichiers d'exemple

Des fichiers CSV d'exemple sont disponibles dans le dossier `public/` :
- `exemple-donnees-etudiants.csv`
- `exemple-donnees-entreprises.csv`
- `exemple-donnees-encadreurs.csv`

## 🎨 Technologies utilisées

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **shadcn/ui** - Composants UI
- **Radix UI** - Composants accessibles
- **XLSX** - Lecture des fichiers Excel
- **Tailwind CSS** - Styling

## 📄 Licence

Ce projet est sous licence MIT.
