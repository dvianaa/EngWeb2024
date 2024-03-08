const http = require('http');
const fs = require('fs');
const url = require('url');

http.createServer(function (req, res) {
    const q = url.parse(req.url, true);

    const regex = /\/(c\d+)/;

    if (q.pathname == '/') {
        fs.readFile('cidades/index.html', function (erro, dados) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(dados);
            res.end();
        });
    } 
    else if (regex.test(q.pathname)) {
        const file = q.pathname.substring(1);
        fs.readFile('cidades/' + file + '.html', function (erro, dados) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(dados);
            res.end();
        });
    } else {
        res.writeHead(400, {'Content-Type': 'text/html'});
        res.write("<p>Pedido não suportado</p>");
        res.write('<pre>' + q.pathname + '</pre>')
        res.end();
    }
    console.log(q.pathname)
}).listen(12345);