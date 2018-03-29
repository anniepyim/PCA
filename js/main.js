var PCA = {};
var parserPCA = require('./parserPCA.js');
var PCdata = require('./svgs/pcdata.js');
var pcPlot = require('./svgs/pcPlot.js');
var PCBC = require('./svgs/pcbarchart.js');

var canvasbc,context,startWidth, startHeight;

PCA.init = function(json,jsonGroupCount,sessionid,parameter,svg,pyScript,onError){ 
    
    if (jQuery.isEmptyObject(json)) onError(new Error('Please add samples!'));
    if ((jsonGroupCount >= 1 && jsonGroupCount < 4) || (json.length >= 1 && json.length < 4)) onError(new Error('Please add at least 4 samples!')); 
    
    var init = "all";

    parserPCA.parse(drawPCA,onError,init,parameter,sessionid,svg,pyScript);
    
};

function drawCustom(cat,pccolor,indata,startHeight,startWidth) {
    
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

  var detachedContainer = document.createElement("custom");
  // Create a d3 selection for the detached container. We won't
  // actually be attaching it to the DOM.
  var dataContainer = d3.select(detachedContainer);

  var BARmargin = {top: 30, right: 20, bottom: 15, left: 10},
      svgWidth = 150,
      barH = 20,
      BARwidth = svgWidth - BARmargin.left - BARmargin.right,
      BARheight = data.length * barH,
      svgHeight = BARheight + BARmargin.top + BARmargin.bottom;


  var xmax = Math.abs(d3.max(data, function (d) {
      return d.count;
  }));

  var x = d3.scale.linear()
    .range([0, BARwidth])
    .domain([0,xmax]);

  var dataBinding = dataContainer.selectAll("custom")
    .data(data);

  dataBinding.enter()
  .append("custom")
  .classed("title",true)
    .attr("x", startWidth+BARmargin.right + 7)
    .attr("y", startHeight+BARmargin.top-10)
    .text(cat);

  // for new elements, create a 'custom' dom node, of class rect
  // with the appropriate rect attributes
  dataBinding.enter()
      .append("custom")
      .classed("rect", true)
      .attr("x", startWidth+BARmargin.right)
      .attr("y", function(d,i){return i*barH+startHeight+BARmargin.top;})
      .attr("height", barH)
      .attr("width", function(d) { return x(d.count); })
      .attr("fillStyle", function (d) {
                return pccolor(d.key);
            });

  dataBinding.enter()
  .append("custom")
  .classed("text",true)
    .attr("x", startWidth+BARmargin.right + 7)
    .attr("y", function(d,i){return i*barH + 5+ barH/2 + startHeight+BARmargin.top;})
    .text(function(d) { return d.key+" ("+d.count+")"; });

  drawCanvas(dataContainer,startHeight);

  return svgHeight + startHeight;
}

function drawCanvas(dataContainer,startHeight) {

  // clear canvas
  context.fillStyle = "#fff";
  context.rect(0,startHeight,900,500);
  context.fill();

  var elements = dataContainer.selectAll("custom.rect");
  elements.each(function(d) {
    var node = d3.select(this);

    context.beginPath();
    context.fillStyle = node.attr("fillStyle");
    context.rect(node.attr("x"), node.attr("y"), node.attr("width"), node.attr("height"));
    context.fill();
    context.closePath();

  });

  var elements2 = dataContainer.selectAll("custom.text");
  elements2.each(function(d) {
    var node = d3.select(this);
    context.beginPath();
    context.fillStyle = "black";
    context.font = "12px Montserrat, Arial";
    context.fillText(node.text(),node.attr("x"),node.attr("y"));
    context.closePath();
  });

  var elements3 = dataContainer.selectAll("custom.title");
  elements3.each(function(d) {
    var node = d3.select(this);
    context.beginPath();
    context.fillStyle = "black";
    context.font = "16px Montserrat, Arial";
    context.fillText(node.text().toUpperCase(),node.attr("x"),node.attr("y"));
    context.closePath();
  });

}
function drawPCA(data,init,onError){
    
    filetype = data[0].filetype;
    d3.json("main_files/color.json", function(error,pccolor) {
        var attr = [],
            thiscat,
            prdata;

        //I. DEFINE parameters for attr, colors, and which particular attr, ie cat is selected
        //Define pccolor
        
        pccolor = pccolor[filetype];
        
        for (var key in pccolor){
            if (data[0].hasOwnProperty(key)){
                pccolor[key] = d3.scale.ordinal().range(pccolor[key]);
                attr.push(key);   
            }
        }

        //Define this cat
        var element = document.getElementsByClassName('pcbc');
        if (attr !== undefined) {thiscat = attr[0];}
        for (i=0;i<element.length;i++){
            if (element[i].style.background.substring(0,18)=="rgb(179, 204, 255)") {
                thiscat = element[i].id.slice(0, -5);
            }
        }    

        //II. PROCESS data for PCA and barcharts
        prdata = PCdata.init(data,attr,pccolor,thiscat);


        //IIIa. INITIATE PCA upon new analysis or changing folders
        if (init == "all" || init == "folder") {
            d3.select("#pcacanvas").remove();
            pcPlot.init();
        }

        //IIIb. DRAW PCA dots
        pcPlot.deletedots();
        pcPlot.adddots(prdata,attr);
        
        $("#pca").click(function(event){
            if (event.target.getAttribute('id') != "pcacanvas"){
                
                $('#rowtip2').empty();
                INTERSECTED = null;
                $('#rowtip2').css('display', 'none');
                $('#rowtip1').css('display', '');
            }    
        });  

        //Draw canvas for screen capture
        canvasbc = document.getElementById("test2");
        context = canvasbc.getContext("2d");
        startHeight = 0;
        startWidth = 0;
        canvasbc.width = 150;

        context.clearRect(0, 0, canvasbc.width, canvasbc.height);

        //IV. DRAW BARCHART with processed data if its a new analysis
        if (init == "all"){

            var clicking = function(){parserPCA.parse(drawPCA,onError,"update");};

            for (key in pccolor){
                if (prdata[0].hasOwnProperty(key)){
                    var color = pccolor[key],
                        barchartname = key + 'barchart',
                        panelname = key + 'panel';

                    PCBC.draw(prdata,color,key,barchartname,panelname);

                    startHeight = drawCustom(key,color,prdata,startHeight,startWidth);


                    var d3panelname = '#'+panelname;

                    d3.select(d3panelname)
                        .on({"click": clicking});
                }
            }

            //JQuery that controls the behaviour of Barchart
            $('.pcbc').css('background','white');

            $('.pcbc').on({
            'click': function(){
                $('.pcbc').css('background','white');
                $(this).css('background','#b3ccff');
            },
            'mouseenter': function(){$(this).css('border','1px solid #6699ff');},
            'mouseleave': function(){$(this).css('border','');}
            }) ;     

            //Set the default panel - the one that will be painted on PC plot to be the first attr
            var defaultpanel = '#' +attr[0]+'panel';
            $(defaultpanel).css('background','#b3ccff');

        }
    
    });
    
}

//Export as App so it could be App.init could be called
module.exports = PCA;