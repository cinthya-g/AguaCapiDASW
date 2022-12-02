let url = 'http://localhost:3000/api/';
let consumosGlobal = []
function loadUserData(){
    let usuario = '';
    let id = localStorage.getItem("token").substring(11, 35);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url + 'users/getinfo?id='+id);
    xhr.setRequestHeader("x-user-token", localStorage.getItem('token'));
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 201) { // analizar el estatus de la respuesta HTTP
        // Ocurrió un error
        console.log(xhr.statusText);
        // ejecutar algo si error
        } else {
        let datos = xhr.response; //esta es la línea que hay que probar
        usuario = datos;
        createTables(usuario);
        }
    };
}

function createTables(){
    let id = localStorage.getItem("token").substring(11, 35);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url + 'users/getconsumos?id='+id);
    xhr.setRequestHeader("x-user-token", localStorage.getItem('token'));
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) { // analizar el estatus de la respuesta HTTP
        // Ocurrió un error
        console.log(xhr.statusText);
        // ejecutar algo si error
        } else {
            consumosGlobal= JSON.parse(xhr.response);
            tableWaterConsumption(consumosGlobal);
            tableTopDrinks(consumosGlobal);
        }
    };
}

function tableWaterConsumption(consumos){
    let hoy = new Date();
    let last10Days = ['','','','','','','','','',''];
    for(let i = 0; i < 10; i++){
        let buffDate = new Date();
        buffDate.setDate(hoy.getDate()-i);
        last10Days[i] = buffDate.toJSON().slice(0,10);
    }
    let hoyMenos10 = new Date();
    hoyMenos10.setDate(hoy.getDate() - 9);
    let hoyMenos10String = hoyMenos10.toJSON().slice(0,10);
    let waterConsumos = [];
    let usefulConsumos = [];
    consumos.forEach(bebida => {
        if(bebida.NombreBebida === "Agua Natural"){
            waterConsumos.push(bebida);
        };
    });
    waterConsumos.forEach(bebida => {
        if(bebida.Fecha >= hoyMenos10String){
            usefulConsumos.push(bebida);
        }
    });
    let mlPerDay = [0,0,0,0,0,0,0,0,0,0];
            for(let i = 0; i < 10; i++){
                mlPerDay[i] = sumOfMiliInDay(usefulConsumos,last10Days[i]);
            }
            let ctx = document.getElementById('myDailyBarChart');
            new Chart(ctx, {
                type: 'bar',
                data: {
                labels: ['Hoy', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7', 'Día 8', 'Día 9', 'Día 10'],
                datasets: [{
                      label: 'Mililitros consumidos',
                      data: mlPerDay,
                      borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    },
                    maintainAspectRatio: true,
                    plugins: {
                    title: {
                        display: true,
                        text: 'Consumo de Agua'
                    },
                }
                  }
            });
}

function tableTopDrinks(consumos){
    let hoy = new Date().toJSON().slice(0,10);
    let drinkLabels = [];
    let drinksData = [];
    let uniqueDrinks = {};
    let accumulatedDrinks = [];
    let todayDrinks = [];
    consumos.forEach(consumo => {
        if(consumo.Fecha === hoy){
            todayDrinks.push(consumo);
            if(uniqueDrinks[consumo.NombreBebida]){
                uniqueDrinks[consumo.NombreBebida] += consumo.Cantidad;
            }else{
                uniqueDrinks[consumo.NombreBebida] = consumo.Cantidad;
            }
        }
    });
    let cache = Object.keys(uniqueDrinks).map(function(key) {
        return [key, uniqueDrinks[key]];
    });
    cache.sort(function(first, second) {
        return second[1] - first[1];
    });
    accumulatedDrinks = cache.slice(0, 5);
    accumulatedDrinks.forEach(e => {
        drinkLabels.push(e[0]);
        drinksData.push(e[1]);
    });
    const ctx = document.getElementById('favoriteDrink');
        new Chart(ctx, {
          type: 'doughnut',
          data: {
        labels: drinkLabels,
        datasets: [{
            label: 'Mililitros consumidos',
            data: drinksData,
            backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(65, 211, 189)',
            'rgb(121, 30, 148)'
            ],
            hoverOffset: 4
        }]
        },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            },
            plugins: {
            title: {
                display: true,
                text: 'Bebidas favoritas'
            }
        }
          }
        });
}   

function sumOfMiliInDay(consumos, fecha){
    let mililitersInDay = 0;
    consumos.forEach(consumo => {
        if(consumo.Fecha === fecha){
            mililitersInDay += consumo.Cantidad;
        }
    });
    
    return mililitersInDay;
}

let historialButton = document.getElementById("historialButton");
historialButton.addEventListener('click', function (){
    consumosGlobal.forEach(e => {
        drinksToHTML(e);
    })
})

function drinksToHTML(consumo){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url + 'users/getdrink?id=' + consumo.IDBebida);
    xhr.setRequestHeader('x-user-toke', localStorage.getItem('token'));
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) { // analizar el estatus de la respuesta HTTP
            // Ocurrió un error
            console.log(xhr.statusText);
        // ejecutar algo si error
        } else {
            let mainDiv = document.getElementById("ListaHistorialConsumo");
            let bebida = JSON.parse(xhr.response);
            drinkToHTML(bebida[0], mainDiv);
        }
    }
}

function drinkToHTML(bebida, mainDiv){
    console.log(bebida);

    let divCol = document.createElement('div');
    divCol.classList.add("media");
    divCol.classList.add("col-12");
    divCol.classList.add("mb-2");

    let divImg = document.createElement('div');
    divImg.classList.add("media-left");
    divImg.classList.add("mb-1");
    divImg.classList.add("mt-1");
    divImg.classList.add("mr-1");

    let img = document.createElement('img');
    img.src = bebida.URL;
    img.classList.add("rounded-circle");

    divImg.appendChild(img);

    let divBody = document.createElement('div');
    divBody.classList.add("media-body");
    divBody.innerHTML = `<b>${bebida.Nombre}</b> <br>`;

    let divButton = document.createElement('div');
    divButton.classList.add("media-right");
    divButton.classList.add("align-self-center");

    divCol.appendChild(divImg);
    divCol.appendChild(divBody);

    mainDiv.appendChild(divCol);
    $('#modalHistorialConsumo').modal('show');
}

loadUserData();