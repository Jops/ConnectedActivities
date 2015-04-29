
(function() {

    define( function()
        {
            var definition = {

                index: null,
                clickCallback: null,
                container: null,
                switchON: null,
                switchOFF: null,
                scale: 0.25,

                constructor: function( container, x, y, index, clickCallback )
                {
                    this.index = index;
                    this.clickCallback = clickCallback;
                    this.container = container.addChild( new createjs.Container() );
                    this.container.scaleX = this.container.scaleY = this.scale;
                    this.container.x = x;
                    this.container.y = y;
                    this.switchON = this.container.addChild( new createjs.Bitmap( '/public/img/switchOn.png' ) );
                    this.switchOFF = this.container.addChild( new createjs.Bitmap( '/public/img/switchOff.png' ) );
                    this.switchState( g_buttonMap[index] );
                    this.container.addEventListener( "click", this.mouseClickHandler.bind( this ) );
                    this.container.alpha = 0;
                    createjs.Tween.get( this.container )
                                .wait( 1000 + index * 20 )
                                .to({
                                    alpha: 1
                                }, 2000, createjs.Ease.cubicOut );
                },

                switchState: function( onoff )
                {
                    if( onoff )
                    {
                        this.switchON.visible = true;
                        this.switchOFF.visible = false;
                    }
                    else
                    {
                        this.switchON.visible = false;
                        this.switchOFF.visible = true;
                    }
                },

                mouseClickHandler: function( event )
                {
                    g_buttonMap[this.index] = !g_buttonMap[this.index];
                    this.switchState( g_buttonMap[this.index] );
                    this.clickCallback( this.index );
                }
            };
            var Class = definition.constructor;
            Class.prototype = definition;
            return Class;
        }
    );

}());
