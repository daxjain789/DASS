// Incidents Over Time Chart
const incidentsCtx = document.getElementById('incidentsChart').getContext('2d');
new Chart(incidentsCtx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
            label: 'Incidents',
            data: [65, 59, 80, 81, 56, 55, 40],
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

// Threat Distribution Chart
const threatDistributionCtx = document.getElementById('threatDistributionChart').getContext('2d');
new Chart(threatDistributionCtx, {
    type: 'pie',
    data: {
        labels: ['Malware', 'Phishing', 'DDoS', 'Insider Threats'],
        datasets: [{
            data: [30, 25, 20, 25],
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