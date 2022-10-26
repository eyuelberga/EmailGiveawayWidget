import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { sendGiveaway } from "./courier.js";


const LIST_ID = process.env.LIST_ID;
const NOTIFICATION_TEMPLATE = process.env.NOTIFICATION_TEMPLATE;

var allowlist = process.env.ALLOW_LIST ? process.env.ALLOW_LIST.split(",") : [];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true }
  } else {
    corsOptions = { origin: false }
  }
  callback(null, corsOptions)
}


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');


app.post("/", cors(corsOptionsDelegate), async (req, res) => {
  res.set("Content-Type", "application/json");
  try {
    const { name, email, success } = req.body;
    if (!email || !name) {
      return res.status(400).send(JSON.stringify({ message: "Name or email not provided!" }));
    }
    else {
      await sendGiveaway(LIST_ID, NOTIFICATION_TEMPLATE, { name, email });
      return res.send(JSON.stringify({ name, email, message: success }));
    }
  }
  catch (e) {
    return res.status(500).send(JSON.stringify({ message: e.message }));
  }

});


app.get("/success", cors(corsOptionsDelegate), async (req, res) => {
  const { name, email, message } = req.query;
  res.render('success', { name, email, message });
});

app.get("/error", cors(corsOptionsDelegate), async (req, res) => {
  const { message } = req.query;
  res.render('error', { message });
});

app.get("/", cors(corsOptionsDelegate), function (req, res) {
  const { heading, description, button, success, name, email, error } = req.query
  if (!LIST_ID || !NOTIFICATION_TEMPLATE) {
    res.render('error', { message: "Notification or List ID missing!" })
  }
  else {
    res.render('index', { heading, description, button, success, name, email, error });
  }

});

app.get("/preview", function (req, res) {
  res.render('preview');
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}.`);
});

export default app;
