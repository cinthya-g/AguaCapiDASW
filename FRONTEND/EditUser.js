let url = 'http://localhost:3000/api/users/';



function showLoadingAnimation() {
    console.log("Cargando...");
    document.querySelector('lottie-player').style.display = 'block';
    setTimeout(function(){
        document.querySelector('lottie-player').style.display = 'none';
        redirect();
    }, 2000);
}

function redirect() {
    window.location.href ="./LandingPage.html"
}


function getIDFromToken() {
    let id = localStorage.getItem("token").substring(11, 35);
    console.log(id);
    console.log(typeof id);
    return id;
}

// Confirmar cambios en edición de usuario
let editButton = document.getElementById("BotonEditarUsuario");
editButton.addEventListener('click', function() {
    // Guardar datos introducidos
    let nombre = document.getElementById("NombreEdit").value;
    console.log(nombre);
    let apellido = document.getElementById("ApellidoEdit").value;
    console.log(apellido);
    let correo = document.getElementById("CorreoEdit").value;
    console.log(correo);
    let contrasenia = document.getElementById("ContraseniaEdit").value;
    console.log(contrasenia);
    let nacimiento = document.getElementById("FechaEdit").value;
    console.log(nacimiento);
    let actividad = document.getElementById("ActividadEdit");
    let actividadValue = actividad.value;
    if(actividad.value == 1){
        actividadValue = "BAJA"
    }else if(actividad.value == 2){
        actividadValue = "MEDIA"
    }else{
        actividadValue = "ALTA"
    }
    console.log(actividadValue);

    let region = document.getElementById("RegionEdit");
    let regionValue = '';
    if(region.value == 1){
        regionValue = "FRIA"
    }else if(region.value == 2){
        regionValue = "TEMPLADA"
    }else{
        regionValue = "CALUROSA"
    }
    console.log(regionValue);
    let peso = document.getElementById("PesoEdit").value;
    console.log(peso);
    let estatura = document.getElementById("EstaturaEdit").value;
    console.log(estatura);
    let sexo = document.getElementById("sexMEdit").checked ? "M" : "H";
    console.log(sexo);
    let fotoUrl = document.getElementById("urlEdit").value;
    console.log(fotoUrl);

    // Añadir atributos anteriores a objeto
    let editedBody = {
        Nombre: nombre,
        Apellido: apellido,
        Correo: correo,
        Contrasenia: contrasenia,
        Nacimiento: nacimiento,
        Actividad: actividadValue,
        Region: regionValue,
        Peso: peso,
        Estatura: estatura,
        Sexo: sexo,
        UrlPicture: fotoUrl
    };

    //Llamar a backend
    let xhr = new XMLHttpRequest();
    xhr.open('PUT', url + 'edit?id='+getIDFromToken());
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('x-user-token', localStorage.getItem("token"));
    xhr.send(JSON.stringify(editedBody));
    xhr.onload = function() {
        if (xhr.status != 201) {
            if(xhr.status == 400)
                alert(xhr.status + ": el correo ingresado ya existe, intenta con otro.");
            if(xhr.status == 500)
                alert(xhr.status + ": error interno del servidor.");
            if(xhr.status == 200) {
                alert(xhr.status + ": parece que no edistaste nada...");
                redirect();
            }
        } else {
            console.log("todo gucci");
            showLoadingAnimation();
        }
    }

})



