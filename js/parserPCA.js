var mainframe = require('./views/mainframe.js');
mainframe = new mainframe();

function parserPCA(){}

function parse(drawPCA,onError,init,svg,data_urls){
    
    if(init == "all"){
        
        var el = document.getElementById( svg );
        while (el.hasChildNodes()) {el.removeChild(el.firstChild);}
        mainframe.setElement('#'+svg).renderPCA();
        
        //Improvement: python data in dictionary with Process name and file name (in processeID instead of name), no need to do the spliting this way
        var htmltext = "";
        $('#pcafolders').empty();
        $.each(data_urls, function(i,url) {
            urlbd = url.split("/");
            mitoprocess = urlbd[urlbd.length-1].split(".json")[0];
            htmltext = htmltext+'<option value=\"'+url+'\">'+mitoprocess+'</option>';
        });

        $("#pcafolders").html(htmltext);
        $('#pcafolders').selectpicker('refresh');
        $('#pcafolders').find('[value="'+data_urls[0]+'"]').prop('selected',true);
        $('#pcafolders').selectpicker('refresh');

        //Update the PCA plot by calling the functions upon changing folders
        $('#pcafolders').on('change',function(){
            parse(drawPCA,onError,"folder");
        });

        parse(drawPCA,onError,"folder");
        
    }else{
        var target_url = $("#pcafolders option:selected").val();

        d3.json(target_url, function(error, data){

            if (error) onError(new Error(error));

            drawPCA(data,init,onError);
        });
    }
    
}

parserPCA.parse = parse;

module.exports = parserPCA;


