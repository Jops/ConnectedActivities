var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    ifaces = require('os').networkInterfaces(),
    path = require('path'),
    express = require('express'),
    sanitizeHtml = require('sanitize-html');

var g_gameTaskOn = true,
    g_buttonMap = [
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true,
        true, true, true, true, true, true, true
    ],
    oPLAYERS = {};

for(var i in g_buttonMap)
{
    g_buttonMap[i] = Math.random() > 0.5? true:false;
}

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(
    '/public',
    express.static(path.resolve(__dirname + '/public'))
);

io.on('connection', function(socket) {
    console.log( 'a user connected: ' + socket.id );

    g_gameTaskOn = g_gameTaskOn? false:true;
    socket.emit( 'give id', socket.id );
    socket.emit( 'task allocation', g_gameTaskOn );
    socket.emit( 'button map', g_buttonMap );
    for(var i in oPLAYERS)
    {
        socket.broadcast.emit(  'new player',
                                {
                                    id: oPLAYERS[i].socket.id,
                                    face: oPLAYERS[i].face,
                                    colour: oPLAYERS[i].colour,
                                    task: oPLAYERS[i].task
                                } );
    }

    socket.on( 'disconnect', function() {
        console.log('user disconnected: ' + socket.id );
        removePlayer(socket.id);
    });

    socket.on( 'chat message', handleMessage.bind(this) );
    socket.on( 'update button', handleMapUpdate.bind(this) );
    socket.on( 'new player', handleNewPlayer.bind(this, socket) );
});

function handleMessage( msg, extra ) {
    console.log( 'message: ' + msg + ', ' + extra );
    msg = sanitizeHtml(msg, { allowedTags: [] });

    io.emit( 'chat message', msg, extra );
}

function handleMapUpdate( index, flag ) {
    g_buttonMap[index] = flag;
    io.emit( 'button map', g_buttonMap );
}

function handleNewPlayer( clientSocket, face, colour, task ) {
    oPLAYERS[clientSocket.id] = { socket: clientSocket, face: face, colour: colour, task: task };
    clientSocket.broadcast.emit( 'new player', { id: clientSocket.id, face: face, colour: colour, task: task } );
}

function removePlayer( id ) {
    // if( typeof(oPLAYERS[id]) == 'undefined' ) return;
    console.log('so here trying');
    io.emit( 'remove player', { id:id } );
    delete oPLAYERS[id];
}

http.listen(3000, function() {
    console.log( 'listening on *:3000' );
    Object.keys( ifaces ).forEach( function( ifname ) {
        var alias = 0;

        ifaces[ifname].forEach( function( iface ) {
            if( 'IPv4' !== iface.family || iface.internal !== false )
            {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if( alias >= 1 )
            {
                // this single interface has multiple ipv4 addresses
                console.log( ifname + ':' + alias, iface.address );
            }
            else
            {
                // this interface has only one ipv4 adress
                console.log( ifname, iface.address );
            }
        });
    });
});


