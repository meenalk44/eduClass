
function init(ansLevel1) {
    alert("Init");
    ansLevel1.forEach(function (ans) {
        preOrder(ans, 1);
    });
}

function preOrder(ans, level) {

    $("#mainDiv").html(getHTMLForAnswer(ans));
}

function getHTMLForAnswer(ans) {
    var html = "";
    html += "<div>";
        html += "Some Html";
        html += "<br/>";
    html += "</div>";
    return html;
}