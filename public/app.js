//Al momento de probar algunas funciones he usado algunos console.log() para mostrar por consola datos que servian a modo de debug.
//Ahora se encuentran comentados para que no se muestre esa información en la consola.


//-----FUNCIONES QUE SE EJECUTAN AL CARGAR index.html------------------------------------------------------------------
cargarSelectDpto();
cargarSelectGeo();
mensajeInicial();


//-----FUNCIONES QUE CARGAN LOS MENSAJES PARA EL USUARIO---------------------------------------------------------------
function mensajeInicial() {
    document.getElementById("mensaje").innerHTML =
        "<p><strong>¡Bienvenidos!</strong><br>Para comenzar seleccione sus preferencias y haga clik en BUSCAR</p>";
}

function mensajeBuscando(resultados) {
    document.getElementById("grilla").innerHTML = "";
    document.getElementById("paginas").innerHTML = "";
    document.getElementById("mensaje").innerHTML =
        `<p><strong>Buscando coincidencias...</strong></p>`;
}

function mensajeDatosEncontrados(resultados) {
    document.getElementById("mensaje").innerHTML =
        `<p style="margin-bottom: 40px;"><strong>¡Se han encontrado ${resultados} obras!</strong></p>`;
}

function mensajeDemasiadosDatos(resultados) {
    document.getElementById("mensaje").innerHTML =
        `<p><strong>¡Se han encontrado ${resultados} obras! Son demasiados!!</strong>
        <br>Puedes cambiar las opciones de búsqueda e intentarlo nuevamente</p>`;
}

function mensajeDatosNoEncontrados() {
    document.getElementById("mensaje").innerHTML =
        `<p><strong>¡No se han encontrado obras que coincidan con tus preferencias!</strong>
    <br>Puedes cambiar las opciones de búsqueda e intentarlo nuevamente</p>`;
}


//-----FUNCIONES DE UTILIDADES - CARGAN LOS SELECT Y LIMPIAN CAMPOS DEL FORMULARIO-------------------------------------
function cargarSelectDpto() {
    //Carga el valor por defecto. SIN FILTRO POR DPTO.
    let op = document.createElement("option");
    op.innerHTML = "--Seleccione el departamento--";
    op.value = 0;
    document.getElementById("dptoSelect").appendChild(op);

    //Pide al server, y este a su vez a la API, el listado de departmentos, los traduce y envía para cargar en el obj dptos:
    let dptos = {};
    axios("dpto")
        .then(response => {
            dptos = response.data.departments;
            //console.log(dptos);//Muestra el arreglo de dptos recibidos del server

            //Recorre el array de dptos y para cada uno crea el <option> con su ID y nombre
            for (let dpto of dptos) {
                let op = document.createElement("option");
                op.textContent = dpto.displayName;
                op.value = dpto.departmentId;
                document.getElementById("dptoSelect").appendChild(op);
            }
        });
}

function cargarSelectGeo() {
    //Carga la lista hardcodeada de ubicaciones.
    html =
        `<option value="">--Seleccionar ubicacion--</option>
        <option value="Africa">África</option>
        <option value="Germany">Alemania</option>
        <option value="Argentina">Argentina</option>
        <option value="Asia">Asia</option>
        <option value="Belgium">Bélgica</option>
        <option value="Bolivia">Bolivia</option>
        <option value="Brazil">Brasil</option>
        <option value="Canada">Canadá</option>
        <option value="Chile">Chile</option>
        <option value="China">China</option>
        <option value="Colombia">Colombia</option>
        <option value="Cuba">Cuba</option>
        <option value="Denmark">Dinamarca</option>
        <option value="Spain">España</option>
        <option value="United States">Estados Unidos</option>
        <option value="Europe">Europa</option>
        <option value="France">Francia</option>
        <option value="Guatemala">Guatemala</option>
        <option value="India">India</option>
        <option value="Italy">Italia</option>
        <option value="Japan">Japón</option>
        <option value="Los Angeles">Los Ángeles</option>
        <option value="Madrid">Madrid</option>
        <option value="Mexico">México</option>
        <option value="Milan">Milán</option>
        <option value="Moscow">Moscú</option>
        <option value="New York">Nueva York</option>
        <option value="New Zealand">Nueva Zelanda</option>
        <option value="Netherlands">Países Bajos</option>
        <option value="Paris">París</option>
        <option value="Portugal">Portugal</option>
        <option value="United Kingdom">Reino Unido</option>
        <option value="Czech Republic">República Checa</option>
        <option value="Rome">Roma</option>
        <option value="Tokyo">Tokio</option>
        <option value="Uruguay">Uruguay</option>
        <option value="Venezuela">Venezuela</option>
        <option value="Washington">Washington</option>`;

    document.getElementById("geoSelect").innerHTML = html;
}

function limpiarForm() {
    document.getElementById("dptoSelect").value = 0;
    clave = document.getElementById("clave").value = "";
    document.getElementById("geoSelect").value = "";
    document.getElementById("grilla").innerHTML = "";
    document.getElementById("paginas").innerHTML = "";
    mensajeInicial();
}



//-----FUNCIONES DE BUSQUEDA DE DATOS SEGÚN LOS FILTROS APLICADOS EN EL FORMULARIO-------------------------------------
let datos; //Variable global, donde se carga el arreglos con los IDs de los objetos encontrados.

function buscarDatos() {
    document.getElementById("formu").noValidate = true;

    let dptoSelec = document.getElementById("dptoSelect").value;
    let clave = document.getElementById("clave").value;
    let geoSelec = document.getElementById("geoSelect").value;

    mensajeBuscando();

    let URL_BUSCAR = "https://collectionapi.metmuseum.org/public/collection/v1/search?";
    if (dptoSelec != 0) URL_BUSCAR += `departmentId=${dptoSelec}&`;
    if (geoSelec != "") URL_BUSCAR += `geoLocation=${geoSelec}&`;
    if (clave != "") {
        try {
            axios(`/translate/${clave}`)
                .then(response => {
                    //console.log(URL_BUSCAR += `q=${response.data}`);//Muestra la URL que se usará para buscar en la API
                    pedirDatos(URL_BUSCAR += `q=${response.data}`);
                })
        } catch {
            URL_BUSCAR += `q=""`;
            //console.log(URL_BUSCAR);  //Muestra la URL que se usará para buscar en la API
            pedirDatos(URL_BUSCAR);
        }
    }
    else {
        URL_BUSCAR += `q=""`;
        //console.log(URL_BUSCAR);//Muestra la URL que se usará para buscar en la API
        pedirDatos(URL_BUSCAR);
    }

    return false;
}

function pedirDatos(URL_BUSCAR) {
    axios(URL_BUSCAR)
        .then(response => {
            datos = response.data;
            //console.log(datos);//Muestra el arreglo de IDs de datos recibido desde  la API
            if (datos.total == 0) {
                mensajeDatosNoEncontrados();
            } else {
                if (datos.total > 1000000) {
                    mensajeDemasiadosDatos(datos.total);
                } else {
                    mensajeDatosEncontrados(datos.total);
                    primerPagina();
                }
            }
        });
}



//-----FUNCIONES PARA CREAR CARDs Y ARMAR LA GRILLA--------------------------------------------------------------------
let pag = 1; //Variable global que indica la página que se está mostrando.
const cardPorPag = 20; //Cant máx de cards para mostrar en cada página.

function cargaGrilla(cargarPag) {
    pag = cargarPag;
    document.getElementById("grilla").innerHTML = "";
    window.scrollTo(0, 0);

    let endArray;
    if (pag * cardPorPag - 1 < datos.total) { endArray = pag * cardPorPag; }
    else { endArray = datos.total; }

    //Carga la grilla correspondiente a la página seleccionada
    for (let index = (pag - 1) * cardPorPag; index < endArray; index++) {
        crearCard(datos.objectIDs[index]);
    }

    actualizaPaginado();
}

function crearCard(objectID) {
    const URL_OBJ = `/obj/${objectID}`;
    axios(URL_OBJ)
        .then(response => {
            obj = response.data;
            //console.log(obj);//Muestra el objeto que buscó el server en la API, este objeto tiene los atributos que necesita 
            //la App para funcionar, con los valores ya traducidos
            let onclickValor = "";
            let buttonValue = "Ampliar imagen principal";
            let buttonClass = "buttonFiltro";
            let buttonTitle = "";

            //Comprabando que no haya campos en blanco
            if (obj.primaryImageSmall == "") {
                obj.primaryImageSmall = "sinImagen";
                buttonClass = "buttonFiltro noFunc";
                buttonTitle = "No hay imagenes para mostrar"
            } else if (obj.additionalImages == "") {
                onclickValor = `onclick="zoomModal(${obj.objectID})"`;
            } else {
                onclickValor = `onclick="carreteModal(${obj.objectID})"`;
                buttonValue = "Ver imágenes adicionales";
            }
            if (obj.title == "") obj.title = "Sin datos";
            if (obj.culture == "") obj.culture = "Sin datos";
            if (obj.dynasty == "") obj.dynasty = "Sin datos";
            if (obj.objectDate == "") obj.objectDate = "Sin datos";

            //Crear el div que contiene la card
            let card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML =
                `<div class="divCard">
                    <img src="${obj.primaryImageSmall}" title="Fecha: ${obj.objectDate}" ${onclickValor}>
                </div>
                <div class="divDatos">
                    <p class="identificador">Título:</p>
                    <h3 class="valor">${obj.title}</h3>
                </div>
                <div class="divDatos">
                    <p class="identificador">Cultura:</p>
                    <p class="valor">${obj.culture}</p>
                </div>
                <div class="divDatos">
                    <p class="identificador">Dinastía:</p>
                    <p class="valor">${obj.dynasty}</p>
                </div>
                <input type="button" class="${buttonClass}" value="${buttonValue}" title="${buttonTitle}" ${onclickValor}">`;
            document.getElementById("grilla").appendChild(card);
        });
}


//-------MANEJO DE BOTONES PARA SELECCIONAR PÁGINAS--------------------------------------------------------------------
let inicioPaginas = 0; //+1 - Valor del primer botón para seleccionar página.
const tamPaginas = 10; //Cant máx de botones para seleccionar páginas.

function actualizaPaginado() {
    let finPaginas;
    let totalPaginas;

    totalPaginas = Math.trunc(datos.total / cardPorPag);
    if (Math.trunc(datos.total / cardPorPag) < (datos.total / cardPorPag)) {
        totalPaginas += 1;
    }
    //Arma los indices del carrete
    if (inicioPaginas + tamPaginas < totalPaginas) {
        finPaginas = inicioPaginas + tamPaginas;
    } else { finPaginas = totalPaginas; }

    let htmlPaginas = "";

    //Botón de retroceso de carrete de botones
    if (totalPaginas > tamPaginas) {
        if (inicioPaginas - tamPaginas >= 0) {
            htmlPaginas += `<input type="button" class="button" value="&larr;" title="Mostrar páginas anteriores" onclick="retrocedeBotones()" style=" margin-inline: 25px;">`;
        } else {
            htmlPaginas += `<input type="button" class="button noFunc" value="&larr;" title="Mostrar páginas anteriores"style=" margin-inline: 25px;">`;
        }
    }

    //Botones de retroceso de páginas
    if (pag == 1) {
        htmlPaginas += `<input type="button" class="button noFunc" value="|&#9668;" title="Ir a la primer página">`;
        htmlPaginas += `<input type="button" class="button noFunc" value="&#9668;" title="Ir a la página anterior">`;
    } else {
        htmlPaginas += `<input type="button" class="button" value="|&#9668;" title="Ir a la primer página" onclick="primerPagina()">`;
        htmlPaginas += `<input type="button" class="button" value="&#9668;" title="Ir a la página anterior" onclick="paginaAnterior()">`;
    }

    //Botones de selección de páginas
    if (inicioPaginas + 1 > pag) { htmlPaginas += `<input type="button" class="button pagSelec" value="${pag}" title="Página seleccionada" onclick="cargaGrilla(${pag})">`; }

    for (let index = inicioPaginas; index < finPaginas; index++) {
        if (index + 1 == pag) {
            htmlPaginas += `<input type="button" class="button pagSelec" value="${index + 1}" title="Página seleccionada" onclick="cargaGrilla(${index + 1})">`;
        } else {
            htmlPaginas += `<input type="button" class="button" value="${index + 1}" title="Seleccionar página" onclick="cargaGrilla(${index + 1})">`;
        }
    };

    if (finPaginas < pag) { htmlPaginas += `<input type="button" class="button pagSelec" value="${pag}" title="Página seleccionada" onclick="cargaGrilla(${pag})">`; }

    //Botones de avance de páginas
    if (pag == totalPaginas) {
        htmlPaginas += `<input type="button" class="button noFunc" value="&#9658;" title="Ir a la página siguiente">`;
        htmlPaginas += `<input type="button" class="button noFunc" value="&#9658;|" title="Ir a la última página">`;
    } else {
        htmlPaginas += `<input type="button" class="button" value="&#9658;" title="Ir a la página siguiente" onclick="paginaSiguiente()">`;
        htmlPaginas += `<input type="button" class="button" value="&#9658;|" title="Ir a la última página" onclick="ultimaPagina(${totalPaginas})">`;
    }

    //Botón de avance de carrete de botones
    if (totalPaginas > tamPaginas) {
        if (inicioPaginas + tamPaginas < totalPaginas) {
            htmlPaginas += `<input type="button" class="button" value="&rarr;" title="Mostrar páginas siguientes" onclick="avanzaBotones()" style=" margin-inline: 25px;">`;
        } else {
            htmlPaginas += `<input type="button" class="button noFunc" value="&rarr;" title="Mostrar páginas siguientes" style=" margin-inline: 25px;">`;
        }
    }
    document.getElementById("paginas").innerHTML = htmlPaginas;
}
function primerPagina() {
    pag = 1;
    inicioPaginas = 0
    cargaGrilla(pag);
}
function ultimaPagina(ultima) {
    pag = ultima;
    let mult = Math.trunc(ultima / tamPaginas);
    if (Math.trunc(ultima / tamPaginas) >= (ultima / tamPaginas)) {
        mult -= 1;
    }
    inicioPaginas = mult * tamPaginas;
    cargaGrilla(pag);
}
function paginaAnterior() {
    pag -= 1;
    if (pag <= inicioPaginas) retrocedeBotones();
    cargaGrilla(pag);
}
function paginaSiguiente() {
    pag += 1;
    if (pag > inicioPaginas + tamPaginas) avanzaBotones();
    cargaGrilla(pag);
}
function retrocedeBotones() {
    inicioPaginas -= tamPaginas;
    actualizaPaginado();
}
function avanzaBotones() {
    inicioPaginas += tamPaginas;
    actualizaPaginado();
}



//-----FUNCIONES DEL MODAL PARA MOSTRAR CARRETE DE IMÁGENES O ZOOM DE LA IMAGEN PRINCIPAL------------------------------
let modal = document.getElementById("modalBox");
let fotosCarrete = []; //Arreglo global donde se cargan la imágenes para mostrar en el modal
let inicioCarrete = 0; //Posición del arreglo que se empiza a mostrar en el carrete
let indexFotoSelec = 0; //Posición del arreglo de la imagen seleccionada
const tamCarrete = 5; //Cant máx de imágenes que se muestran en el carrete

function zoomModal(objectID) {
    //Solicita al server la imágen principal para mostrar según el Id del objeto
    const URL_OBJ = `/obj/${objectID}`;
    axios(URL_OBJ)
        .then(response => {
            obj = response.data;

            let html =
                `<div id="modal-cont" class="modal-cont">
                     <span class="cerrar" onclick="cerrarModal()">&times;</span>
                        <img src=${obj.primaryImage} title="${obj.title} - ${obj.objectDate}" style="max-width: 100%; max-height: 100%;">
                </div>`;
            modal.innerHTML = html;

            modal.style.display = "block";
        });
}

function carreteModal(objectID) {
    //Carga el arreglo de fotos para mostrar
    //Solicita al server las imágenes para mostrar según el Id del objeto
    const URL_OBJ = `/obj/${objectID}`;
    axios(URL_OBJ)
        .then(response => {
            obj = response.data;
            //Carga en el arreglo de fotosCarrete la imagen principal y las imágenes adicionales.
            fotosCarrete.push(obj.primaryImage);
            obj.additionalImages.forEach(img => {
                fotosCarrete.push(img);
            })

            //Arma estructura del MODAL
            let html =
                `<div id="modal-cont" class="modal-cont">
                     <span class="cerrar" onclick="cerrarModal()">&times;</span>
                    <div id="imgPrincipal"></div>
                    <div id="carrete"></div>
                </div>`;
            modal.innerHTML = html;
            actualizaCarrete();
            selecFoto(0);
            modal.style.display = "block";
        });
}

function selecAnterior() {
    //Cambia de foto seleccionada
    if (indexFotoSelec > 0) {
        indexFotoSelec -= 1;
    } else {
        indexFotoSelec = fotosCarrete.length - 1;
    }

    if (indexFotoSelec == fotosCarrete.length - 1) {
        if (fotosCarrete.length > tamCarrete) {
            inicioCarrete = fotosCarrete.length - tamCarrete;
        } else {
            inicioCarrete = 0;
        }
    } else if (inicioCarrete > indexFotoSelec) {
        inicioCarrete -= 1;
    }
    actualizaCarrete();
    selecFoto(indexFotoSelec);
}

function selecSiguiente() {
    //Cambia de foto seleccionada
    if (indexFotoSelec + 1 < fotosCarrete.length) {
        indexFotoSelec += 1;
    } else {
        indexFotoSelec = 0;
    }

    if (indexFotoSelec == 0) {
        inicioCarrete = 0;
    } else if (inicioCarrete + tamCarrete - 1 < indexFotoSelec) {
        inicioCarrete += 1;
    }
    actualizaCarrete();
    selecFoto(indexFotoSelec);
}

function actualizaCarrete() {
    let finCarrete;
    //Arma los indices del carrete
    if (inicioCarrete + tamCarrete < fotosCarrete.length) {
        finCarrete = inicioCarrete + tamCarrete;
    } else { finCarrete = fotosCarrete.length; }
    //Carga el carrete con las fotos
    let carrete = fotosCarrete.slice(inicioCarrete, finCarrete);
    let html = `<input type="button" class="button" value="&#9668;" onclick="selecAnterior()">`;
    for (let index = inicioCarrete; index < finCarrete; index++) {
        html += `<div class="divCarrete"><img src="${fotosCarrete[index]}" onclick="selecFoto(${index})"></div>`;
    };
    html += `<input type="button" class="button" value="&#9658;" onclick="selecSiguiente()">`;
    document.getElementById("carrete").innerHTML = html;
}

function selecFoto(index) {
    indexFotoSelec = index;
    document.getElementById("imgPrincipal").innerHTML =
        `<img src=${fotosCarrete[indexFotoSelec]} title="${obj.title} - ${obj.objectDate}">`;

    let carrete = document.querySelectorAll(".divCarrete");
    carrete.forEach((div) => {
        div.classList.remove("fotoSelec");
    });

    carrete[indexFotoSelec - inicioCarrete].classList.add("fotoSelec");
}

// Función para cerrar el modal (puede ser disparada por el span (x), o bien haciendo click fuera del modal.
function cerrarModal() {
    modal.style.display = "none";
    modal.innerHTML = "";
    inicioCarrete = 0;
    indexFotoSelec = 0;
    fotosCarrete = [];

}

// Dispara la función cerrarModal haciendo click fuera del modal.
window.onclick = function (event) {
    if (event.target == modal) {
        cerrarModal();
    }
}