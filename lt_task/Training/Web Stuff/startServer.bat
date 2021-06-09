@title serverStart
@echo off

:: Before starting the server, verify all of our prereqs
echo Verifying prerequisites...
echo.

:: Check if node is installed. If not display message and stop execution.
set NODE_VERSION=null
for /F "delims=" %%f in ('node -v') do (
   if defined NODE_VERSION set "NODE_VERSION=!LF!"
   set "NODE_VERSION=%%f"
)
IF %NODE_VERSION% == null (
	echo node.js has not been installed. Please install node.js from https://nodejs.org and re-run this script.
	pause
	exit
) ELSE (
	echo Detected node.js %NODE_VERSION%
)

:: Ensure that our required middleware packages are installed
call:verifyMiddleware express
call:verifyMiddleware body-parser
call:verifyMiddleware mkdirp

:: Reset the window title after all the npm nonsense is finished.
@title serverStart

:: The prerequisites should be met. Start the node.js server.
echo.
echo Starting the server...
node index.js


::method definitions below this line
:verifyMiddleware
	:: takes the npm name of a middleware package as an argument.
	:: Check if specified middleware is installed. If not, install it.
	set MIDDLEWARE_VERSION=null
	for /F "delims=" %%f in ('call npm list %~1') do (
	if defined MIDDLEWARE_VERSION set "MIDDLEWARE_VERSION=!LF!"
		set "MIDDLEWARE_VERSION=%%f"
	)
	:: if the end of the varible is ")" ie, "(empty)", assume the middleware package is not yet installed
	IF "%MIDDLEWARE_VERSION:~-1%" == ")" (
		echo %~1 is not yet installed. Installing...
		call npm install %~1
	) ELSE (
		:: Get the actual version number for the purpose of displaying it
		for /F "tokens=2 delims=@" %%a in ("%MIDDLEWARE_VERSION%") do (
			echo Detected %~1 v%%a
		)
	)
	exit /b