window.onload = loadDoc();

function loadDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
    };
    xhttp.open("GET", "https://proto.io/en/jobs/candidate-exercise/quiz.json", true);
    xhttp.onload = function () {
        var jsonResponse = JSON.parse(xhttp.response);

        var title = jsonResponse.title;
        var desc = jsonResponse.description;

        document.getElementById("title").innerHTML = title;
        document.getElementById("description").innerHTML = desc;
    };
    xhttp.send();
}

function redirect() {
    location.href = "http://localhost:3000/views/quiz.html";
}

function callMethod(method, endpoint, body) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(method, "http://localhost:3000/" + endpoint, true); // false for synchronous request
    xmlHttp.send(body);
}