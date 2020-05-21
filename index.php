<?php
    /**
        Trial of Tim
        Zelda style clone in javascript
        64px squares
        960 x 640
        15 x 10
    **/
?>
<html>
<head>
    <title>The Trial of Tim</title>
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1, user-scalable=0" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <style>
        body{
            margin: 0;
            padding: 0;
            text-align: center;
            color: #fff;
            background-color: #000;
            background-image: url('images/bg.jpg');
            background-position: 50% 50%;
            background-repeat: no-repeat;
        }
        .game-area{
            position: relative;
            width: 960px;
            height: 640px;
            margin: auto;
        }
        #game-canvas{
            width: 100%;
            height: 100%;
            margin: auto;
            background: #666;
        }
        @media (max-width: 600px) {
        }
    </style>
</head>
    <body>
        <div class="game-area" id="game-area">
            <canvas id="game-canvas"></canvas>
        </div>
        <div class="game-info">
            <h1>The Trial of Tim</h1>
            <p>Move with arrow keys, attack with spacebar.</p>
        </div>
        <?php include_once('../../lib/includes/opalgames-footer.php'); ?>
        <script type='text/javascript' src='scripts/game.js'></script>
    </body>
</html>
