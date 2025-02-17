import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function () {
    const productosContainer = document.getElementById("productosContainer");
    actualizarCarritoBadge();

    // Escuchar cambios en Firestore
    onSnapshot(collection(db, "productos"), (snapshot) => {
        productosContainer.innerHTML = ""; // Limpiar antes de actualizar

        snapshot.forEach((doc) => {
            let producto = doc.data();

            if (!producto.nombre || !producto.precio || !producto.tallas) {
                console.error("Producto con datos incorrectos:", producto);
                return; // No mostrar el producto si tiene datos incorrectos
            }

            let tallasOptions = Object.keys(producto.tallas).map(
                talla => `<option value="${talla}">${talla} - Stock: ${producto.tallas[talla]}</option>`
            ).join("");

            let productoHTML = `
                <div class="col">
                    <div class="card h-100">
                        <img src="https://via.placeholder.com/300x200" class="card-img-top" alt="${producto.nombre}">
                        <div class="card-body">
                            <h5 class="card-title">${producto.nombre}</h5>
                            <p class="card-text">Precio: $${parseFloat(producto.precio).toFixed(2)}</p>
                            <p class="card-text">Seleccione talla:</p>
                            <select id="talla-${doc.id}" class="form-select">${tallasOptions}</select>
                        </div>
                        <div class="card-footer">
                            <button onclick="agregarAlCarrito('${doc.id}', '${producto.nombre}', ${producto.precio})" class="btn btn-primary">Comprar</button>
                        </div>
                    </div>
                </div>
            `;
            productosContainer.innerHTML += productoHTML;
        });
    });
});

// Modificar la función agregarAlCarrito para incluir la talla
window.agregarAlCarrito = async function (id, nombre, precio) {
    let selectTalla = document.getElementById(`talla-${id}`);
    let tallaSeleccionada = selectTalla.value;
    
    if (!tallaSeleccionada) {
        alert("Por favor selecciona una talla.");
        return;
    }


    
    // Obtener el stock de Firestore
    const productoRef = doc(db, "productos", id);
    let productoSnapshot = await getDoc(productoRef);
    let productoData = productoSnapshot.data();

    if (!productoData || !productoData.tallas || productoData.tallas[tallaSeleccionada] === undefined) {
        alert("Error: Producto no disponible.");
        return;
    }

    let stockDisponible = productoData.tallas[tallaSeleccionada];

    if (stockDisponible <= 0) {
        alert("No hay stock disponible para esta talla.");
        return;
    }

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let productoExistente = carrito.find(item => item.id === id && item.talla === tallaSeleccionada);

    if (productoExistente) {
        if (productoExistente.cantidad < stockDisponible) {
            productoExistente.cantidad += 1;
        } else {
            alert("No puedes agregar más de este producto, no hay más stock disponible.");
            return;
        }
    } else {
        carrito.push({ id, nombre, precio, talla: tallaSeleccionada, cantidad: 1 });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    actualizarCarritoBadge();
    alert(`${nombre} (Talla ${tallaSeleccionada}) agregado al carrito.`);

    // Actualizar stock en Firebase
    let nuevoStock = stockDisponible - 1;
    let nuevoTallas = { ...productoData.tallas, [tallaSeleccionada]: nuevoStock };

    await updateDoc(productoRef, { tallas: nuevoTallas });
};

function actualizarCarritoBadge() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let totalCantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    let badgeElement = document.getElementById("carritoBadge");
    if (badgeElement) {
        badgeElement.textContent = totalCantidad;
    }
}

// Abrir el modal con los detalles del producto seleccionado
async function abrirModalProducto(id) {
    const productoRef = doc(db, "productos", id);
    const productoSnap = await getDoc(productoRef);
    if (!productoSnap.exists()) return;

    let producto = productoSnap.data();
    document.getElementById("productoNombre").innerText = producto.nombre;
    document.getElementById("productoDescripcion").innerText = producto.descripcion || "Descripción no disponible";
    document.getElementById("productoPrecio").innerText = `$${producto.precio.toFixed(2)}`;

    let imagenesHTML = "";
    producto.imagenes.forEach((img, index) => {
        imagenesHTML += `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${img}" class="d-block w-100" alt="${producto.nombre}">
            </div>
        `;
    });
    document.getElementById("productoImagenes").innerHTML = imagenesHTML;

    let tallasSelect = document.getElementById("tallaSelect");
    tallasSelect.innerHTML = "";
    Object.keys(producto.tallas).forEach(talla => {
        tallasSelect.innerHTML += `<option value="${talla}">${talla} (Stock: ${producto.tallas[talla]})</option>`;
    });

    document.getElementById("agregarCarritoBtn").setAttribute("onclick", `agregarAlCarrito('${id}')`);

    let modal = new bootstrap.Modal(document.getElementById("productoModal"));
    modal.show();
}