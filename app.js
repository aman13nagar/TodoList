const express=require("express");
const bodyParser=require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
const app=express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("Public"));

mongoose.connect("mongodb+srv://aman13nagar:Aaman@cluster0.zecfzcz.mongodb.net/todolist",{useNewUrlParser:true, useUnifiedTopology: true});

const itemsSchema={
    name:String
}
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
    name:"welcome to todolist"
})
const item2=new Item({
    name:"Hit this to delete an item"
})
const item3=new Item({
    name:"Hit the button to add an item"
})
const defalutItems=[item1,item2,item3];
const ListSchema={
    name:String,
    items:[itemsSchema]
}
const List=mongoose.model("List",ListSchema);
app.get("/",function(req,res){
    Item.find({}).then(function(FoundItems){
        if(FoundItems.length===0){
            Item.insertMany(defalutItems).then(function () {
                console.log("Successfully saved defult items to DB");
              }).catch(function (err) {
                console.log(err);
              });        
              res.redirect("/");
        }
        else{
            res.render("list", {ListTitle: "Today", newListItems:FoundItems});
        }
    
      })
       .catch(function(err){
        console.log(err);
      })
})
app.post("/",function(req,res){
    const itemName=req.body.newItem;
    const listName=req.body.list;
    const item=new Item({
        name:itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
})
app.post("/Delete",function(req,res){
    const checkeditemid=req.body.checkbox;
    const ListName=req.body.ListName;
    if(ListName==="Today"){
        Item.findByIdAndRemove(checkeditemid).then(function(){
            console.log("Successfully deleted checked item");
            res.redirect("/");
        }).catch(function(err){
            if(!err){
                console.log("Successfully deleted the checked item");
            }
        })
    }
   else{
        List.findOneAndUpdate({name:ListName},{$pull:{items:{_id:checkeditemid}}},function(err,FoundList){
            if(!err){
                res.redirect("/"+ListName);
            }
        })
    }
})
app.get("/:customListName",function(req,res){
    const customlistName=_.capitalize(req.params.customListName);
    List.findOne({name:customlistName},function(err,FoundList){
        if(!err){
            if(!FoundList){
                console.log("does not exists");
                const list=new List({
                    name:customlistName,
                    items:defalutItems
                })
                list.save();
                res.redirect("/"+customlistName);
            }
            else{
                res.render("list",{ListTitle:FoundList.name,newListItems:FoundList.items});
            }
        }
    })
   /* try {
        const data = List.findOne({
            name:customlistName
        });
        console.log(data);
       /* if (data) {
          console.log("does not exist")
          res.render("list",{ListTitle:data.name,newListItems:data.items});
        }
  
        else{
            const list=new List({
                name:customlistName,
                items:defalutItems
            })
            list.save();
        }
      } catch (error) {
        console.log(error);
      }*/
})
app.listen(3000,function(){
    console.log("server has started at port 3000");
})