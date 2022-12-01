

export function showLoadingAnimation() {
    console.log("Cargando...");
    document.querySelector('lottie-player').style.display = 'block';
    setTimeout(function(){
        document.querySelector('lottie-player').style.display = 'none';
    }, 3000);
}