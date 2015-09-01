# powershell-restapi

ACHTUNG: Codepage muss auf UTF8 (65001) gesetzt werden! Also vor 'npm start' mit 'chcp 65001' setzen!


##### config.json
    {
        "server": {
            "port": 3100
        },
        "ipWhitelist": [
            "127.0.0.1","::1",
            "194.15.252.254"
        ]
    }

### Powershell-Profil
c:\windows\system32\WindowsPowerShell\v1.0\profile.ps1:

    chcp 65001

### Consolen-Font festsetzen
Zur korrekten Darstellung der Umlaute in UTF8 wird als Consolen-Font 'Lucida Console' benötigt. Ein Bug in der Powershell verhindert allerdings, das dieser Font als Stand eingestellt bleibt. Daher dieser Workaround mit einem geänderten Font  
(http://www.bdhphoto.com/application-downloads/powershell-font-fix-lucida/ )
* \consolefont\lucon1.ttf installieren
* In HKLM:\\SOFTWARE\Microsoft\WindowsNT\CurrentVersion\Console\TrueTypeFont "Lucida Console" in "LucidaConsoleNew" umbennen
* Unter HKCU::\Console\...  FontName auf "LucidaConsoleNew" ändern.

## FIX
##### node_modules\powershell-command-executor\pcCommandService.js

    PSCommandService.prototype._sanitize = function(toSanitize,isQuoted)
    ...
        toSanitize = toSanitize.replace(/([;\$\|\(\)\[\]\\])/g, "`$1");
        //toSanitize = toSanitize.replace(/([;\$\|\(\)\{\}\[\]\\])/g, "`$1");

{ und } werden sonst durch \`{ und \`{ ersetzt !!!
Dadurch können Parameter wie -filter { name -like 'bla*' } nicht verarbeitet werden.