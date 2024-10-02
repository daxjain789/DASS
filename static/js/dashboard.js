// Incidents Over Time Chart
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

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


const data = {
    "insides": 0,
    "systemsMonitored": 0,
    'barLabels': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    'barData': [],
    'pieLabels': ['Malware', 'Phishing', 'DDoS', 'Insider Threats'],
    'pieData': [],
    'securityAlerts':{
        'type':[],
        'description':[],
        'severity':[],
        'time':[],
        'status':[]
    }
}

function addCharts() {
    const incidentsCtx = document.getElementById('incidentsChart').getContext('2d');
    new Chart(incidentsCtx, {
        type: 'bar',
        data: {
            labels: data['barLabels'],
            datasets: [{
                label: 'Incidents',
                data: data['barData'],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const threatDistributionCtx = document.getElementById('threatDistributionChart').getContext('2d');
    new Chart(threatDistributionCtx, {
        type: 'pie',
        data: {
            labels: data['pieLabels'],
            datasets: [{
                data: data['pieData'],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

function updateData() {
    document.querySelector("#totalIncident").innerHTML = data['insides']
    document.querySelector("#systemMonitored").innerHTML = data['systemsMonitored']

    for(let i=0;i<data['securityAlerts']['type'].length;i++){
        document.querySelector('.addAlerts').innerHTML+=`<tr>
                                    <td>${data['securityAlerts']['type'][i]}</td>
                                    <td>${data['securityAlerts']['description'][i]}</td>
                                    <td class="severity-${data['securityAlerts']['severity'][i].lower()}">${data['securityAlerts']['severity'][i]}</td>
                                    <td>${data['securityAlerts']['time'][i]}</td>
                                    <td class="status-in-progress">${data['securityAlerts']['status'][i]}</td>
                                </tr>`
    }
    
}

function convertToPer(arr) {
    t = 0
    for (i of arr) {
        t += i
    }
    for (let i = 0; i < arr.length; i++) {
        arr[i] = (arr[i] / t) * 100
    }
    return arr
}

function getData() {
    var formData = new FormData();

    formData.append("file_path", getCookie("path"));
    formData.append("prompt", "");

    $.ajax({
        data: formData,
        type: "POST",
        url: "/dashboardData",
        contentType: false,
        processData: false,
        beforeSend: function () {
            console.log("Message Sent")
        },
        timeout: 90000,
        success: function (response) {
            console.log(response)
            data['insides'] = response['summary123']['incidents']
            data['systemsMonitored'] = response['summary123']['monitired']

            data['barLabels'] = Object.keys(response['response_area'])
            for (var key in response['response_area']) {
                data['barData'].push(response['response_area'][key])
            }

            data['pieLabels'] = Object.keys(response['summary123']['recommendation_category'])
            for (var key in response['summary123']['recommendation_category']) {
                data['pieData'].push(response['summary123']['recommendation_category'][key])
            }

            data['pieData'] = convertToPer(data['pieData'])

            for(d of response['response_security']['Recent Security Alerts']){
                data['securityAlerts']['type'].push(d['type'])
                data['securityAlerts']['description'].push(d['description'])
                data['securityAlerts']['severity'].push(d['severity'])
                data['securityAlerts']['time'].push(d['time'])
                data['securityAlerts']['status'].push(d['status'])
            }
            addCharts()
            updateData()
        },
        error: function (response) {
            console.log("Error:", response)
        },
        complete: function (data) {
            console.log("Complete!")
        }
    });
    return data;
}

window.addEventListener("load", async (event) => {
    console.log("page is fully loaded");
    await getData()
    console.log(data);
})
