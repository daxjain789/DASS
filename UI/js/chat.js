function sendMessage() {
    const chatBody = document.querySelector('.chat-body');
    const messageElement = document.createElement('div');
    let data = {
        'file_path': 'D:/Other/Invarido/AI/AI/reports/report.pdf',
        'prompt': 'describe'
    }
    var formData = new FormData();
    formData.append("file_path", "D:/Other/Invarido/AI/AI/reports/report.pdf");
    formData.append("prompt", "Describe this pdf");

    var object = {};
    formData.forEach((value, key) => object[key] = value);
    console.log("formData", JSON.stringify(object))

    $.ajax({
        data: formData,
        type: "POST",
        url: "http://192.168.8.128:8000/summarize-issues",
        // enctype: 'multipart/form-data',
        contentType: false,
        processData: false,
        beforeSend: function () {
            console.log("Message Sent")
        },
        timeout: 90000,
        success: function (response) {
            aiMessage = response['summary'].replace(/\*\*(\d+)\.\*\*/g, '<strong>$1.</strong>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');

            console.log("Response", aiMessage)
            messageElement.classList.add('message', 'ai-message');
            messageElement.innerHTML = `<strong>AI:</strong> ${aiMessage}`;
            chatBody.appendChild(messageElement);
            chatBody.scrollTop = chatBody.scrollHeight;
        },
        error: function (response) {
            console.log("Error:", response)
        },
        complete: function (data) {
            console.log("Complete!")
        }
    });
}

document.querySelector('#sendButton').addEventListener('click', function () {
    const input = document.querySelector('.chat-input input');
    const message = input.value.trim();
    if (message) {
        sendMessage()
        const chatBody = document.querySelector('.chat-body');
        const messageElement = document.createElement('div');

        document.querySelector('.file-upload').style.display = 'none'

        messageElement.classList.add('message', 'user-message');
        messageElement.innerHTML = `<strong>You:</strong> ${message}`;
        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
        input.value = '';
    }
});

function uploadFile() {
    document.querySelector('#reportFile').click()
}

function getFile(files) {
    // const files = uploadedFile.files[0];
    if (files) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(files);
        fileReader.addEventListener("load", function () {
            let img = document.createElement('img');
            img.id = 'image';
            img.src = String(this.result);
            result.innerHTML = '';
            result.appendChild(img);

            cropper = new Cropper(img);

            save.addEventListener('click', e => {
                e.preventDefault();
                cropAndUpload(cropper);
            });

            console.log("this is blank")
        });
    }
}

document.querySelector('#reportFile').addEventListener('change', function (event) {
    event.preventDefault()
    const chatBody = document.querySelector('.chat-body');
    const messageElement = document.createElement('div');
    const input = document.querySelector('.chat-input input');
    document.querySelector('#selected-file-msg').innerHTML = "File Uploaded"
    document.querySelector('.file-upload').style.borderColor = '#42e776'
    let file = document.querySelector('#reportFile').files[0]
    console.log("first",file);

    var formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", "Describe this pdf");

    // var object = {};
    // formData.forEach((value, key) => object[key] = value);
    // console.log("formData", object)
    
    event.preventDefault();
    $.ajax({
        data: formData,
        type: "POST",
        url: "http://192.168.8.128:8000/uploadPDF",
        enctype: 'multipart/form-data',
        contentType: false,
        processData: false,
        beforeSend: function () {
            event.preventDefault();
            console.log("Message Sent")
        },
        // timeout: 90000,
        success: function (response) {
            event.preventDefault();
            document.querySelector('.file-upload').style.display = 'none'
            aiMessage = response['summary'].replace(/\*\*(\d+)\.\*\*/g, '<strong>$1.</strong>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');
            console.log("Response", aiMessage)
            alert(131)
            messageElement.classList.add('message', 'ai-message');
            alert(133)
            messageElement.innerHTML = `<strong>AI:</strong> ${aiMessage}`;
            chatBody.appendChild(messageElement);
            chatBody.scrollTop = chatBody.scrollHeight;
            input.value = '';
            alert(138)
        },
        error: function (error) {
            alert(error)
            console.log("Error:", response)
        },
        complete: function (data) {
            alert("Completed")
            console.log("Complete!")
        }
    });
});

document.querySelector('.file-upload').addEventListener('click', function () {
    uploadFile()
});

document.querySelector('#messageInput').addEventListener('keypress', function (event) {
    if (event.keyCode === 13) {
        document.querySelector('#sendButton').click()
        event.target.value = ""
    }
})