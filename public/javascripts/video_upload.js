
const form = document.getElementById('uploadForm'); // form element

form.addEventListener("submit", function(e) { // intercept form submission
    e.preventDefault(); // prevent real form submission


    var formData = new FormData();
    var xhr = new XMLHttpRequest();

    const file = document.getElementById('customFile');
    console.log(file.files);
    const progressbar = document.getElementById('upload-progress');

    // Get all the inputs and append them to a formData object
    formData.append('customFile', file.files[0]);
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('desc').value);

    xhr.open('post', '/upload', true); // POST

    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            let percentage = (e.loaded / e.total) * 100;
            console.log(percentage + "%");
            progressbar.style.width = percentage + "%";
            progressbar.setAttribute('aria-valuenow', percentage);
        }
    };

    xhr.onerror = function(e) {
        console.log('Error');
        console.log(e);
    };

    xhr.onload = function() {
        console.log(this.statusText);
        progressbar.style.width = "0%";
        progressbar.setAttribute('aria-valuenow', '0');
    };

    xhr.send(formData); // SEND

});