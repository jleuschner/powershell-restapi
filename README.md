# powershell-restapi
REST-API zur Ausführung von Powershell-Commands. Commands sind in commandregistry.js definiert.
### Installation 
- npm install
- Config.json anpassen
- npm start


### Test
	curl -X POST -d name="www.google.com" http://localhost:3100/command/execute/ResolveDnsName
---
##### config.json
    {
        "server": {
            "port": 3100                <- TCP-Port
        },
        "ipWhitelist": [
            "127.0.0.1","::1",          <- Erlaubte IP-Adressen  
            "194.15.252.254"
						],
		"powershell": {
			"min" : 1,                  <- minimale Powershell-Prozesse
			"max" : 8,                  <- maximale Powershell-Prozesse
			"idleTimeout" : 180000      <- Timeout bevor inaktive Powershell-Prozesse beendet werden
		}
    }
---
## FIX:
##### node_modules\powershell-command-executor\pcCommandService.js

    PSCommandService.prototype._sanitize = function(toSanitize,isQuoted)
    ...
        toSanitize = toSanitize.replace(/([;\$\|\(\)\[\]\\])/g, "`$1");
        //toSanitize = toSanitize.replace(/([;\$\|\(\)\{\}\[\]\\])/g, "`$1");

{ und } werden sonst durch \`{ und \`{ ersetzt !!!
Dadurch können Parameter wie -filter { name -like 'bla*' } nicht verarbeitet werden.

----
## Windows Systemanpassungen
Folgende Anpassungen sind norwending, damit Powershell mit Umlauten zurechtkommt:
### Powershell-Profil
Codepage muss auf UTF8 (65001) gesetzt werden! Also grundsätzlich 'chcp 65001' setzen!
c:\windows\system32\WindowsPowerShell\v1.0\profile.ps1:

    chcp 65001

### Consolen-Font festsetzen
Zur korrekten Darstellung der Umlaute in UTF8 wird als Consolen-Font 'Lucida Console' benötigt. Ein Bug in der Powershell verhindert allerdings, das dieser Font als Standard eingestellt bleibt. Daher dieser Workaround mit einem geänderten Font  
(http://www.bdhphoto.com/application-downloads/powershell-font-fix-lucida/ )
- \consolefont\lucon1.ttf installieren
- In HKLM:\\SOFTWARE\Microsoft\WindowsNT\CurrentVersion\Console\TrueTypeFont "Lucida Console" in "LucidaConsoleNew" umbennen
- Unter HKCU:\\Console\...  FontName auf "LucidaConsoleNew" ändern.

### Server-Features
Für die AD-Powershell-Commands müssen die Server-Features "Remote-verwaltungstools - Rollenverwaltungstools - AD DS- und AD LDS-Tools - AD DS-Snap-Ins und -Befehlszeilentools" installiert sein.

---
## Installation als Windows-Dienst
    install-service.cmd
Verwendet nssm (https://nssm.cc/). Script entsprechend anpassen!
Wichtig: Der Benutzer, mit dessen Credentials der Dienst gestartet wird muss LucidaConsoleNew als default-Konsolenfont verwenden! 
