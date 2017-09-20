var d3 = require('d3');
var pcPlot = require('./pcPlot.js');

var PCdata = function (obj) {
    if (obj instanceof PCdata) return obj;
    if (!(this instanceof PCdata)) return new PCdata(obj);
    this.PCdatawrapped = obj;
};

PCdata.init = function (indata,attr,pccolor,cat) {
    
    //Scaling for PCA data
    var xmax = d3.max(indata, function (d) {return d.PC1;}),
        xmin = d3.min(indata, function (d) {return d.PC1;}),
        zmax = d3.max(indata, function (d) {return d.PC2;}),
        zmin = d3.min(indata, function (d) {return d.PC2;}),
        ymax = d3.max(indata, function (d) {return d.PC3;}),
        ymin = d3.min(indata, function (d) {return d.PC3;});

    var xDom = (xmax-xmin)*0.1,
        yDom = (ymax-ymin)*0.1,
        zDom = (zmax-zmin)*0.1;

    var xScale = d3.scale.linear()
                  .domain([xmin-xDom,xmax+xDom])
                  .range([-100,100]);
    var yScale = d3.scale.linear()
                  .domain([ymin-yDom,ymax+yDom])
                  .range([-100,100]);                  
    var zScale = d3.scale.linear()
                  .domain([zmin-zDom,zmax+zDom])
                  .range([-100,100]);

    
    //prdata - Scaled data addded
    var prdata = indata;
    
    prdata.forEach(function (d) {
            d.PC1 = xScale(d.PC1);
            d.PC2 = zScale(d.PC2);
            d.PC3 = yScale(d.PC3);
        });
    
    var sorting = function(a,b) {return d3.ascending(a[attr[i]], b[attr[i]]);};
    var naming = function (d) {d[colorname] = pccolor[attr[i]](d[attr[i]]);};
    //prdata - Assign color to each attribute
    if(attr.length > 0){
        for (i = 0; i < attr.length; i++){
            prdata.sort(sorting);

            var colorname = attr[i] + 'color';

            prdata.forEach(naming);
        }
        
        //prdata - If attr exist, Set the default color to the color of attr and prepare for tooltip
        var defaultcolor = cat + 'color';
        prdata.forEach(function (d) {
            d.color = d[defaultcolor];
            d.attrexist = true;
        });
    }else{
        prdata.forEach(function (d) {
            d.color = '#ff004d';
            d.attrexist = false;
        });
    }
    
    //Add Criteria if exist
    var element = document.getElementsByClassName('pcbc');
    var newdata;
    if (!!element[0]) newdata = addCriteria(prdata,attr);
    else newdata = prdata;
    
    //RETURN the processed data for other purposes, e.g. barchart
    return newdata;
};

PCdata.update = function (prdata,attr,cat){
    
    //Add Criteria if exist
    var element = document.getElementsByClassName('pcbc');
    var newdata;
    if (!!element[0]) newdata = addCriteria(prdata,attr);
    else newdata = prdata;
    
    if(attr !== undefined){
        var colorname = cat + 'color';
    
        newdata.forEach(function (d) {
            d.color = d[colorname];
        });
    }
    pcPlot.deletedots();
    pcPlot.adddots(newdata,attr);
};

function addCriteria(prdata,attr){
    
    var newdata = [],
        criteria = [];
    
    for (i=0; i<attr.length; i++){
        var criterianame = attr[i] + 'criteria';
        criteria[i] = document.getElementById(criterianame).value.split(",");
        criteria[i].pop();
    }
    
    
    prdata.forEach(function(d){
        var valid = true;
        for (i=0; i<attr.length; i++){
            valid = (contains.call(criteria[i],d[attr[i]]) || criteria[i].length === 0) ? valid : false;
        }
        if (valid === true){
            newdata.push(d);
        }
        
    });
    
    
    return newdata;
    
}

var contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                var item = this[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};


if (typeof define === "function" && define.amd) {
    define(PCdata);
} else if (typeof module === "object" && module.exports) {
    module.exports = PCdata;
} else {
    this.PCdata = PCdata;
}
