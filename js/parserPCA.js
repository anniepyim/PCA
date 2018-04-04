var mainframe = require('./views/mainframe.js');
mainframe = new mainframe();

function parserPCA(){}

function parse(drawPCA,onError,init,parameter,sessionid,svg,pyScript){
    
    if(init == "all"){
        
        //RUN python script that calls R script to do PCA analysis
        jQuery.ajax({
            url: pyScript, 
            data: parameter,
            type: "POST",
            dataType: "text",    
            success: function (result) {
                
                // Somehow python returns the targeturl with newline at the end, so I have to trim it
                var targeturl = result.trim();

                var el = document.getElementById( svg );
                while (el.hasChildNodes()) {el.removeChild(el.firstChild);}
                mainframe.setElement('#'+svg).renderPCA();
                

//Retrieve files result from the python+R script runs and 
                var folderurl = '.'+targeturl; //tell the next ajax script what is the target url
                var htmltext = "",
                value = "",
                text = "";

                jQuery.ajax({
                    type: "POST",
                    url: "./php/getdirectory.php",
                    dataType: "json",
                    data: { folderurl : folderurl },
                  success: function(data){
                      
                      $('#pcafolders').empty();
                      $.each(data, function(i,filename) {
                        value = targeturl+filename;
                        text = filename.split("-pca")[0];
                        htmltext = htmltext+'<option value=\"'+value+'\">'+text+'</option>';

                    });

                    $("#pcafolders").html(htmltext);
                    $('#pcafolders').selectpicker('refresh');
                    $('#pcafolders').find('[value="'+targeturl+'All Processes-pca.json"]').prop('selected',true);
                    $('#pcafolders').selectpicker('refresh');

                    //Update the PCA plot by calling the functions upon changing folders
                    $('#pcafolders').on('change',function(){
                        parse(drawPCA,onError,"folder");
                    });

                  },
                    error: function(e){
                        console.log(e);
                    }
                });
                
                //call the function to drawPCA
                var process = targeturl+"All Processes-pca.json";

                jQuery.ajax({
                    url: process,  // or just tcga.py
                    dataType: "json",    
                    success: function (result) {
                        drawPCA(result,init,onError);
                    },
                    error: function(e){
                        console.log(e);
                    }
                });

            },
            error: function(e){
                onError(e);
            }
        });
        
    }else{
        var process = $("#pcafolders option:selected").val();

        jQuery.ajax({
            url: process,  // or just tcga.py
            dataType: "json",    
            success: function (result) {
                drawPCA(result,init,onError);
            },
            error: function(e){
                console.log(e);
            }
        });
    }
    

    
}

parserPCA.parse = parse;

module.exports = parserPCA;


