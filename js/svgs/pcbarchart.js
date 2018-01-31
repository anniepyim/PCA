var d3 = require('d3');
//var pcPlot = require('./pcPlot.js');
var PCdata = require('./pcdata.js');
var pcbcsvgTemplate = require('../views/templates').PCA_barchart;

var PCBC = function (obj) {
    if (obj instanceof PCBC) return obj;
    if (!(this instanceof PCBC)) return new PCBC(obj);
    this.PCBCwrapped = obj;
};

PCBC.draw = function (indata,pccolor,cat,svgname,panelname) {
        
        //console.log(pccolor);
        //pccolor = d3.scale.ordinal().range(pccolor);
        
        //RENDER barchart panels for svgs
        var element = document.getElementById(panelname);
        var criteria = cat + 'criteria';
        
        if(!element){
            var Obj = {};
            Obj.panelname = panelname;
            Obj.svgname = svgname;
            Obj.name = cat;
            Obj.collapse = 'col'+panelname;
            
            var newcontent = pcbcsvgTemplate(Obj);
            $('#pcbcsvg').append(newcontent); 
            $('#pcbctext').append('<input type="text" id="'+criteria+'">');
        }
        
        //PROCESS data for barchart
        var prdata = indata.map(function(d){return{cat: d[cat]};});
        
        prdata.sort(function(a,b) { return d3.ascending(a.cat, b.cat);});
        
        var data = d3.nest()
                .key(function (d) {
                    return d.cat;
                })
                .entries(prdata);

        data.forEach(function (d) {
                d.count = d.values.length;
            });
        
        //RENDER barchart svg
        var d3svgname = '#'+svgname;
        
        var BARmargin = {top: 15, right: 20, bottom: 15, left: 10},
            svgWidth = 300,
            barH = 40,
            BARwidth = svgWidth - BARmargin.left - BARmargin.right,
            BARheight = data.length * barH,
            svgHeight = BARheight + BARmargin.top + BARmargin.bottom,
            currentOpacity = 0;
        

        var BARsvg = d3.select(d3svgname)//= resp
            .append("svg")
            .attr('class', 'canvas svg-content-responsive pcbcchild')
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .attr('viewBox', [0, 0, svgWidth, svgHeight].join(' '))
            .append("g")
            .attr("transform", "translate(" + BARmargin.left + "," + BARmargin.top + ")");    
        
        var xmax = Math.abs(d3.max(data, function (d) {
            return d.count;
        }));

        var x = d3.scale.linear()
        .range([0, BARwidth])
        .domain([0,xmax]);

      var bar = BARsvg.selectAll("g")
          .data(data)
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * barH + ")"; });
        
    
        bar.append("rect")
          .attr("width", function(d) { return x(d.count); })
          .attr("height", barH - 1)
          .style("fill", function (d) {
                return pccolor(d.key);
            })
          .on("click", function(d){
                var currentOpacity = d3.select(this.parentNode).select('line').style('opacity');
                currentOpacity = (currentOpacity == 0) ? 1 : 0;
                d3.select(this.parentNode).select('line').style('opacity',currentOpacity);
                addOrRemoveCriteria(criteria,d.key,currentOpacity);
            });

        bar.append("text")
          .attr("x", 7)
          .attr("y", barH / 2)
          .attr("dy", ".35em")
          .text(function(d) { return d.key+" ("+d.count+")"; })
          .style("font-size","20px")
          .style("font-family", 'Montserrat, Arial')
          .on("click", function(d){
                var currentOpacity = d3.select(this.parentNode).select('line').style('opacity');
                currentOpacity = (currentOpacity == 0) ? 1 : 0;
                d3.select(this.parentNode).select('line').style('opacity',currentOpacity);
                addOrRemoveCriteria(criteria,d.key,currentOpacity);
            });
    
        bar.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", barH - 1)
          .attr("stroke-width", 5)
          .attr("stroke", "#595959")
          .attr("opacity",0);

    
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
    
    function addOrRemoveCriteria(criteria,key,select){
        
        var text = document.getElementById(criteria);
        crit = text.value.split(",");
        crit.pop();
        
        if (!contains.call(crit,key) && select == 1){
            text.value = (text.value + key+",");

            /*var button = document.createElement("button");
            button.className = "btn btn-xs btn-default criteriabut";
            var textnode = document.createTextNode(key);
            button.appendChild(textnode);
            var gly = document.createElement("span");
            gly.className = "glyphicon glyphicon-trash";
            button.appendChild(gly);
            button.onclick = function(e){
                var array = document.getElementById(criteria).value.split(",");
                var index = array.indexOf(key);
                if (index > -1) {array.splice(index, 1);}
                document.getElementById(criteria).value = array.toString();
                this.parentNode.removeChild(this);
                
                var element = document.getElementsByClassName('pcbc');
                var thiscat;
                for (e in element) if (element.hasOwnProperty(e)){
                    if (element[e].style.background=="rgb(179, 204, 255)") {
                        thiscat = element[e].id.slice(0, -5);
                    }
                }
                
                PCdata.update(indata,attr,thiscat);
            };
            document.getElementById("criteriabutton").appendChild(button); */  
        }else if(select === 0){
                    
            var array = document.getElementById(criteria).value.split(",");
            var index = array.indexOf(key);
            if (index > -1) {array.splice(index, 1);}
            document.getElementById(criteria).value = array.toString();
 
        }
    }

};


if (typeof define === "function" && define.amd) {
    define(PCBC);
} else if (typeof module === "object" && module.exports) {
    module.exports = PCBC;
} else {
    this.PCBC = PCBC;
}