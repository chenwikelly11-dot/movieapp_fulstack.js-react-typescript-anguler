

An ultra-polished, dual-engine movie streaming player and offline download manager. This project combines rich streaming simulations, interactive search parameters, and an advanced graphical insights dashboard. Guests can watch high-speed preview streams immediately, while premium offline MP4 and torrent downloads are guarded by a frictionless inline sign-up/login authentication gateway.

---



*   **Cinematic Simulation Room**: Watch high-definition web streams inside fluid simulated players.
*   **Frictionless Authentication Gateway**: Guests search, filter, and stream instantly. Deeper features like direct MP4 torrent downloads trigger an elegant modal or inline credential signup prompting.
*   **Aesthetic Metric Insights**: Fully responsive visual charts powered by `recharts` presenting catalog distributions, top genre classifications, and watchlist ratings composition.
*   **Sophisticated Real-time Search & Filters**: Multi-keyword search paired with real-time genre chip triggers and an advanced IMDb interactive rating threshold slider.
*   **Bookmark Watchlist Sync**: Real-time localized subscription synchronization to bookmark favorites across views.

---



Before running the application locally, make sure you have the following installed on your computer:

*   **Node.js**: Version 18.x or newer is highly recommended.
*   **npm**: Included with Node.js installation.
*   **VS Code** (Optional, but recommended code editor).

---

##  Running Locally in VS Code

Follow these straightforward steps to boot up the application on your computer:

### 1. Open the Project in VS Code
Launch VS Code, select **File > Open Folder...**, and select this project directory.

### 2. Open the Integrated Terminal
Open the terminal inside VS Code by pressing `Ctrl + \`` (backtick) or selecting **Terminal > New Terminal** from the top menu.

### 3. Install Dependencies
Get all external packages and framework utilities:
```bash
npm install
```

### 4. Set Up Environment Variables (Optional)
If you wish to configure environment variables locally, duplicate the example template:
*   On Windows (PowerShell):
    ```powershell
    copy .env.example .env
    ```
*   On Mac/Linux:
    ```bash
    cp .env.example .env
    ```

### 5. Launch the Server
Start the unified full-stack development server:
```bash
npm run dev
```

### 6. Enjoy the Application!
Open your preferred web browser and navigate to:
**`http://localhost:3000`**

---

##  Pushing to GitHub

To store your workspace on a remote GitHub repository, use these classic sequential Git commands in your VS Code terminal:https://github.com/chenwikelly11-dot/movieapp_fulstack.js-react-typescript-anguler


### 2. Stage your files
Stage all changes in the project directory, respecting the `.gitignore` exclusions:
```bash
git add .
```





---

##  Project Structure

*   `/src/react-module/` - Custom UI layouts, Movie analytics graphs, search bars, and main views.
*   `/src/angular-module/` - Underlying micro-compiled components governing detailed modals, watchstreams, and download simulators.
*   `/src/shared/` - Global stores managing active bookmarks, state changes, and session logic.
*   `server.ts` - Production-grade Node.js server wrapping Vite development middlewares.
*   `package.json` - Custom commands (`npm run dev`/`npm run build`) and external styling matrices.
