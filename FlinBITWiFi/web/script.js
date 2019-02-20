
/* --- Graph --- */

function Graph(canvas)
{
    this.canvas = canvas;
    this.X = {min: 0, max: 1, steps: 5};
    this.Y = {min: 0, max: 100, steps: 5};
    this.list = [];
    this.dimensions = 1;

    this.style = {
        background: "white",
        foreground: "black",
        data: "red"
    };
}

Graph.prototype.draw = function()
{
    if (this.canvas == null || this.canvas == undefined) { return; }

    // https://stackoverflow.com/questions/30229536/how-to-make-a-html5-canvas-fit-dynamic-parent-flex-box-container
    var canvasBound = this.canvas.parentNode.getBoundingClientRect();
    var width = canvasBound.width;
    var height = canvasBound.height;

    this.canvas.width = width;
    this.canvas.height = height;

    var ctx = this.canvas.getContext("2d", {alpha: false});

    // clear to background colour
    ctx.fillStyle = this.style.background;
    ctx.fillRect(0, 0, width, height);

    var border = 10;

    var leftBorderPos = (width / 10) - border;
    var bottomBorderPos = (height - (height / 15)) - border;

    ctx.strokeStyle = this.style.foreground;

    ctx.moveTo(leftBorderPos, 0);
    ctx.lineTo(leftBorderPos, bottomBorderPos);
    ctx.stroke();

    ctx.moveTo(leftBorderPos, bottomBorderPos);
    ctx.lineTo(width, bottomBorderPos);
    ctx.stroke();

    var xInc = ((width - border) - leftBorderPos) / (this.X.steps + 0.5);
    var xValInc = (this.X.max - this.X.min) / this.X.steps;
    var yInc = (bottomBorderPos - border) / (this.Y.steps + 0.5);
    var yValInc = (this.Y.max - this.Y.min) / this.Y.steps;

    ctx.fillStyle = this.style.foreground;
    ctx.font = "16px Arial";

    for (var i = 0, x = leftBorderPos;
        i < this.X.steps + 1;
        i++, x += xInc)
    {
        ctx.textAlign = "start";
        ctx.textBaseline = "top";
        ctx.fillText((this.X.min + (xValInc * i)).toFixed(2),
            x + 2, bottomBorderPos + 2, xInc / 2);

        ctx.moveTo(x, height - border);
        ctx.lineTo(x, bottomBorderPos);
        ctx.stroke();
    }

    for (var i = 0, y = bottomBorderPos;
        i < this.Y.steps + 1;
        i++, y -= yInc)
    {
        ctx.textAlign = "end";
        ctx.textBaseline = "bottom";
        ctx.fillText((this.Y.min + (yValInc * i)).toFixed(2),
            leftBorderPos - 2, y - 2, leftBorderPos - border);

        ctx.moveTo(border, y);
        ctx.lineTo(leftBorderPos, y);
        ctx.stroke();
    }

    if (this.dimensions == 1)
    {

    }
    else if (this.dimensions == 2)
    {

    }
};

Graph.prototype.push_back = function(value)
{
    if (this.list.length >= this.count)
    {
        if (this.count <= 0)
            this.list = [];
        else
        {
            this.list = this.list.slice(this.list.length - (this.count - 1), this.list.length);
            this.list += value;
        }
    }
    else
    {
        this.list += value;
    }
    this.draw();
};

Graph.prototype.clear = function()
{
    this.list = [];
    this.draw();
};

/* --- Tokeniser --- */

var IsWhitespace = function(char)
{
    return char == ' ' || char == '\t' || char == '\n' || char == '\r'
}

function Tokeniser(str)
{
    this.rest = str || "";
};

Tokeniser.prototype.next = function()
{
    var rtn = "";
    var i = 0;
    for (; i < this.rest.length && IsWhitespace(this.rest[i]); i++);
    for (; i < this.rest.length && !IsWhitespace(this.rest[i]); i++)
        rtn += this.rest[i];
    if (i < this.rest.length)
        this.rest = this.rest.substring(i);
    else
        this.rest = "";
    return rtn;
};

Tokeniser.prototype.nextLower = function()
{
    return this.next().toLowerCase();
}

/* --- Web Serial --- */

function WebSerial(address, onMessage, onOpen, onClose, onError)
{
    this.address = address || "";
    this.socket = null;
    this.onMessage = onMessage || function(event){};
    this.onOpen = onOpen || function(event){};
    this.onClose = onClose || function(event){};
    this.onError = onError || function(event){};

    if (this.address != null && this.address != undefined && this.address != "")
    {
        this.reconnect();
    }
};

WebSerial.prototype.reconnect = function()
{
    this.socket = new WebSocket(this.address);
    this.socket.onmessage = this.onMessage;
    this.socket.onopen = this.onOpen;
    this.socket.onerror = this.onError;
    this.socket.onclose = this.onClose;
};

WebSerial.prototype.connect = function(address)
{
    this.address = address;
    this.reconnect();
};

WebSerial.prototype.close = function()
{
    if (this.socket)
    {
        this.socket.close();
        this.socket = null;
    }
};

WebSerial.prototype.print = function(message)
{
    this.socket.send(message);
};

WebSerial.prototype.println = function(message)
{
    this.socket.send(message+'\n');
};

/* --- Global Objects --- */

var Plotter;

var Serial = new WebSerial(
    /* addresss */
    'ws://192.168.1.1:81',
    /* onMessage */
    function(event) { MessageParser(event.data); },
    /* onOpen */
    function(event) { document.getElementById('connectionClosed').style.display = 'none'; },
    /* onClose */
    function(event) { document.getElementById('connectionClosed').style.display = 'flex'; },
    /* onError */
    function(event) {}
);

/* --- Functions --- */

var MessageParser = function(message)
{
    var isCommand = false;

    if (message.length > 1 && message[0] == '/')
    {
        message = message.slice(1);
        if (message[0] != '/') { isCommand = true; }
    }

    if (isCommand)
    {
        // command
        var tokens = new Tokeniser(message);
        var command = tokens.nextLower();
        console.log("Command '"+command+"'");
        if (command == 'monitor')
        {
            var command = tokens.nextLower();
            if (command == "show")
            {
                document.getElementById('serialMonitor').style.display = 'flex';
            }
            else if (command == "hide")
            {
                document.getElementById('serialMonitor').style.display = 'none';
            }
            else if (command == "toggle")
            {
                if (document.getElementById('serialMonitor').style.display == 'none')
                    document.getElementById('serialMonitor').style.display = 'flex';
                else
                    document.getElementById('serialMonitor').style.display = 'none';
            }
            else if (command == "clear")
            {
                document.getElementById("serialInput").value = "";
            }
            else if (command == "error")
            {

            }
            else if (command == "set")
            {
                command = tokens.nextLower();
                if (command == "autoscroll")
                {
                    command = tokens.nextLower();
                    var autoscroll = (command === "true" || command === "on" || command === "yes");
                    document.getElementById('serialMonitorAutoScroll').checked = autoscroll;
                }
            }
        }
        else if (command == 'plotter')
        {
            command = tokens.nextLower();
            if (command == "show")
            {
                document.getElementById('serialPlotter').style.display = 'flex';
            }
            else if (command == "hide")
            {
                document.getElementById('serialPlotter').style.display = 'none';
            }
            else if (command == "toggle")
            {
                if (document.getElementById('serialPlotter').style.display == 'none')
                    document.getElementById('serialPlotter').style.display = 'flex';
                else
                    document.getElementById('serialPlotter').style.display = 'none';
            }
            else if (command == "set")
            {
                command = tokens.nextLower();
                if (command == "mode")
                {
                    if (command == "1d")
                        Plotter.dimensions = 1;
                    else if (command == "2d")
                        Plotter.dimensions = 2;
                }
                if (command == "background")
                {
                    Plotter.style.background = tokens.next();
                }
                if (command == "foreground")
                {
                    Plotter.style.foreground = tokens.next();
                }
                if (command == "data")
                {
                    Plotter.style.data = tokens.next();
                }
                else if (command == "x")
                {
                    Plotter.X.min = parseFloat(tokens.next());
                    console.log("x-min '"+Plotter.X.min+"'");
                    Plotter.X.max = parseFloat(tokens.next());
                    console.log("x-max '"+Plotter.X.max+"'");
                    Plotter.X.steps = parseInt(tokens.next());
                    console.log("x-steps '"+Plotter.X.steps+"'");
                }
                else if (command == "x-min")
                {
                    Plotter.X.min = parseFloat(tokens.next());
                    console.log("x-min '"+Plotter.X.min+"'");
                }
                else if (command == "x-max")
                {
                    Plotter.X.max = parseFloat(tokens.next());
                    console.log("x-max '"+Plotter.X.max+"'");
                }
                else if (command == "x-steps")
                {
                    Plotter.X.steps = parseInt(tokens.next());
                    console.log("x-steps '"+Plotter.X.steps+"'");
                }
                else if (command == "y")
                {
                    Plotter.Y.min = parseFloat(tokens.next());
                    console.log("y-min '"+Plotter.Y.min+"'");
                    Plotter.Y.max = parseFloat(tokens.next());
                    console.log("y-max '"+Plotter.Y.max+"'");
                    Plotter.Y.steps = parseInt(tokens.next());
                    console.log("y-steps '"+Plotter.Y.steps+"'");
                }
                else if (command == "y-min")
                {
                    Plotter.Y.min = parseFloat(tokens.next());
                    console.log("y-min '"+Plotter.Y.min+"'");
                }
                else if (command == "y-max")
                {
                    Plotter.Y.max = parseFloat(tokens.next());
                    console.log("y-max '"+Plotter.Y.max+"'");
                }
                else if (command == "y-steps")
                {
                    Plotter.Y.steps = parseInt(tokens.next());
                    console.log("y-steps '"+Plotter.Y.steps+"'");
                }
            }
            Plotter.draw();
        }
        else if (command == 'logger')
        {
            command = tokens.nextLower();
            if (command == "show")
            {
                document.getElementById('serialLogger').style.display = 'flex';
            }
            else if (command == "hide")
            {
                document.getElementById('serialLogger').style.display = 'none';
            }
            else if (command == "toggle")
            {
                if (document.getElementById('serialLogger').style.display == 'none')
                    document.getElementById('serialLogger').style.display = 'flex';
                else
                    document.getElementById('serialLogger').style.display = 'none';
            }
            else if (command == "running")
            {
                console.log("Logger running");
                document.getElementById('serialLoggerRunning').style.display = 'flex';
                document.getElementById('serialLoggerNotRunning').style.display = 'none';
            }
            else if (command == "notrunning")
            {
                console.log("Logger not running");
                document.getElementById('serialLoggerNotRunning').style.display = 'flex';
                document.getElementById('serialLoggerRunning').style.display = 'none';
            }
        }
        else if (command == 'set')
        {
            command = tokens.nextLower();
            console.log("Setting '"+command+"' to...");
            if (command == 'background')
            {
                console.log("'"+tokens.rest+"'");
                document.body.style.backgroundColor = tokens.rest;
            }
            else if (command == 'foreground')
            {
                console.log("'"+tokens.rest+"'");
                document.body.style.color = tokens.rest;
            }
        }
    }
    else
    {
        console.log("Message");
        // not a command
        var elem = document.getElementById("serialInput");
        elem.value += message;
        if (document.getElementById('serialMonitorAutoScroll').checked)
            elem.scrollTop = elem.scrollHeight; // "auto"-scroll to the end
    }
}

var SendMessageFromTextArea = function(id)
{
    var elem = document.getElementById(id);
    Serial.println(elem.value);
    console.log(elem.value);
    elem.value = "";
};

var SendMessageFromElement = function(id)
{
    var elem = document.getElementById(id);
    Serial.println(elem.innerHTML);
    console.log(elem.innerHTML);
    elem.innerHTML = "";
};

var OnLoad = function()
{
    console.log("OnLoad");

    Plotter = new Graph(document.getElementById('serialPlotterCanvas'));
    Plotter.draw();
};

window.addEventListener('load', OnLoad);

var OnResize = function()
{
    console.log("OnResize");

    Plotter.draw();
};

window.addEventListener('resize', OnResize);

