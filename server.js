var express = require("express");
var app = express();
var path = require("path");
var server = require("./data-service.js");
var multer = require("multer");
var fs = require("fs");
var bodyParser = require('body-parser');
const exphbs = require('express-handlebars');

var HTTP_PORT = process.env.PORT || 8080;


// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
   }

const storage = multer.diskStorage({
   destination: "./public/images/uploaded",
   filename: function (req, file, cb) {
     cb(null, Date.now() + path.extname(file.originalname));
   }
 });
 
app.engine('.hbs', 
exphbs({ extname: '.hbs', 
         defaultLayout: 'main',
         helpers: {
            navLink: (url, options)=>{
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
            },

            equal: function (lvalue, rvalue, options) {
                if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
                if (lvalue != rvalue) {
                return options.inverse(this);
                } else {
                return options.fn(this);
                }
            }
        }
    }
 ));

app.set('view engine', '.hbs');

 // tell multer to use the diskStorage function for naming files instead of the default.
 const upload = multer({ storage: storage });

app.use(express.static('public')); //required to return css

app.use(bodyParser.urlencoded({extended:true}));

app.use((req,res,next)=>{
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
    });

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", (req,res) => {
   res.render("home")
});

// setup another route to listen on /about
app.get("/about", (req,res) => {
   res.render("about")
});

app.get("/employees/add", (req,res) => {
    server.getDepartments().then(function(data){
    res.render("addEmployee", {departments: data});
    }).catch(function(err){
        res.render("addEmployee", {departments: []});
    })
 });

 
 app.get("/images/add", (req,res)=>{
   res.render("addImage");
 });

 app.get("/employees", function(req,res){
    if (req.query.status){
        server.getEmployeesByStatus(req.query.status).then((data)=>{ 
            if (data.length > 0) {
                 res.render("employees", {employees: data}); }
            else {
               res.render("employees", {message: "no results"});
            }    
            //res.render("employees", {employees: data});
        }).catch(function(err){
            res.render({message: "no results"});
        });
    }

    else if (req.query.department){
        server.getEmployeesByDepartment(req.query.department).then((data)=>{
            if (data.length > 0) {
                res.render("employees", {employees: data}); 
            }
            else {
               res.render("employees", {message: "no results"});
            }
        }).catch(function(err){
            res.render({message: "no results"});
        });
    }

    else if (req.query.manager){
        server.getEmployeesByManager(req.query.manager).then((data)=>{
            if (data.length > 0) {
                res.render("employees", {employees: data}); 
            }
            else {
               res.render("employees", {message: "no results"});
            }
        }).catch(function(err){
            res.render({message: "no results"});
        });
    }

    else {
        server.getAllEmployees().then(function(data) {
            if (data.length > 0) {
             res.render("employees", {employees: data}); }
            else {
            res.render("employees", {message: "no results"});}
        }).catch(function(err){
            res.render({message: "no results"});
        });
    }
});

app.get("/employee/:num", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    server.getEmployeeByNum(req.params.num).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        }
         
        else {
         viewData.employee = null; // set employee to null if none were returned
            }
        }).catch(() => {
            viewData.employee = null; // set employee to null if there was an error
     
        }).then(server.getDepartments).then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"
    // loop through viewData.departments and once we have found the departmentId that matches
    // the employee's "department" value, add a "selected" property to the matching
    // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
            viewData.departments[i].selected = true;
                }
            }
         }).catch(() => {
         viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
             if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            }
            else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
            }
         });
    });

/*app.get("/employee/:num", (req, res) => { 
    server.getEmployeeByNum(req.params.num).then((data)=>{
        res.render("employee", { employee: data });;
    }).catch((err)=> {
        res.render("employee",{message:"no results"});;
    })

});  */

 app.get("/departments", function(req,res){
    server.getDepartments().then(function(data){
        if (data.length > 0) {
            res.render("departments", {departments: data}); 
        }
           else {
           res.render("departments", {message: "no results"});
        }
    }).catch(function(err){
        res.render({message: "no results"});
    })
 });

 /*app.get("/managers", function(req,res){
    server.getManagers().then(function(data){
        res.json(data);
    }).catch(function(err){
        res.json({message: err});
    })
 }); removed */

 app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
    });

 app.post("/employees/add", (req,res)=> {
     
    server.addEmployee(req.body).then(function(data){   
        res.redirect("/employees");
     }).catch(function(err){
        res.status(500).send("Unable to add Employee");
     });

});

app.get("/departments/add", (req,res) => {
    res.render("addDepartment");
     });


app.post("/departments/add", (req,res)=> {
    server.addDepartment(req.body);
    res.redirect("/departments");
});

/* app.post("/employee/update", (req, res) => { 
     console.log(req.body); 
     res.redirect("/employees"); 
    }); old */

app.post("/employee/update", (req, res) => {
        server.updateEmployee(req.body).then((data) => {
           // console.log(req.body);
            res.redirect("/employees");
        }).catch((err) => {
            res.status(500).send("Unable to Update Employee");
        })
    });

    
app.post("/department/update", (req, res) => {
    server.updateDepartment(req.body).then((data) => {
       // console.log(req.body);
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Update Department");
    })
});

app.get("/department/:id", (req, res) => { 
    server.getDepartmentById(req.params.id).then((data)=>{
        res.render("department", { department: data });
        if (data == undefined){
        res.status(404).send("Department Not Found");
    }
    }).catch((err)=> {
        res.status(404).send("Department Not Found");
    })

}); 
 app.get("/images", (req,res)=> {
 
    /*try {
     fs.readdir('./public/images/uploaded', (err,items) => { 
        res.json({"images":items}); 
        });
     } catch (err) {
         console.log ("Unable to read file");
    } previous assignment */  
    try {
        fs.readdir('./public/images/uploaded', (err,images) => { 
           res.render("images", {images: images}); 
           });
        } catch (err) {
            console.log ("Unable to read file");
       }  
 }); 


 app.get("/employees/delete/:num", (req, res) => {
     server.deleteEmployeeByNum(req.params.num).then((data) => {
         res.redirect("/employees");
     }).catch(function(err){
         res.status(500).send("Unable to remove employee.");
     })
 });

 app.use(function(req, res) {
    res.status(404).send("Error 404 - Page Not Found. Please contact system administrator.");
  });
// setup http server to listen on HTTP_PORT

server.initialize().then(function(data){
    app.listen(HTTP_PORT, onHttpStart);
    console.log(data);
}).catch(function(err){
    console.log("Unable to start server on " + HTTP_PORT);
}); 

