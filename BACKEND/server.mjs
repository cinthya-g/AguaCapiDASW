import mongoose from "mongoose";
import express from "express";
import chalk from "chalk";
import cors from "cors";
import randomize from "randomatic";
import bcrypt from "bcrypt";
import e from "express";
import url from "url";
import path from "path";

// Constantes de render
/*
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
*/

//------------------------------------------------

const app = express();
const port = 3000;

//USAMOS EL DIRNAME:
//app.use(express.static(__dirname + '/public'));
//app.use(express.static(__dirname+'../FRONTEND/IMAGES/'));
//--------------------------------

app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));

app.use(express.json());

app.listen(port,()=>{
    console.log("AguaCapi corriendo el el puerto "+ port);
}); 


/*

app.get('/', (req, res) => {
    console.log(chalk.blue("Entró a la raíz"));
    //res.send('Raíz del sitio');
    res.sendFile(path.join(__dirname, '../FRONTEND/Home.html'));
});
*/

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
        enum: ["FRIA", "TEMPLADA", "CALUROSA"],
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
    // Lo que lleva
    Meta: {
        type: Number
    },
    // Lo que debe alcanzar
    MetaObjetivo: {
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

let consumoSchema = mongoose.Schema({
    Fecha: {
        type: String
    },
    IDUsuario: {
        type: String
    } ,
    IDBebida: {
        type: String
    },
    NombreBebida: {
        type: String
    },
    Cantidad: {
        type: Number,
        min: 10,
        max: 2000
    },
    URL: {
        type: String
    }
})

// ------DECLARACION DE SCHEMAS-----------------------------------------------------------------------------------
let User = mongoose.model('User', userSchema); 
let Liquid = mongoose.model('Liquid', liquidSchema);
let Consumo = mongoose.model('Consumo', consumoSchema);
// ---------------------------------------------------------------------------------------------------------------

// ------- ACTUALIZAR META ----------------------------------------------------------------------
/* Función que recibe el id del usuario y la fecha actual.
   Devolverá la suma de las cantidades de los consumos que coincidan con el id del usuario y la fecha actual.
*/
function updateMeta(idUsuario){
    let fechaHoy = new Date().toJSON().slice(0,10);
    let sumaMeta = 0;
    console.log("La fecha es: "+ fechaHoy);
    // Buscar todos los consumos que coincidan con el id del usuario y la fecha actual
    Consumo.find({IDUsuario: idUsuario, Fecha: fechaHoy}, (err, consumos) => {
        console.log("Consumos encontrados: "+ consumos.length);
        if(err){
            console.log(err);
        } else {
            // Sumar las cantidades de los consumos
            consumos.forEach(consumo => {
                sumaMeta += consumo.Cantidad;
            });
        }

            // Buscar el usuario que tiene ese id y actualizar su meta (lo que lleva)
            User.findOne({_id: idUsuario}, (err, usuario) => {
                if(err){
                    console.log(err);
                } else {
                    console.log("SumaMeta: "+ sumaMeta);
                    usuario.Meta = sumaMeta;
                    console.log(chalk.bgGreen("La meta de "+ usuario.Nombre +" es: "+ usuario.Meta));
                    usuario.save();
                }
            });
    });

}


// *****************************************************************************************************************
//                           USUARIO
// *****************************************************************************************************************

//------ MIDDLEWARE PARA AUTENTICAR ACCIONES DEL USUARIO ----------------------------------------------------------
/* Con este middleware se toma el token del usuario para poder agregar o eliminar bebidas consumidas.
   Cambiar su meta de consumo, o modificar su perfil.
   ------------------------------------
   STATUS CODES:
   500 error interno de la bd
   401 hay un token, pero no existe en la bd
   400 no hay token
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
                res.status(401).send( "No estás autorizado para realizar esta acción, token inválido.");
            }
        });
    } else {
        // No existe dicho header (forbidden)
        res.status(400).send("Usuario no autenticado: no tiene token.")
    }
}
app.use("/api/users/edit", autenticarUsuario);
app.use("/api/users/addliquid", autenticarUsuario);
app.use("/api/users/deleteliquid", autenticarUsuario);
app.use("/api/users/getinfo", autenticarUsuario);
app.use("/api/users/getdefaultliquids", autenticarUsuario);
app.use("/api/users/updatemeta", autenticarUsuario);
app.use("/api/users/ranking", autenticarUsuario);
app.use("/api/users/gettodayliquids", autenticarUsuario);


//  ----- REGISTRAR USUARIO ---------
/* POST /api/users/register
  Se utiliza en el registro de usuarios. Debe verificar que no falte de rellenar ningún campo
  y que tampoco exista el correo en la base de datos. También encripta password.
  ------------------------------------
  STATUS CODES:
   401 hay un token, pero no existe en la bd o si ya hay un correo existente
   400 no hay token o si falta informacion
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
                        let today = new Date().toJSON().slice(0,10);
                        let newUser = new User({
                            Nombre: req.body.Nombre,
                            Apellido: req.body.Apellido,
                            Correo: req.body.Correo,
                            Contrasenia: hash,
                            Nacimiento: req.body.Nacimiento,
                            Registro: today,
                            Actividad: req.body.Actividad,
                            Region: req.body.Region,
                            Peso: req.body.Peso,
                            Estatura: req.body.Estatura,
                            Sexo: req.body.Sexo,
                            StatsData: req.body.StatsData,
                            UrlPicture: newUserUrl,
                            Token: token,
                            Meta: 0,
                            MetaObjetivo: 2000
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
   401 hay un token, pero no existe en la bd o el correo no existe
   400 no hay token o si falta info. de login
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
                                // Actualizar consumo en caso de que se reloggee;
                                updateMeta(docs[0]._id);
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
   401 hay un token, pero no existe en la bd
   400 no hay token o si se quiere cambiar el correo a uno existente
    500 si hay un error en la base de datos
    400 si falta algún campo
*/
app.put('/api/users/edit', (req,res)=>{ 
    let buscarEsteId = req.query.id;
    let updatedSomething = false;
    let editedUser = {};

    // Verificar qué campos quiere editar de su perfil:
    if(req.body.Nombre != undefined && req.body.Nombre != "") {
        editedUser.Nombre = req.body.Nombre;
        updatedSomething = true;
    }
    if(req.body.Apellido != undefined && req.body.Apellido != "") {
        editedUser.Apellido = req.body.Apellido;
        updatedSomething = true;
    }
    if(req.body.Correo != undefined && req.body.Correo != "") {
        editedUser.Correo = req.body.Correo;
        updatedSomething = true;
    }
    if(req.body.Contrasenia != undefined && req.body.Contrasenia != "") {
        editedUser.Contrasenia = bcrypt.hashSync(req.body.Contrasenia, 10);
        updatedSomething = true;
    }
    if(req.body.Nacimiento != undefined    && req.body.Nacimiento != "") {
        editedUser.Nacimiento = req.body.Nacimiento;
        updatedSomething = true;
    }
    if(req.body.Actividad != undefined && req.body.Actividad != "") {
        editedUser.Actividad = req.body.Actividad;
        updatedSomething = true;
    }
    if(req.body.Region != undefined && req.body.Region != "") {
        editedUser.Region = req.body.Region;
        updatedSomething = true;
    }
    if(req.body.Peso != undefined && req.body.Peso != "") {
        editedUser.Peso = req.body.Peso;
        updatedSomething = true;
    }
    if(req.body.Estatura != undefined && req.body.Estatura != "") {
        editedUser.Estatura = req.body.Estatura;
        updatedSomething = true;
    }
    if(req.body.Sexo != undefined && req.body.Sexo != "") {
        editedUser.Sexo = req.body.Sexo;
        updatedSomething = true;
    }
    if(req.body.UrlPicture != undefined && req.body.UrlPicture != "") {
        editedUser.UrlPicture = req.body.UrlPicture;
        updatedSomething = true;
    }
    console.log(chalk.red(updatedSomething));

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

// ----- AÑADIR CONSUMO: USUARIO ----------------
/* POST /api/users/addliquid
    Se utiliza para añadir un consumo de líquido a un usuario.
    Debe verificar que el token sea correcto.
    Buscar a partir del _id del usuario.
    ---------------------------------------------
    STATUS CODES:
    401 hay un token, pero no existe en la bd
    400 no hay token
    500 si hay un error en la base de datos
    201 si se registra bien el consumo
*/
app.post('/api/users/addliquid', (req,res)=>{ 
    // Se añade un consumo independientemente de si es de bebida default o no
    // Recibe un body que recopila:
    // {IDUsuario, IDBebida, NombreBebida, Cantidad, URL}

    // Si es una bebida default, entonces se busca esa bebida en el schema de liquids  utilizando su nombre y cantidad
    // y se agrega como consumo al usuario con la fecha actual +su id de usuario
    if(req.body.IDBebida != undefined) {
        Liquid.find({_id : req.body.IDBebida}, (err,docs)=>{
            if(err) {
                res.status(500).send("Error al buscar la bebida.");
                return;
            }
            // Si la bebida existe:
            if(docs.length > 0) {
                // Vamos a crear nuevo consumo para ese usuario con esa bebida default:
                // Guardamos fecha actual:
                let today = new Date().toJSON().slice(0,10);
                let newConsumo = new Consumo({
                    Fecha: today,
                    IDUsuario: req.body.IDUsuario,
                    IDBebida: req.body.IDBebida,
                    NombreBebida: docs[0].Nombre,
                    Cantidad: docs[0].Cantidad,
                    URL: docs[0].URL
                });

                // Se añade el consumo nuevo creado:
                newConsumo.save((err,doc)=>{
                    if(err) {
                        updateMeta(req.body.IDUsuario);
                        res.status(500).send("Error al guardar el consumo.");
                        return;
                    }
                    // Si se guardó correctamente:
                    else {
                        // Actalizar meta de lo q lleva consumido el usuario:
                        updateMeta(req.body.IDUsuario);
                        res.status(201).send("Consumo registrado correctamente.");
                        return;
                    }
                });
            }
        });
    }
    // Si es una bebida personalizada, entonces se crea una nueva bebida con los datos recibidos en el body
    // y también se crea un consumo vinculado al usuario que la creó y esa nueva bebida
    else {
        // Vamos a crear una nueva bebida personalizada:
        let missing = false;
        if(req.body.Cantidad == undefined || req.body.Cantidad == "") missing = true;
        if(req.body.NombreBebida == undefined || req.body.NombreBebida == "") missing = true;

        // Ver si tiene URL o asignarle una default
        let newURL = req.body.URL;
        if(newURL == undefined || newURL == "") {
            newURL = "./IMAGES/DRINKS/default.png";
        }

        if(missing) {
            res.status(400).send("Faltan datos.");
            return;
        }

        // Crear nueva bebida:
        if(req.body.Cantidad > 2000) req.body.Cantidad = 2000;
        let newLiquid = new Liquid({
            Nombre: req.body.NombreBebida,
            Cantidad: req.body.Cantidad,
            URL: newURL,
            IDPertenenciaUsuario: req.body.IDUsuario
        });
        // Se añade la bebida nueva:
        newLiquid.save((err,doc)=>{
            if(err) {
                res.status(500).send("Error al guardar la bebida.");
                return;
            }
            // Si se guardó correctamente:
            else {
                // Vamos a crear nuevo consumo para ese usuario con esa bebida personalizada:
                // Guardamos fecha actual:
                let today = new Date().toJSON().slice(0,10);
                let newConsumo = new Consumo({
                    Fecha: today,
                    IDUsuario: req.body.IDUsuario,
                    IDBebida: doc._id,
                    NombreBebida: req.body.NombreBebida,
                    Cantidad: req.body.Cantidad,
                    URL: newURL
                });

                // Se añade el consumo nuevo creado:
                newConsumo.save((err,doc)=>{
                    if(err) {
                        updateMeta(req.body.IDUsuario);
                        res.status(500).send("Error al guardar el consumo.");
                        return;
                    }
                    // Si se guardó correctamente:
                    else {
                        // Actalizar meta de lo q lleva consumido el usuario:
                        updateMeta(req.body.IDUsuario);
                        res.status(201).send("Consumo registrado correctamente.");
                        return;
                    }
                });
            }
        });
    }

});

// ----- ELIMINAR CONSUMO: USUARIO ----------------
/* POST /api/users/deleteliquid
    Se utiliza para eliminar un consumo de líquido a un usuario. Eliminará el consumo más reciente coincidente.
    Debe verificar que el token sea correcto.
    Busca a partir del _id del usuario y del nombre de la bebida.
    ---------------------------------------------
    STATUS CODES:
    401 hay un token, pero no existe en la bd
    400 no hay token
    500 si hay un error en la base de datos
    201 si se elimina bien el consumo
*/
app.delete('/api/users/deleteliquid', (req,res)=>{
    // Recibimos: {IDUsuario, NombreBebida}
    // Revisar que no venga vacío el nombre
    if(req.body.NombreBebida == undefined || req.body.NombreBebida == "") {
        res.status(400).send("Ingresa el nombre.");
        return;
    }
    
    // Buscar el consumo que tenga el nombre de la bebida, fecha de hoy y id del usuario
    let hoy = new Date().toJSON().slice(0,10);
    Consumo.findOneAndDelete({IDUsuario: req.body.IDUsuario, NombreBebida: req.body.NombreBebida, Fecha: hoy}, (err,doc)=>{
        if(err) {
            res.status(500).send("Error al eliminar el consumo.");
            return;
        }        
        else {
            console.log(chalk.green("Se eliminó el consumo: " + doc));

            // Eliminar la bebida vinculada a ese consumo
            Liquid.findOneAndDelete({Nombre: req.body.NombreBebida, IDPertenenciaUsuario: req.body.IDUsuario}, (err,doc)=>{
                if(err) {
                    res.status(500).send("No se puede eliminar la bebida");
                    return;
                }
                if( doc == null || doc.length <= 0) {
                    // Determinar si el nombre de la bebida estaba bien escrito
                    Liquid.findOne({Nombre : req.body.NombreBebida}, (err,doc)=>{
                        if(err) {
                            res.status(500).send("Error al buscar la bebida.");
                            return;
                        }
                        if(doc == null || doc.length <= 0) {
                            res.status(404).send("No existe la bebida.");
                            return;
                        } else {
                            updateMeta(req.body.IDUsuario);
                            res.status(200).send("No hay bebida personalizada con ese nombre.")
                            return;
                        }
                    });
                }
                // Si se eliminó correctamente:
                else {
                    updateMeta(req.body.IDUsuario);
                    res.status(201).send("Bebida eliminada correctamente.");
                    return;
                }
            });
        }
    });
});

// ----- TRAER INFORMACION DEL USUARIO LOGGEADO ----------------
/* GET /api/users/getinfo
    Se utiliza para traer la información del usuario loggeado.
    Debe verificar que el token sea correcto.
    Busca a partir del _id del usuario.
    ---------------------------------------------
    STATUS CODES:
    401 hay un token, pero no existe en la bd
    400 no hay token
    500 si hay un error en la base de datos
    201 si se trae bien la información
*/
app.get('/api/users/getinfo', (req,res)=>{
    // Recibimos: getinfo?id=###
    // Buscar usuario por el _id
    console.log("id que buscas: " + req.query.id);
    User.findOne({_id: req.query.id}, (err,doc)=>{
        if(err) {
            res.status(500).send("Error al traer la información del usuario.");
            return;
        }        
        else {
            
            console.log(chalk.green("Se trajo la información del usuario: " + doc));
            updateMeta(req.query.id);
            res.status(201).send(doc);
            return;
        }
    });
});

//----- TRAER BEBIDAS DEFAULT EXISTENTES ---------------
app.get('/api/users/getdefaultliquids', (req, res) =>{
    let nombre = req.query.nombre;
    let id = 'default'
    let filtro = {}
    filtro.IDPertenenciaUsuario = {$regex : id};
    if(nombre != undefined){
        filtro.Nombre = {$regex : nombre};
    }
    Liquid.find(filtro, (err, docs)=>{
        if(err) {
            res.status(500).send("Error al buscar las bebidas.");
            return;
        }
        else {
            console.log("Bebidas encontrados: ");
            console.log(docs);
            res.status(201).send(docs);
            return;
        }
    });
});


//------- TRAER BEBIDAS ASOCIADAS A ESE USUARIO PARA BEBIDAS RECIENTES ----------
/* Busca en la base de datos los consumos con fecha actual y el id del usuario loggeado, 
   y regresa los consumos que coincidan.
   Guarda sus IDs en un arreglo y busca las bebidas con esos IDs en la base de datos de bebidas
   para regresar su nombre, cantidad y url.
   GET /api/users/gettodayliquids?idUsuario=###&fecha=####
*/
app.get('/api/users/gettodayliquids', (req, res) =>{
    let id = req.query.idUsuario;
    let fecha = req.query.fecha;
    Consumo.find({IDUsuario: id, Fecha: fecha}, (err, docs)=>{
        if(err) {
            res.status(500).send("Error al buscar las bebidas.");
            return;
        }
        else {
            if(docs.length <= 0) {
                // Significa que hoy no ha consumido nada, por lo tanto se mostrará
                // un div que diga "No has consumido nada hoy"
                res.status(200).send("No hay consumos de hoy.");
                return;
            } else {
                // Regresa el arreglo de consumos encontrados
                console.log("Consumos de hoy encontrados: ");
                console.log(docs);
                // send docs
                res.status(201).send(docs);

            }
        }
    });
});




// ------ ACTUALIZAR META ----------
app.put('/api/users/updatemeta', (req,res)=>{ 
    // Recibimos: {IDUsuario, MetaObjetivo, Personalizada: true/false}
    // Si es personalizada, tendremos MetaObjetivo. Si no, calcularla
    
    if(req.body.Personalizada) {
    // Recibimos: {IDUsuario, MetaObjetivo}
    let nuevoObjetivo = req.body.MetaObjetivo;
    if(nuevoObjetivo == undefined || nuevoObjetivo == null || nuevoObjetivo == "") {
        res.status(400).send("No se recibió el nuevo objetivo.");
        return;
    }
    if(nuevoObjetivo < 1000) {
        res.status(400).send("El objetivo debe ser mayor a 1000 ml.");
        return;
    }
    // Si está todo completo, buscar usuario al que se le actualizará la meta:
        User.findOne({_id: req.body.IDUsuario}, (err,doc)=>{
            if(err) {
                res.status(500).send("Error al actualizar la meta.");
                return;
            }        
            else {
                if(doc == null || doc.length <= 0) {
                    res.status(401).send("No existe el usuario.");
                    return;
                }
                else {
                    // Actualizar meta:
                    doc.MetaObjetivo = nuevoObjetivo;
                    doc.save((err,doc)=>{
                        if(err) {
                            res.status(500).send("Error al actualizar la meta.");
                            return;
                        }
                        else {
                            console.log(chalk.green("Se actualizó la meta del usuario: " + doc));
                            updateMeta(req.body.IDUsuario);
                            res.status(201).send("Meta actualizada correctamente.");
                            return;
                        }
                    });
                }
            }
        });
    }
    else {
        // Calcularemos la meta
        // Solo recibimos el {IDUsuario}, debemos buscarlo y obtener sus datos
        User.findOne({_id: req.body.IDUsuario}, (err,doc)=>{
            if(err) {
                res.status(500).send("Error en la base de datos.");
                return;
            }        
            else {
                if(doc == null || doc.length <= 0) {
                    res.status(401).send("No existe el usuario.");
                    return;
                }
                else {
                    // Obtener peso, altura, region, sexo, edad y estatura para el cálculo
                    let hoy = new Date().getFullYear();
                    let peso = doc.Peso;
                    let altura = doc.Estatura;
                    let region = doc.Region;
                    let sexo = doc.Sexo;
                    let edad = doc.Nacimiento;
                    let actividad = doc.Actividad;
                    edad = parseInt(edad.substring(0, 4),10);

                    // Calcular meta
                    let calculo = 0;
                    let adicional = 0;
                    if(altura > 170) adicional += 50;
                    else if(region == "FRIA") adicional += 60;
                    else if(region == "TEMPLADA") adicional += 110;
                    else if(region == "CALUROSA") adicional += 300;
                    else if(edad >= 50) adicional += 120;
                    else if(actividad == "BAJA") adicional += 40;
                    else if(actividad == "MEDIA") adicional += 120;
                    else if(actividad == "ALTA") adicional += 360;
                    
                    calculo = peso*35 + adicional;

                    doc.MetaObjetivo = calculo;
                    console.log(chalk.bgRed("Objetivo calculado: " + calculo));

                    doc.save((err,doc)=>{
                        if(err) {
                            res.status(500).send("Error al actualizar la meta.");
                            return;
                        }
                        else {
                            console.log(chalk.green("Se actualizó la meta del usuario: " + doc));
                            updateMeta(req.body.IDUsuario);
                            res.status(201).send("Meta actualizada a "+calculo+" correctamente.");
                            return;
                        }
                    });
                }
            }
        });

    }
});

//*************************************************************************************************************************************
//                         ESTADISTICAS
//*************************************************************************************************************************************
app.get('/api/users/getconsumos', (req, res) => {
    let idUsuario = req.query.id;
    Consumo.find({IDUsuario: idUsuario}, (err, consumos) => {
        if(err) {
            res.status(500).send("Error al buscar los consumos del usuario: " + idUsuario);
            return;
        }
        else {
            console.log("Consumos encontrados: ");
            console.log(consumos);
            res.status(200).send(consumos);
            return;
        }
    });
})

app.get('/api/users/getdrink', (req, res) => {
    
    let id = req.query.id;
    console.log(id);
    let filtro = {}
    filtro._id = id;
    console.log(filtro);
    Liquid.find(filtro, (err, docs)=>{
        if(err) {
            res.status(500).send("Error al buscar las bebidas.");
            return;
        }
        else {
            console.log("Bebidas encontrados: ");
            console.log(docs);
            res.status(200).send(docs);
            return;
        }
    });
})


//*************************************************************************************************************************************
//                          RANKING DE USUARIOS
//*************************************************************************************************************************************
// ----- TRAER A LOS 10 USUARIOS QUE HAN TOMADO MÁS AGUA -----------------------
/* GET /api/users/ranking
   Buscamos, entre los consumos de hoy, aquellos 10 usuarios que han tenido más cantidad consumida.
   Primero se filtrarán aquellos usuarios que en StatsData sea "true" y después se sumarán sus consumos
   de hoy para sacar los 10 con más consumo.
*/
app.get('/api/users/ranking', (req, res) => {
    console.log("entró a get rankings");
    // Buscar usuarios que tengan StatsData en true
    User.find({StatsData: true}, (err, docs)=>{
        if(err) {
            res.status(500).send("Error al buscar usuarios.");
            return;
        }
        else {
            // Buscar consumos de hoy
            let today = new Date().toJSON().slice(0,10);
            Consumo.find({Fecha: today}, (err, consumos)=>{
                if(err) {
                    res.status(500).send("Error al buscar consumos.");
                    return;
                }
                else {
                    // Si no hay consumos, no hay ranking
                    if(consumos.length <= 0) {
                        res.status(200).send("No hay consumos.");
                        return;
                    }
                    else {
                    // Buscar consumos de cada usuario
                    let ranking = [];
                    for(let i = 0; i < docs.length; i++) {
                        let usuario = docs[i];
                        let total = 0;
                        for(let j = 0; j < consumos.length; j++) {
                            let consumo = consumos[j];
                            if(consumo.IDUsuario == usuario._id) {
                                total += consumo.Cantidad;
                            }
                        }
                        ranking.push({IDUsuario: usuario._id, Nombre: usuario.Nombre, 
                                    Apellido: usuario.Apellido, URL: usuario.UrlPicture, 
                                    Total: total});
                    }
                    // Ordenar ranking
                    ranking.sort((a,b)=>{
                        return b.Total - a.Total;
                    });
                    // Devolver los 10 primeros
                    ranking = ranking.slice(0,10);
                    res.status(201).send(ranking);
                    return;
                }
                }
            }
            );
        }
    });
});




// ************************************************************************************************************************************
//                        ADMINISTRADOR
// ************************************************************************************************************************************

//------ MIDDLEWARE PARA AUTENTICAR ACCIONES DEL ADMIN----------------------------------------------------------
/* Con este middleware se toma el token del usuario para poder agregar o eliminar bebidas default.
   Filtrar usuarios, mostrar detalles y eliminarlos.
   ------------------------------------
   STATUS CODES:
   403 no cuenta con token de administrador 'admintoken'
*/
function autenticarAdmin(req, res, next) {
    if(req.headers['x-user-token'] == "admintoken") {
        console.log(chalk.bgWhite("Loggeado como admin: "+req.headers['x-user-token']));
        next();
    }
    else {
        res.status(403).send("No está autorizado para entrar a contenido de administrador");
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
    403 si falta el token (middleware)
    500 si hay un error en la base de datos
    200 si se encontró el usuario
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
    403 si falta el token (middleware)
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
    403 si falta el token (middleware)
    500 si hay un error en la base de datos
    201 si se agregó correctamente
*/
app.post('/api/admin/addliquid', (req,res)=>{
    let url = '';
    if(req.body.URL != undefined && req.body.URL !=' '){
        url = req.body.URL
    }else{
        url = './IMAGES/DRINKS/default.png';
    }    
    let nuevaBebida = new Liquid({
        Nombre : req.body.Nombre,
        Cantidad : req.body.Cantidad,
        URL : url,
        IDPertenenciaUsuario : "default"
    });
    nuevaBebida.save((err,doc)=> {
        if(err) {
            res.status(500).send("Error al guardar la bebida.");
            return;
        }else{
            console.log("Bebida agregada: ");
            console.log(doc);
            res.status(201).send(doc);
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
    403 si falta el token (middleware)
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

// ------ GET BEBIDAS ------------
/* GET /api/admin/getliquids
    Se utiliza para sacar las bebida default de la base de datos.
    PAra poder mostrar las bebidas al Admin y pueda modificarlas.
    Debe verificar que el token del admin sea correcto.
    ---------------------------------------------
    STATUS CODES:
    403 si falta el token (middleware)
    500 si hay un error en la base de datos
    200 si se encontrarion correctamente
*/
app.get('/api/admin/getliquids', (req, res) =>{
    let nombre = req.query.nombre;
    let id = 'default'
    let filtro = {}
    filtro.IDPertenenciaUsuario = {$regex : id};
    if(nombre != undefined){
        filtro.Nombre = {$regex : nombre};
    }
    Liquid.find(filtro, (err, docs)=>{
        if(err) {
            res.status(500).send("Error al buscar las bebidas.");
            return;
        }
        else {
            console.log("Bebidas encontrados: ");
            console.log(docs);
            res.status(200).send(docs);
            return;
        }
    });
});