
var exec = require('child_process').exec;
console.log('scanning wifi');
exec('connmanctl scan wifi', (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    var child = exec('connmanctl services');
    child.stdout.on('data', function (data) {
        console.log(data + '%');
        res = data.split('\n');
        var connected = false;
        var ssid;
        var path;
        for (var i=0; i < data.length;++i){
            if (data[i].substr(0,3)=='*AO'){
                connected = true;
                ssid = data[i].split('  ')[0]
                console.log('ssid:'+ssid)

            }

        }
        console.log(res[0].split('      '));

    });
    child.stderr.on('data', function (data) {
        console.log('stdoerr: ' + data)
    });
    child.on('close', function (code) {
        console.log('closing code: ' + code);
    });

});