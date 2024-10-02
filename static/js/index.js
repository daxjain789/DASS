let chatHistory = []
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
function getCookie(cname) {
let name = cname + "=";
let ca = document.cookie.split(';');
for(let i = 0; i < ca.length; i++) {
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

function addHistory(role,message){
    chatHistory.push({
        "role": role,
        "parts": [message]
    })

    console.log("history",chatHistory)
}

function sendMessage(message) {
    const chatBody = document.querySelector('.chat-body');
    const messageElement = document.createElement('div');

    addHistory('user',message)

    var formData = new FormData();
    formData.append("file_path", getCookie('path'));
    formData.append("prompt", message);
    formData.append("history", JSON.stringify(history));
    
    var object = {};
    formData.forEach((value, key) => object[key] = value);
    console.log("formData", JSON.stringify(object))

    $.ajax({
        data: formData,
        type: "POST",
        url: "/answer",
        // enctype: 'multipart/form-data',
        contentType: false,
        processData: false,
        beforeSend: function () {
            console.log("Message Sent")
        },
        timeout: 90000,
        success: function (response) {
            aiMessage = marked.parse(response['summary'])
            addHistory('model',response['summary'])
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

document.querySelector('#sendButton').addEventListener('click', async (event)=> {
    const input = document.querySelector('.chat-input input');
    const message = input.value.trim();
    aiMessage = ""
    if (message) {
        // sendMessage(message)
        const chatBody = document.querySelector('.chat-body');
        const messageElementUser = document.createElement('div');
        const messageElement = document.createElement('div');

        document.querySelector('.file-upload').style.display = 'none'

        messageElementUser.classList.add('message', 'user-message');
        messageElementUser.innerHTML = `<strong>You:</strong> ${message}`;
        chatBody.appendChild(messageElementUser);
        chatBody.scrollTop = chatBody.scrollHeight;
        input.value = '';

        var formData = new FormData();
        formData.append("file", getCookie('path'));
        formData.append("prompt", message);
        formData.append("history", JSON.stringify(history));
        addHistory('user',message)

        event.preventDefault();

        const response = await fetch("/answer", {
            method: "POST",
            headers: {
                'Accept': 'text/event-stream'
            },
            body:formData
        });
        

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        messageElement.classList.add('message', 'ai-message');

        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
        input.value = '';
        messageElement.innerHTML = `<strong>AI:</strong> `
        console.log("Stream Start")
        
        function readStream(){
            reader.read().then(({done,value})=>{
                if(done){
                    addHistory('model',aiMessage)
                    return "Done"
                }
                let stream_return = decoder.decode(value,{stream:true})
                aiMessage+=stream_return
                messageElement.innerHTML += marked.parse(stream_return);
                readStream()
            })
        }
        readStream();
        
    }
    
});

function uploadFile() {
    let file = document.querySelector('#reportFile').files[0]
    var formData = new FormData();
    formData.append("file", file);
    $.ajax({
        data: formData,
        type: "POST",
        url: "/uploadPDF",
        enctype: 'multipart/form-data',
        contentType: false,
        processData: false,
        beforeSend: function () {
            console.log("Message Sent")
        },
        success: function (response) {
            console.log("Path:",response)
            setCookie("path",response['path'].replace('\\','/'))
        },
        error: function (error) {
            console.log("Error:", response)
        },
        complete: function (data) {
            console.log("Complete!",data)
        }
    });
    return getCookie('path')
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

document.querySelector('#reportFile').addEventListener('change',(event) => {
    event.preventDefault()
    const chatBody = document.querySelector('.chat-body');
    const messageElement = document.createElement('div');
    const input = document.querySelector('.chat-input input');
    document.querySelector('#selected-file-msg').innerHTML = "File Uploaded"
    document.querySelector('.file-upload').style.borderColor = '#42e776'
    
    let path = uploadFile()
    setTimeout(console.log("1"),1000)
    setTimeout(async ()=>{
        console.log("1Sec",path)
        
        var formData = new FormData();
        formData.append("file", path);
        formData.append("prompt", "Describe this pdf");

        event.preventDefault();

        const response = await fetch("/answer", {
            method: "POST",
            headers: {
                'Accept': 'text/event-stream'
            },
            body:formData
        });
        

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        document.querySelector('.file-upload').style.display = 'none'
        messageElement.classList.add('message', 'ai-message');

        chatBody.appendChild(messageElement);
        chatBody.scrollTop = chatBody.scrollHeight;
        input.value = '';
        messageElement.innerHTML = `<strong>AI:</strong> `
        console.log("Stream Start")

        function readStream(){
            reader.read().then(({done,value})=>{
                if(done){
                    return "Done"
                }
                let stream_return = decoder.decode(value,{stream:true})
                messageElement.innerHTML += marked.parse(stream_return);
                readStream()
            })
        }
        readStream();
    },2000)
});


document.querySelector('.file-upload').addEventListener('click', function () {
    document.querySelector('#reportFile').click()
});

document.querySelector('#messageInput').addEventListener('keypress', function (event) {
    if (event.keyCode === 13) {
        document.querySelector('#sendButton').click()
        event.target.value = ""
    }
})