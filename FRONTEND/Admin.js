let url = 'http://localhost:3000/api/admin/';
let totalUsers = []
let totalDrinks = []

function initData(pageNum, usuarios){
    let showedUsers = []
    let numbersInPagination = ~~((usuarios.length - (usuarios.length % 4)) / 4);
    let extraPages = (usuarios.length % 4) != 0 ? 1 : 0;
    numbersInPagination += extraPages;
    let paginationNav = document.createElement('nav');
    let paginationUl = document.createElement('ul');
    paginationUl.classList.add("pagination");
    paginationUl.id = "PaginationUsersAdmin";
    for(let i = 0; i < numbersInPagination; i++){
        let li = document.createElement('li');
        let a = document.createElement('a');
        li.classList.add("page-item");
        a.classList.add("page-link");
        a.href = "#";
        a.innerText = `${i + 1}`;
        li.addEventListener('click', function(){
            initData(parseInt(li.firstElementChild.innerHTML), usuarios);
        })
        li.appendChild(a);
        paginationUl.appendChild(li);
    }
    paginationNav.appendChild(paginationUl);
    for(let i = (pageNum - 1) * 4; i <= (pageNum - 1) * 4 + 3 && i < usuarios.length; i++){
        showedUsers.push(usuarios[i]);
    }
    usersToHTML(showedUsers);
    let bigDiv = document.getElementById("userContainter")
    bigDiv.appendChild(paginationNav);
}

function usersToHTML(usuarios){
    let bigDiv = document.getElementById("userContainter")
    bigDiv.innerHTML = ''
    addSearchBar(bigDiv, "Usuarios", "Nombre o apellido de usuario a buscar");
    for(let i of usuarios){
        userToHTML(i, bigDiv);
    }
}

function userToHTML(usuario, div){
    let divMain = document.createElement('div');
    divMain.classList.add("media");
    divMain.classList.add("col-12");
    divMain.classList.add("mb-2");
    let divImage = document.createElement('div');
    divImage.classList.add("media-left");
    divImage.classList.add("mb-1");
    divImage.classList.add("mt-1");
    divImage.classList.add("mr-1");
    let img = document.createElement('img');
    img.src = usuario.UrlPicture;
    img.classList.add("rounded-circle");
    img.classList.add("user");
    divImage.appendChild(img);

    let divBody = document.createElement('div');
    divBody.classList.add("media-body");
    divBody.innerHTML = `<b> ${usuario.Nombre} ${usuario.Apellido}</b> <br>
                        Correo: ${usuario.Correo} <br>
                        Nacimiento: ${usuario.Nacimiento}   <br>
                        Sexo: ${usuario.Sexo} <br>`;
    let divButtons = document.createElement('div');
    divButtons.classList.add("media-right");
    divButtons.classList.add("align-self-center");
    let divButtonsCol = document.createElement('div');
    divButtonsCol.classList.add("col-1");

    let buttonSearch = document.createElement('button');
    buttonSearch.classList.add("btn");
    buttonSearch.classList.add("btn-primary");
    buttonSearch.classList.add("mb-1");
    let iSearch = document.createElement('i');
    iSearch.classList.add("fa");
    iSearch.classList.add("fa-search");
    iSearch.style= "width:15px;";
    buttonSearch.appendChild(iSearch);

    let buttonInfo = document.createElement('button');
    buttonInfo.classList.add("btn");
    buttonInfo.classList.add("btn-primary");
    buttonInfo.classList.add("mb-1");
    buttonInfo.type = "button";
    let iInfo = document.createElement('i');
    iInfo.classList.add("fa");
    iInfo.classList.add("fa-bars");
    iInfo.style = "width:15px;";
    buttonInfo.appendChild(iInfo);
    buttonInfo.addEventListener('click', function (){
        alert('Mostrar info');
    });

    let buttonDelete = document.createElement('button');
    buttonDelete.classList.add("btn");
    buttonDelete.classList.add("btn-primary");
    let iDelete = document.createElement('i');
    iDelete.classList.add("fa");
    iDelete.classList.add("fa-trash");
    iDelete.style = "width:15px;";
    buttonDelete.appendChild(iDelete);
    buttonDelete.addEventListener('click', function (){
        alert('Borrar Usuario');
    })

    //divButtonsCol.appendChild(iSearch);
    divButtonsCol.appendChild(buttonInfo);
    divButtonsCol.appendChild(buttonDelete);
    divButtons.appendChild(divButtonsCol);

    divMain.appendChild(divImage);
    divMain.appendChild(divBody);
    divMain.appendChild(divButtons);

    div.appendChild(divMain);
}

function addSearchBar(div, toSearch, placeholderText){
    let divRow =  document.createElement('div');
    divRow.classList.add("row");
    divRow.classList.add("mt-4");
    let divCol = document.createElement('div');
    divCol.classList.add("col-8");
    let divForm = document.createElement('div');
    divForm.classList.add("form-group");
    let inputSearchBar = document.createElement('input');
    inputSearchBar.id = "barraBusqueda" + toSearch;
    inputSearchBar.type = "text";
    inputSearchBar.name = "search";
    inputSearchBar.classList.add("form-control");
    inputSearchBar.placeholder = placeholderText;
    let divButton = document.createElement('div');
    divButton.classList.add("col-4");
    let searchButton = document.createElement('button');
    searchButton.type = "button";
    searchButton.classList.add("btn");
    searchButton.classList.add("btn-primary");
    searchButton.innerText = "Buscar";
    searchButton.addEventListener('click', function(){
        let nameToSearch = document.getElementById("barraBusqueda" + toSearch).value;
        if(toSearch === "Bebidas"){
            let searchedDrinks = [];
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url+'getliquids?nombre='+nameToSearch);
            xhr.setRequestHeader('x-user-token', 'admintoken');
            xhr.send();
            xhr.onload = function () {
                if (xhr.status != 200) { // analizar el estatus de la respuesta HTTP
                // Ocurrió un error
                console.log(xhr.statusText);
                // ejecutar algo si error
                } else {
                let datos = JSON.parse(xhr.response);
                searchedDrinks = datos; 
                loadDrinksToModal(1, searchedDrinks);
                }
            };
        }else{
            let searchedUsers = searchItem(totalUsers, nameToSearch.toLowerCase(), 1);
            initData(1, searchedUsers);
        }
    })
    divButton.appendChild(searchButton);
    divForm.appendChild(inputSearchBar);
    divForm.innerHTML += "<hr>"
    divCol.appendChild(divForm);
    divRow.appendChild(divCol);
    divRow.appendChild(divButton);
    div.appendChild(divRow);
}

function loadUsersFromDB(){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url + 'search');
    xhr.setRequestHeader("x-user-token", localStorage.getItem("token"));
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) { // analizar el estatus de la respuesta HTTP
        // Ocurrió un error
        console.log(xhr.statusText);
        // ejecutar algo si error
        } else {
        let datos = JSON.parse(xhr.response);
        totalUsers = datos; 
        //usersToHTML(totalUsers)
        initData(1, totalUsers);
        }
    };
    
}

loadUsersFromDB();

let addDrinkButton = document.getElementById("BotonAgregarBebida");
addDrinkButton.addEventListener('click', function (){
    let nombre = document.getElementById("NombreNuevaBebida").value;
    let cantidad = document.getElementById("CantidadNuevaBebida").value;
    let urlBebida = document.getElementById("URLNuevaBebida").value;
    if(isBlank(urlBebida)){
        urlBebida = './IMAGES/DRINKS/default.png';
    }
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url + 'addliquid');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("x-user-token", localStorage.getItem("token"));
    let json = '{"Nombre": "' + nombre + 
                '", "Cantidad": ' + cantidad +
                ', "URL": "'+ urlBebida +'"}';
    xhr.send(json);
    xhr.onload = function () {
        if (xhr.status != 201) { // analizar el estatus de la respuesta HTTP
        // Ocurrió un error
        console.log(xhr.statusText);
        // ejecutar algo si error
        } else {
        console.log("Bebida Creado");
        window.location.href ="./Admin.html"
        }
    };
});

let populateDrinksOnModal = document.getElementById("BotonModalEliminarBebida");
populateDrinksOnModal.addEventListener('click', function (){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url + 'getliquids');
    xhr.setRequestHeader('x-user-token', localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status != 200) { // analizar el estatus de la respuesta HTTP
            // Ocurrió un error
            console.log(xhr.statusText);
            // ejecutar algo si error
        } else {
            let datos = JSON.parse(xhr.response);
            loadDrinksToModal(1, datos);
        }
    }
})

function loadDrinksToModal(pageNum, bebidas){
    let showedDrinks = [];
    let numbersInPagination = ~~((bebidas.length - (bebidas.length % 3)) / 3);
    let extraPages = (bebidas.length % 3) != 0 ? 1 : 0;
    numbersInPagination += extraPages;

    let mainDiv = document.getElementById("ListaBebidasModal");
    let paginationNav = document.createElement('nav');
    let paginationUl = document.createElement('ul');
    paginationUl.classList.add("pagination");
    paginationUl.id = "PaginationDrinksAdmin";
    for(let i = 0; i < numbersInPagination; i++){
        let li = document.createElement('li');
        let a = document.createElement('a');
        li.classList.add("page-item");
        a.classList.add("page-link");
        a.href = "#";
        a.innerText = `${i + 1}`;
        li.addEventListener('click', function(){
            loadDrinksToModal(parseInt(li.firstElementChild.innerHTML), bebidas);
        })
        li.appendChild(a);
        paginationUl.appendChild(li);
    }
    paginationNav.appendChild(paginationUl);
    for(let i = (pageNum - 1) * 3; i <= (pageNum - 1) * 3 + 2 && i < bebidas.length; i++){
        showedDrinks.push(bebidas[i]);
    }
    drinksToHTML(showedDrinks);
    mainDiv.appendChild(paginationNav);
}

function drinksToHTML(bebidas){
    let bigDiv = document.getElementById("ListaBebidasModal")
    bigDiv.innerHTML = ''
    addSearchBar(bigDiv, "Bebidas", "Nombre de Bebida");
    for(let i of bebidas){
        drinkToHTML(i, bigDiv);
    }
}

function drinkToHTML(bebida, mainDiv){
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

    let divButtonCol = document.createElement('div');
    divButtonCol.classList.add("col-1");

    let buttonDelete = document.createElement('button');
    buttonDelete.classList.add("btn");
    buttonDelete.classList.add("btn-primary");
    buttonDelete.addEventListener('click', function(){
        let otherUrl = url + "deleteliquid?id="+bebida._id;
        let urlWithQuery = new URL(url + "deleteliquid");
        urlWithQuery.searchParams.append('id', bebida._id);
        console.log(otherUrl);
        let xhr = new XMLHttpRequest();
        xhr.open('DELETE', otherUrl);
        xhr.setRequestHeader('x-user-token', localStorage.getItem("token"));
        xhr.send()
        xhr.onload = function (){
            if (xhr.status != 200) { // analizar el estatus de la respuesta HTTP
                // Ocurrió un error
                console.log(xhr.statusText);
                // ejecutar algo si error
            } else {
                alert('Bebida Eliminada');
                window.location.href ="./Admin.html"
            }
        }
    })

    let iDelete = document.createElement('i');
    iDelete.classList.add("fa");
    iDelete.classList.add("fa-trash");

    buttonDelete.appendChild(iDelete);
    divButtonCol.appendChild(buttonDelete);
    divButton.appendChild(divButtonCol);

    divCol.appendChild(divImg);
    divCol.appendChild(divBody);
    divCol.appendChild(divButton);

    mainDiv.appendChild(divCol);
}

function isBlank(str) {
    return (!str || '/^\s*$/'.test(str));
}

function searchItem(items, name, toSearch){
    let searchedItems = []
    items.forEach(i => {
        if(toSearch == 1){
            if(i.Nombre.toLowerCase().includes(name) || i.Apellido.toLowerCase().includes(name)){
                searchedItems.push(i)
            }
        }else{
            if(i.Nombre.toLowerCase().includes(name)){
                searchedItems.push(i);
            }
        }
    });
    return searchedItems
}

