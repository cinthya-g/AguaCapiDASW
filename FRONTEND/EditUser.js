

let url = 'http://localhost:3000/api/users/';

let currentUser = [];

getUserData();

function showLoadingAnimation() {
    console.log("Cargando...");
    document.querySelector('lottie-player').style.display = 'inline-block';
    setTimeout(function(){
        document.querySelector('lottie-player').style.display = 'none';
        redirect();
    }, 2000);
}

function redirect() {
    window.location.href ="./LandingPage.html"
    //console.log("redireccionando...");
}


function getIDFromToken() {
    let id = localStorage.getItem("token").substring(11, 35);
    console.log(id);
    console.log(typeof id);
    return id;
}

// Tomar datos del usuario existente
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
            
            let datos = JSON.parse(xhr.response);
            currentUser = datos;
            console.log("json obtenido (currentUser=datos):");
            console.log(currentUser);
            editForm.innerHTML = buildFormToHTML(currentUser);

        }
    }
}

// Fabricar form con datos del usuario
function buildFormToHTML(user) {
return `
<div class="row justify-content-center">
<div class="col-md-6 text-center mb-5">
    <h2 class="heading-section"></h2>
</div>
</div>
<!-- Div donde vive el form -->
<div class="row justify-content-center">
<div class="col-md-7 col-lg-5">
    <div class="wrap">                    <!-- Aqui empieza el titulo y los campos a llenar -->
        <div class="login-wrap p-4 p-md-5">
          <!-- Div del titulo -->
      <div class="d-flex">
          <div class="w-100">
              <p id="editUser" class="mb-4">Editar cuenta</p>
              <hr>
              <br>
          </div>
      </div>
      <!-- Comienza el form -->
      <form id="editform" class="needs-validated">
        <div class="form-group">
            <input type="text" id="NombreEdit" class="form-control" placeholder="${user.Nombre}" required minlength="3"><br>
            <input type="text" id="ApellidoEdit" class="form-control" placeholder="${user.Apellido}" required minlength="3"><br>
            <input type="email" id="CorreoEdit" class="form-control" placeholder="${user.Correo}" name="email" required minlength="10"><br>
            <input type="password" id="ContraseniaEdit" class="form-control" placeholder="Nueva contraseña" name="contra" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" title="Must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters" required><br>
            <input type="date" id="FechaEdit" class="form-control" rows="4" placeholder="" required max="2050-11-20" value="${user.Nacimiento}"><br>
            <label>Actividad física: </label>
            <select id = "ActividadEdit">
                <option value="1" selected>Seleccionar</option>
                <option value="2">Baja</option>
                <option value="3">Media</option>
                <option value="4">Alta</option>
            </select><br>
            <label>Región:</label>
            <select id = "RegionEdit">
              <option value="1" selected>Seleccionar</option>
              <option value="2">Fría</option>
              <option value="3">Templada</option>
              <option value="4">Calurosa</option>
            </select><br><br>
            <input type="number" id="PesoEdit" class="form-control" placeholder="Peso: ${user.Peso} kg" required min="20"><br>
            <input type="number" id="EstaturaEdit" class="form-control" placeholder="Estatura: ${user.Estatura} cm" required min="70"><br>
            <label><input type="radio" id="sexMEdit" name="test" value="Mujer" required> Mujer</label><br>
            <label><input type="radio" id="sexHEdit" name="test" value="Hombre" required> Hombre</label><br>
            <hr><label>URL de foto de perfil:</label>
            <input type="url" id="urlEdit" class="form-control" placeholder="https://ejemplo.com" minlength="3"><br>

            
            <div class="row">
              <button id="BotonEditarUsuario" type="button" class="btn btn-primary ml-4" onclick="editarUsuarioBoton()"><i class="fa fa-edit"></i> Guardar cambios</button>
              <a href="./LandingPage.html"><button type="button" class="btn btn-danger ml-4"><i class="fa fa-window-close"></i> Cancelar</button></a>
            </div>

            <!-- espacio para animación de carga-->
            <div id="LoadingAnimation" class="row justify-content-center">
              <br>
                <lottie-player 
                src="./ANIMATIONS/loading.json" background="transparent"  speed="1"  style="display: none; width: 100px; height: 100px;"
                loop autoplay></lottie-player>
            </div>

        </div>
      </form>

</div>
</div>
</div>
</div>
`;
}



// Confirmar cambios en edición de usuario

function editarUsuarioBoton() {

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
        actividadValue = currentUser.Actividad;
    }else if(actividad.value == 2){
        actividadValue = "BAJA";
    }else if(actividad.value == 3){
        actividadValue = "MEDIA";
    } else {
        actividadValue = "ALTA";
    }
    console.log(actividadValue);

    let region = document.getElementById("RegionEdit");
    let regionValue = '';
    if(region.value == 1){
        regionValue = currentUser.Region;
    }else if(region.value == 2){
        regionValue = "FRIA";
    }else if(region.value == 3){
        regionValue = "TEMPLADA";
    } else {
        regionValue = "CALUROSA";

    }
    console.log(regionValue);
    let peso = document.getElementById("PesoEdit").value;
    console.log(peso);
    let estatura = document.getElementById("EstaturaEdit").value;
    console.log(estatura);
    
    let sexo = document.getElementById("sexMEdit").checked ? "M" : 
    document.getElementById("sexHEdit").checked ? "H" : currentUser.Sexo;
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

}



