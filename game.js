/*jslint bitwise:true, es5: true */ 
(function (window, undefined) { 
    /*RequestAnimationFrame*/    
        'use strict';

    var KEY_ENTER = 13,
        KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40,

        canvas = null,
        ctx = null,
        lastPress = null,
        pause = true,
        dir = 0,
        score = 0,
        //wall = new Array(),
        gameover = true,
        //body[0] = null,
        body = [],
        food = null,
        extra = null,
        iBody = new Image(),     
        iFood = new Image(),
        iExtra = new Image(),     
        aEat = new Audio(),     
        aDie = new Audio(),

        lastUpdate = 0,     
        FPS = 0,     
        frames = 0,     
        acumDelta = 0,

        error = null;

    function resize(){
        var w = window.innerWidth / canvas.width;             
        var h = window.innerHeight / canvas.height;             
        var scale = Math.min(h, w);
        canvas.style.width = (canvas.width * scale) + 'px';             
        canvas.style.height = (canvas.height * scale) + 'px';
    }


    window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 17);
            };
    }());


    document.addEventListener('keydown', function (evt) {
        lastPress = evt.which;
    }, false);

    function Rectangle(x, y, width, height) {
        this.x = (x === undefined) ? 0 : x; //analiza x: asigna 0 si es indefinido o asigna el valor de x en caso contrario
        this.y = (y === undefined) ? 0 : y;
        this.width = (width === undefined) ? 0 : width;
        this.height = (height === undefined) ? this.width : height; //si el alto es indefinido, le asigna el ancho, y queda un cuadrado

        /* this.intersects = function (rect) {
            if (rect == null) {
                window.console.warn('Missing parameters on function intersects');
            } else {
                return (this.x < rect.x + rect.width &&
                    this.x + this.width > rect.x &&
                    this.y < rect.y + rect.height &&
                    this.y + this.height > rect.y);
            }
        };

        this.fill = function (ctx) {
            if (ctx == null) {
                window.console.warn('Missing parameters on function fill');
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        };*/
    }

    Rectangle.prototype = {         
        constructor: Rectangle, 

        intersects: function (rect) {             
            if (rect === undefined) {                 
                window.console.warn('Missing parameters on function intersects');             
            } else {                 
                return (this.x < rect.x + rect.width &&                     
                    this.x + this.width > rect.x &&                     
                    this.y < rect.y + rect.height &&                     
                    this.y + this.height > rect.y);             
            }         
        },                  
        fill: function (ctx) {             
            if (ctx === undefined) {                 
                window.console.warn('Missing parameters on function fill');             
            } else {                 
                ctx.fillRect(this.x, this.y, this.width, this.height);             
            }         
        },                  
        drawImage: function (ctx, img) {             
            if (img === undefined) {                 
                window.console.warn('Missing parameters on function drawImage');             
            } else {                 
                if (img.width) {                     
                    ctx.drawImage(img, this.x, this.y);                 
                } else {                     
                    ctx.strokeRect(this.x, this.y, this.width, this.height);                 
                }             
            }         
        }     
    };

    function random(max) {
        return ~~(Math.random() * max);
    }

    function canPlayOgg() {         
        var aud = new Audio();         
        if (aud.canPlayType('audio/ogg').replace(/no/, '')) {             
            return true;         
        } else {             
            return false;         
        }     
    }

    function reset() {     
        score = 0;     
        dir = 1;     
        body.length = 0;     
        body.push(new Rectangle(40, 40, 10, 10));     
        body.push(new Rectangle(0, 0, 10, 10));     
        body.push(new Rectangle(0, 0, 10, 10));    
        food.x = random(canvas.width / 10 - 1) * 10;     
        food.y = random(canvas.height / 10 - 1) * 10; 
        extra.x = random(canvas.width / 10 -1) * 10;
        extra.y = random(canvas.height / 10 -1) * 10;    
        gameover = false;
    }


    function paint(ctx) {
        var i = 0,
            l = 0;

        // Clean Canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw player     
        ctx.strokeStyle = '#0f0';     
        for (i = 0, l = body.length; i < l; i += 1) {         
            //body[i].fill(ctx);  
            body[i].drawImage(ctx,iBody);   
        }

        // Draw food     
        ctx.strokeStyle = '#f00';
        //food.fill(ctx);
        food.drawImage(ctx, iFood);

        // Draw extra
        ctx.strokeStyle = '#0f0';
        extra.drawImage(ctx,iExtra);

        // Draw walls     
        /*ctx.fillStyle = '#999';     
        for (i = 0, l = wall.length; i < l; i += 1) {        
            wall[i].fill(ctx);     
        }*/

        //Debug last key pressed
        ctx.fillStyle = '#fff'; 
        //ctx.fillText('Last Press: ' + lastPress, 0, 20);

        // Draw score   
        ctx.fillText('Score: ' + score, 0, 10);

        //Draw pause
        if (pause) {         
            ctx.textAlign = 'center';         
            if (gameover) {             
                ctx.fillText('GAME OVER', 150, 75);         
            } else {             
                ctx.fillText('PAUSE', 150, 75);         
            }         
            ctx.textAlign = 'left';     
        }

        //ctx.fillText('FPS: ' + FPS, 10, 10); 
    }

    function act() {
        var i = 0,
            l = 0;

        if (!pause) {
            // GameOver Reset         
            if (gameover) {             
                reset();         
            }
            
            // Move Body         
            for (i = body.length - 1; i > 0; i -= 1) {             
                body[i].x = body[i - 1].x;             
                body[i].y = body[i - 1].y;         
            }

            // Change Direction     
            if (lastPress === KEY_UP && dir !== 2) {             
                dir = 0;         
            }         
            if (lastPress === KEY_RIGHT && dir !== 3) {             
                dir = 1;         
            }         
            if (lastPress === KEY_DOWN && dir !== 0) {             
                dir = 2;         
            }         
            if (lastPress === KEY_LEFT && dir !== 1) {             
                dir = 3;         
            }

            // Move Head     
            if (dir === 0) {
                body[0].y -= 10;
            }
            if (dir === 1) {
                body[0].x += 10;
            }
            if (dir === 2) {
                body[0].y += 10;
            }
            if (dir === 3) {
                body[0].x -= 10;
            }

            // Out Screen     
            if (body[0].x > canvas.width - body[0].width) {             
                body[0].x = 0;         
            }         
            if (body[0].y > canvas.height - body[0].height) {             
                body[0].y = 0;         
            }         
            if (body[0].x < 0) {             
                body[0].x = canvas.width - body[0].width;         
            }         
            if (body[0].y < 0) {             
                body[0].y = canvas.height - body[0].height;        
            }

            // Body Intersects         
            for (i = 2, l = body.length; i < l; i += 1) {             
                if (body[0].intersects(body[i])) {                 
                    gameover = true;                 
                    pause = true;
                    aDie.play();             
                }         
            }

            // Food Intersects         
            if (body[0].intersects(food)) {
                body.push(new Rectangle(food.x, food.y, 10, 10));
                score += 1;
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
                aEat.play();
            }

            // Extra Intersects
            if (body[0].intersects(extra)) {
                score += 1;
                extra.x = random(canvas.width / 10 - 1) * 10;
                extra.y = random(canvas.height / 10 - 1) * 10;
                aEat.play();
            }


            // Wall Intersects         
            /*for (i = 0, l = wall.length; i < l; i += 1) {             
                if (food.intersects(wall[i])) {                 
                    food.x = random(canvas.width / 10 - 1) * 10;                 
                    food.y = random(canvas.height / 10 - 1) * 10;             
                } 
    
                if (body[0].intersects(wall[i])) {                 
                    pause = true;
                    gameover = true;
                }             
            }*/         
        }

        // Pause/Unpause     
        if (lastPress === KEY_ENTER) {
            pause = !pause;
            lastPress = null;
        }
    }

    function repaint() {
        window.requestAnimationFrame(repaint);
        paint(ctx);
    }

    function run() {
        setTimeout(run,50);
        var now = Date.now(),         
            deltaTime = (now - lastUpdate) / 1000;     
        if (deltaTime > 1) {         
            deltaTime = 0;     
        }     
        lastUpdate = now;

        frames += 1;     
        acumDelta += deltaTime;
        if (acumDelta > 1) {         
            FPS = frames;         
            frames = 0;         
            acumDelta -= 1;     
        }
        
        act();
        paint(ctx);
    }

    function init() {
        // Get canvas and context      
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        // Load assets     
        iBody.src = 'assets/body.png';     
        iFood.src = 'assets/fruit.png';
        iExtra.src = 'assets/extra.png';
        if (canPlayOgg()) {             
            aEat.src = 'assets/chomp.oga';             
            aDie.src = 'assets/dies.oga';         
        } else {             
            aEat.src = 'assets/chomp.m4a';             
            aDie.src = 'assets/dies.m4a'; 
        }        

        // Create food     
        food = new Rectangle(80, 80, 10, 10);

        // Create extra
        extra = new Rectangle(80,80,10,10);

        // Create walls     
        /*wall.push(new Rectangle(100, 50, 10, 10));     
        wall.push(new Rectangle(100, 100, 10, 10));     
        wall.push(new Rectangle(200, 50, 10, 10));     
        wall.push(new Rectangle(200, 100, 10, 10));*/

        //Start game
        run();
        repaint();
        resize();
    }

    // GET

    function main(){
        //request.open('GET', url, true);

        fetch('http://www.jsonplaceholder.com?score=100')
            .then(() => console.log('Score sent successfully'))
            .catch(() => console.log('Error trying to send the score'))
        
        /*request.onreadystatechange = (event) => {
            if(request.readyState === 4){
                if (request.status >= 200 && request.status < 400){
                    let score = request.responseText;
                    let data = JSON.parse(score);
                    callback(data, null);
                }else{
                    error(null, "Error trying to send the score");
                }
            }
        }*/
        //request.send();
    }

    /*function callback(data,error){
        if (error){
            console.log(error);
        }else{
            data.results.forEach(item => {
                console.log(item.name);
                console.log('Score sent successfully');
            });
        }
    }*/

    main();


    window.addEventListener('load', init, false);
    window.addEventListener('resize', resize, false);
}(window));