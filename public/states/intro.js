
(function() {

    define(
        {

            stage: null,
            endCB: null,
            container: null,
            titleText: null,
            descText: null,
            taskText: null,
            nextBtnContainer: null,
            nextButton: null,

            __progressFromIntro: null,

            constructor: function( stage, endCallback )
            {
                this.stage = stage;
                this.endCB = endCallback;
            },

            Begin: function()
            {
                this.container = this.stage.addChild( new createjs.Container() );
                this.container.y = -100;

                this.titleText = this.container.addChild( new createjs.Text( "Strength In Numbers", "36px Curious-Sans", "#230012" ) );
                this.titleText.x = -this.titleText.getMeasuredWidth()/2;
                this.titleText.y = -this.titleText.getMeasuredHeight()*2;

                this.descText = this.container.addChild( new createjs.Text( "Everything must be...", "13px Curious-Sans", "#230012") );
                this.descText.x = -this.descText.getMeasuredWidth()/2;
                this.descText.y = (this.titleText.y*-1) + this.descText.getMeasuredHeight();

                if( g_gameTaskOn )
                    this.taskText = this.container.addChild( new createjs.Text( "...ON", "40px Curious-Sans", "#00d814") );
                else
                    this.taskText = this.container.addChild( new createjs.Text( "...OFF", "40px Curious-Sans", "#d80014") );
                this.taskText.x = -this.taskText.getMeasuredWidth()/2;
                this.taskText.y = this.descText.y + this.taskText.getMeasuredHeight();

                this.nextBtnContainer = this.container.addChild( new createjs.Container() );
                this.nextBtnContainer.x = 200;
                this.nextBtnContainer.y = 200;
                this.nextButton = this.nextBtnContainer.addChild( new createjs.Bitmap( "/public/img/play_button.png" ) );
                this.nextButton.x = -250/2;
                this.nextButton.y = -250/2;

                this.nextBtnContainer.alpha = 0;
                createjs.Tween.get( this.nextBtnContainer )
                                .wait( 500 )
                                .to({
                                        alpha:1,
                                        scaleX: 0.5,
                                        scaleY: 0.5
                                    },
                                    1000,
                                    createjs.Ease.bounceOut );

                this.__progressFromIntro = this.progressFromIntro.bind( this );
                this.stage.addEventListener( 'stagemousedown', this.__progressFromIntro );
                g_canvasElm.addEventListener( "keydown", this.__progressFromIntro );
            },

            progressFromIntro: function()
            {
                trace('finished intro');
                this.stage.removeEventListener( 'stagemousedown', this.__progressFromIntro );
                g_canvasElm.removeEventListener( "keydown", this.__progressFromIntro );

                this.container.alpha = 1;
                createjs.Tween.get( this.container )
                                .wait( 100 )
                                .to({
                                    alpha:0,
                                    scaleX: 0.8,
                                    scaleY: 0.8,
                                    visible:false
                                }, 1000, createjs.Ease.bounceOut )
                                .call( this.finishAnim.bind( this ) );
            },

            finishAnim: function()
            {
                this.endCB();
            },

            End: function()
            {
                this.stage.removeChild( this.container );
                this.titleText = null;
                this.descText = null;
                this.taskText = null;
                this.nextButton = null;
                this.nextBtnContainer = null;
                this.stage.removeEventListener( 'stagemousedown', this.__progressFromIntro );
                g_canvasElm.removeEventListener( "keydown", this.__progressFromIntro );
            }

        }
    );

}());
