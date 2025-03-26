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

function cargarReservas() {
    fetch('/api/reservas') // Petición al servidor
        .then(response => response.json()) // Convertimos la respuesta en JSON
        .then(reservas => {
            let contenido = `<h2>Reservas Actuales</h2>     
            <table class="table">
                <thead> 
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Nombre</th>
                        <th scope="col">Número de personas</th>
                        <th scope="col">Fecha</th>
                        <th scope="col">Teléfono</th>
                        <th scope="col">Número de mesa</th>
                        <th scope="col">Acción</th>
                        <th scope="col">Acción</th>
                    </tr>
                </thead>
                <tbody>`;

            reservas.forEach(reserva => {
                contenido += ` 
                    <tr>
                        <td>${reserva.Id}</td>
                        <td>${reserva.nombre}</td>
                        <td>${reserva.n_personas}</td>
                        <td>${new Date(reserva.fecha).toLocaleDateString()}</td>
                        <td>${reserva.telefono}</td>
                        <td>${reserva.n_mesa}</td>
                        <td><button type="button" class="btn btn-primary">Acción</button></td>
                        <td><button type="button" class="btn btn-primary">Acción</button></td>
                    </tr>`;
            });

            contenido += `</tbody></table>`;
            document.getElementById("listaReservas").innerHTML = contenido;
        })
        .catch(error => console.error("Error cargando reservas:", error));
}


// Llamamos a la función cuando la página se carga
window.onload = cargarReservas;