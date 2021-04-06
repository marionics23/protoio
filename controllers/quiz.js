const boolAns = ['True', 'False'];

window.onload = fillData(0);

function fillData(questNo) {
    var xhttp = new XMLHttpRequest();
    var response;

    xhttp.open("GET", "https://proto.io/en/jobs/candidate-exercise/quiz.json", true);

    xhttp.onload = function () {
        response = JSON.parse(xhttp.response);

        var title = response.title;

        var dataArray = response.questions[questNo];
        var qTitle = dataArray.title
        var qImgUrl = dataArray.img;
        var qType = dataArray.question_type;
        var qAns = dataArray.possible_answers;

        document.getElementById("title").innerHTML = title;

        document.getElementById("question").innerHTML = parseInt(questNo) + 1 + ') ' + qTitle;
        document.getElementById('image').src = qImgUrl;

        if (qType == 'multiplechoice-single' || qType == 'multiplechoice-multiple') {
            var a = '';

            for (i = 0; i < qAns.length; i += 1) {
                a += '<tr id="answer' + qAns[i].a_id + '"><td>';
                a += '<input type="checkbox" name="ans1" value="' + qAns[i].a_id + '">';
                a += '<label for="vehicle1">' + qAns[i].caption + '</label><br>';
                a += '</td></tr>';
            }

            document.getElementById('answers').innerHTML = a;
        }

        if (qType == 'truefalse') {

            var a = '';
            for (i = 0; i < 2; i += 1) {
                a += '<tr id="answer' + i + '"><td>';
                a += '<input type="checkbox" name="ans1" value="' + boolAns[i] + '">';
                a += '<label for="vehicle1">' + boolAns[i] + '</label><br>';
                a += '</td></tr>';

            }

            document.getElementById('answers').innerHTML = a;
        }

        var button = document.querySelector('button').disabled = false;


        if (qType == 'multiplechoice-single' || qType == 'truefalse') {
            var divAns = document.getElementById("answers");
            var chks = divAns.getElementsByTagName("INPUT");
            for (var i = 0; i < chks.length; i++) {
                chks[i].onclick = function () {
                    for (var i = 0; i < chks.length; i++) {
                        if (chks[i] != this && this.checked) {
                            chks[i].checked = false;
                        }
                    }
                };
            }
        }
    };
    xhttp.send();

}

function showResult() {
    var xmlHttpQuestNum = new XMLHttpRequest();
    var responseQuestNum;
    var questionNumber;
    xmlHttpQuestNum.open('GET', "http://localhost:3000/getQuestionNumber", true);

    xmlHttpQuestNum.onload = function () {
        responseQuestNum = JSON.parse(xmlHttpQuestNum.response);

        questionNumber = responseQuestNum.resBody;

        var xhttp = new XMLHttpRequest();
        var response;

        xhttp.open("GET", "https://proto.io/en/jobs/candidate-exercise/quiz.json", true);

        xhttp.onload = function () {
            response = JSON.parse(xhttp.response);

            var numQuest = response.questions.length;
            var dataArray = response.questions[questionNumber];
            var corAns;
            var points = dataArray.points;
            var qType = dataArray.question_type;

            if (qType == 'multiplechoice-single' || qType == 'truefalse') {
                corAns = dataArray.correct_answer;

                var divAns = document.getElementById("answers");
                var chks = divAns.getElementsByTagName("INPUT");
                var selectedAns;
                for (var i = 0; i < chks.length; i++) {
                    if (chks[i].checked) {
                        selectedAns = chks[i].value;
                    }
                }

                var correct = qType == 'truefalse' ? corAns ? 1 : 0 : corAns;
                var selected = qType == 'truefalse' ? selectedAns == 'True' ? 1 : 0 : parseInt(selectedAns);
                var result = correct == selected;
                var correctId = qType == 'truefalse' ? correct ? "answer0" : "answer1" : "answer" + corAns;
                var selectedId = qType == 'truefalse' ? selected ? "answer0" : "answer1" : "answer" + selected;
                var finalQuestion = numQuest == parseInt(questionNumber) + 1;

                if (result) {
                    callMethod('PATCH', 'updatePoints', JSON.stringify(points));
                }

                if (result) {
                    displayAnswerAndProceed(correctId, '', 3, finalQuestion);
                } else {
                    displayAnswerAndProceed(correctId, selectedId, 3, finalQuestion);
                }
            } else if (qType == 'multiplechoice-multiple') {
                corAns = dataArray.correct_answer;

                var divAns = document.getElementById("answers");
                var chks = divAns.getElementsByTagName("INPUT");
                var selectedAns = [];
                for (var i = 0; i < chks.length; i++) {
                    if (chks[i].checked) {
                        selectedAns[i] = parseInt(chks[i].value);
                    }
                }
                var filSelAns = selectedAns.filter(function (el) {
                    return el != null;
                });

                var correct = true;

                for (var i = 0; i < filSelAns.length; i++) {
                    if (!corAns.includes(filSelAns[i])) {
                        correct = false;
                        break;
                    }
                }

                if (correct) {
                    callMethod('PATCH', 'updatePoints', JSON.stringify(points));
                }

                if (correct) {
                    displayAnswerAndProceedArray(buildMultipleChoiceArray(corAns), '', 3, finalQuestion);
                } else {
                    var corIds = buildMultipleChoiceArray(corAns);
                    var selIds = buildMultipleChoiceArray(filSelAns);
                    var filSelIds = selIds.filter(function (el) {
                        return !corIds.includes(el);
                    });
                    displayAnswerAndProceedArray(corIds, filSelIds, 3, finalQuestion);
                }

            }


        };
        xhttp.send();
    };
    xmlHttpQuestNum.send(null);

}

function displayAnswerAndProceed(cid, sid, seconds, finalQuestion) {
    var xmlHttpQuestNum = new XMLHttpRequest();
    var responseQuestNum;
    var questionNumber;
    xmlHttpQuestNum.open('GET', "http://localhost:3000/getQuestionNumber", true);

    xmlHttpQuestNum.onload = function () {
        responseQuestNum = JSON.parse(xmlHttpQuestNum.response);
        questionNumber = responseQuestNum.resBody;

        var celement;
        var corigcolor;
        celement = document.getElementById(cid);
        corigcolor = celement.style.backgroundColor;
        celement.style.backgroundColor = 'green';

        var selement;
        var sorigcolor;
        if (sid) {
            selement = document.getElementById(sid);
            sorigcolor = selement.style.backgroundColor;
            selement.style.backgroundColor = 'red';
        }

        var t = setTimeout(function () {
            celement.style.backgroundColor = corigcolor;

            if (sid) {
                selement.style.backgroundColor = sorigcolor;
            }

            callMethod('PUT', 'putQuestionNumber', ++questionNumber);

            if (!finalQuestion) {
                fillData(questionNumber);
            } else {
                location.href = "result.html";
            }
        }, (seconds * 1000));
    };
    xmlHttpQuestNum.send(null);
}

function displayAnswerAndProceedArray(cid, sid, seconds, finalQuestion) {
    var xmlHttpQuestNum = new XMLHttpRequest();
    var responseQuestNum;
    var questionNumber;
    xmlHttpQuestNum.open('GET', "http://localhost:3000/getQuestionNumber", true);

    xmlHttpQuestNum.onload = function () {
        responseQuestNum = JSON.parse(xmlHttpQuestNum.response);
        questionNumber = responseQuestNum.resBody;

        var celement;
        var celements = [];
        var corigcolor;
        corigcolor = document.getElementById(cid[0]).style.backgroundColor;
        for (var j = 0; j < cid.length; j++) {
            celements[j] = document.getElementById(cid[j]);
            celements[j].style.backgroundColor = 'green';
        }

        var selement;
        var sorigcolor;
        if (sid) {
            var selements = [];
            // var filSElements = selements.filter(function (el) {
            //     return el != null;
            // });
            sorigcolor = document.getElementById(sid[0]).style.backgroundColor;
            for (var j = 0; j < sid.length; j++) {
                selements[j] = document.getElementById(sid[j]);
                selements[j].style.backgroundColor = 'red';
            }
        }

        var t = setTimeout(function () {
            for (var j = 0; j < cid.length; j++) {
                celements[j].style.backgroundColor = corigcolor;
            }

            if (sid) {
                for (var j = 0; j < sid.length; j++) {
                    selements[j].style.backgroundColor = sorigcolor;
                }
            }

            callMethod('PUT', 'putQuestionNumber', ++questionNumber);

            if (!finalQuestion) {
                fillData(questionNumber);
            } else {
                location.href = "result.html";
            }
        }, (seconds * 1000));
    };
    xmlHttpQuestNum.send(null);
}

function callMethod(method, endpoint, body) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(method, "http://localhost:3000/" + endpoint, true); // false for synchronous request
    xmlHttp.send(body);
}

function buildMultipleChoiceArray(ids) {
    var ansIds = [];
    for (var i = 0; i < ids.length; i++) {
        ansIds[i] = "answer" + ids[i];
    }

    return ansIds;
}