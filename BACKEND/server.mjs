import mongoose from "mongoose";
import express from "express";
import chalk from "chalk";
import cors from "cors";

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
        type: String,
        required: true
    }
})


let liquidSchema = mongoose.Schema({
    Nombre: {
        type: String,
        required: true
    },
    Tamanio: {
        type: Number,
        min:10,
        max:2000,
        required: true
    },
    URL:{
        type: String,
        required: true
    },
    IDPertenenciaUsuario:{
        type:Number
    }
})

// ------DECLARACION DE SCHEMAS-----------------------------------------------------------------------------------
let User = mongoose.model('User', userSchema); //para registro y edicion
let Liquid = mongoose.model('Liquid',liquidSchema);

// ---------------------------------------------------------------------------------------------------------------


//  ----- REGISTRAR USUARIO ---------
/* POST /api/users
  Se utiliza en el registro de usuarios. Debe verificar que no falte de rellenar ningún campo
  y que tampoco exista el correo y/o el nombre en la base de datos.
  STATUS CODES:
   400 si falta información
   401 si el correo o el nombre ya existen
   201 si se registró correctamente
*/
app.post('/api/users',(req,res)=> {
    let errorStr = [];
    let missing = false;


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
                res.status(401).send("El correo ya existe.");
                return;
            }
            // Si el correo no existe:
            else {
                // Verificar que no exista el nombre:
                User.find({Nombre : req.body.Nombre},(err,docs)=>{
                    if(err) {
                        res.status(500).send("Error al verificar el nombre.");
                        return;
                    }
                    // Si el nombre ya existe:
                    if(docs.length > 0) {
                        res.status(401).send("El nombre ya existe.");
                        return;
                    }
                    // Si el nombre no existe:
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

                        // Crear el usuario:
                        let newUser = new User({
                            Nombre: req.body.Nombre,
                            Apellido: req.body.Apellido,
                            Correo: req.body.Correo,
                            Contrasenia: req.body.Contrasenia,
                            Nacimiento: req.body.Nacimiento,
                            Actividad: req.body.Actividad,
                            Region: req.body.Region,
                            Peso: req.body.Peso,
                            Estatura: req.body.Estatura,
                            Sexo: req.body.Sexo,
                            StatsData: req.body.StatsData,
                            UrlPicture: newUserUrl
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
                    }
                });
            
            }

        });
    }
});




// PUBLICAR BEBIDA
app.post('/api/liquids',(req,res)=> {
    let newLiquid = {Nombre: req.body.Nombre,Tamanio: req.body.Tamanio,URL: req.body.URL,IDPertenenciaUsuario:req.body.IDPertenenciaUsuario};
    let liquid= Liquid(newLiquid);
    liquid.save().then((doc)=> console.log(chalk.green("Bebida Creada: ")+ doc));
});


// ELIMINAR USUARIO
app.delete('/api/users', (req, res) => {
    console.log(chalk.yellow("Eliminando usuario..."));
    let idToDelete = req.body._id;
    //let User = mongoose.model('User', userSchema);
    User.findByIdAndDelete(idToDelete, (err, doc) => {
        if(err) {
            console.log("ERROR: "+err);
            res.send(err);
        } else {
            console.log(chalk.green("¡Usuario eliminado!:"));
            console.log(doc);
            res.send(doc);
        }
    });
});