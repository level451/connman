
var exec = require('child_process').exec;
console.log('scanning wifi');
exec('connmanctl scan wifi', (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    var child = exec('connmanctl services');
    child.stdout.on('data', function (data) {
        console.log(data + '%');
        data = data.split('\n');
        var connected = false;
        var ssid;
        var path;
        console.log('Looking for connected access point '+data.length)
        for (var i=0; i < data.length;++i){
            if (data[i].substr(0,3)=='*AO'){
                connected = true;
                console.log('Connected access point found#'+i)
                ssid = data[i].split('\t')[0].substr(4).trim();
               // path = data[i].split('\t')[2].trim();
                console.log('ssid:'+ssid)
                console.log('path:'+path)
                console.log(data[i].split('\t'));

            }

        }

    });
    child.stderr.on('data', function (data) {
        console.log('stdoerr: ' + data)
    });
    child.on('close', function (code) {
        console.log('closing code: ' + code);
    });

});