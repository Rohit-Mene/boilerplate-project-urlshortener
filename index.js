require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const urlparser = require('url');
const dns = require('dns');
const client = new MongoClient(process.env.DB_URL);
const db = client.db("urlshortner");
const urls = db.collection("urls");



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//ShortURL Creation
app.post('/api/shorturl', function(req, res) {
  console.log(req.body);
  const dnslookup = dns.lookup(urlparser.parse(req.body.url).hostname,async(err,address)=>{
    if(!address){
      res.json({error:"invalid url"});
    }else{
      const urlCnt = await urls.countDocuments({});
      const urlDoc = {
        url : req.body.url,
        shorturl : urlCnt + 1
      }
      const result = await urls.insertOne(urlDoc);
      res.json({original_url : req.body.url, short_url:urlCnt + 1});
      console.log(result);
    }
  })
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({shorturl : +shorturl});
  res.redirect(urlDoc.url);;
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
