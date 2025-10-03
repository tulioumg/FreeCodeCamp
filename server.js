'use strict'
const express = require('express');
const app = express();

const cors = require('cors');
const runner = require('./test-runner');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
})

app.use(express.static(__dirname + '/public'));

app.get('/hello', function (req, res) {
  const name = req.query.name || 'Guest';
  res.type('txt').send('hello ' + name);
})

const travellers = function (req, res) {
  let data = {};
  const surname = req.body && req.body.surname;
  if (surname) {
    switch (surname.toLowerCase()) {
      case 'polo':
        data = {
          name: 'Marco',
          surname: 'Polo',
          dates: '1254 - 1324'
        };
        break;
      case 'colombo':
        data = {
          name: 'Cristoforo',
          surname: 'Colombo',
          dates: '1451 - 1506'
        };
        break;
      case 'vespucci':
        data = {
          name: 'Amerigo',
          surname: 'Vespucci',
          dates: '1454 - 1512'
        };
        break;
      case 'da verrazzano':
      case 'verrazzano':
        data = {
          name: 'Giovanni',
          surname: 'da Verrazzano',
          dates: '1485 - 1528'
        };
        break;
      default:
        data = {
          name: 'unknown'
        }
    }
  }
  
  // Si es una petición POST (formulario HTML), responder con HTML
  if (req.method === 'POST') {
    const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Famous Italian Explorers</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <h1>Famous Italian Explorers</h1>

    <form method="post" action="/travellers" id="f1">
      <label for="surname">Surname:</label>
      <input type="text" name="surname" id="i1" />
      <button type="submit">submit</button>
    </form>

    <div id="tn">
      <h2>Explorer Info</h2>
      <p>Name: <span id="name">${data.name || ''}</span></p>
      <p>Surname: <span id="surname">${data.surname || ''}</span></p>
    </div>
  </body>
</html>`;
    res.send(html);
  } else {
    // Para peticiones PUT (AJAX), responder con JSON
    res.json(data);
  }
};


app.route('/travellers')
  .put(travellers)
  .post(travellers);

let error;
app.get('/_api/get-tests', cors(), function (req, res, next) {
  if (error)
    return res.json({ status: 'unavailable' });
  next();
},
  function (req, res, next) {
    if (!runner.report) return next();
    res.json(testFilter(runner.report, req.query.type, req.query.n));
  },
  function (req, res) {
    runner.on('done', function (report) {
      process.nextTick(() => res.json(testFilter(runner.report, req.query.type, req.query.n)));
    });
  });


const port = process.env.PORT || 3004;
app.listen(port, function () {
  console.log("Listening on port " + port);
  
  // Solo ejecutar tests en desarrollo, no en producción
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 1500);
  }
});


module.exports = app; // for testing

function testFilter(tests, type, n) {
  let out;
  switch (type) {
    case 'unit':
      out = tests.filter(t => t.context.match('Unit Tests'));
      break;
    case 'functional':
      out = tests.filter(t => t.context.match('Functional Tests'));
      break;
    default:
      out = tests;
  }
  if (n !== undefined) {
    return out[n] || out;
  }
  return out;
}
