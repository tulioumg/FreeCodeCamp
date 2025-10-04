const { suite, test } = require('mocha');
const chai = require('chai');
const assert = chai.assert;

const server = require('../server');

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(5000);
  suite('Integration tests with chai-http', function () {
    // #1
    test('Test GET /hello with no name', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/hello')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'hello Guest');
          done();
        });
    });
    // #2
    test('Test GET /hello with your name', function (done) {
      chai
        .request(server)
        .keepOpen()
        .get('/hello?name=xy_z')
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'hello xy_z');
          done();
        });
    });
    // #3
    test('Send {surname: "Colombo"}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/travellers')
        .send({ surname: 'Colombo' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.name, 'Cristoforo');
          assert.equal(res.body.surname, 'Colombo');
          done();
        });
    });
    // #4
    test('Send {surname: "da Verrazzano"}', function (done) {
      chai
        .request(server)
        .keepOpen()
        .put('/travellers')
        .send({ surname: 'da Verrazzano' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.name, 'Giovanni');
          assert.equal(res.body.surname, 'da Verrazzano');
          done();
        });
    });
  });
});

const Browser = require('zombie');
Browser.site = 'http://127.0.0.1:3004'; // Usar IP específica en lugar de localhost
const browser = new Browser({
  silent: true,
  waitDuration: '30s',
  loadCss: false
});

suite('Functional Tests with Zombie.js', function () {
  this.timeout(5000);

  suite('Headless browser', function () {
    test('should have a working "site" property', function () {
      assert.isNotNull(browser.site);
    });
  });

  suite('"Famous Italian Explorers" form', function () {
    // Load the page before running form tests
    before(function(done) {
      browser.visit('/', done);
    });
    
    // #5
    test('Submit the surname "Colombo" in the HTML form', function (done) {
      browser.fill('surname', 'Colombo');
      browser.pressButton('submit', function() {
        // pressButton is Async. Waits for the ajax call to complete...
        // But we need a small delay to ensure AJAX completes
        setTimeout(() => {
          // assert that status is OK 200
          browser.assert.success();
          // assert that the text inside the element 'span#name' is 'Cristoforo'
          browser.assert.text('span#name', 'Cristoforo');
          // assert that the text inside the element 'span#surname' is 'Colombo'
          browser.assert.text('span#surname', 'Colombo');
          // assert that the element(s) 'span#dates' exist and their count is 1
          browser.assert.elements('span#dates', 1);
          
          done(); // It's an async test, so we have to call 'done()'
        }, 200);
      });
    });
    // #6
    test('Submit the surname "Vespucci" in the HTML form', function (done) {
      browser.visit('/', function (err) {
        if (err) return done(err);
        browser.fill('#i1', 'Vespucci');
        browser.pressButton('button[type="submit"]', function (err) {
          if (err) return done(err);
          
          // Dar tiempo para que el AJAX se complete
          setTimeout(() => {
            try {
              browser.assert.success();
              browser.assert.text('span#name', 'Amerigo');
              browser.assert.text('span#surname', 'Vespucci');
              done();
            } catch (error) {
              done(error);
            }
          }, 100);
        });
      });
    });
  });
});
