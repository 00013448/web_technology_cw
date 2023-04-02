const express = require("express");
const fs = require("fs");
const {body, check, validationResult} = require("express-validator")

const app = express();
const port = 3000;

const uniqid = require("uniqid")

app.set("view engine", "pug");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  let created = req.query.created;
  const medicines = getAll("medicines")

  res.render("medicines", { created ,medicines});
});

app.get("/show/:medicine", (req, res) => {

  const medicines = getAll("medicines")
  const medicine = medicines.find(({id}) => id == req.params.medicine)
  res.render("medicines", {  medicines,medicine});
});

app.get("/create", (req, res) => {
  res.render("form", {});
});

app.get("/medicines/:medicine/edit",(req,res) => {
  const medicines = getAll("medicines")
  const medicine = medicines.find(({id:medicineId}) => medicineId == req.params.medicine)
  return res.render("form",{data:medicine});
})

app.post("/create",[
  check("name").notEmpty().withMessage("Name can not be empty"),
  check("expire_date").notEmpty().withMessage("Expire Date can not be empty"),
  check("country").notEmpty().withMessage("Country can not be empty")
], (req, res) => {

  let data = req.body;
  const errors  = validationResult(req)

  if(!errors.isEmpty()){
    return res.render("form", {errors: JSON.stringify(errors.errors),data});
  }

  

  let medicine = {
    id: data.id || uniqid(),
    name: data.name,
    description: data.description,
    expire_date: data.expire_date,
    country: data.country,
  };

  data.id ? update('medicines',medicine) : insert('medicines',medicine)

  res.redirect("/?created=true");
});


app.post("/medicines/delete/:medicine",(req,res) => {
  remove('medicines',req.params.medicine)
  res.redirect("/")
})

app.listen(port);

function getAll(file) {
  return JSON.parse(fs.readFileSync(`./data/${file}.json`));
}

function insert(file, data) {
  let collection = getAll(file);
  collection.push(data);
  return fs.writeFileSync(`./data/${file}.json`, JSON.stringify(collection));
}

function update(file,data){
  let collection = getAll(file);
  let itemIndex =collection.findIndex((item) => item.id == data.id)
  if(!itemIndex < 0) return 
  collection[itemIndex] = data
  return fs.writeFileSync(`./data/${file}.json`, JSON.stringify(collection));
}

function remove(file,id){
  let collection = getAll(file);
  collection = collection.filter(({id:itemId}) => itemId != id)
  return fs.writeFileSync(`./data/${file}.json`, JSON.stringify(collection));
}