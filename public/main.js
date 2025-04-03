document.addEventListener("DOMContentLoaded", cargarReservas);

document.getElementById("Ptext").innerHTML = "RESERVAS GO!"
document.getElementById("Ptext2").innerHTML="VISTA DE NUESTRO SISTEMA"


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
      Swal.fire({
        title: data.success ? "¡Éxito!" : "Error",
        text: data.message,
        icon: data.success ? "success" : "error",
        confirmButtonText: "Aceptar"
    }).then(() => {
        if (data.success) {
            document.getElementById("formReserva").reset();
            document.getElementById("idReserva").value = "";
            document.getElementById("enviar").style.display = "inline-block";
            document.getElementById("actualizar").style.display = "none";
            cargarReservas();
        }
    }); 
    
    })
    .catch(error => console.error("Error:", error));
});

function cargarReservas() {
    fetch('/api/reservas')
        .then(response => response.json())
        .then(reservas => {
            let lista = document.getElementById("listaReservas");
            lista.innerHTML = "";  // 🔹 Limpiar contenido antes de agregar nuevos datos

            let contenido = `
            <nav class="navbar m-2">
                <h1 class="text-center" id="Ptext3">ESTAS SON LAS RESERVAS QUE TIENES ACTIVAS</h1>
            </nav>   
            <br>
            <div class="container">
                <div class="table-responsive">
                    <table class="table table-bordered table-striped text-center">
                        <thead class="table-danger">
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>N° Personas</th>
                                <th>Fecha</th>
                                <th>Teléfono</th>
                                <th>N° Mesa</th>
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
                        <td><button class="btn btn-primary btn-sm" onclick="editar(${reserva.Id})">Editar</button></td>
                        <td><button class="btn btn-danger btn-sm" onclick="eliminar(${reserva.Id})">Eliminar</button></td>
                    </tr>`;
            });

            contenido += `</tbody></table></div></div>`;
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
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
      });
      swalWithBootstrapButtons.fire({
        title: "¿Estás seguro?",
        text: "¡No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No, cancelar",
        
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`/api/reservas/${id}`, { method: "DELETE" })
            .then(response => response.json())
            .then(data => {
              swalWithBootstrapButtons.fire({
                title: "¡Eliminado!",
                text: data.message,
                icon: "success"
              });
    
              if (data.success) cargarReservas();
            })
            .catch(error => {
              console.error("Error al eliminar:", error);
              Swal.fire("Error", "No se pudo eliminar la reserva", "error");
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire({
            title: "Cancelado",
            text: "Tu reserva está segura",
            icon: "error"
          });
        }
      });
    }


    
