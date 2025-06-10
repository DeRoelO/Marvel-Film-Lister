@echo off
if exist build rmdir /S /Q build
mkdir build
xcopy /E /I /Y src build\src
copy /Y index.html build\index.html 