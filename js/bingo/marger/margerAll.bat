
call marger.bat
call marger.mv.bat

m.exe ./build/bingo.core.js ./build/bingo.mv.js ./build/bingo.mv.factory.js ./build/bingo.mv.command.js  ./build/bingo.js

m.exe ./build/bingo.core-vsdoc.js ./build/bingo.mv-vsdoc.js ./build/bingo.mv.factory-vsdoc.js ./build/bingo-vsdoc.js
