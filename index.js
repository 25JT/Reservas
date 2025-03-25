const express = require('express');
let mysql = require('mysql');

let conexion = mysql.createConnection({
    host: 'localhost',
    database: 'reserva',
    user: 'root',
    password: '',
});

conexion.connect(function (error) {
    if (error) {
        console.log('Error en la conexion');
        console.log(error);
    } else {
        console.log('Conexion correcta');
        
    }
});


const app = express();

app.set('view engine', 'ejs');

//DATOS DE USUARIO PARA QUE EL SERVER LO ENTIENDA
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
        let nMesa = datos.mesa;

        let buscar = "SELECT * FROM datos WHERE n_mesa = "+ nMesa +"" 
      conexion.query(buscar, function (error, result) {
            if(error){
                throw error;

            }else{
                if (result.length>0) {
                    console.log ("Mesa ya reservada") ;
                    conexion.end()

                   
                }else{
                    let insertar = "INSERT INTO datos (Id, nombre, n_personas, fecha, telefono, n_mesa) VALUES (NULL, '" + nombre + "', '" + nPersonas + "', '" + fecha + "', '" + telefono + "', '" + nMesa + "');";
                    conexion.query(insertar, function (error, result) {
                        if (error) {
                            throw error;
                        } else {
                            console.log("Datos insertados");
                            
                        }
                    });
                }
            }     
      })
        
       

        
    });

app.listen(3000, function () {
    console.log('Servidor iniciado http://localhost:3000'); {
    }

});