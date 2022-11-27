import mongoose from "mongoose";
import express from "express";
import chalk from "chalk";
import cors from "cors";
import randomize from "randomatic";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;

app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));
app.use(express.json());
app.listen(port,()=>{
    console.log("AguaCapi corriendo el el puerto "+ port);
}); 

let mongoConnection = "mongodb+srv://AguaCapi:AguaCapi@aguacapidb.hcfhc8j.mongodb.net/AguaCapiDB";
let db = mongoose.connection;
db.on('connecting',()=>{
    console.log(chalk.blue('connecting'));
    console.log(mongoose.connection.readyState);
});
db.on('connected',()=>{
    console.log(chalk.blue('connected'));
    console.log(mongoose.connection.readyState);
});
mongoose.connect(mongoConnection,{useNewUrlParser: true});


let userSchema = mongoose.Schema({
    Nombre: {
        type: String,
        required: true
    },
    Apellido: {
        type: String,
        required: true
    },
    Correo:{
        type: String,
        required: true
    },
    Contrasenia:{
        type: String,
        required: true
    },
    Nacimiento:{
        type: String,
        required: true
    },
    Registro: {
        type: String
    },
    Actividad: {
        type: String,
        enum: ["BAJA", "MEDIA", "ALTA"],
        required: true
    },
    Region: {
        type: String,
        enum: ["FRÍA", "TEMPLADA", "CALUROSA"],
        required: true
    },
    Peso: {
        type: Number,
        required: true
    },
    Estatura: {
        type: Number,
        required: true
    },
    Sexo:{
        type: String,
        enum:['M','H'],
        required: true
    },
    StatsData: {
        type: Boolean
    },
    UrlPicture: {
        type: String
    },
    Token: {
        type: String
    },
    Meta: {
        type: Number
    }
})


let liquidSchema = mongoose.Schema({
    Nombre: {
        type: String,
        required: true
    },
    Cantidad: {
        type: Number,
        min: 10,
        max: 2000,
        required: true
    },
    URL:{
        type: String
    },
    IDPertenenciaUsuario:{
        type: String
    }
})

let adminSchema = mongoose.Schema({
    Correo: {
        type: String,
        required: true
    },
    Contrasenia: {
        type: String,
        required: true
    }
})

// ------DECLARACION DE SCHEMAS-----------------------------------------------------------------------------------
let User = mongoose.model('User', userSchema); //para registro y edicion
let Liquid = mongoose.model('Liquid', liquidSchema);

// ---------------------------------------------------------------------------------------------------------------

// *****************************************************************************************************************
//                           USUARIO
// *****************************************************************************************************************

//------ MIDDLEWARE PARA AUTENTICAR ACCIONES DEL USUARIO ----------------------------------------------------------
/* Con este middleware se toma el token del usuario para poder agregar o eliminar bebidas consumidas.
   Cambiar su meta de consumo, o modificar su perfil.
   ------------------------------------
   STATUS CODES:
   500 error interno de la bd
   401 no existe ese token o no tiene token
*/
function autenticarUsuario(req, res, next) {
    // verificar si existe el header con el token
    let token = req.get('x-user-token');
    if(token != "notoken" && token != undefined) {

        // verificar si el token es válido
        User.findOne({Token: req.get("x-user-token")}, (err, user) => {
            if(err) {
                res.status(500).send({error: "middleware: Error interno del servidor"});
            } else if(user) {
                // el token es valido
                console.log(chalk.bgMagenta("Loggeado como usuario: "+user.Nombre));
                next();
            } else {
                // el token no es valido
                res.status(404).send( "No estás autorizado para realizar esta acción, token inválido.");
            }
        });
    } else {
        // No existe dicho header
        res.status(405).send("Usuario no autenticado: no tiene token.")
    }
}
app.use("/api/users/edit", autenticarUsuario);


//  ----- REGISTRAR USUARIO ---------
/* POST /api/users/register
  Se utiliza en el registro de usuarios. Debe verificar que no falte de rellenar ningún campo
  y que tampoco exista el correo en la base de datos. También encripta password.
  ------------------------------------
  STATUS CODES:
   400 si falta información
   401 si el correo o el nombre ya existen
   500 si hay un error en la base de datos
   201 si se registró correctamente
*/
app.post('/api/users/register',(req,res)=> {
    let errorStr = [];
    let missing = false;

    // Revisar si falta algún campo
    if(req.body.Nombre == undefined || req.body.Nombre == "") {
        errorStr.push("nombre");
        missing = true;
    }
    if(req.body.Apellido == undefined || req.body.Apellido == "") {
        errorStr.push("apellido");
        missing = true;
    }
    if(req.body.Correo == undefined || req.body.Correo == "") {
        errorStr.push("correo");
        missing = true;
    }
    if(req.body.Contrasenia == undefined || req.body.Contrasenia == "") {
        errorStr.push("contraseña");
        missing = true;
    }
    if(req.body.Nacimiento == undefined || req.body.Nacimiento == "") {
        errorStr.push("fecha de nacimiento");
        missing = true;
    }
    if(req.body.Actividad == undefined || req.body.Actividad == "") {
        errorStr.push("actividad");
        missing = true;
    }
    if(req.body.Region == undefined || req.body.Region == "") {
        errorStr.push("región");
        missing = true;
    }
    if(req.body.Peso == undefined || req.body.Peso == "") {
        errorStr.push("peso");
        missing = true;
    }
    if(req.body.Estatura == undefined || req.body.Estatura == "") {
        errorStr.push("estatura");
        missing = true;
    }
    if(req.body.Sexo == undefined || !(req.body.Sexo == "M" || req.body.Sexo == "H")) {
        errorStr.push("sexo");
        missing = true;
    }
    if(req.body.StatsData == undefined || !(req.body.StatsData == true || req.body.StatsData == false)) {  
        errorStr.push("StatsData");
        missing = true;
    }
    // Si falta algún campo:
    if(missing) {
        res.status(400).send(`Falta la siguiente información: ${errorStr.join(", ")}.`);
        return;
    }
    // Si no falta nada:
    else {
        // Verificar que no exista el correo:
        User.find({Correo : req.body.Correo},(err,docs)=>{
            if(err) {
                res.status(500).send("Error al verificar el correo.");
                return;
            }
            // Si el correo ya existe:
            if(docs.length > 0) {
                res.status(401).send("Usuario no creado: el correo ya existe.");
                return;
            }
            // Si el correo no existe:
                    else {
                        // Hacer url random en caso de que se necesite
                        let newUserUrl = "";
                        if(req.body.UrlPicture == undefined || req.body.UrlPicture == "") {
                            let num = Math.floor(Math.random() * 100);
                            req.body.Sexo.toUpperCase() == "H" ?
                            newUserUrl = `https://randomuser.me/api/portraits/men/${num}.jpg` :
                            newUserUrl = `https://randomuser.me/api/portraits/women/${num}.jpg`;
                        }
                        else {
                            // Dejar la que puso el usuario
                            newUserUrl = req.body.UrlPicture;
                        }

                        // Encriptar contraseña
                        console.log("Encriptando contraseña...");
                        let hash = bcrypt.hashSync(req.body.Contrasenia,10);
                        console.log("Contraseña encriptada.");
                        
                        // Crear el usuario:
                        // OJO: se añade un espacio de token VACIO para que el userSchema no dé errores
                        let token = "notoken";
                        let today =  new Date();
                        let newUser = new User({
                            Nombre: req.body.Nombre,
                            Apellido: req.body.Apellido,
                            Correo: req.body.Correo,
                            Contrasenia: hash,
                            Nacimiento: req.body.Nacimiento,
                            Registro: `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`,
                            Actividad: req.body.Actividad,
                            Region: req.body.Region,
                            Peso: req.body.Peso,
                            Estatura: req.body.Estatura,
                            Sexo: req.body.Sexo,
                            StatsData: req.body.StatsData,
                            UrlPicture: newUserUrl,
                            Token: token
                        });
                        // Guardar el usuario:
                        newUser.save((err, doc)=>{
                            if(err) {
                                res.status(500).send("Error al guardar el usuario.");
                                return;
                            }
                            // Si se guardó correctamente:
                            else {
                                res.status(201).send("Usuario registrado correctamente.");
                                console.log(doc);
                                return;
                            }
                        });
                    }//
        });
    }
});

//  ----- INICIAR SESIÓN COMO USUARIO ---------
/* POST /api/users/login
    Se utiliza para iniciar sesión. Debe verificar que el correo y la contraseña sean correctos.
    La contraseña ya está encriptada, por lo que debe validarse que sea la misma con compareSync.
    Se genera el token del usuario en caso de que no lo tenga (inicie sesión por 1ra vez). 
    Si ya tiene token, enviar el mismo que ya tiene.
    -------------------------------------------
    STATUS CODES:
    400 si falta correo o contraseña
    401 si el correo o la contraseña son incorrectos
    500 si hay un error en la base de datos
    201 si se inició sesión correctamente
*/
app.post('/api/users/login', (req,res)=>{
    let errorStr = [];
    let missing = false;
    // Verificar que no falte nada:
    if(req.body.Correo == undefined || req.body.Correo == "") {
        errorStr.push("correo");
        missing = true;
    }
    if(req.body.Contrasenia == undefined || req.body.Contrasenia == "") {
        errorStr.push("contraseña");
        missing = true;
    }
    // Si falta algún campo:
    if(missing) {
        res.status(400).send(`Falta la siguiente información: ${errorStr.join(", ")}.`);
        return;
    }
    // Si no falta nada:
    else {
        // Verificar que el correo exista:
        User.find({Correo : req.body.Correo},(err,docs)=>{
            if(err) {
                res.status(500).send("Error al verificar el correo.");
                return;
            }
            // Si el correo no existe:
            if(docs.length == 0) {
                res.status(401).send("El correo ingresado no existe");
                return;
            }
            // Si el correo existe:
            else {
                // Verificar que la contraseña sea correcta:
                if(bcrypt.compareSync(req.body.Contrasenia, docs[0].Contrasenia)) {
                    // Si la contraseña es correcta:
                    // Verificar que el usuario no tenga token:
                    let newToken = docs[0].Token;
                    if(newToken == undefined || newToken == "" || newToken == "notoken") {
                        // Si no tiene token, crearlo con randomatic:
                        newToken = randomize('Aa0','10')+"-"+docs[0]._id;
                        docs[0].Token = newToken;
                        console.log("Token de "+ docs[0].Nombre +" creado:"+docs[0].Token); 
                    } else {
                        // Si ya tiene token, dejar el mismo:
                        newToken = docs[0].Token;
                    }
                    // Guardar el token:
                        User.updateOne({Correo  : req.body.Correo}, {Token : newToken}, (err,doc)=>{
                            if(err) {
                                res.status(500).send("Error al guardar el token.");
                                return;
                            }
                            // Si se guardó correctamente:
                            else {
                                res.set('x-user-token', newToken);
                                res.status(201).send(newToken);
                                return;
                            }
                        });
                }
                else {
                    // Si la contraseña es incorrecta:
                    res.status(401).send("La contraseña ingresada es incorrecta.");
                    return;
                }
            }
        });
    }
});

// ----- EDITAR CUENTA: USUARIO ----------------
/* PUT /api/users/edit?id=####
    Se utiliza para editar la cuenta de un usuario sin repetir correos existentes.
    Debe verificar que el token sea correcto.
    Buscar a partir del _id del usuario.
    No necesariamente debe editar todos los datos existentes.
    ---------------------------------------------
    STATUS CODES:
    405 si falta el token (middleware)
    405 si el token es incorrecto (middleware)
    500 si hay un error en la base de datos
    400 si falta algún campo
*/
app.put('/api/users/edit', (req,res)=>{ 
    let buscarEsteId = req.query.id;
    let updatedSomething = false;
    let editedUser = {};

    // Verificar qué campos quiere editar de su perfil:
    if(req.body.Nombre != undefined) {
        editedUser.Nombre = req.body.Nombre;
        updatedSomething = true;
    }
    if(req.body.Apellido != undefined) {
        editedUser.Apellido = req.body.Apellido;
        updatedSomething = true;
    }
    if(req.body.Correo != undefined) {
        editedUser.Correo = req.body.Correo;
        updatedSomething = true;
    }
    if(req.body.Contrasenia != undefined) {
        editedUser.Contrasenia = bcrypt.hashSync(req.body.Contrasenia, 10);
        updatedSomething = true;
    }
    if(req.body.Nacimiento != undefined) {
        editedUser.Nacimiento = req.body.Nacimiento;
        updatedSomething = true;
    }
    if(req.body.Actividad != undefined) {
        editedUser.Actividad = req.body.Actividad;
        updatedSomething = true;
    }
    if(req.body.Region != undefined) {
        editedUser.Region = req.body.Region;
        updatedSomething = true;
    }
    if(req.body.Peso != undefined) {
        editedUser.Peso = req.body.Peso;
        updatedSomething = true;
    }
    if(req.body.Estatura != undefined) {
        editedUser.Estatura = req.body.Estatura;
        updatedSomething = true;
    }
    if(req.body.Sexo != undefined) {
        editedUser.Sexo = req.body.Sexo;
        updatedSomething = true;
    }
    if(req.body.UrlPicture != undefined) {
        editedUser.UrlPicture = req.body.UrlPicture;
        updatedSomething = true;
    }

    if(updatedSomething) {
        // Verificar que el correo no exista:
        User.find({Correo : req.body.Correo},(err,docs)=>{
            if(err) {
                res.status(500).send("Error al verificar el correo.");
                return;
            }
            // Si el correo no existe:
            if(docs.length == 0) {
                // Actualizar el usuario:
                User.updateOne({_id : buscarEsteId}, editedUser,{new:true}, (err,doc)=>{
                    if(err) {
                        res.status(500).send("Error al actualizar el usuario.");
                        return;
                    }
                    // Si se actualizó correctamente:
                    else {
                        res.status(201).send("Usuario actualizado correctamente.");
                        return;
                    }
                });
            }
            // Si el correo ya existe:
            else {
                res.status(400).send("El correo ingresado ya existe.");
                return;
            }
        }); 
    
    } else {
        res.status(200).send("No se ingresaron datos distintos.");
        return;
    }
});


// ************************************************************************************************************************************
//                        ADMINISTRADOR
// ************************************************************************************************************************************

//------ MIDDLEWARE PARA AUTENTICAR ACCIONES DEL ADMIN----------------------------------------------------------
/* Con este middleware se toma el token del usuario para poder agregar o eliminar bebidas default.
   Filtrar usuarios, mostrar detalles y eliminarlos.
   ------------------------------------
   STATUS CODES:
   500 error interno de la bd
   401 no existe ese token o no tiene token
*/
function autenticarAdmin(req, res, next) {
    if(req.headers['x-user-token'] == "admintoken") {
        console.log(chalk.bgWhite("Loggeado como admin: "+req.headers['x-user-token']));
        next();
    }
    else {
        res.status(404).send("No está autorizado para entrar a contenido de administrador");
    }

}
app.use("/api/admin/", autenticarAdmin);

// ----- FILTROS DE BÚSQUEDA DE USUARIOS ---------------
/* GET /api/admin/search?nombre=##&apellido=##&id=###
    Se utiliza para buscar usuarios por nombre y/o apellido en la barra de búsquedas del admin.
    O si se consultan los detalles, entonces se usa con id.
    Debe verificar que el token del admin sea correcto.
    Muestra coincidencias con el substring enviado o con el nombre/apellido si es que está completo.
    ---------------------------------------------
    STATUS CODES:
    405 si falta el token (middleware)
    500 si hay un error en la base de datos
*/
app.get('/api/admin/search', (req,res)=>{
    let nombre = req.query.nombre;
    let apellido = req.query.apellido;
    let id = req.query.id;
    let filtro = {};
    if(nombre != undefined) {
        filtro.Nombre = {$regex : nombre};
    }
    if(apellido != undefined) {
        filtro.Apellido = {$regex : apellido};
    }
    if(id != undefined) {
        filtro._id = id;
    }
    User.find(filtro, (err, docs)=>{
        if(err) {
            res.status(500).send("Error al buscar los usuarios.");
            return;
        }
        else {
            console.log("Usuarios encontrados: ");
            console.log(docs);
            res.status(200).send(docs);

            return;
        }
    });
});

// ------ ELIMINAR USUARIO ----------------
/* DELETE /api/admin/delete?id=###
    Se utiliza para eliminar un usuario.
    Debe verificar que el token del admin sea correcto.
    ---------------------------------------------
    STATUS CODES:
    405 si falta el token (middleware)
    500 si hay un error en la base de datos
    200 si se eliminó correctamente
*/
app.delete('/api/admin/deleteuser', (req,res)=>{
    let id = req.query.id;
    User.deleteOne({_id : id
    }, (err, docs)=>{
        if(err) {
            res.status(500).send("Error al eliminar el usuario.");
            return;
        }
        else {
            console.log("Usuario eliminado: ");
            console.log(docs);
            res.status(200).send(docs);

            return;
        }
    });
});


// ------ PUBLICAR BEBIDA DEFAULT ------------
/* POST /api/admin/addliquid
    Se utiliza para agregar una bebida default.
    Debe verificar que el token del admin sea correcto.
    ---------------------------------------------
    STATUS CODES:
    405 si falta el token (middleware)
    500 si hay un error en la base de datos
    200 si se agregó correctamente
*/
app.post('/api/admin/addliquid', (req,res)=>{
    let nuevaBebida = new Liquid({
        Nombre : req.body.Nombre,
        Cantidad : req.body.Cantidad,
        URL : req.body.URL,
        IDPertenenciaUsuario : "default"
    });
    nuevaBebida.save((err,doc)=> {
        if(err) {
            res.status(500).send("Error al guardar la bebida.");
            return;
        }
        else {
            console.log("Bebida agregada: ");
            console.log(doc);
            res.status(200).send(doc);
            return;
        }
    });
});

// ------ ELIMINAR BEBIDA DEFAULT ------------
/* DELETE /api/admin/deleteliquid?id=###
    Se utiliza para eliminar una bebida default.
    Debe verificar que el token del admin sea correcto.
    ---------------------------------------------
    STATUS CODES:
    405 si falta el token (middleware)
    500 si hay un error en la base de datos
    200 si se eliminó correctamente
*/
app.delete('/api/admin/deleteliquid', (req,res)=>{ 
    let id = req.query.id;
    Liquid.deleteOne({_id : id }, (err, docs)=>{
        if(err) {
            res.status(500).send("Error al eliminar la bebida.");
            return;
        }
        else {
            console.log("Bebida eliminada: ");
            console.log(docs);
            res.status(200).send(docs);

            return;
        }
    });
});