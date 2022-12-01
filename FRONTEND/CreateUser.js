let url = 'http://localhost:3000/api/'

function userAlreadySignedIn(){
    if(localStorage.getItem('token')){
        if(localStorage.getItem('token') == 'admintoken'){
            window.location.href ="./Admin.html"
        }
        else{
            window.location.href ="./LandingPage.html"
        }  
    }
}

let userLoginInfo = [];

function registeredUserRedirect(){
    let xhr = new XMLHttpRequest();
    let email = userLoginInfo[0];
    let password = userLoginInfo[1];
    let json = '{"Correo": "' + email + '", "Contrasenia": "' + password + '"}';
    console.log(json)
    xhr.open('POST', url + 'users/login');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(json);
    xhr.onload = function () {
        if (xhr.status != 201) { // analizar el estatus de la respuesta HTTP
        // Ocurrió un error
        if(xhr.status == 400) // no rellenó los campos
            alert(xhr.status + ': ¡completa todos los campos!');
        if(xhr.status == 401) // no existe el usuario
            alert(xhr.status + ': ¡no hay cuenta registrada con esos datos!');
        if(xhr.status == 500) // error en la bd
            alert(xhr.status + ': algo sucedió con MongoDB...');
        } else {
        let datos = xhr.response; //esta es la línea que hay que probar
        console.log(datos)// Ejecutar algo si todo está correcto
        localStorage.setItem('token', datos);

        userAlreadySignedIn();
        
        }
    };
}


function showLoadingAnimation() {
    console.log("Cargando...");
    document.querySelector('lottie-player').style.display = 'block';
    setTimeout(function(){
        document.querySelector('lottie-player').style.display = 'none';
        registeredUserRedirect();
    }, 2000);
}


let BotonReg = document.getElementById("BotonReg");
BotonReg.addEventListener('click', function(){
    let nombre = document.getElementById("NombreReg").value;
    let apellido = document.getElementById("ApellidoReg").value;
    let correo = document.getElementById("CorreoReg").value;
    let contrasenia = document.getElementById("ContraseniaReg").value;
    let confirmarConstrasenia = document.getElementById("Contrasenia2Reg").value;
    let nacimiento = document.getElementById("NacimientoReg").value;
    let actividad = document.getElementById("ActividadReg");
    let actividadValue = actividad.value;
    if(actividad.value == 1){
        actividadValue = "BAJA"
    }else if(actividad.value == 2){
        actividadValue = "MEDIA"
    }else{
        actividadValue = "ALTA"
    }
    //actividad.options[actividad.selectedIndex].text;
    let peso = document.getElementById("PesoReg").value;
    let region = document.getElementById("RegionReg");
    let regionValue = '';
    if(region.value == 1){
        regionValue = "FRIA"
    }else if(region.value == 2){
        regionValue = "TEMPLADA"
    }else{
        regionValue = "CALUROSA"
    }
    //region.options[region.selectedIndex].text;
    let estatura = document.getElementById("EstaturaReg").value;
    let sexo = '';
    if(document.getElementById("sexMCReg").checked){
        sexo = "M";
    }else{
        sexo = "H";
    }
    let fotoUrl = document.getElementById("urlReg").value;
    let usarDatos = false;
    if(document.getElementById("StatsReg").checked){
        usarDatos = true
    }
    if(contrasenia == confirmarConstrasenia){
        
        let json = '{"Nombre": "' + nombre + '", "Apellido": "' 
        + apellido + '", "Correo": "' + correo + '", "Contrasenia": "' + contrasenia + 
        '", "Nacimiento": "' + nacimiento + '", "Actividad": "' + actividadValue + 
        '", "Region": "' + regionValue + '", "Peso": ' + peso + ', "Estatura": ' + estatura + 
        ', "Sexo": "' + sexo + '", "StatsData": ' + usarDatos + ', "UrlPicture": "' + fotoUrl + '"}';
        console.log(json);
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url + 'users/register');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(json);
        xhr.onload = function () {
            if (xhr.status != 201) { // analizar el estatus de la respuesta HTTP
                if(xhr.status == 400) // no rellenó los campos
                    alert(xhr.status + ': ¡completa todos los campos!');
                if(xhr.status == 401) // no existe el usuario
                    alert(xhr.status + ': correo existente, intenta con otro');
                if(xhr.status == 500) // error en la bd
                    alert(xhr.status + ': algo sucedió con MongoDB...');
            } else {
            console.log("Usuario Creado");
            userLoginInfo.push(correo);
            userLoginInfo.push(contrasenia);
            showLoadingAnimation();
            }
        };
        
    }
    else{
        alert("Las contraseñas no coinciden");
    }
})