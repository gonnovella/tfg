// Importar funciones necesarias del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Configuración de Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyBjxpUkNnXOf3VjvgR3cI6Hpw_iZXaP-oc",
  authDomain: "tiendaonlinetfg.firebaseapp.com",
  projectId: "tiendaonlinetfg",
  storageBucket: "tiendaonlinetfg.firebasestorage.app",
  messagingSenderId: "228446562012",
  appId: "1:228446562012:web:fc25595dd53eab30283619",
  measurementId: "G-ELPZR7RPW2"
};

// Inicializar Firebase solo si no está inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // 🔹 Agregar Firestore y hacer que `db` esté definido

// Hacer `db` accesible globalmente
window.db = db;
