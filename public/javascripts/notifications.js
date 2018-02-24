
const progressbar = $('#upload-progress');

let processing = false;

for (let i=0; i<user.videos.length; i++) {
    if (user.videos[i].status !== 'ready') {
        processing = true;
        pollVideoProcessing(user.videos[i].filename);
    }
}

function pollVideoProcessing(filename) {
    setTimeout(function(){
       $.ajax({ url: "/pollVideoProcessing", data: {'filename': filename}, success: function(data){
         progressbar.css({'width': data.percentage + '%'}).attr('aria-valuenow', data.percentage);
         console.log(data.percentage);
         if (processing) {pollVideoProcessing();}
       }, dataType: "json"});
   }, 5000);
 }