window.onload = fillData();

function fillData() {
    var xmlHttpFinalPoints = new XMLHttpRequest();
    var responseFinalPoints;
    var finalPoints;
    xmlHttpFinalPoints.open('GET', "http://localhost:3000/getPoints", true);

    xmlHttpFinalPoints.onload = function () {
        responseFinalPoints = JSON.parse(xmlHttpFinalPoints.response);

        finalPoints = responseFinalPoints.resBody;

        var xhttp = new XMLHttpRequest();
        var response;

        xhttp.open("GET", "https://proto.io/en/jobs/candidate-exercise/result.json", true);

        xhttp.onload = function () {
            response = JSON.parse(xhttp.response);

            var classes = response.results;
            
            var totalPer = (100 * parseInt(finalPoints))/20;

            var finalClass = classes.filter(function (el) {
                return el.minpoints <= totalPer && el.maxpoints >= totalPer;
            });

            var outcome = finalClass[0].title;
            var message = finalClass[0].message;
            var imgUrl = finalClass[0].img;

            document.getElementById("title").innerHTML = outcome;
            document.getElementById('message').innerHTML = message;
            document.getElementById('image').src = imgUrl;
        };
        xhttp.send();
    };
    xmlHttpFinalPoints.send(null);
}

function restartQuiz() {
    location.href = "http://localhost:3000/views/home.html";
}