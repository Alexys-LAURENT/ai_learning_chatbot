# StudyMate — Document Chat (PDF + IA)

**StudyMate** est une application web (Next.js) qui te permet de **discuter avec un ou plusieurs documents PDF** : poser des questions, demander une **fiche de révision**, générer un **quiz/QCM**, et afficher une **page précise** d’un document directement dans le chat.

L’app repose sur une API de chat qui :
- reçoit tes messages + tes PDF,
- **extrait/convertit** le contenu des PDF côté serveur,
- envoie le tout à un modèle LLM (par défaut via **LM Studio**, compatible API OpenAI),
- et renvoie une réponse **streamée** (avec “tool calling” pour afficher quiz/fiche/pages).

---

## Prérequis

- Node.js récent (TypeScript + Next.js)
- Un serveur LLM compatible OpenAI, par exemple **LM Studio** en local

---

## Installation

```bash
git clone https://github.com/Alexys-LAURENT/ai_learning_chatbot.git
cd ai_learning_chatbot
npm install
```

---

## Configuration (.env)

Copie le fichier d’exemple et complète-le :

```bash
cp .env.exemple .env
```

Variables disponibles (extrait) :

- `LMSTUDIO_BASE_URL` : URL de l’API OpenAI-compatible (par défaut `http://localhost:1234/v1`)
- `LMSTUDIO_MODEL` : nom du modèle (ex: `qwen/qwen3.5-9b`)
- (optionnel) `LANGSMITH_*` : traçage LangSmith

---

## Lancer en développement

```bash
npm run dev
```

Puis ouvre :
- http://localhost:3000

---

## Fonctionnalités

### Chat orienté “apprentissage”
- Réponses **en français**
- Ton concis et pédagogique
- Ne “devine” pas le contenu : l’assistant doit s’appuyer sur les documents fournis

### Import de PDF (multi-doc)
- Upload initial d’un ou plusieurs PDF (drag & drop)
- Historique des documents chargés dans une sidebar

### Citations (pages / sélections)
- Ouverture d’un panneau PDF intégré
- Possibilité de :
  - **citer une page** complète
  - **citer une sélection de texte**
- Les citations sont injectées dans le prompt sous forme de balises, et affichées côté UI sous forme de “chips”.

### Outils pédagogiques intégrés (tool-calling)
Selon la demande de l’utilisateur, l’assistant peut déclencher des rendus UI dédiés :
- **Quiz interactif** (QCM, score final, explications)
- **Fiche de révision structurée** (titres, listes, tableaux) avec export/partage
- **Affichage d’une page PDF** dans le flux de chat

### UI moderne
- Interface type “chat app”
- Thème **dark/light** (stocké en local)
- Rendu Markdown côté assistant (GFM : listes, tableaux, code, etc.)

---

## Stack technique

- **Next.js (App Router)** + **React**
- **TypeScript**
- UI : **HeroUI** + **Tailwind CSS**
- Chat/streaming : **Vercel AI SDK** (`@ai-sdk/react`, `ai`)
- Provider LLM : **OpenAI compatible** (par défaut LM Studio via URL locale)
- Observabilité : **LangSmith** (optionnel)
- PDF :
  - **react-pdf / pdfjs** côté client (viewer + extraction de sélection)
  - traitement PDF côté serveur (runtime Node requis)

---

## Architecture (vue d’ensemble)

### Frontend (App Router)
- `app/page.tsx` : page principale
  - “gate” d’upload au début (pas de chat tant que pas de PDF)
  - ensuite : sidebar documents + viewer PDF + chat
- `components/*` : composants UI
  - `DocumentUpload` : import PDF
  - `Sidebar` : liste des documents
  - `PdfViewerPanel` : viewer + citations page/sélection
  - `MessageList` : rendu du flux (texte + outils)
  - `InputBar` : saisie + pièce jointe + citations

### Backend (API)
- `app/api/chat/route.ts` : endpoint unique de chat
  - valide le format des messages UI
  - détecte les PDF transmis
  - transforme/“injecte” le contenu PDF dans la conversation
  - lance une génération **streamée**
  - active des outils UI (quiz/fiche/page)

### Outils (tool calling)
- `app/tools/displayQuizTool.ts`
- `app/tools/displayRevisionSheetTool.ts`
- `app/tools/displayPdfPageTool.ts`

### Types & utils
- `types/CustomUiMessage.ts` : typage UIMessage + outils disponibles
- `utils/citations.ts` : format/parse des citations dans le texte
- `utils/fileToUIPart.ts` : conversion fichier → UI part (Vercel AI SDK)

---

## Routes importantes

### UI
- `GET /` : interface principale (upload → chat)

### API
- `POST /api/chat` : endpoint de conversation (streaming)

---

## Utilisation (workflow)

1. Ouvre l’app
2. Glisse/dépose un ou plusieurs **PDF**
3. Clique **“Lancer la conversation”**
4. Pose des questions sur le cours
5. Optionnel :
   - ouvre un document dans le viewer
   - “cite” une page ou une sélection
   - demande un **quiz** ou une **fiche de révision**

---

## Notes importantes

### Runtime Node obligatoire côté API
L’API de chat force le runtime **Node.js** (nécessaire pour le traitement PDF côté serveur).

### Viewer PDF côté client uniquement
Certains composants PDF sont explicitement chargés sans SSR pour éviter les erreurs de build/prerender.

---

## Scripts

- `npm run dev` : serveur de dev
- `npm run build` : build production
- `npm start` : lancer en production
- `npm run lint` : lint ESLint

---

## Licence

À définir (MIT, Apache-2.0, etc.).
