var PCA = {};
var parserPCA = require('./parserPCA.js');
var PCdata = require('./svgs/pcdata.js');
var pcPlot = require('./svgs/pcPlot.js');
var PCBC = require('./svgs/pcbarchart.js');

PCA.init = function(json,jsonGroupCount,sessionid,parameter,svg,pyScript,onError){ 
    
    if (jQuery.isEmptyObject(json)) onError(new Error('Please add samples!'));
    if ((jsonGroupCount >= 1 && jsonGroupCount < 4) || (json.length >= 1 && json.length < 4)) onError(new Error('Please add at least 4 samples!')); 
    
    var init = "all";
    
    parserPCA.parse(drawPCA,onError,init,parameter,sessionid,svg,pyScript);
    
};

function drawPCA(data,init){
    
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

        //IV. DRAW BARCHART with processed data if its a new analysis
        if (init == "all"){

            var clicking = function(){parserPCA.parse(drawPCA,onError,"update");};

            for (key in pccolor){
                if (prdata[0].hasOwnProperty(key)){
                    var color = pccolor[key],
                        barchartname = key + 'barchart',
                        panelname = key + 'panel';

                    PCBC.draw(prdata,color,key,barchartname,panelname);

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