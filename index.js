import conexion from "./public/Conexion.js";
import express from "express";

const mesasD = 8;

const app = express();
app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.render('registro', { message: 'Datos insertados correctamente.' });
});
//validar mesas disponibles






app.post('/validar', function (req, res) {
    const datos = req.body;
    let nombre = datos.nombre;
    let nPersonas = datos.personas;
    let fecha = datos.fecha;
    let telefono = datos.telefono;
    let nMesa = parseInt(datos.mesa, 10);

    //validaciones 
    if (nMesa < 1 || nMesa > mesasD) {
        return res.json({ success: false, message: "Por favor, escoja una mesa entre 1 y 8." });
    } else {
        if (nPersonas > 8) {
            return res.json({ message: "No disponemos de mesas para mas de 8 personas" })
        } else {
            let hoy = new Date();
            hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

            let fechaReserva = new Date(fecha);

            if (fechaReserva < hoy) {
                return res.status(400).json({ success: false, message: "No puedes reservar en una fecha pasada. Ni tampoco para el dia de hoy" });
            }
        }
    }

    //consulta para insertar
    let buscar2 = `
        SELECT n FROM (
            SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
            UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
        ) AS all_mesas
        WHERE n NOT IN (SELECT n_mesa FROM datos)`;

    conexion.query(buscar2, function (error, resultD) {
        if (error) {
            console.error("Error en la consulta:", error);
            return res.status(500).json({ success: false, message: "Error al verificar disponibilidad de mesas." });
        }

        let mesasDisponibles = resultD.map(row => row.n);

        if (!mesasDisponibles.includes(nMesa)) {
            return res.json({ success: false, message: `La mesa ${nMesa} no está disponible. Mesas disponibles: ${mesasDisponibles.join(", ")}` });
        }

        let insertar = "INSERT INTO datos (nombre, n_personas, fecha, telefono, n_mesa) VALUES (?, ?, ?, ?, ?)";
        let valores = [nombre, nPersonas, fecha, telefono, nMesa];

        conexion.query(insertar, valores, function (error, result) {
            if (error) {
                console.error("Error insertando datos:", error);
                return res.status(500).json({ success: false, message: "Error al crear la reserva." });
            }

            console.log("Datos insertados correctamente");

            return res.json({ success: true, message: "Reserva creada con éxito." });

        });
    });
});


//Mostrar contenido de la tabla

app.get('/api/reservas', function (req, res) {
    let consulta = "SELECT * FROM datos";

    conexion.query(consulta, function (error, resultados) {
        if (error) {
            console.error("Error al obtener datos:", error);
            return res.status(500).json({ error: "Error al obtener las reservas." });
        }

        res.json(resultados); // Enviar datos como JSON
    });
});

//Eliminar usuario
app.delete('/api/reservas/:id', (req, res) => {
    const reservaId = req.params.id;
    const sql = "DELETE FROM datos WHERE Id = ?";

    conexion.query(sql, [reservaId], (err, result) => {
        if (err) {
            console.error("Error eliminando reserva:", err);
            res.status(500).json({ success: false, message: "Error eliminando reserva" });
        } else {
            if (result.affectedRows > 0) {
                res.json({ success: true, message: "Reserva eliminada exitosamente" });
            } else {
                res.status(404).json({ success: false, message: "Reserva no encontrada" });
            }
        }
    });
});

// Obtener una reserva específica
app.get('/api/reservas/:id', function (req, res) {
    const reservaId = req.params.id;
    let consulta = "SELECT * FROM datos WHERE Id = ?";

    conexion.query(consulta, [reservaId], function (error, resultado) {
        if (error) {
            console.error("Error obteniendo la reserva:", error);
            return res.status(500).json({ error: "Error al obtener la reserva." });
        }
        if (resultado.length === 0) {
            return res.status(404).json({ error: "Reserva no encontrada." });
        }
        res.json(resultado[0]); // Enviar la reserva encontrada
    });
});

// Actualizar una reserva
app.put('/api/reservas/:id', function (req, res) {
    const reservaId = req.params.id;
    const { nombre, personas, fecha, telefono, mesa } = req.body;
    let mesasD = 8; // Número máximo de mesas disponibles

    // Validar número de mesa
    if (mesa < 1 || mesa > mesasD) {
        return res.json({ success: false, message: "Por favor, escoja una mesa entre 1 y 8." });
    }

    // Validar número de personas
    if (personas > 8) {
        return res.json({ success: false, message: "No disponemos de mesas para más de 8 personas." });
    }

    // Validar fecha
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let fechaReserva = new Date(fecha);

    if (fechaReserva < hoy) {
        return res.status(400).json({ success: false, message: "No puedes reservar en una fecha pasada ni para el día de hoy." });
    }

    // **Obtener la mesa actual de la reserva**
    let consultaMesaActual = "SELECT n_mesa FROM datos WHERE Id=?";
    
    conexion.query(consultaMesaActual, [reservaId], function (error, resultado) {
        if (error) {
            console.error("Error verificando mesa actual:", error);
            return res.status(500).json({ success: false, message: "Error al verificar la mesa actual." });
        }

        if (resultado.length === 0) {
            return res.status(404).json({ success: false, message: "Reserva no encontrada." });
        }

        let mesaActual = resultado[0].n_mesa;

        // **Si la mesa no ha cambiado, actualizar directamente**
        if (parseInt(mesa) === mesaActual) {
            return actualizarReserva();
        }

        // **Consultar mesas disponibles**
        let consultaMesasDisponibles = `
            SELECT n FROM (
                SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
                UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
            ) AS all_mesas
            WHERE n NOT IN (SELECT n_mesa FROM datos WHERE fecha = ? AND Id <> ?)`;

        conexion.query(consultaMesasDisponibles, [fecha, reservaId], function (error, resultado) {
            if (error) {
                console.error("Error verificando mesas disponibles:", error);
                return res.status(500).json({ success: false, message: "Error al verificar disponibilidad de mesas." });
            }

            let mesasDisponibles = resultado.map(row => row.n);

            // **Mostrar mesas disponibles al usuario**
            console.log(`Mesas disponibles para la fecha ${fecha}:`, mesasDisponibles);

            // **Si la mesa elegida no está disponible, bloquearla**
            if (!mesasDisponibles.includes(parseInt(mesa))) {
                return res.status(400).json({
                    success: false,
                    message: `La mesa ${mesa} no está disponible en esa fecha. Mesas disponibles: ${mesasDisponibles.join(", ")}`
                });
            }

            // **Actualizar la reserva si la nueva mesa está libre**
            actualizarReserva();
        });
    });

    function actualizarReserva() {
        let consultaActualizar = "UPDATE datos SET nombre=?, n_personas=?, fecha=?, telefono=?, n_mesa=? WHERE Id=?";
        let valores = [nombre, personas, fecha, telefono, mesa, reservaId];

        conexion.query(consultaActualizar, valores, function (error, resultado) {
            if (error) {
                console.error("Error actualizando la reserva:", error);
                return res.status(500).json({ success: false, message: "Error al actualizar la reserva." });
            }
            if (resultado.affectedRows > 0) {
                res.json({ success: true, message: "Reserva actualizada correctamente." });
            } else {
                res.status(404).json({ success: false, message: "Reserva no encontrada." });
            }
        });
    }
});



app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        return res.sendStatus(204); // Responde y termina la solicitud
    }
    next();
});




app.listen(3000, function () {
    console.log('Servidor iniciado en http://localhost:3000');
});
