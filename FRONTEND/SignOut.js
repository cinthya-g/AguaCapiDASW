let signOutButton = document.getElementById("BotonCerrarSesion");
signOutButton.addEventListener('click', function(){
    localStorage.removeItem('token');
})