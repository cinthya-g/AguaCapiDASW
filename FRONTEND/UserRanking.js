let url = 'http://localhost:3000/api/users/';



getRankingUsers();

function searchingAnimation(appear) {
    if(appear) {
        document.querySelector('lottie-player').style.display = 'block';
        document.querySelector('estatus1').style.display = 'block';
    } else {
        document.querySelector('lottie-player').style.display = 'none';
        document.querySelector('estatus1').style.display = 'none';
    }
}

function rankingToHTML(userArr) {
    let html = '';
    for (let i = 0; i < userArr.length; i++) {
        let user = userArr[i];
        if(i == 0) {
            html += `
            <div class="rowRanking">
                <div class="fotoUsuarioRanking">
                <img id="fotoUsuarioRank" class="rounded-circle-Ranking rounded-circle" src="${user.URL}">
                </div>
                <div class="nameRanking goalDigitRanking">${user.Nombre} ${user.Apellido}</div>
                <div class="scoreRanking goalDigitRanking">${user.Total} ml</div>
                <div class="placeRanking goalDigitRanking">${i+1}st </div>
            </div>
            `;
        } else {
            html += `
            <div class="rowRanking">
                <div class="fotoUsuarioRanking">
                <img id="fotoUsuarioRank" class="rounded-circle-Ranking rounded-circle" src="${user.URL}">
                </div>
                <div class="nameRanking goalDigitRanking">${user.Nombre} ${user.Apellido}</div>
                <div class="scoreRanking goalDigitRanking">${user.Total} ml</div>
                <div class="placeRanking goalDigitRanking">${i+1}th </div>
            </div>
            `;

        }
    }
    return html;
}

function getRankingUsers() {
    console.log("Entró a rankings");
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/api/users/ranking'); 
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('x-user-token', localStorage.getItem('token'));
    xhr.send();
    
    xhr.onload = function() {
        console.log("status: "+xhr.status);
        if(xhr.status == 500) {
            alert(xhr.status + ": algo sucedió con Mongo...");
        }
        if (xhr.status == 200) {
            // significa que no hay consumos disponibles hoy
            let sample = {
                IDUsuario: "null",
                Nombre: "Poncho",
                Apellido: "Carpincho",
                URL: "./IMAGES/logocircle.png",
                Total: 2000
            };
            let sampleArr = [];
            sampleArr.push(sample);
            // Hacer div
            topUsers.innerHTML = rankingToHTML(sampleArr);
            searchingAnimation(true);

        }
        if(xhr.status == 201){
            // significa que hay consumos disponibles hoy
            let ranking = JSON.parse(xhr.responseText);
            console.log(ranking);
            // Hacer divs
            topUsers.innerHTML = rankingToHTML(ranking);
            searchingAnimation(false);
        }
    }


}
