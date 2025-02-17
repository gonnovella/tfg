document.addEventListener("DOMContentLoaded", function () {
    cargarPedidos();
    cargarProductos();
});

async function procesarPago() {
    let correo = document.getElementById("correo").value;
    
    if (!correo) {
        alert("Por favor, introduce un correo electrónico válido.");
        return;
    }

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

    console.log("Iniciando verificación de stock...");

    for (let item of carrito) {
        let productoRef = doc(db, "productos", item.id);
        let productoSnap = await getDoc(productoRef);

        if (!productoSnap.exists()) {
            console.log(`El producto ${item.nombre} no existe en la base de datos.`);
            alert(`El producto ${item.nombre} no existe en la base de datos.`);
            return;
        }

        let productoData = productoSnap.data();
        console.log(`Verificando stock de ${item.nombre} - Talla: ${item.talla}, Pedido: ${item.cantidad}, Stock disponible: ${productoData.tallas[item.talla] || 0}`);

        if (!productoData.tallas[item.talla] || productoData.tallas[item.talla] < item.cantidad) {
            console.log(`❌ No hay suficiente stock de ${item.nombre}`);
            alert(`No hay suficiente stock de ${item.nombre} en la talla ${item.talla}. Stock disponible: ${productoData.tallas[item.talla] || 0}`);
            return;
        }
    }

    console.log("✅ Stock verificado correctamente. Procediendo con el pago...");

    let pedidoRef = await addDoc(collection(db, "orders"), {
        cliente: correo,
        productos: carrito,
        total: total,
        estado: "Pendiente",
        fecha: new Date()
    });

    console.log("Pedido registrado con ID:", pedidoRef.id);
    
    for (let item of carrito) {
        let productoRef = doc(db, "productos", item.id);
        let productoSnap = await getDoc(productoRef);
        let productoData = productoSnap.data();
        
        let nuevoStock = { ...productoData.tallas };
        nuevoStock[item.talla] -= item.cantidad;
        
        await updateDoc(productoRef, { tallas: nuevoStock });
    }

    alert("Pedido realizado con éxito.");
    localStorage.removeItem("carrito");
    window.location.href = "confirmacion.html";
}

