var d3 = require('d3');
var THREE = require ('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var tipTemplate = require('../views/templates').PCA_tooltip;

var div = d3.select("#pca").append("div")
.attr("class", "tooltip")
.style("opacity", 0);    

var scene, camera, renderer, controls, pcObj, boxes, dots, raycaster;
var mouse = new THREE.Vector2(), INTERSECTED,
    pageEvent = new THREE.Vector2();
var canvasWidth= Math.round(document.getElementById("svgs-all").offsetWidth*9/12-40),
    canvasHeight = canvasWidth;
var gridDepth = 100,
    gridWidth = 100,
    gridHeight = 100;
var rotate = true, mouseflag = 0;
var container,
    pcacanvas;

var pcPlot = function (obj) {
if (obj instanceof pcPlot) return obj;
if (!(this instanceof pcPlot)) return new pcPlot(obj);
this.pcPlotwrapped = obj;
};

function sceneInit(){
    
    var canv = document.createElement('canvas');
    canv.id = 'pcacanvas';

    document.getElementById('pca').appendChild(canv);
    
    container = document.getElementById( 'pca' );
    pcacanvas = document.getElementById( 'pcacanvas' );
    
    scene = new THREE.Scene();

    var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );

    var alight = new THREE.AmbientLight( 0xffffff, 0.5 );
    scene.add( alight );

    camera = new THREE.PerspectiveCamera( 75, canvasWidth/canvasHeight, 0.1, 1000 );
    camera.position.z = 250;
    
    renderer = new THREE.WebGLRenderer({ canvas: pcacanvas });
    renderer.setSize( canvasWidth, canvasWidth );
    renderer.setClearColor( 0xffffff );

    raycaster = new THREE.Raycaster();

    pcObj = new THREE.Object3D();
    scene.add(pcObj);
    pcObj.rotation.y = -0.3;
    pcObj.rotation.x = 0.2;
    pcObj.position.x = 20;
    pcObj.position.y = 30;

    container.appendChild( renderer.domElement );
    container.addEventListener( 'mousemove', onDocumentMouseMove, false );
    container.addEventListener( 'click', onDocumentMouseClick);
    container.addEventListener("mousedown", function(){mouseflag = 0;}, false);
    container.addEventListener("mouseup", function(){if(mouseflag === 0) rotate=!rotate;},false);
    window.addEventListener( 'resize', onWindowResize, false );
    
    controls = new OrbitControls( camera,renderer.domElement );

}    

function createTextCanvas(text, color, font, size) {
    size = size || 16;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var fontStr = (size + 'px ') + (font || 'Arial');
    ctx.font = fontStr;
    var w = ctx.measureText(text).width;
    var h = Math.ceil(size);
    canvas.width = w;
    canvas.height = h;
    ctx.font = fontStr;
    ctx.fillStyle = color || 'black';
    ctx.fillText(text, 0, Math.ceil(size * 0.8));
    return canvas;
}

function createText2D(text, color, font, size, segW, segH) {
    var canvas = createTextCanvas(text, color, font, size);
    var plane = new THREE.PlaneGeometry(canvas.width, canvas.height, segW, segH);
    var tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    var planeMat = new THREE.MeshBasicMaterial({
        map: tex,
        color: 0xffffff,
        transparent: true
    });
    var mesh = new THREE.Mesh(plane, planeMat);
    mesh.scale.set(0.5, 0.5, 0.5);
    mesh.doubleSided = true;
    return mesh;
}

function gridInit(gridDepth,gridWidth,gridHeight){

    var grid = new THREE.Object3D();
    var planeXY = new THREE.GridHelper( gridHeight, 20, 0x000000, 0x000000 ),
        planeYZ = new THREE.GridHelper( gridDepth, 20, 0x000000, 0x000000 ),
        planeXZ = new THREE.GridHelper( gridWidth, 20, 0x000000, 0x000000 );

    grid.add(planeXY);
    grid.add(planeYZ);
    grid.add(planeXZ); 

    planeXY.position.y = -gridHeight;
    planeYZ.position.z = -gridDepth;
    planeYZ.rotation.x = Math.PI/2;
    planeXZ.position.x = -gridWidth;
    planeXZ.rotation.z = Math.PI/2;

    var labelXZ = createText2D("PC1");
    grid.add(labelXZ);
       labelXZ.position.x = gridWidth*1.1;
       labelXZ.position.y = -gridHeight;

    var labelXY = createText2D("PC2");
    grid.add(labelXY);
       labelXY.position.x = gridWidth*1.1;
       labelXY.position.z = -gridDepth;

    var labelYZ = createText2D("PC3");
    grid.add(labelYZ);
       labelYZ.position.x = -gridWidth*1.1;
       labelYZ.position.z = gridDepth;

    pcObj.add(grid);
}

function hexToRgb(hex) { //TODO rewrite with vector output
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function dotsInit(data,attr){
        
    dots = new THREE.Object3D();
    
    var format = d3.format("+.2f");

    for ( i = 0; i < data.length; i ++ ) {
        var realcolor = data[i].color;
        var geometry = new THREE.SphereBufferGeometry( 3, 32, 32 );
        var material = new THREE.MeshLambertMaterial( { color: new THREE.Color().setRGB( hexToRgb(realcolor).r / 255, hexToRgb(realcolor).g / 255, hexToRgb(realcolor).b / 255 ) } );
        var particle = new THREE.Mesh( geometry, material );
        particle.position.x = data[i].PC1;
        particle.position.z = data[i].PC2;
        particle.position.y = data[i].PC3;
        particle.sampleID = data[i].sampleID;
        particle.url = data[i].url;
        particle.PC1 = format(data[i].PC1);
        particle.PC2 = format(data[i].PC2);
        particle.PC3 = format(data[i].PC3);
        
        particle.attrexist = data[i].attrexist;
        
        if (particle.attrexist){
            particle.attributes = [];
            for (j=0; j<attr.length; j++){
                particle[attr[j]] = data[i][attr[j]];
                var attribute = {};
                attribute.name = attr[j];
                attribute.value = data[i][attr[j]];
                particle.attributes.push(attribute);
            }
        }
    
        dots.add(particle);
    }
    pcObj.add(dots);
    
}

function boxInit(){

    var geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );

    boxes = new THREE.Object3D();

    for ( var i = 0; i < 2000; i ++ ) {

      var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

      object.position.x = Math.random() * 800 - 400;
      object.position.y = Math.random() * 800 - 400;
      object.position.z = Math.random() * 800 - 400;

      object.rotation.x = Math.random() * 2 * Math.PI;
      object.rotation.y = Math.random() * 2 * Math.PI;
      object.rotation.z = Math.random() * 2 * Math.PI;

      object.scale.x = Math.random() + 0.5;
      object.scale.y = Math.random() + 0.5;
      object.scale.z = Math.random() + 0.5;

      boxes.add( object );
    }

    pcObj.add(boxes);

}

function onDocumentMouseMove( event ) {

    event.preventDefault();
    
    var rect = pcacanvas.getBoundingClientRect();

    mouse.x = ( ( event.clientX - rect.left ) / renderer.domElement.width ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / renderer.domElement.height ) * 2 + 1;

    pageEvent.x = event.clientX - rect.left;
    pageEvent.y = event.clientY - rect.top;

    mouseflag = 1;

  }

function onDocumentMouseClick( event ) {

    event.preventDefault();
    
    var selected = $("#groups option:selected").val();
    if (selected == "") {
        selected = "selected-sample";
    }
    
    var rect = pcacanvas.getBoundingClientRect();

    mouse.x = ( ( event.clientX - rect.left ) / renderer.domElement.width ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / renderer.domElement.height ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( dots.children ); 
    INTERSECTED = intersects[ 0 ].object;
    
    var dotvalue = INTERSECTED.sampleID;
    
    if ($("#"+selected+" option[value='"+dotvalue+"']").length === 0){    
        var option = document.createElement("option");
        option.text = INTERSECTED.sampleID;
        option.value = INTERSECTED.sampleID;
        var select = document.getElementById(selected);
        select.appendChild(option);
    }

    
      

  }

function onWindowResize(){

    var w = document.getElementById("pca").offsetWidth-40;
    camera.aspect = w / w;
    camera.updateProjectionMatrix();

    renderer.setSize( w, w );

}

function render() {

    requestAnimationFrame( render );

    controls.update();

    renderer.render( scene, camera );

    //if (rotate) pcObj.rotation.y += 0.002;

    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( dots.children );

    if ( intersects.length > 0 ) {
        if ( INTERSECTED != intersects[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
            if (pageEvent.x !== 0 && pageEvent.y !== 0){
                $('.tip').empty();
                $('.tip').append(tipTemplate(INTERSECTED));
            }
        }   
    } else {
      if ( INTERSECTED ) {
          INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
          $('.tip').empty();
      }
      INTERSECTED = null;
    }

}

pcPlot.init = function(){
    sceneInit();
    gridInit(gridDepth,gridWidth,gridHeight);
    //dotsInit(d);
    //boxInit();
    //pcObj.add(new THREE.Mesh(new THREE.BoxBufferGeometry(100,100,100),new THREE.MeshNormalMaterial()))
    //pcObj.add(new THREE.Mesh(new THREE.BoxBufferGeometry(100,100,100),new THREE.MeshNormalMaterial()))
    //render();
};

pcPlot.deletedots = function(){
    pcObj.remove(dots);
    dots = null;
    //render();
};

pcPlot.adddots = function(d,attr){
    dotsInit(d,attr);
    render();
};

if (typeof define === "function" && define.amd) {
    define(pcPlot);
} else if (typeof module === "object" && module.exports) {
    module.exports = pcPlot;
} else {
    this.pcPlot = pcPlot;
}