
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
   return 
   `
      <!-- DIV HIJO1: left-->
        <div class="media-left align-self-center">
            <img id="fotoUsuario" class="mr-4 ml-4 rounded-circle user" src="${currentUser.url}">
        </div>
        <!-- DIV HIJO2: body-->
        <div class="media-body ml-2">
            <p class="idTitle mt-3 mb-1" style="text-align:center">¡Bienvenid@, Maire Gómez!<p>
              <hr style="width: 70%">
            <p style="text-align:center"><b>Formas parte de AguaCapi desde:</b> 2022-11-19</p>
            <p><b>Fecha de nacimiento:</b> 01-01-2001</p>
            <p><b>Región:</b> fría</p>
            <p><b>Estatura:</b> 167 cm</p>
            <p><b>Sexo:</b> Mujer</p>
            <a id="EditarCuentaBoton" class="btn btn-secondary" href="EditUser.html" role="button"><i class="fa fa-cog"></i> | Editar cuenta</a>
            <a id="ConsumoBoton" class="btn btn-secondary" href="#" data-toggle="modal" data-target="#modalAñadirConsumo" role="button"><i class="fa fa-plus-square"></i> | Consumo diario</a>
            <a id="MetaBoton" class="btn btn-secondary" href="#" data-toggle="modal" data-target="#modalFijarMeta" role="button"><i class="fa fa-plus-square"></i> | Fijar nueva meta</a>
            <p></p>
            <br>
        </div>`;
}

function getUserData() {
    let xhr =  new XMLHttpRequest();
    xhr.open('GET', url+'getinfo');
    xhr.setRequestHeader("content-type", 'application/json');
    xhr.setRequestHeader("x-user-token", localStorage.getItem("token"));

console.log(localStorage.getItem("token"));

    let body = {
        id: getIDFromToken()
    };

    console.log(JSON.stringify(body));
    xhr.send(JSON.stringify(body));
    
    xhr.onload = function() {
        if (xhr.status != 201) { // analizar el estatus de la respuesta HTTP
            console.log(xhr.status + ':  no se pudo traer la información del usuario');
        } else {
            console.log("json obtenido:");
            let datos = JSON.parse(xhr.response);
            console.log(datos);
            currentUser = datos;
            console.log(currentUser);
            document.getElementById("userCard").innerHTML = userCardToHTML(currentUser);
        }
    }

}

getUserData();