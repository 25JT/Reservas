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
    }else{
        if (nPersonas > 8 ) {
            return res.json({message: "No disponemos de mesas para mas de 8 personas"})
        }else{
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
 const insert = "SELECT * FROM datos"

conexion.query(insert, function (error,resul) {
    console.log(resul);
    
    if (error) {
        console.error("Error al traer los datos", error);
        return res.status(500).json({ success: false, message: "Error al consultar con la base de datos" });
    }else{
              
       
    }
    
})


app.listen(3000, function () {
    console.log('Servidor iniciado en http://localhost:3000');
});
