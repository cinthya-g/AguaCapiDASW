
let url = 'http://localhost:3000/api/'
//
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


function showLoadingAnimation() {
    console.log("Cargando...");
    document.querySelector('lottie-player').style.display = 'block';
    setTimeout(function(){
        document.querySelector('lottie-player').style.display = 'none';
        userAlreadySignedIn();
    }, 2000);
}

userAlreadySignedIn();

let logInButton = document.getElementById("logInButton");
logInButton.addEventListener('click', function (){
    let xhr = new XMLHttpRequest();
    let email = document.getElementById("LoginUsername").value;
    let password = document.getElementById("LoginPassword").value;
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
        showLoadingAnimation();

        
        }
    };
})