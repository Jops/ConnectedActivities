var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    ifaces = require('os').networkInterfaces(),
    path = require('path'),
    express = require('express'),
    sanitizeHtml = require('sanitize-html');
    Dictionary = require('./dictionary');

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
    dCLIENTS = new Dictionary(),
    dPLAYERS = new Dictionary();

var trace = function( msg ) { console.log( msg ); };

for(var i in g_buttonMap)
{
    g_buttonMap[i] = Math.random() > 0.5? true:false;
}

app.get(
    '/',
    function(req, res) {
        res.sendFile(__dirname + '/index.html');
    }
);

app.use(
    '/public',
    express.static(path.resolve(__dirname + '/public'))
);

io.on(
    'connection',
    function(socket)
    {
        trace( 'a user connected: ' + socket.id );
        if( !dCLIENTS.has(socket.id) ) dCLIENTS.add(socket.id, socket);
        else
        {
            trace( 'ERROR: client socket id already exists for ' + socket.id );
            return;
        }
        trace('New Connection, number of Clients: ' + dCLIENTS.length());

        g_gameTaskOn = g_gameTaskOn? false:true;
        socket.emit( 'give id', socket.id );
        socket.emit( 'task allocation', g_gameTaskOn );
        socket.emit( 'button map', g_buttonMap );

        socket.on(
            'disconnect',
            function()
            {
                trace('user disconnected: ' + socket.id );
                if( dCLIENTS.has(socket.id) )
                {
                    dCLIENTS.remove(socket.id);
                    removePlayer(socket.id);
                }
                else trace( 'ERROR: client socket id does not exist for ' + socket.id );
                trace( 'Lost Connection, number of Clients: ' + dCLIENTS.length() );
            }
        );

        socket.on( 'chat message', MessageHandle.bind(this) );
        socket.on( 'update button', MapUpdateHandle.bind(this) );
        socket.on( 'new player', NewPlayerHandle.bind(this, socket) );
    }
);

function MessageHandle( msg, extra )
{
    trace( 'message: ' + msg + ', ' + extra );
    msg = sanitizeHtml(msg, { allowedTags: [] });

    io.emit( 'chat message', msg, extra );
}

function MapUpdateHandle( index, flag )
{
    g_buttonMap[index] = flag;
    io.emit( 'button map', g_buttonMap );
}

function NewPlayerHandle( socket, face, colour, task )
{
    if( !dPLAYERS.has(socket.id) )
    {
        dPLAYERS.add(
            socket.id,
            { face: face, colour: colour, task: task }
        );
    }
    else
    {
        trace( 'ERROR: player already exists for ' + socket.id );
        return;
    }
    socket.broadcast.emit(
        'new player',
        { id: socket.id, face: face, colour: colour, task: task }
    );
    dPLAYERS.iterate(
        function( key, value )
        {
            if( key !== socket.id )
            {
                socket.emit(
                    'new player',
                    {
                        id: key,
                        face: value.face,
                        colour: value.colour,
                        task: value.task
                    }
                );
            }
        }
    );
    socket.emit( 'button map', g_buttonMap );
}

function removePlayer( id )
{
    if( dPLAYERS.has( id ) )
    {
        io.emit( 'remove player', { id:id } );
        dPLAYERS.remove( id );
    }
    else trace( 'ERROR: Cannot remove player, player does not exist for ' + id );
}

http.listen( 3000, function() {
        trace( 'listening on *:3000' );
        // Object.keys( ifaces ).forEach( function( ifname )
        //     {
        //         var alias = 0;

        //         ifaces[ifname].forEach( function( iface )
        //             {
        //                 if( 'IPv4' !== iface.family || iface.internal !== false )
        //                 {
        //                     trace( 'skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses' );
        //                     return;
        //                 }

        //                 if( alias >= 1 )
        //                 {
        //                     trace( 'this single interface has multiple ipv4 addresses' );
        //                     trace( ifname + ':' + alias, iface.address );
        //                 }
        //                 else
        //                 {
        //                     trace( 'this interface has only one ipv4 address' );
        //                     trace( ifname, iface.address );
        //                 }
        //             }
        //         );
        //     }
        // );
    }
);


