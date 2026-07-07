# JIDWADAAG — Simple static site

This is a minimal static implementation of the JIDWADAAG website (no authentication, client-side storage).

How to run

- Server + client (development):

```bash
# from project root
cd server
npm install
node index.js

n# in another terminal
cd client
npm install
npm run dev
```

- Production build (serve built client from server):

```bash
# build client
cd client
npm run build
# then start server (it will serve client/dist)
cd ../server
node index.js
```

Notes
- Trips are stored in the browser's `localStorage`. Clearing browser data removes them.
- This is purposely simple; if you want a server-backed version later I can scaffold one.
