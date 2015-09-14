@echo off
mkdir "c:\node\powershell-RESTAPI\logs"
"%~dp0nssm.exe" install Powershell-RESTAPI "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -command "npm start"
"%~dp0nssm.exe" set Powershell-RESTAPI AppDirectory "c:\node\powershell-RESTAPI" 
"%~dp0nssm.exe" set Powershell-RESTAPI Description "Powershell REST-API" 
"%~dp0nssm.exe" set Powershell-RESTAPI Start SERVICE_AUTO_START 
"%~dp0nssm.exe" set Powershell-RESTAPI ObjectName kl\administrator PASSWORD

"%~dp0nssm.exe" set Powershell-RESTAPI AppStdout "c:\node\powershell-RESTAPI\logs\stdout.log"
"%~dp0nssm.exe" set Powershell-RESTAPI AppStderr "c:\node\powershell-RESTAPI\logs\stderr.log"
"%~dp0nssm.exe" set Powershell-RESTAPI AppStdoutCreationDisposition 4
"%~dp0nssm.exe" set Powershell-RESTAPI AppStderrCreationDisposition 4
"%~dp0nssm.exe" set Powershell-RESTAPI AppRotateFiles 1
"%~dp0nssm.exe" set Powershell-RESTAPI AppRotateSeconds 86400




