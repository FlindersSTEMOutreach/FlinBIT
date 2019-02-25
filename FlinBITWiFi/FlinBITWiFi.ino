#include "FlinBITWiFi.h"

// Serial

String SerialInputString = "";
bool SerialInputComplete = false;

// WiFi

const char AP_SSID[] = "FlinBit";
const char AP_Password[] = "123456789";
int AP_Channel = random(0, 13) + 1;

const IPAddress AP_IP(192,168,1,1);
const IPAddress AP_Gateway = AP_IP;
const IPAddress AP_Subnet(255,255,255,0);

// DNS

DNSServer DNS;
const uint16_t DNSPort = 53;

// Web Server

const uint16_t ServerPort = 80;
ESP8266WebServer Server(ServerPort);

// Web Socket

const uint16_t SocketPort = 81;
WebSocketsServer Socket(SocketPort);

// SPIFFS

File LogFile;
const String LogDir = "/logs/";

// #define DEBUG

void setup()
{
    //
    // Set up Serial
    //
    Serial.begin(9600);

    #ifdef DEBUG_ESP_CORE
    Serial.setDebugOutput(true);
    #endif

    SerialInputString.reserve(200);

    //
    // Set up SPIFFS
    //
    SPIFFS.begin();

    //
    // Set up WiFi
    //
    WiFi.mode(WIFI_AP);
    WiFi.softAPConfig(AP_IP, AP_Gateway, AP_Subnet);
    WiFi.softAP(AP_SSID, AP_Password, AP_Channel, false);

    //
    // Set up DNS
    //
    DNS.setErrorReplyCode(DNSReplyCode::NoError);
    DNS.start(DNSPort, "*", AP_IP);

    //
    // Set up WebServer
    //
    // Server.on("/", &ServerHandleRequest);
    Server.onNotFound(&ServerHandleRequest);
    Server.begin();

    //
    // Set up WebSocket
    //
    Socket.begin();
    Socket.onEvent([](uint8_t num, WStype_t type, uint8_t *payload, size_t length)
    {
        switch (type)
        {
            //
            // Device connected to the web socket
            //
            case WStype_CONNECTED: {

            } break;

            //
            // Device disconnected from the web socket
            //
            case WStype_DISCONNECTED: {

            } break;

            //
            // Received text over web socket
            //
            case WStype_TEXT: {
                // payload should be null-terminated-string
                if (payload[length-1] == '\0' || payload[length] == '\0')
                {
                    String str = (const char *)payload;

                    bool wasLogger = false;
                    if (str.length() > 1 && str[0] == '/' && str[1] != '/')
                    {
                        tokeniser_t commands(str);
                        const String &command = commands.nextLower();
                        auto boardcastLogging = [](){
                            if (LogFile)
                                Socket.broadcastTXT("/logger running");
                            else
                                Socket.broadcastTXT("/logger notrunning");
                        };
                        if (command == "/logstart")
                        {
                            wasLogger = true;
                            bool overwrite = commands.nextLower() == "overwrite";
                            String &&fname = commands.next();
                            ServerStartLogging(fname, overwrite);
                            boardcastLogging();
                        }
                        else if (command == "/logstop")
                        {
                            wasLogger = true;
                            ServerStopLogging();
                            boardcastLogging();
                        }
                        else if (command == "/islogging")
                        {
                            wasLogger = true;
                            boardcastLogging();
                        }
                        else if (command == "/logclear")
                        {
                            Dir dir = SPIFFS.openDir(LogDir);

                            while (dir.next())
                            {
                                SPIFFS.remove(dir.fileName());
                                dir = SPIFFS.openDir(LogDir);
                            }
                        }
                    }

                    if (!wasLogger)
                    {
                        Serial.print(str);

                        #ifdef DEBUG
                        Socket.broadcastTXT(str);
                        #endif
                        if (LogFile)
                        {
                            size_t sz = str.length();
                            if (LogFile.write((const uint8_t *)str.c_str(), sz) != sz)
                                Socket.broadcastTXT("> Failed to save\n");
                            #ifdef DEBUG
                            else
                                Socket.broadcastTXT("> Saved\n");
                            #endif
                        }
                    }
                }
                // else error
            } break;

            //
            // Received binary blob over web socket
            //
            case WStype_BIN: {
                // payload is binary
            } break;
        }
    });
}

void loop()
{
    DNS.processNextRequest();
    Socket.loop();
    Server.handleClient();
    if (SerialEvent())
    {
        Socket.broadcastTXT(SerialInputString);
        if (LogFile)
        {
            size_t sz = SerialInputString.length();
            if (LogFile.write((const uint8_t *)SerialInputString.c_str(), sz) != sz)
                Socket.broadcastTXT("> Failed to save\n");
            #ifdef DEBUG
            else
                Socket.broadcastTXT("> Saved");
            #endif
        }
    }
    delay(1);
}

void ServerStartLogging(String fname, bool overwrite)
{
    if (LogFile)
        return;

    fname = LogDir + fname;

    if (fname.endsWith("/"))
        fname += "log.txt";
    else if (!fname.endsWith(".txt"))
        fname += ".txt";

    String message = "Opened file '";
    message += fname + "'\n";
    Socket.broadcastTXT(message);

    LogFile = SPIFFS.open(fname, ((overwrite || !SPIFFS.exists(fname)) ? "w" : "a"));
}

void ServerStopLogging()
{
    if (!LogFile)
        return;

    LogFile.close();
}

void ServerHandleRequest()
{
    String &&uri = Server.uri();
    uri = uri.endsWith("/") ? uri + "index.html" : uri;

    if (!ServerSendFile(Server, uri))
    {
        ServerSendDirectory(Server, uri);
    }
}

bool ServerSendFile(ESP8266WebServer &server, const String &path)
{
    String dataType = F("text/plain");
    String lowerPath = path.substring(path.length() - 5, path.length());
    lowerPath.toLowerCase();
    if      (lowerPath.endsWith(".src"))    lowerPath = lowerPath.substring(0, path.lastIndexOf("."));
    else if (lowerPath.endsWith(".gz"))     dataType = F("application/x-gzip");
    else if (lowerPath.endsWith(".html"))   dataType = F("text/html");
    else if (lowerPath.endsWith(".htm"))    dataType = F("text/html");
    else if (lowerPath.endsWith(".png"))    dataType = F("image/png");
    else if (lowerPath.endsWith(".js"))     dataType = F("application/javascript");
    else if (lowerPath.endsWith(".css"))    dataType = F("text/css");
    else if (lowerPath.endsWith(".gif"))    dataType = F("image/gif");
    else if (lowerPath.endsWith(".jpg"))    dataType = F("image/jpeg");
    else if (lowerPath.endsWith(".ico"))    dataType = F("image/x-icon");
    else if (lowerPath.endsWith(".svg"))    dataType = F("image/svg+xml");
    else if (lowerPath.endsWith(".mp3"))    dataType = F("audio/mpeg");
    else if (lowerPath.endsWith(".wav"))    dataType = F("audio/wav");
    else if (lowerPath.endsWith(".ogg"))    dataType = F("audio/ogg");
    else if (lowerPath.endsWith(".xml"))    dataType = F("text/xml");
    else if (lowerPath.endsWith(".pdf"))    dataType = F("application/x-pdf");
    else if (lowerPath.endsWith(".zip"))    dataType = F("application/x-zip");

    String pathWithGz = path + ".gz";

    File file;

    if (SPIFFS.exists(pathWithGz))
    {
        file = SPIFFS.open(pathWithGz, "r");
    }
    else if (SPIFFS.exists(path))
    {
        file = SPIFFS.open(path, "r");
    }
    else
    {
        return false;
    }

    server.setContentLength(file.size());
    size_t sent = server.streamFile(file, dataType);
    file.close();
    return true;
}

void ServerSendDirectory(ESP8266WebServer &server, const String &path)
{
    int lastIndex = path.lastIndexOf("/") + 1;
    if (lastIndex <= 0)
        lastIndex = 1;
    String &&substr = path.substring(0, lastIndex);

    #ifndef DEBUG
    if (substr != LogDir)
    {
        String error = "Failed to read file. '";
        error += path + "'\n\n" + substr;
        server.send(404, "text/plain", error);
    }
    else
    #endif
    {
        Dir dir = SPIFFS.openDir(substr);

        String doc = R"(<html><head><meta charset="utf-8"></head><body><h1 style="margin:0 0 0 0;">)"
            +substr+R"(</h1><br/><a href="/"><h2 style="margin:0 0 0 0;">Home</h2></a><br/>)";
        while (dir.next())
        {
            String &&fname = dir.fileName();
            if (fname.endsWith(".gz"))
                fname = fname.substring(0, fname.length() - 3);
            doc += String(R"(<a href=")") + fname + R"(">)" + fname + "</a><br/>";
        }
        doc += "</body></html>";

        server.send(200, "text/html", doc);
    }
}

bool SerialEvent()
{
    if (SerialInputComplete)
    {
        SerialInputString = "";
        SerialInputComplete = false;
    }
    while (Serial.available())
    {
        char in = (char)Serial.read();
        SerialInputString += in;
        if (in == '\n')
        {
            SerialInputComplete = true;
            break;
        }
    }
    return SerialInputComplete;
}

bool IsWhitespace(const char c)
{
    return c == ' ' || c == '\t' || c == '\r' || c == '\n';
}

tokeniser_t::tokeniser_t(const String &str) : _str(str) {}

String tokeniser_t::next()
{
    size_t i = 0;
    for (; i < _str.length() && IsWhitespace(_str[i]); ++i); // find next not-space (start of token)
    if (i >= _str.length())
    {
        _str = "";
        return "";
    }

    size_t j = i;
    for (; j < _str.length() && !IsWhitespace(_str[j]); ++j); // find next whitespace (end of token)

    String rtn = _str.substring(i, j);
    _str = _str.substring(j, _str.length());
    return rtn;
}

String tokeniser_t::nextLower()
{
    String str = next();
    str.toLowerCase();
    return str;
}