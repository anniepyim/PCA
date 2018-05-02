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
            success: function (data) {
                
                var el = document.getElementById( svg );
                while (el.hasChildNodes()) {el.removeChild(el.firstChild);}
                mainframe.setElement('#'+svg).renderPCA();
                
                //Improvement: python data in dictionary with Process name and file name (in processeID instead of name), no need to do the spliting this way
                var htmltext = "";
                $('#pcafolders').empty();
                $.each(data, function(i,url) {
                    urlbd = url.split("/");
                    mitoprocess = urlbd[urlbd.length-1].split(".json")[0].split("_")[1];
                    htmltext = htmltext+'<option value=\"'+url+'\">'+mitoprocess+'</option>';
                });

                $("#pcafolders").html(htmltext);
                $('#pcafolders').selectpicker('refresh');
                $('#pcafolders').find('[value="'+data[0]+'"]').prop('selected',true);
                $('#pcafolders').selectpicker('refresh');

                //Update the PCA plot by calling the functions upon changing folders
                $('#pcafolders').on('change',function(){
                    parse(drawPCA,onError,"folder");
                });

                parse(drawPCA,onError,"folder",parameter,sessionid,svg,pyScript);

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


