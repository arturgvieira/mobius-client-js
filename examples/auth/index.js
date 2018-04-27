const StellarSdk = require('stellar-sdk')
const MobiusClient = require('../../lib');

const express = require('express')
const app = express()
const PORT = 3000
const keypair = StellarSdk.Keypair.random()

StellarSdk.Network.useTestNetwork();

app.set('view engine', 'ejs')
app.set('views', 'examples/auth')
app.use(express.json())
app.use(express.static('examples/auth'))
app.use(express.static('dist'))

console.log(`App Public Key: ${keypair.publicKey()}`)

app.get('/', (req, res) => {
  res.render('index', { publicKey: keypair.publicKey() })
})

app.get('/auth', (req, res) => {
  res.send(
    MobiusClient.Auth.Challenge.call(keypair.secret())
  );
})

app.post('/auth', (req, res) => {
  MobiusClient.Auth.verifyToken(req.body.xdr, req.body.public_key, keypair.secret())
    .then(body => res.send(body))
    .catch(error => res.status(500).send({ error: error.message }))
})

app.listen(PORT, () => console.log(`Auth example app is listening on port ${PORT}!`))
