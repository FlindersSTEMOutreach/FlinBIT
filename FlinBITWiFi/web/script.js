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
var PlotterIndex = -1;
var PlotterData = "0,0";
var PlotterAxis = "";

var PlotterResize = function()
{
    if (document.getElementById('serialPlotter').style.display != 'none') Plotter.resize();
}

var PlotterRefresh = function()
{
    Plotter.updateOptions({'file':PlotterData});
}

var Serial = new WebSerial(
    /* addresss */
    'ws://192.168.1.1:81',
    /* onMessage */
    function(event) { MessageParser(event.data); },
    /* onOpen */
    function(event) { document.getElementById('connectionClosed').style.display = 'none'; PlotterResize(); },
    /* onClose */
    function(event) { document.getElementById('connectionClosed').style.display = 'flex'; PlotterResize(); },
    /* onError */
    function(event) {}
);

/* --- Functions --- */

var StartLogger = function()
{
    var filename = document.getElementById('serialLoggerFileName').value;
    var overwrite = document.getElementById('fileModeOverwrite').checked;

    if (overwrite === true)
        Serial.println('/logstart overwrite '+filename);
    else
        Serial.println('/logstart append '+filename);

    document.getElementById('serialLoggerStartButton').disabled = true;
}

var StopLogger = function()
{
    Serial.println('/logstop');

    document.getElementById('serialLoggerStopButton').disabled = true;
}

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
        if (command == 'monitor')
        {
            var command = tokens.nextLower();
            if (command == "show")
            {
                document.getElementById('serialMonitor').style.display = 'flex';
                PlotterResize();
            }
            else if (command == "hide")
            {
                document.getElementById('serialMonitor').style.display = 'none';
                PlotterResize();
            }
            else if (command == "toggle")
            {
                if (document.getElementById('serialMonitor').style.display == 'none')
                    document.getElementById('serialMonitor').style.display = 'flex';
                else
                    document.getElementById('serialMonitor').style.display = 'none';
                PlotterResize();
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
                PlotterResize();
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
                PlotterResize();
            }
            else if (command == "clear")
            {
                PlotterIndex = -1;
                PlotterData = "";
                PlotterRefresh();
            }
        }
        else if (command == 'logger')
        {
            command = tokens.nextLower();
            if (command == "show")
            {
                document.getElementById('serialLogger').style.display = 'flex';
                PlotterResize();
            }
            else if (command == "hide")
            {
                document.getElementById('serialLogger').style.display = 'none';
                PlotterResize();
            }
            else if (command == "toggle")
            {
                if (document.getElementById('serialLogger').style.display == 'none')
                    document.getElementById('serialLogger').style.display = 'flex';
                else
                    document.getElementById('serialLogger').style.display = 'none';
                PlotterResize();
            }
            else if (command == "running")
            {
                document.getElementById('serialLoggerRunning').style.display = 'flex';
                document.getElementById('serialLoggerNotRunning').style.display = 'none';

                document.getElementById('serialLoggerStartButton').disabled = false;
                document.getElementById('serialLoggerStopButton').disabled = false;
            }
            else if (command == "notrunning")
            {
                document.getElementById('serialLoggerNotRunning').style.display = 'flex';
                document.getElementById('serialLoggerRunning').style.display = 'none';

                document.getElementById('serialLoggerStartButton').disabled = false;
                document.getElementById('serialLoggerStopButton').disabled = false;
            }
        }
        else if (command == 'set')
        {
            command = tokens.nextLower();

            if (command == 'background')
            {
                document.body.style.backgroundColor = tokens.rest;
            }
            else if (command == 'foreground')
            {
                document.body.style.color = tokens.rest;
            }
        }
    }
    else
    {
        // not a command
        var elem = document.getElementById("serialInput");
        elem.value += message;
        var maxMonitorLines = document.getElementById("serialMonitorMax").value;
        var curMonitorLines = 0;
        for (var i = elem.value.length; i --> 0;)
        {
            if (elem.value[i] == '\n')
                ++curMonitorLines;
            if (curMonitorLines > maxMonitorLines)
            {
                elem.value = elem.value.substring(i + 1);
                break;
            }
        }
        if (document.getElementById('serialMonitorAutoScroll').checked)
            elem.scrollTop = elem.scrollHeight; // "auto"-scroll to the end

        if (document.getElementById('serialPlotterEnabled').checked)
        {
            if (PlotterIndex < 0)
            {
                PlotterIndex = 0;
                var axis = 1;
                for (var i = 0; i < message.length; ++i) if (message[i] == ',') ++axis;
                for (var i = 0; i < axis; ++i) PlotterAxis += ""+i+",";
                PlotterAxis += ""+axis+"\n";
                PlotterData = PlotterAxis;
            }
            else
            {
                var maxPlotterDatas = document.getElementById("serialPlotterMax").value;
                var curPlotterDatas = 0;
                for (var i = PlotterData.length; i --> 0;)
                {
                    if (PlotterData[i] == '\n')
                        ++curPlotterDatas;
                    if (curPlotterDatas >= maxPlotterDatas)
                    {
                        PlotterData = PlotterAxis + PlotterData.substring(i + 1);
                        break;
                    }
                }
            }
            PlotterData += ""+PlotterIndex+","+message;
            PlotterIndex++;
            PlotterRefresh();
        }
    }
}

var SendMessageFromTextArea = function(id)
{
    var elem = document.getElementById(id);
    Serial.println(elem.value);
    elem.value = "";
};

var SendMessageFromElement = function(id)
{
    var elem = document.getElementById(id);
    Serial.println(elem.innerHTML);
    elem.innerHTML = "";
};

var OnLoad = function()
{
    Plotter = new Dygraph(document.getElementById('serialPlotterContainer'), PlotterData);
};

window.addEventListener('load', OnLoad);

var OnResize = function()
{
    PlotterResize();
};

window.addEventListener('resize', OnResize);
