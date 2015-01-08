requirejs.config({
    baseUrl: '/public',
    paths: {
    }
});

var g_canvasName,
    g_canvasElm,
    g_stage,
    g_aSTATES,
    g_stateIndex = 0,
    g_activeState,
    g_socket,
    g_mySocketId;

var g_gameTaskOn,
    g_buttonMap,
    g_oPLAYERS = {};

requirejs(
    [
        './states/intro',
        './states/demo'
    ],
    function( IntroDef, DemoDef )
    {
        function main()
        {
            initialise();
            setupStates();

            logIn();
        }

        function startGame()
        {
            g_activeState.Begin();
        }

        function initialise()
        {
            g_canvasName       = "demo-view";
            g_canvasElm        = document.getElementById(g_canvasName);
            // fix canvas sizes
            g_canvasElm.width  = $('#canvas-container').width();
            g_canvasElm.height = $('#canvas-container').height();
            // createJS stage object
            g_stage            = new createjs.Stage(g_canvasName);
            // move stage origin to centre of canvas
            g_stage.x          = g_canvasElm.width/2;
            g_stage.y          = g_canvasElm.height/2;
            // create main loop
            createjs.Ticker.addEventListener("tick", app_tick);
            createjs.Ticker.setFPS( 32 );
            window.trace = function( msg ) {
                console.log(msg);
            };
        }

        function setupStates()
        {
            var Intro = createClass( IntroDef );
            var Demo = createClass( DemoDef );
            g_aSTATES = [
                new Intro( g_stage, progressState ),
                new Demo( g_stage, progressState )
            ];

            g_activeState = g_aSTATES[g_stateIndex];
        }

        function logIn()
        {
            g_socket = io();
            g_socket.on('give id', function( id ) {
                trace('id = ' + id);
                g_mySocketId = id;
            });
            g_socket.on('task allocation', function( f ) {
                trace('task allocation');
                g_gameTaskOn = f;
                startGame();
            });
            g_socket.on('button map', function( btnMap ) {
                trace('button map');
                g_buttonMap = btnMap;
            });
            g_socket.on('new player', function( data ) {
                trace('new player');
                if( data.id == g_mySocketId ) return;
                g_oPLAYERS[data.id] = data;
            });
            g_socket.on('remove player', function( data ) {
                trace('remove player');
                delete g_oPLAYERS[data.id];
            });
        }

        function app_tick( event )
        {
            g_stage.update( event );
        }

        function progressState()
        {
           trace('progressState');
            if( ++g_stateIndex == g_aSTATES.length ) g_stateIndex = 0;
            g_activeState.End();
            g_activeState = g_aSTATES[g_stateIndex];
            g_activeState.Begin();
        }

        function createClass( definition )
        {
            var Class = definition.constructor;
            Class.prototype = definition;
            return Class;
        }

        main();
    }
);
