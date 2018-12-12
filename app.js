connectssid('tw24','22224444')
function connectssid(ssidWanted,passphrase) {
    var exec = require('child_process').exec;
   // connect('wifi_0200b23055b1_74773234_managed_psk')
  //return

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
            var connectedPath;
            console.log('Looking for connected access point ' + data.length)
            for (var i = 0; i < data.length; ++i) {
                ssid = data[i].substring(4, data[i].lastIndexOf(' ')).trim();
                path = data[i].substr(data[i].lastIndexOf(' ')).trim();
                if (data[i].substr(0, 3) == '*AO' || data[i].substr(0, 3) == '*AR') {
                    connected = true;
                    console.log('Connected access point found#' + i)
                    connectedPath = path;
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
                    disconnect(connectedPath,function(){connect(pathWanted,ssidWanted)})
                } else
                {
                    console.log('not connected - connecting')
                    connect(pathWanted,ssidWanted)
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


    function connect(p){
        var state =0;
        console.log('attemting to connect to '+p)
        exec('rm  /var/lib/connman/*.config', (error, stdout, stderr) => {
            console.log('deleted all saved access points')
            var child = exec('connmanctl');

            child.stdout.on('data', function (data) {
                console.log('--'+data+'%')
                switch (state){
                    case 0:
                   console.log ('turning agent on')
                        child.stdin.write('agent on\n')
                    ++state
                        break;

                    case 1:
                        console.log ('sending connect command')
                        child.stdin.write('connect '+p+'\n')
                        ++state
                        break;
                    case 2:
                      if (data.indexOf('Passphrase?' != -1 )){
                        console.log ('sending passphrase')
                        child.stdin.write(passphrase+'\n')
                        ++state

                      }
                      else
                      {console.log('waiting for passphrase request')}
                          break;

                    case 3:
                        console.log ('exiting')
                        child.stdin.write('exit\n')
                        ++state
                        break;

                }

            })
            child.on('close', function (code) {
                console.log('closing code wifi connected?: ' + code);
            });
            child.stderr.on('data', function (data) {
                console.log('stdoerr: ' + data)
            });




        })
    }

    // function connect(p,s){
    //     const fs = require('fs')
    //
    //     console.log('attemting to connect to '+p)
    //     exec('rm /var/lib/connman/*.config', (error, stdout, stderr) => {
    //         console.log('deleting all saved access points')
    //         console.log(`stdout: ${stdout}`);
    //         console.log(`stderr: ${stderr}`);
    //         var settingsFile = '[service_'+p+']\rType=wifi\rName='+s+'\rPassphrase='+ passphrase+'\r'
    //
    //         fs.writeFileSync('/var/lib/connman/accesspoint.config',settingsFile)
    //         // exec('connmanctl connect '+p, (error, stdout, stderr) => {
    //         // console.log('connection results')
    //         //     console.log(`stdout: ${stdout}`);
    //         //     console.log(`stderr: ${stderr}`);
    //         // })
    //     })
    // }
}
