<?php
    /**
        Trial of Tim
        Sample Level Editor
        64px squares
        960 x 640
        15 x 10
    **/
?>
<html>
<head>
    <title>The Trial of Tim, Level Editor</title>
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
        #screenOutput{
            width: 60%;
            height: 300px;
            margin: 0 auto;
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
            <h1>The Trial of Tim Level Editor</h1>
            <p>Choose your tile type</p>
            <select>
                <option name="floor">floor</option>
                <option name="bush">bush</option>
                <option name="rock">rock</option>
            </select>
            <p>Save Screen</p>
			<p id="btnLoadScreen">Load Screen</p>
            <p>Save World</p>
            <textarea id='screenOutput' class="screenOutput"></textarea>
        </div>
        <?php include_once('../../../lib/includes/opalgames-footer.php'); ?>
        <?php /**
            include opal games scripts and tools for world builder
        **/ ?>
        <script type='text/javascript' src='/scripts/og-tools/opalgames.js?t=<?php print time(); ?>'></script>
        <script type='text/javascript' src='/scripts/og-tools/tools.js?t=<?php print time(); ?>'></script>
        <script type='text/javascript' src='/scripts/og-tools/render.js?t=<?php print time(); ?>'></script>
        <script type='text/javascript' src='editor.js?t=<?php print time(); ?>'></script>
        <script type='text/javascript' src='state.js?t=<?php print time(); ?>'></script>
    </body>
</html>
