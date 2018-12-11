connectssid('tw24','22224444')
function connectssid(ssidWanted,passphrase) {
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
            var ssidWantedIsVisible = false
            var ssid;
            var path;
            console.log('Looking for connected access point ' + data.length)
            for (var i = 0; i < data.length; ++i) {
                ssid = data[i].substring(4, data[i].lastIndexOf(' ')).trim();
                path = data[i].substr(data[i].lastIndexOf(' ')).trim();
                if (data[i].substr(0, 3) == '*AO' || data[i].substr(0, 3) == '*AR') {
                    connected = true;
                    console.log('Connected access point found#' + i)

                    console.log('ssid:' + ssid)
                    console.log('path:' + path)
                    if (ssidWanted == ssid){
                        console.log('Already Connected to:'+ssid);
                        return(0);
                    }
                }
                if (ssidWanted == ssid){
                    var pathWanted = path;
                    ssidWantedIsVisible = true
                    break;
                }

            }
            if (ssidWantedIsVisible == false){
                console.log('Unable to connect to '+ssidWanted+ ' accesspoint not visible')
                return (-1,'Accesspoint not visible')
            } else {
                if (connected == true){
                    // if we connected to the right access point we would have exited already
                    console.log('Connected to wrong access point:'+ssid+' - disconnecting')
                    //call discconect then callback connect
                    disconnect(path,function(){connect(pathWanted,ssidWanted)})
                } else
                {
                    console.log('not connected - connecting')
                    connect(pathWanted, ssidWanted)
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
    function disconnect(inpath,cb){
        console.log('disconnecting...');
        exec('connmanctl disconnect '+inpath, (error, stdout, stderr) => {

            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            cb()
        })

    }
    function connect(p,s){
        const fs = require('fs')

        console.log('attemting to connect to '+p,s)
        exec('rm -rf /var/lib/connman/wifi*', (error, stdout, stderr) => {
            console.log('deleting all saved access points')
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            fs.mkdirSync('/var/lib/connman/'+p)
            var settingsFile = '['+p+']\nType=wifi\nName='+s+'\nPassphrase='+ passphrase+'\nSSID='+p.split('_')[2]+'\nAutoConnect=true\n'

            fs.writeFileSync('/var/lib/connman/'+p+'/settings',settingsFile)
            exec('connmanctl connect '+p, (error, stdout, stderr) => {
            console.log('connection results')
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            })
        })
    }
}
