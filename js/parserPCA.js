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
            dataType: "json",    
            success: function (result) {
                
                var el = document.getElementById( svg );
                while (el.hasChildNodes()) {el.removeChild(el.firstChild);}
                mainframe.setElement('#'+svg).renderPCA();
                

                //Retrieve files result from the python+R script runs and 
                var targeturl = './data/user_uploads/'+sessionid+'/PCA/';
                var folderurl = '.'+targeturl;
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
                    $('#pcafolders').find('[value="./data/user_uploads/'+sessionid+'/PCA/All Processes-pca.json"]').prop('selected',true);
                    $('#pcafolders').selectpicker('refresh');
                  },
                    error: function(e){
                        console.log(e);
                    }
                });

                //Update the PCA plot by calling the functions upon changing folders
                $('#pcafolders').on('change',function(){
                    parse(drawPCA,onError,"folder");
                });
                
                //call the function to drawPCA
                drawPCA(result,init,onError);
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


