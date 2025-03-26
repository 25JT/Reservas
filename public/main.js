console.log("Conexión main.js establecida");

document.getElementById("formReserva").addEventListener("submit", function (event) {
    event.preventDefault(); // Evita que la página se recargue

    let formData = {
        nombre: document.getElementById("nombre").value,
        personas: document.getElementById("personas").value,
        fecha: document.getElementById("fecha").value,
        telefono: document.getElementById("telefono").value,
        mesa: document.getElementById("mesa").value
    };

    console.log("Datos enviados:", formData); // Verifica los datos en la consola

    fetch("/validar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Muestra la alerta con la respuesta del servidor
        if (data.success) {
            
            document.getElementById("formReserva").reset(); // Limpia el formulario si la reserva fue exitosa
        }
    })
    .catch(error => console.error("Error:", error));
});
