import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Inicializar Firebase solo si no está inicializado
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function () {
    cargarPedidos();
    cargarProductos();
});

// Cargar pedidos desde Firestore
function cargarPedidos() {
    onSnapshot(collection(db, "orders"), (snapshot) => {
        let tablaPedidos = document.getElementById("tablaPedidos");
        tablaPedidos.innerHTML = "";

        snapshot.forEach((doc) => {
            let pedido = doc.data();
            let row = `<tr>
                        <td>${doc.id}</td>
                        <td>${pedido.cliente}</td>
                        <td>$${pedido.total}</td>
                        <td>
                            <select onchange="actualizarEstadoPedido('${doc.id}', this.value)">
                                <option value="Pendiente" ${pedido.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
                                <option value="Enviado" ${pedido.estado === "Enviado" ? "selected" : ""}>Enviado</option>
                                <option value="Entregado" ${pedido.estado === "Entregado" ? "selected" : ""}>Entregado</option>
                                <option value="Cancelado" ${pedido.estado === "Cancelado" ? "selected" : ""}>Cancelado</option>
                            </select>
                        </td>
                      </tr>`;
            tablaPedidos.innerHTML += row;
        });
    });
}

// Actualizar estado del pedido
window.actualizarEstadoPedido = function (id, nuevoEstado) {
    updateDoc(doc(db, "orders", id), { estado: nuevoEstado });
}

// Cargar productos desde Firestore
function cargarProductos() {
    onSnapshot(collection(db, "productos"), (snapshot) => {
        let tablaProductos = document.getElementById("tablaProductos");
        tablaProductos.innerHTML = "";

        snapshot.forEach((doc) => {
            let producto = doc.data();
            let tallasTexto = Object.entries(producto.tallas || {}).map(([talla, stock]) => `${talla}: ${stock}`).join(", ");

            let filaHTML = `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                    <td>${tallasTexto}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarProducto('${doc.id}')">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarProducto('${doc.id}')">Eliminar</button>
                    </td>
                </tr>
            `;
            tablaProductos.innerHTML += filaHTML;
        });
    });
}

// Agregar un nuevo producto
window.agregarProducto = function () {
    let nombre = prompt("Ingrese el nombre del producto:");
    let precio = parseFloat(prompt("Ingrese el precio del producto:"));
    let tallasInput = prompt("Ingrese las tallas y stock en formato talla:stock, talla:stock");
    let tallas = {};

    tallasInput.split(",").forEach(pair => {
        let [talla, stock] = pair.split(":");
        tallas[talla.trim()] = parseInt(stock);
    });

    if (nombre && !isNaN(precio) && Object.keys(tallas).length > 0) {
        addDoc(collection(db, "productos"), {
            nombre,
            precio,
            tallas
        }).then(() => {
            alert("Producto agregado exitosamente.");
        }).catch(error => {
            console.error("Error al agregar producto: ", error);
        });
    } else {
        alert("Datos inválidos, intente nuevamente.");
    }
}

// Eliminar un producto
window.eliminarProducto = function (id) {
    deleteDoc(doc(db, "productos", id)).then(() => {
        alert("Producto eliminado correctamente.");
    }).catch(error => {
        console.error("Error al eliminar producto: ", error);
    });
}

// Editar un producto
window.editarProducto = function (id) {
    let nuevoNombre = prompt("Nuevo nombre del producto:");
    let nuevoPrecio = parseFloat(prompt("Nuevo precio:"));
    let nuevasTallasInput = prompt("Nuevas tallas y stock en formato talla:stock, talla:stock");
    let nuevasTallas = {};

    nuevasTallasInput.split(",").forEach(pair => {
        let [talla, stock] = pair.split(":");
        nuevasTallas[talla.trim()] = parseInt(stock);
    });

    if (nuevoNombre && !isNaN(nuevoPrecio) && Object.keys(nuevasTallas).length > 0) {
        updateDoc(doc(db, "productos", id), {
            nombre: nuevoNombre,
            precio: nuevoPrecio,
            tallas: nuevasTallas
        }).then(() => {
            alert("Producto actualizado correctamente.");
        }).catch(error => {
            console.error("Error al actualizar producto: ", error);
        });
    } else {
        alert("Datos inválidos, intente nuevamente.");
    }
}
