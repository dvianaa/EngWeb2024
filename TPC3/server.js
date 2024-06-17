var http = require('http')
var fs = require('fs')
var url = require('url')
const axios = require('axios')

function getActorsPage(actors){
    HTML = 
    
`
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lista de Atores</title>
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"/>
    </head>

    <body>
        <div class="w3-card-4">
            <div class="w3-container w3-teal">
                <h1>Lista de Atores</h1>
            </div>

            <div class="w3-container">
                <table class="w3-table-all w3-hoverable-teal">
                    <tr>
                        <th>Nome</th>
                        <th>Filmes</th>
                    </tr>
`

actors.forEach(element => {
    HTML += 
`
                    <tr>
                        <td><a href="/actors/"${element.id}</a>${element.name}</td>
                        <td>
                            <ul>

`
    if(element.movies != ''){
        element.movies.forEach(element2 => {
            HTML +=
`
                                <li><a href="/movies/${element2[0]}">${element2[1]}</a>
`
        })
    }
})

    HTML += 
`
                            </ul>
                        </td>
                    </tr>
                </table>
            </div>
        <div>
    </body>
</html> 
`
    return HTML;
}

function getGenresPage(genres){
    HTML = 
    
    `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de géneros</title>
            <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"/>
        </head>
    
        <body>
            <div class="w3-card-4">
                <div class="w3-container w3-teal">
                    <h1>Lista de Géneros</h1>
                </div>
    
                <div class="w3-container">
                    <table class="w3-table-all w3-hoverable-teal">
                        <tr>
                            <th>Género</th>
                        </tr>
    `
    
    genres.forEach(element => {
        HTML += 
    `
                        <tr>
                            <td><a href="/genres/"${element.id}</a>${element.genreName}</td>
                        </tr>
`
    })
        HTML +=
`
                    </table>
                </div>
            <div>
            <footer class="w3-container w3-teal">
                <h5>EngWeb2024 A100701</h5>
            </footer>
        </body>
    </html> 
`
    return HTML;
}

function getMoviesPage(movies){
    HTML = 
    
    `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de filmes</title>
            <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"/>
        </head>
    
        <body>
            <div class="w3-card-4">
                <div class="w3-container w3-teal">
                    <h1>Lista de Filmes</h1>
                </div>
    
                <div class="w3-container">
                    <table class="w3-table-all w3-hoverable-teal">
                        <tr>
                            <th>Título</th>
                            <th>Ano</th>
                            <th>Géneros</th>
                            <th>Cast</th>
                        </tr>
    `
    
    movies.forEach(element => {
        HTML += 
    `
                        <tr>
                            <td><a href="/movies/"${element.id}</a>${element.title}</td>
                            <td>${element.year}</td>
                            <td>
                                <ul>
    
    `
        if(element.genres != ''){
            element.genres.forEach(element2 => {
                HTML +=
    `
                                    <li><a href="/genres/${element2[0]}">${element2[1]}</a>
    `
            })
        }
    
    
        HTML += 
    `
                                </ul>
                            </td>
                            <td>
                                <ul>
    `
        if(element.cast != ''){
            element.cast.forEach(element2 => {
                HTML +=
    `
                                    <li><a href="/actors/${element2[0]}">${element2[1]}</a>
    `
            })
        }
        HTML +=
    `

                                </ul>
                            </td>
                        </tr>
    `
        })
        HTML += `
                    </table>
                </div>
            <div>
            <footer class="w3-container w3-teal">
                <h5>EngWeb2024 A100701</h5>
            </footer>
        </body>
    </html> 
    `
        return HTML;
}

function getSingleMoviePage(movie){
    HTML = 
`
<DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Filme</title>
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"/>
    </head> 

    <body>
        <div class="w3-card-4">
            <header class="w3-container w3-teal">
                <h1>${movie.title}</h1>
            </header>

            <div>
            <header class=" w3-container header-teal">
                <h3>Informações</h3>
            </header>
        
            <div class="w3-container">
                <p>Id: ${movie.id}</p>
                <p>Título: ${movie.title}</p>
                <p>Ano: ${movie.year}</p>
                <p>Cast:</p>
                <ul>
`

    if(movie.cast != ''){
        movie.cast.forEach(actor => {
            HTML += 
`
                    <li><a href="/actors/${actor[0]}">${actor[1]}</a></li>
`
        })
    }

    HTML += 
`
                </ul>
                <p>Géneros:</p>
                <ul>
`
    if(movie.genres != ''){
        movie.genres.forEach(genre => {
            HTML +=
`
                    <li><a href="/genres/${genre[0]}">${genre[1]}</a></li>
`
        })
    }
    HTML +=
`
                </ul>
            </div>
        </div>
        <footer class="w3-container w3-teal">
            <h5>EngWeb2024 A100701</h5>
        </footer>
    </body>
</html>
`
    return HTML
}

function getSingleActorPage(actor){
    HTML = 
`
<DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ator</title>
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"/>
    </head> 

    <body>
        <div class="w3-card-4">
            <header class="w3-container w3-teal">
                <h1>${actor.name}</h1>
            </header>

            <div>
            <header class=" w3-container header-teal">
                <h3>Informações</h3>
            </header>
        
            <div class="w3-container">
                <p>Id: ${actor.id}</p>
                <p>Nome: ${actor.name}</p>
                <p>Filmes:</p>
                <ul>
`

    if(actor.movies != ''){
        actor.movies.forEach(movie => {
            HTML += 
`
                    <li><a href="/movies/${movie[0]}">${movie[1]}</a></li>
`
        })
    }
    HTML +=
`
                </ul>
            </div>
        </div>
        <footer class="w3-container w3-teal">
            <h5>EngWeb2024 A100701</h5>
        </footer>
    </body>
</html>
`
    return HTML
}

function getSingleGenrePage(genre){
    HTML = 
`
<DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Género</title>
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"/>
    </head> 

    <body>
        <div class="w3-card-4">
            <header class="w3-container w3-teal">
                <h1>${genre.genreName}</h1>
            </header>

            <div>
            <header class=" w3-container header-teal">
                <h3>Informações</h3>
            </header>
        
            <div class="w3-container">
                <p>Id: ${genre.id}</p>
                <p>Nome: ${genre.genreName}</p>
                <p>Filmes:</p>
                <ul>
`

    if(genre.movies != ''){
        genre.movies.forEach(movie => {
            HTML += 
`
                    <li><a href="/movies/${movie[0]}">${movie[1]}</a></li>
`
        })
    }
    HTML +=
`
                </ul>
            </div>
        </div>
        <footer class="w3-container w3-teal">
            <h5>EngWeb2024 A100701</h5>
        </footer>
    </body>
</html>
`
    return HTML
}

http.createServer(function(req,res) {
    const moviesRegex = /^\/movies\/[a-zA-Z0-9]*$/
    var genresRegex = /^\/genres\/(\d+)$/
    var actorRegex = /^\/actors\/(\d+)$/

    var q = url.parse(req.url, true)
    console.log(q.pathname)

    if(q.pathname == "/"){
        fs.readFileSync("index.html", function(error,data){
            res.writeHead(200, {"Content-type":"text/html"})
            res.write(data)
            res.end()
        })
    } 
    
    else if(q.pathname == "/actors"){
        axios.get("http://localhost:12345/actors").then(function(resp) {
            data = resp.data
            html = getActorsPage(data)
            res.writeHead(200, {"Content-type":"text/html"})
            res.write(html)
            res.end()
        })
    }

    else if(q.pathname == "/genres"){
        axios.get("http://localhost:12345/genres").then(function(resp){
            data = resp.data
            html = getGenresPage(data)
            res.writeHead(200, {"Content-type":"text/html"})
            res.write(html)
            res.end()
        })
    }

    else if(q.pathname == "/movies"){
        axios.get("http://localhost:12345/movies").then(function(resp){
            data = resp.data
            html = getMoviesPage(data)
            res.writeHead(200, {"Content-type":"text/html"})
            res.write(html)
            res.end()
        })
    }

    else if(moviesRegex.test(q.pathname)){
        axios.get("http://localhost:12345" + q.pathname).then(function(resp){
            data = resp.data
            html = getSingleMoviePage(data)
            res.writeHead(200, {"Content-type":"text/html"})
            res.write(html)
            res.end()
        })
    }

    else if(actorRegex.test(q.pathname)){
        axios.get("http://localhost:12345" + q.pathname).then(function(resp){
            data = resp.data
            html = getSingleActorPage(data)
            res.writeHead(200, {"Content-type":"text/html"})
            res.write(html)
            res.end()
        })
    }

    else if(genresRegex.test(q.pathname)){
        axios.get("http://localhost:12345" + q.pathname).then(function(resp){
            data = resp.data
            html = getSingleGenrePage(data)
            res.writeHead(200, {"Content-type":"text/html"})
            res.write(html)
            res.end()
        })
    }
}).listen(54321)
