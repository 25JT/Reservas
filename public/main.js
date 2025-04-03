document.addEventListener("DOMContentLoaded", cargarReservas);

document.getElementById("Ptext").innerHTML = "RESERVAS GO!"

document.getElementById("formReserva").addEventListener("submit", function (event) {
    event.preventDefault();
    let idReserva = document.getElementById("idReserva").value;

    let formData = {
        nombre: document.getElementById("nombre").value,
        personas: document.getElementById("personas").value,
        fecha: document.getElementById("fecha").value,
        telefono: document.getElementById("telefono").value,
        mesa: document.getElementById("mesa").value
    };

    let url = idReserva ? `/api/reservas/${idReserva}` : "/validar";
    let method = idReserva ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            document.getElementById("formReserva").reset();
            document.getElementById("idReserva").value = "";
            document.getElementById("enviar").style.display = "inline-block";
            document.getElementById("actualizar").style.display = "none";
            cargarReservas();
        }
    })
    .catch(error => console.error("Error:", error));
});

function cargarReservas() {
    fetch('/api/reservas')
        .then(response => response.json())
        .then(reservas => {
            let lista = document.getElementById("listaReservas");
            lista.innerHTML = "";  // 🔹 Limpiar contenido antes de agregar nuevos datos

            let contenido = `<h2>Reservas Actuales</h2>     
            <table class="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Número de personas</th>
                        <th>Fecha</th>
                        <th>Teléfono</th>
                        <th>Número de mesa</th>
                        <th>Editar</th>
                        <th>Eliminar</th>
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
                        <td><button class="btn btn-primary" onclick="editar(${reserva.Id})">Editar</button></td>
                        <td><button class="btn btn-danger" onclick="eliminar(${reserva.Id})">Eliminar</button></td>
                    </tr>`;
            });

            contenido += `</tbody></table>`;
            lista.innerHTML = contenido;
        })
        .catch(error => console.error("Error cargando reservas:", error));
}


function editar(id) {
    fetch(`/api/reservas/${id}`) // Obtener los datos de la reserva
        .then(response => response.json())
        .then(reserva => {
            document.getElementById("idReserva").value = id;
            document.getElementById("nombre").value = reserva.nombre;
            document.getElementById("personas").value = reserva.n_personas;
            document.getElementById("fecha").value = reserva.fecha.split("T")[0];
            document.getElementById("telefono").value = reserva.telefono;
            document.getElementById("mesa").value = reserva.n_mesa;

            document.getElementById("enviar").value = "Actualizar";
        })
        .catch(error => console.error("Error obteniendo reserva:", error));
}

function eliminar(id) {
    if (confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
        fetch(`/api/reservas/${id}`, { method: "DELETE" })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                if (data.success) cargarReservas();
            })
            .catch(error => console.error("Error al eliminar:", error));
    }
}
