function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

let button = document.getElementById("btn");
button.addEventListener("click", function () {
    const element = document.getElementById('GFG');
    const options = {
        filename: 'ReportAnalysis.pdf',
        margin: 0,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(options).from(element).save();
    html2pdf(element, options);
});

function getSolutions() {
    var formData = new FormData();
    formData.append("path", getCookie('path'));
    $.ajax({
        data: formData,
        type: "POST",
        url: "/reportAnalysis",
        contentType: false,
        processData: false,
        beforeSend: function () {
            console.log("Message Sent")
        },
        timeout: 90000,
        success: function (response) {  
            document.querySelector(".solution").innerHTML = marked.parse(response['data'])
        },
        error: function (response) {
            console.log("Error:", response)
        },
        complete: function (data) {
            console.log("Complete!")
        }
    });
}
window.addEventListener("load", async (event) => {
    console.log("page is fully loaded");
    getSolutions()
})