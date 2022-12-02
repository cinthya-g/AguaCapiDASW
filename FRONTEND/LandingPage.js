
let url = 'http://localhost:3000/api/users/';

// Objeto del usuario loggeado actualmente
let defaultLiquids = [];
let defaultAdded = {};


getUserData(1);



function getIDFromToken() {
    let id = localStorage.getItem("token").substring(11, 35);
    console.log(id);
    console.log(typeof id);
    return id;
}


// Fabrica el div de la meta objetivo
function metaObjetivo(usuario) {
    return `
    <div class="media-body align-self-center">
    <p class="idTitle">TU META DIARIA:</p>
    <p id="goalDigit2">${usuario.MetaObjetivo} ml</p>`;
}


// Fabrica el div de la meta diaria
function metaDiaria(usuario) {
    return `
    <div class="media-body align-self-center">
    <p class="idTitle">HAS CONSUMIDO: </p>
    <p id="goalDigit1">${usuario.Meta} ml</p>

  </div>`;

}
// Actualizar meta y meta objetivo
function actualizarDivsMeta(usuario) {
    HasConsumido.innerHTML = metaDiaria(usuario);
    Objetivo.innerHTML = metaObjetivo(usuario);
}

// Guardar el consumo default
let saveDefaultConsumption = document.getElementById('BotonRegistrarDefault');
saveDefaultConsumption.addEventListener('click', function() {
    for(let i = 0; i < defaultLiquids.length; i++) {
        // Tomar a label padre
        let inputElement = document.getElementById("label"+i).firstChild;
        console.log("Opcion:"+inputElement.id + "checked? " + inputElement.checked);
        if(inputElement.checked) {
            defaultAdded = {
                IDUsuario: getIDFromToken(),
                IDBebida: inputElement.id
            };
            console.log(defaultAdded);
            $('#modalAñadirConsumo').modal('hide');
            getUserData(1);
            getUserData(1);
            getUserData(1);
        }
        
    }

    // Enviar a POST /api/users/addliquid
    let xhr =  new XMLHttpRequest();
    xhr.open('POST', url+'addliquid');
    xhr.setRequestHeader("content-type", 'application/json');
    xhr.setRequestHeader("x-user-token", localStorage.getItem("token"));
    xhr.send(JSON.stringify(defaultAdded));

    xhr.onload = function() {
        if(xhr.status != 201) {
            alert(xhr.status + ": error al guardar el consumo default");
        } else {
            console.log("Consumo default guardado");
        }
    }

});

function defaultLiquidsToHTML(defaultLiquids) {
//              <label><input type="radio" id="idBEBIDA" name="option" required> Electrolit - 250ml</label><br> 
// Crear tantos inputs type="radio" como líquidos haya en el arreglo defautLiquids
    let html = '';
    for(let i = 0; i < defaultLiquids.length; i++) {
        if(i==0){
            html += `<label id="label${i}"><input type="radio" id="${defaultLiquids[i]._id}" name="option" checked required> ${defaultLiquids[i].Nombre} - ${defaultLiquids[i].Cantidad} ml</label><br>`;
            continue;
        }
        html += `<label id="label${i}"><input type="radio" id="${defaultLiquids[i]._id}" name="option" required> ${defaultLiquids[i].Nombre} - ${defaultLiquids[i].Cantidad} ml</label><br>`;
    }
    //console.log(html);
return html;
}


// Mostrar las bebidas default en las opciones de agregar bebida existente
// y guardarlas en defaultLiquids
let addDefaultDrinkButton = document.getElementById("BotonBebidaExistente");
addDefaultDrinkButton.addEventListener("click", function() {
    console.log("diste click en añadir bebida existente");
    let xhr =  new XMLHttpRequest();
    xhr.open('GET', url+'getdefaultliquids');
    xhr.setRequestHeader("content-type", 'application/json');
    xhr.setRequestHeader("x-user-token", localStorage.getItem("token"));
    xhr.send();

    xhr.onload = function() {
        if (xhr.status != 201) { // analizar el estatus de la respuesta HTTP
            console.log(xhr.status + ':  no se pudo traer la información de las bebidas default');
        } else {
            console.log("json obtenido:");
            let datos = JSON.parse(xhr.response);
            defaultLiquids = datos;
            console.log(defaultLiquids);
            listadoDefault.innerHTML = defaultLiquidsToHTML(defaultLiquids);
            }
        }
    }
);

// Captura los datos de una bebida personalizada y guarda su consumo
let addCustomDrinkButton = document.getElementById("BotonRegistrarBebidaPersonalizada");
 addCustomDrinkButton.addEventListener("click", function() {
    console.log("diste click en añadir bebida personalizada");
    
    let customDrink = {
        IDUsuario: getIDFromToken(),
        NombreBebida: document.getElementById("nombreBebida").value,
        Cantidad: document.getElementById("cantidadBebida").value,
        URL: document.getElementById("urlBebida").value
    };

    console.log(customDrink);
    // Enviar a POST /api/users/addliquid
    let xhr =  new XMLHttpRequest();
    xhr.open('POST', url+'addliquid');
    xhr.setRequestHeader("content-type", 'application/json');
    xhr.setRequestHeader("x-user-token", localStorage.getItem("token"));
    xhr.send(JSON.stringify(customDrink));

    xhr.onload = function() {
        if(xhr.status != 201) {
            alert(xhr.status + ": error al guardar el consumo personalizado");
            $('#modalAñadirConsumo').modal('hide');
            getUserData(1);
            getUserData(1);
            getUserData(1);
        } else {
            console.log("Consumo personalizado guardado");
            $('#modalAñadirConsumo').modal('hide');
            getUserData(1);
            getUserData(1);
            getUserData(1);
        }
    }
 });

 // Añadir funcion para boton de FIJAR META PROPIA

 // Añadir funcion para boton de CALCULAR META





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
            <a id="MetaBoton" class="btn btn-secondary" href="#" data-toggle="modal" data-target="#modalFijarMeta" role="button"><i class="fa fa-star"></i> | Fijar nueva meta</a>
            <p></p>
            <br>
        </div>`;
}

function getUserData(priority) {
    
        let xhr =  new XMLHttpRequest();
        xhr.open('GET', url+'getinfo?id='+getIDFromToken());
        xhr.setRequestHeader("content-type", 'application/json');
        xhr.setRequestHeader("x-user-token", localStorage.getItem("token"));
        xhr.send();

        xhr.onload = function() {
            if (xhr.status != 201) { // analizar el estatus de la respuesta HTTP
                console.log(xhr.status + ':  no se pudo traer la información del usuario');
            } else {
                
                let datos = JSON.parse(xhr.response);
                let usuario = datos;
                console.log("json obtenido (usuario=datos):");
                console.log(usuario);
                
                // Actualiza user card y metas
                if(priority == 1){ 
                    console.log("Entró a actualizar todo");
                    userCard.innerHTML = userCardToHTML(usuario);
                    actualizarDivsMeta(usuario);
                }
                // Solo actualizar divs de meta
                if(priority == 2) {
                    actualizarDivsMeta(usuario);
                }

            }
        }
    


}






