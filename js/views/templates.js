var glob = ('undefined' === typeof window) ? global : window,

Handlebars = glob.Handlebars || require('handlebars');

this["Templates"] = this["Templates"] || {};

this["Templates"]["PCA"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"pca\" class=\"col-md-9\"></div>\n<div id=\"pcbarchart\" class=\"col-md-3\">\n        <div class=\"col-md-12 midtitle\" style=\"margin-top:20px;\">\n            Show PCA by Processes\n        </div>\n        <div class=\"col-md-12\" style=\"margin-top:10px;\">\n            <select class=\"selectpicker\" id=\"pcafolders\" data-style=\"btn-default\" title=\"Pick process\" data-width=\"175px\">\n            </select>\n        </div>\n        <div class=\"col-md-12\"><hr></div>\n        <div class=\"col-md-12 midtitle\" style=\"margin-top:0px;margin-bottom:10px;\">\n            Color samples by\n        </div>\n</div>\n<div class=\"col-md-3\">\n    <div class=\"col-md-12\">\n            <div id=\"pcbcsvg\" class=\"panel-group\">\n        </div>\n    </div>\n    <div class = \"col-md-12\" id=\"criteriabutton\"></div>\n    <div class = \"col-md-12\" id=\"pcbctext\" style=\"display:none\">\n    </div>\n</div>";
},"useData":true});

this["Templates"]["PCA_barchart"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"panel panel-default pcbc\" id=\""
    + alias4(((helper = (helper = helpers.panelname || (depth0 != null ? depth0.panelname : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"panelname","hash":{},"data":data}) : helper)))
    + "\" style=\"background:#b3ccff\">\n    <div class=\"minititle\" style=\"padding: 10px 10px;\">\n        <a data-toggle=\"collapse\" href=\"#"
    + alias4(((helper = (helper = helpers.collapse || (depth0 != null ? depth0.collapse : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collapse","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</a>\n    </div>\n    <div id=\""
    + alias4(((helper = (helper = helpers.collapse || (depth0 != null ? depth0.collapse : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collapse","hash":{},"data":data}) : helper)))
    + "\" class=\"panel-collapse collapse-in\">\n        <div class=\"panel-body svg-container\" id=\""
    + alias4(((helper = (helper = helpers.svgname || (depth0 != null ? depth0.svgname : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"svgname","hash":{},"data":data}) : helper)))
    + "\" style=\"padding :0px 0px; font-size:20px\"></div>\n    </div>\n</div>\n\n ";
},"useData":true});

this["Templates"]["PCA_tooltip"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.attributes || (depth0 != null ? depth0.attributes : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"attributes","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),options) : helper));
  if (!helpers.attributes) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"2":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"col-md-6 miniTitle\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</div>\n\n<div class=\"col-md-6 info\">"
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "</div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"col-md-12 title\">"
    + alias4(((helper = (helper = helpers.sampleID || (depth0 != null ? depth0.sampleID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sampleID","hash":{},"data":data}) : helper)))
    + "</div>\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.attrexist : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n<div class=\"col-md-12 miniTitle\">PC</div>\n\n\n<div class=\"col-md-12\" style=\"text-align:left;font-size:12px\">\n    PC1: "
    + alias4(((helper = (helper = helpers.PC1 || (depth0 != null ? depth0.PC1 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"PC1","hash":{},"data":data}) : helper)))
    + "<br>\n    PC2: "
    + alias4(((helper = (helper = helpers.PC2 || (depth0 != null ? depth0.PC2 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"PC2","hash":{},"data":data}) : helper)))
    + "<br>\n    PC3: "
    + alias4(((helper = (helper = helpers.PC3 || (depth0 != null ? depth0.PC3 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"PC3","hash":{},"data":data}) : helper)))
    + "\n</div>\n    \n";
},"useData":true});

if (typeof exports === 'object' && exports) {module.exports = this["Templates"];}