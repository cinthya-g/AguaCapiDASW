import mongoose from "mongoose";
import express from "express";
import chalk from "chalk";
import cors from "cors";

const app=express();
const port=3000;

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
    Date:{
        type: Date,
        required: true
    },
    Sexo:{
        type: String,
        enum:['M','H'],
        required: true
    },
    UID: {
        type: Number,
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
let User = mongoose.model('User', userSchema);
let Liquid = mongoose.model('Liquid',liquidSchema);

// ---------------------------------------------------------------------------------------------------------------



// PUBLICAR USUARIO
app.post('/api/users',(req,res)=> {
    let newUser =   {Nombre: req.body.Nombre, 
        Apellido: req.body.Apellido,
        Correo: req.body.Correo,
        Contrasenia:req.body.Contrasenia,
        Date:req.body.Date,
        Sexo:req.body.Sexo,
        UID:req.body.UID};
    let user = User(newUser);
    user.save().then((doc)=> console.log(chalk.green("Usuario Creado: ")+ doc));
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