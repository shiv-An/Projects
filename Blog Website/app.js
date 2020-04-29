
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent = "Welcome the Journal Home Page! Here Adding your daily posts are made simple. Click the Navigation menus to view the corresponding pages. Use Compose option to write your Journal. Click Read more option to read the full article, which will be visible after adding your posts.";
const aboutContent = "This project is created as part of my learning process.This App is created using template javascript (ejs) and Mongoose ODM is used to connected the database.";


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/blogDB', {useNewUrlParser: true, useUnifiedTopology: true});

const postSchema = {
  title:String,
  content:String
}

const Post = mongoose.model("Post",postSchema);



app.get("/", function(req, res){
  Post.find({},function(err,posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  })
  
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save(function(err){
    if(err){
      res.redirect("/")
    }
  });
  res.redirect("/");
});

app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
