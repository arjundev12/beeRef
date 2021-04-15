const mangoose= require("mongoose");

mangoose.connect("mongodb://localhost:27017/bee-ref", {
  useNewUrlParser:true, 
   useUnifiedTopology: true,
   keepAlive: true,
   useCreateIndex: true,
   useFindAndModify: false
  }).then(() => {
  console.log("Connected to Database");
  }).catch((err) => {
    console.log(err);
      console.log("Not Connected to Database ERROR! ");
  });