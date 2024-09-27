//Require del proyecto
const translate = require('node-google-translate-skidz');
const path = require('path');
const express = require("express");
const app = express();


//URLs
const URL_DPTOS = "https://collectionapi.metmuseum.org/public/collection/v1/departments";
const URL_OBJ = "https://collectionapi.metmuseum.org/public/collection/v1/objects";


//Solicitud index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

//Solicitud app.js
app.get("/app.js", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'app.js'));
});
//Solicitud style.css
app.get("/style.css", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'style.css'));
});


//Solicitud de imagenes
app.get("/background_MET.jpg", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'img', 'background_MET.jpg'));
});
app.get("/logoULP", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'img', 'logoULP.jpeg'));
});
app.get("/sinImagen", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'img', 'sinImagen.png'));
});


//Solicitud de DPTOS
app.get("/dpto", (req, res) => {
    fetch(URL_DPTOS)
        .then((response) => response.json())
        .then((data) => {
            translate({
                text: JSON.stringify(data),
                source: 'en',
                target: 'es'
            }, function (result) {
                res.send(JSON.parse(result.translation));
            });
        });
});

//Carga OBJETOSS
app.get("/obj/:id", (req, res) => {
    const obj = {};
    obj.objectID = req.params.id;

    obj.primaryImage = "";
    obj.primaryImageSmall = "";
    obj.additionalImages = "";
    obj.titleOriginal = "";

    obj.title = "";
    obj.culture = "";
    obj.dynasty = "";
    obj.objectDate = "";

    fetch(URL_OBJ + `/${req.params.id}`)
        .then((response) => response.json())
        .then((data) => {
            console.log("data");
            if (Object.keys(data) == 'message') {
                console.log("ERROR!!!!!!!!!!! JSON vacío!");
                obj.title = "No es un objeto válido<br>Error de la API";
                res.send(obj);
            } else {
                //Recupera las imagenes
                obj.primaryImage = data.primaryImage;
                obj.primaryImageSmall = data.primaryImageSmall;
                obj.additionalImages = data.additionalImages;
                obj.titleOriginal = data.title;

                //Preparar para traduccion
                let objToTrans = {};
                if (data.title != "") objToTrans.t = data.title.replace(/['"]+/g, '');
                if (data.culture != "") objToTrans.c = data.culture;
                if (data.dynasty != "") objToTrans.d = data.dynasty;
                if (data.objectDate != "") objToTrans.f = data.objectDate;
                let textToTrans = JSON.stringify(objToTrans);
                console.log(textToTrans);

                try {
                    translate({
                        text: textToTrans,
                        source: 'en',
                        target: 'es'
                    }, function (result) {
                        if (JSON.parse(result.translation).t != undefined) obj.title = JSON.parse(result.translation).t;
                        if (JSON.parse(result.translation).c != undefined) obj.culture = JSON.parse(result.translation).c;
                        if (JSON.parse(result.translation).d != undefined) obj.dynasty = JSON.parse(result.translation).d;
                        if (JSON.parse(result.translation).f != undefined) obj.objectDate = JSON.parse(result.translation).f;

                        //Algunos arreglos de la traducción
                        if (obj.culture == "American") obj.culture = ("Americana")
                        obj.objectDate = obj.objectDate.replace("ca.", "al rededor de");
                        res.send(obj);
                    });
                }
                catch (error) {
                    console.log(error);
                    res.send(obj);
                }
            }
        });
});

app.get("/translate/:clave", (req, res) => {
    try {
        translate({
            text: req.params.clave,
            source: 'es',
            target: 'en'
        }, result =>
            res.send(result.translation)
        );
    } catch {
        res.send("");
    }
});

//Solicitudes de páginas erróneas
app.get("/*", (req, res) => {
    res.send("Velo!!");
});

//
app.listen(3000, () => {
    console.log("El servidor se está ejecutando en el puerto 3000");
});

module.exports = app;