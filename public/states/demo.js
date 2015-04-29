
(function() {

    define(
        [
            'dictionary',
            'switch'
        ],
        function( Dictionary, Switch ) {

            return {

                stage: null,
                endCB: null,

                faceNum: null,
                colour: null,
                taskColour: null,

                container: null,
                width: 0,
                height: 0,

                myFace: null,
                dOTHER_PLAYERS: null,

                aSWITCHES: null,
                switchBoardContainer: null,

                constructor: function( stage, endCallback )
                {
                    this.stage = stage;
                    this.width = stage.x * 2;
                    this.height = stage.y * 2;
                    this.endCB = endCallback;
                    this.aSWITCHES = [];
                    this.dOTHER_PLAYERS = new Dictionary();
                },

                Begin: function()
                {
                    this.faceNum = Math.floor(Math.random() * 6) + 1;
                    this.colour = this.getRandomColor();
                    this.taskColour = g_gameTaskOn? "green" : "red";

                    this.network();

                    this.container = this.stage.addChild( new createjs.Container() );

                    this.myFace = this.createFace( this.faceNum, this.colour, this.taskColour );
                    createjs.Tween.get( this.myFace.faceContainer )
                                .wait( 1000 )
                                .to({
                                    x: -this.stage.x + 30,
                                    y: 0,
                                    scaleX: 5,
                                    scaleY: 5,
                                    alpha: 0.2
                                }, 2000, createjs.Ease.elasticInOut );

                    this.createSwitchBoard();

                    g_socket.emit( 'new player', this.faceNum, this.colour, g_gameTaskOn );
                },

                createSwitchBoard: function()
                {
                    switchBoardContainer = this.container.addChild( new createjs.Container() );
                    var w = 60,
                        h = 25,
                        columns = 7;
                    for( var i = 0; i < g_buttonMap.length; i++ )
                    {
                        this.aSWITCHES.push(
                            new Switch(
                                switchBoardContainer,
                                (i%columns)*w,
                                Math.floor(i/columns)*h,
                                i,
                                this.switchClicked.bind( this )
                            )
                        );
                    }
                    switchBoardContainer.x = -w*(columns/2);
                    switchBoardContainer.y = -this.stage.y+50;
                },

                switchClicked: function( index )
                {
                    g_socket.emit( 'update button', index, g_buttonMap[index] );
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
                    g_socket.on( 'button map', this.buttonUpdateHandler.bind( this ) );
                    g_socket.on( 'new player', this.newPlayerHandler.bind( this ) );
                    g_socket.on( 'remove player', this.removePlayerHandler.bind( this ) );
                },

                buttonUpdateHandler: function( data )
                {
                    g_buttonMap = data;
                    for( var i = 0; i < g_buttonMap.length; i++ )
                    {
                        this.aSWITCHES[i].switchState( g_buttonMap[i] );
                    }
                },

                newPlayerHandler: function( data )
                {
                    if( data.id == g_mySocketId ) return;
                    if( !this.dOTHER_PLAYERS.has( data.id ) )
                    {
                        this.dOTHER_PLAYERS.add( data.id, data );
                        this.addOtherPlayerFace( data );
                    }
                    else trace( 'ERROR: player already exists for ' + data.id );
                },

                removePlayerHandler: function( data )
                {
                    if( this.dOTHER_PLAYERS.has( data.id ) )
                        this.removeOtherPlayerFace( data.id );
                    else
                        trace( 'ERROR: Cannot remove player for ' + data.id );
                },

                addOtherPlayerFace: function( data )
                {
                    var o = this.createFace( data.face, data.colour, data.task? "green" : "red" );
                    o.faceContainer.x = 0;
                    o.faceContainer.y = -30;
                    o.faceContainer.alpha = 0.3;
                    o.faceContainer.scaleX = o.faceContainer.scaleY = 0.7;
                    this.dOTHER_PLAYERS.at( data.id ).sprite = o;
                    o.faceContainer.alpha = 0;
                    createjs.Tween.get( o.faceContainer )
                                .wait( 10 )
                                .to({
                                    x: this.getRandomInt( 200, this.stage.x - 20 ),
                                    y: this.getRandomInt( -this.stage.y+20, this.stage.y-20 ),
                                    scaleX: 0.7,
                                    scaleY: 0.7,
                                    alpha: 0.2
                                }, 2000, createjs.Ease.elasticOut );
                },

                removeOtherPlayerFace: function( id )
                {
                    var o = this.dOTHER_PLAYERS.at( id );
                    this.container.removeChild( o.sprite.faceContainer );
                    this.dOTHER_PLAYERS.remove( id );
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
                },

                getRandomInt: function( min, max )
                {
                    return Math.floor( Math.random() * (max-min) ) + min;
                }
            };
        }
    );

}());
