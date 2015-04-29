(function() {

    define( function() {
            var definition = {

                overwrite: true,
                KEYS: [],
                VALUES: [],

                constructor: function( overwrite )
                {
                    this.overwrite = overwrite||true;
                    this.KEYS      = [];
                    this.VALUES    = [];
                },

                clear: function()
                {
                    this.KEYS.length   = 0;
                    this.VALUES.length = 0;
                },

                add: function( key, value )
                {
                    if( !this.overwrite || this.KEYS.indexOf( key ) == -1 )
                    {
                        this.KEYS.push(key);
                        this.VALUES.push(value);
                    }
                    return value;
                },

                remove: function( key )
                {
                    var i = this.KEYS.indexOf( key );
                    if( i != -1 )
                    {
                        this.KEYS.splice(i,1);
                        return this.VALUES.splice(i,1);
                    }
                },

                at: function( key )
                {
                    return this.VALUES[this.KEYS.indexOf( key )];
                },

                has: function( key )
                {
                    return this.KEYS.indexOf( key ) != -1? true:false;
                },

                iterate: function( func )
                {
                    for(var i = 0; i < this.KEYS.length; i++) func(this.KEYS[i], this.VALUES[i]);
                },

                length: function()
                {
                    return this.KEYS.length;
                }
            };
            var Class = definition.constructor;
            Class.prototype = definition;
            return Class;
        }
    );

}());