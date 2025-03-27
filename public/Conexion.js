import mysql from 'mysql';
let conexion = mysql.createConnection({
    host: 'localhost',
    database: 'reserva',
    user: 'root',
    password: '',
});

export default conexion;

conexion.connect(function (error) {
    if (error) {
        console.log('Error en la conexion');
        console.log(error);
    } else {
        console.log('Conexion correcta');
        
        
    }
});


// 



// //INSERTAR
// const newRegister = "INSERT INTO datos (Id, N_Mesa, Nombre, Telefono) VALUES (NULL, '3', 'bat', '65454');";
// conexion.query(newRegister, function (error, result) {
//     if (error) {
//         throw error;
//     } else {
//         console.log("Dato insertado");
//         conexion.end();
//     }
// });    

//ACTUALIZAR
// const update = "UPDATE datos SET Nombre = 'Dr' WHERE datos.Id = 6;";

// conexion.query(update, function (error, result) {
//     if (error) {
//         throw error;
//     } else {
//         console.log(result);
//     }
// }
// );

//ELIMINAR
// const eliminar = "DELETE FROM datos WHERE datos.Id = 5;";
// conexion.query(eliminar, function (error, result) {
//     if (error) {
//         throw error;
//     } else {
//         console.log("dato eliminado");
//         conexion.end();
//     }
// }
// );

//VER TABLA
// const tabla = "SELECT * FROM datos";

// conexion.query(tabla, function (error, result) {
//     if (error) {
//         throw error;

//     } else {
//         console.log(result);


//     }
// });
