
(function() {

    define(
        {

            stage: null,
            endCB: null,

            faceNum: null,
            colour: null,
            taskColour: null,

            container: null,

            myFace: null,
            oFaces: {},

            constructor: function( stage, endCallback )
            {
                this.stage = stage;
                this.endCB = endCallback;
            },

            Begin: function()
            {
                this.faceNum = Math.floor(Math.random() * 6) + 1;
                this.colour = this.getRandomColor();
                this.taskColour = g_gameTaskOn? "green":"red";

                this.network();

                this.container = this.stage.addChild( new createjs.Container() );

                this.myFace = this.createFace( this.faceNum, this.colour, this.taskColour );

                for( var i in g_oPLAYERS )
                {
                    this.addOtherPlayerFace( g_oPLAYERS[i] );
                }

                g_socket.emit( 'new player', this.faceNum, this.colour, g_gameTaskOn );
            },

            createFace: function( faceNum, colour, taskColour )
            {
                var face = {};
                face.faceContainer = this.container.addChild( new createjs.Container() );

                face.faceClrSqu = face.faceContainer.addChild( new createjs.Shape() );
                var gfx = face.faceClrSqu.graphics;
                gfx.beginFill( colour )
                    .drawRect( 0, 0, 60, 70 )
                    .endFill();
                face.faceClrSqu.x = -30;
                face.faceClrSqu.y = -35;
                face.faceClrSqu.alpha = 0.3;
                face.faceClrSpot = face.faceContainer.addChild( new createjs.Shape() );
                gfx = face.faceClrSpot.graphics;
                gfx.beginFill( taskColour )
                    .drawCircle(0,0,10)
                    .endFill();
                face.faceSprite = face.faceContainer.addChild( new createjs.Container() );
                face.faceBitmap = face.faceSprite.addChild( new createjs.Bitmap( '/public/img/face0' + faceNum + '.png' ) );
                face.faceBitmap.scaleX = face.faceBitmap.scaleY = 0.5;
                face.faceBitmap.regX = 203/2 + 10;
                face.faceBitmap.regY = 224/2;

                return face;
            },

            network: function()
            {
                var submit = function() {
                    g_socket.emit( 'chat message', "testing testing testing", "some more" );
                };
                g_socket.on( 'chat message', function( msg, extra ) {
                    $('#messages').append($('<li>').html(msg+', '+extra));
                });
                g_socket.on('button map', function( btnMap ) {
                    g_buttonMap = btnMap;
                });
                g_socket.on('new player', this.newPlayer.bind(this) );
                g_socket.on('remove player', this.removePlayer.bind(this) );
                // setInterval( submit, 1000 );
            },

            newPlayer: function( data )
            {
                if( data.id == g_mySocketId ) return;
                g_oPLAYERS[data.id] = data;
                this.addOtherPlayerFace( data );
            },

            addOtherPlayerFace: function( data )
            {
                this.oFaces[data.id] = this.createFace( data.face, data.colour, data.task?"green":"red" );
                this.oFaces[data.id].faceContainer.x = Math.floor(Math.random() * -10) + -200;
                this.oFaces[data.id].faceContainer.y = Math.floor(Math.random() * 200) + -200;
                this.oFaces[data.id].faceContainer.alpha = 0.7;
                this.oFaces[data.id].faceContainer.scaleX = this.oFaces[data.id].faceContainer.scaleY = 0.7;
            },

            removePlayer: function( data )
            {
                trace('removing a player');
                // if( typeof(g_oPLAYERS[data.id]) == 'undefined' ) return;
                trace('okokok');
                this.container.removeChild( this.oFaces[data.id].faceContainer );
                delete this.oFaces[data.id];
                delete g_oPLAYERS[data.id];
            },

            getRandomColor: function()
            {
                var letters = '0123456789ABCDEF'.split('');
                var color = '#';
                for( var i = 0; i < 6; i++ )
                    color += letters[ Math.floor( Math.random() * 16 ) ];
                return color;
            },

            End: function()
            {
                this.stage.removeChild( this.container );
            }

        }
    );

}());
