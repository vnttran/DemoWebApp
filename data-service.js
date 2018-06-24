
/*var fs = require("fs");
var employees = [ ] //array
var departments = [ ]//array */

const Sequelize = require('sequelize');
var sequelize = new Sequelize('deecubi3umcg5s', 'yjptbqnehvtjcw', '8bd7a7b7cfe6e7a4117b120a614c5dad863898fee3925682042a1394dcf345fb', {
    host: 'ec2-174-129-206-173.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: true
    }
    });

    var Employee = sequelize.define('Employee', {
        employeeNum: { 
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement : true
        },
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        email: Sequelize.STRING,
        SSN: Sequelize.STRING,
        addressStreet: Sequelize.STRING,
        addresCity: Sequelize.STRING,
        addressState: Sequelize.STRING,
        addressPostal: Sequelize.STRING,
        maritalStatus: Sequelize.STRING,
        isManager: Sequelize.BOOLEAN,
        employeeManagerNum: Sequelize.INTEGER,
        status: Sequelize.STRING,
        department: Sequelize.INTEGER,
        hireDate: Sequelize.STRING, 
    }
);

    var Department = sequelize.define('Department', {
        departmentId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        departmentName: Sequelize.STRING,
    }
);

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function (Employee) {
               resolve();
            }).then(function (Department) {
               resolve();
            }).catch(function (err) {
                console.log(err);
                reject("Unable to sync database")
            });
    });
};

module.exports.getAllEmployees = function () {
    return new Promise(function (resolve, reject) {
       sequelize.sync().then(function() {
            resolve(Employee.findAll());
       }).catch (function (err) {
            reject("No results returned");
       });
     });
}

module.exports.getEmployeesByStatus = (status) => {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Employee.findAll({
                where: { 
                    status: status
                }}));
       }).catch (function (err) {
            reject("No results returned");
       });
    });
}

module.exports.getEmployeesByDepartment = (department) => {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Employee.findAll({
                where: { 
                    department: department
                }}));
       }).catch (function (err) {
            reject("No results returned");
       });
    });
}

module.exports.getEmployeesByManager = (manager) => {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Employee.findAll({
                where: { 
                   employeeManagerNum: manager
                }}));
       }).catch (function (err) {
            reject("No results returned");
       });
    });
}

module.exports.getEmployeeByNum = (num) => {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function() {
            Employee.findAll({
                where: { 
                    employeeNum: num
                }}
            ).then(function(data){
                resolve(data[0]);
            }).catch (function (err) {
            reject("No results returned");
            });
        });
    })
}

/* module.exports.getManagers = function() {
 var managersList = []; 

    return new Promise(function(resolve,reject){
        
        for (var i = 0; i < employees.length; i++) {
            if (employees[i].isManager == true){
                    managersList[i] = employees[i];
            }
        }

        if (managersList.length == 0) {
                reject("No results returned. Manager array is empty.")
        }
        resolve(managersList);
    }); 
} old function */

module.exports.getDepartments = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function() {
            resolve(Department.findAll());
       }).catch (function (err) {
            reject("No results returned");
       });
    });
}

module.exports.addEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function() {
           for (let i in employeeData) {
               if (employeeData[i] == "") {
                   employeeData[i] = null;
               }
           }
           
           Employee.create({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addresCity: employeeData.addresCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
           });
       }).then(function(){ 
           resolve();
        }).catch (function (err) {
            reject("Unable to create employee");
       });
    });
}


module.exports.updateEmployee = (employeeData) => {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function() {
            for (let i in employeeData) {
                if (employeeData[i] == "") {
                    employeeData[i] = null;
                }
            }

            Employee.update({
             employeeNum: employeeData.employeeNum,
             firstName: employeeData.firstName,
             lastName: employeeData.lastName,
             email: employeeData.email,
             SSN: employeeData.SSN,
             addressStreet: employeeData.addressStreet,
             addresCity: employeeData.addresCity,
             addressState: employeeData.addressState,
             addressPostal: employeeData.addressPostal,
             maritalStatus: employeeData.maritalStatus,
             isManager: employeeData.isManager,
             employeeManagerNum: employeeData.employeeManagerNum,
             status: employeeData.status,
             department: employeeData.department,
             hireDate: employeeData.hireDate
            }, { where: {
                employeeNum: employeeData.employeeNum }

        }).then(function(){ 
            resolve();
         }).catch (function (err) {
             reject("Unable to update employee");
            });
        });
    });

}

module.exports.addDepartment = (departmentData) => {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function() {
           for (let i in departmentData) {
               if (departmentData[i] == "") {
                   departmentData[i] = null;
               }
           }
           
           Department.create({
            departmentId : departmentData.departmentId,
            departmentName : departmentData.departmentName
           });
       }).then(function(){ 
           resolve();
        }).catch (function (err) {
            reject("Unable to create department");
       });
    });
}

module.exports.updateDepartment = (departmentData) => {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function() {
           for (let i in departmentData) {
               if (departmentData[i] == "") {
                   departmentData[i] = null;
               }
           }
           
           Department.update({
            departmentId : departmentData.departmentId,
            departmentName : departmentData.departmentName
           }, { where: {
            departmentId : departmentData.departmentId }
       }).then(function(){ 
           resolve();
        }).catch (function (err) {
            reject("Unable to update department");
             });
        });
    });
}

module.exports.getDepartmentById = (id) => {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function() {
            Department.findAll({
                where: { 
                   departmentId: id
                }}
            ).then(function(data){  
                resolve(data[0]);
            }).catch (function (err) {
            reject("No results returned");
            });
        });
    })
}

module.exports.deleteEmployeeByNum = (num) => {
    return new Promise(function(resolve,reject){
        sequelize.sync().then(function(){
            Employee.destroy({
                where: {
                    employeeNum: num
                }
            }).then(function(){
                resolve();
            }).catch(function(err){
                reject(err);
            })
        })
    })
}