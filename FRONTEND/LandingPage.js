
let url = 'http://localhost:3000/api/users/';

let currentUser = [];

function getIDFromToken() {
    let id = localStorage.getItem("token").substring(11, 35);
    console.log(id);
    console.log(typeof id);
    return id;
}


// Mostrar datos del usuario en el div de usuario
function userCardToHTML(currentUser) {
    let sexo = 'Mujer';
    if(currentUser.Sexo == 'H') sexo = 'Hombre';
   return `
   <div class="media-left align-self-center">
            <img id="fotoUsuario" class="mr-4 ml-4 rounded-circle user" src="${currentUser.UrlPicture}">
        </div>
        <!-- DIV HIJO2: body-->
        <div class="media-body ml-2">
            <p class="idTitle mt-3 mb-1" style="text-align:center">¡Bienvenid@, ${currentUser.Nombre} ${currentUser.Apellido}!<p>
              <hr style="width: 70%">
            <p style="text-align:center"><b>Formas parte de AguaCapi desde:</b> ${currentUser.Registro}</p>
            <p><b>Fecha de nacimiento:</b> ${currentUser.Nacimiento}</p>
            <p><b>Región:</b> ${currentUser.Region}</p>
            <p><b>Actividad física:</b> ${currentUser.Actividad} </p>	
            <p><b>Estatura:</b> ${currentUser.Estatura} cm</p>
            <p><b>Sexo:</b> ${sexo}</p>
            <a id="EditarCuentaBoton" class="btn btn-secondary" href="EditUser.html" role="button"><i class="fa fa-cog"></i> | Editar cuenta</a>
            <a id="ConsumoBoton" class="btn btn-secondary" href="#" data-toggle="modal" data-target="#modalAñadirConsumo" role="button"><i class="fa fa-plus-square"></i> | Consumo diario</a>
            <a id="MetaBoton" class="btn btn-secondary" href="#" data-toggle="modal" data-target="#modalFijarMeta" role="button"><i class="fa fa-plus-square"></i> | Fijar nueva meta</a>
            <p></p>
            <br>
        </div>`;
}

function getUserData() {
    let xhr =  new XMLHttpRequest();
    xhr.open('GET', url+'getinfo?id='+getIDFromToken());
    xhr.setRequestHeader("content-type", 'application/json');
    xhr.setRequestHeader("x-user-token", localStorage.getItem("token"));
    xhr.send();

    xhr.onload = function() {
        if (xhr.status != 201) { // analizar el estatus de la respuesta HTTP
            console.log(xhr.status + ':  no se pudo traer la información del usuario');
        } else {
            console.log("json obtenido:");
            let datos = JSON.parse(xhr.response);
            currentUser = datos;
            console.log(currentUser);
            userCard.innerHTML = userCardToHTML(currentUser);
        }
    }

}

getUserData();