var clock;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var VIEW_ANGLE = 45;
var ASPECT = WIDTH / HEIGHT;
var NEAR = 1;
var FAR = 1000;
var lens;
var lensLine;
var centerDot;
var focusDot2;
var twoFocusDot2;
var focusDot1;
var twoFocusDot1;
var principalAxis;
var image;
var object;
var focus=7.5;
var length=3;
var animateRays=[];
var speed=0.005;
var lastX=0;
var count1;
var objectTex;
var imageTex;
var ray=[];
//Initialising the scene
function initialiseScene()
{
    clock=new THREE.Clock();
    PIEscene.add(new THREE.AmbientLight(0x606060));
    PIEscene.background=new THREE.Color( 0xbfd1e5 );
    PIEsetCameraFOV(45);
    PIEsetCameraAspect(ASPECT);
    PIEsetCameraDepth(FAR);
    PIEadjustCamera(0,0,80);
    var x = 0;
    var y = -10;

    var lensShape = new THREE.Shape();
    lensShape.moveTo(x,y);
    lensShape.quadraticCurveTo(x -5 , y +10, x , y +20);
    lensShape.quadraticCurveTo(x + 5,y+10, x, y );

    var extrudeSettings = {
      amount: 0,
      bevelEnabled: false,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1
    };
    var lensGeometry = new THREE.ExtrudeGeometry( lensShape, extrudeSettings );
    lens = new THREE.Mesh( lensGeometry, new THREE.LineBasicMaterial({color:"silver",opacity:0.8,transparent:true}) );
    lens.scale.x=1.2;
    PIEaddElement( lens );

    var material = new THREE.LineDashedMaterial({color: "black",dashSize: 1,gapSize: 0.3});
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3( 0, -10, 0 ));
    geometry.vertices.push(new THREE.Vector3( 0, 10, 0 ));
    geometry.computeLineDistances();
    lensLine = new THREE.Line( geometry, material );
    PIEaddElement(lensLine);

    var principalAxisMaterial = new THREE.LineBasicMaterial( { color: "black",linewidth:2} );
    var principalAxisGeometry = new THREE.Geometry();
    principalAxisGeometry.vertices.push(new THREE.Vector3( -50, 0, 0));
    principalAxisGeometry.vertices.push(new THREE.Vector3( 50, 0, 0));
    principalAxis=new THREE.Line( principalAxisGeometry, principalAxisMaterial );
    PIEaddElement(principalAxis);

    var geometryDot = new THREE.CircleBufferGeometry( 0.3, 32 );
    var materialDot = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    centerDot = new THREE.Mesh( geometryDot, materialDot );
    centerDot.position.set(0,0,0);
    PIEaddElement( centerDot );

    focusDot2=new THREE.Mesh( geometryDot, materialDot );
    focusDot2.position.set(7.5,0,0);
    PIEaddElement(focusDot2);

    twoFocusDot2=new THREE.Mesh( geometryDot, materialDot );
    twoFocusDot2.position.set(15,0,0);
    PIEaddElement(twoFocusDot2);

    focusDot1=new THREE.Mesh( geometryDot, materialDot );
    focusDot1.position.set(-7.5,0,0);
    PIEaddElement(focusDot1);

    twoFocusDot1=new THREE.Mesh( geometryDot, materialDot );
    twoFocusDot1.position.set(-15,0,0);
    PIEaddElement(twoFocusDot1);

    var loader = new THREE.FontLoader();
    loader.load("optimer.json", function(response)
    {
        font = response;

        var geometry = new THREE.TextGeometry("O", {
            font : font,
            size : 1,
            height : 10,
            curveSegments : 3
        });

        labelO=new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color:"black"}));
        labelO.translation = geometry.center();

        PIEaddElement(labelO);
        labelO.position.set(centerDot.position.x,-1.5,0);
        labelO.lookAt(PIEcamera.position);
        var geometry = new THREE.TextGeometry("2F1", {
            font : font,
            size : 1,
            height : 10,
            curveSegments : 3
        });

        labelTwoF1=new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color:"black"}));
        labelTwoF1.translation = geometry.center();
        PIEaddElement(labelTwoF1);
        labelTwoF1.position.set(twoFocusDot1.position.x,-1.5,0);
        labelTwoF1.lookAt(PIEcamera.position);

        var geometry = new THREE.TextGeometry("2F2", {
            font : font,
            size : 1,
            height : 10,
            curveSegments : 3
        });

        labelTwoF2=new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color:"black"}));
        labelTwoF2.translation = geometry.center();

        PIEaddElement(labelTwoF2);
        labelTwoF2.position.set(twoFocusDot2.position.x,-1.5,0);
        labelTwoF2.lookAt(PIEcamera.position);

        var geometry = new THREE.TextGeometry("F2", {
            font : font,
            size : 1,
            height : 10,
            curveSegments : 3
        });

        labelF2=new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color:"black"}));
        labelF2.translation = geometry.center();

        PIEaddElement(labelF2);
        labelF2.position.set(focusDot2.position.x,-1.5,0);
        labelF2.lookAt(PIEcamera.position);

        var geometry = new THREE.TextGeometry("F1", {
            font : font,
            size : 1,
            height : 10,
            curveSegments : 3
        });

        labelF1=new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color:"black"}));
        labelF1.translation = geometry.center();

        PIEaddElement(labelF1);
        labelF1.position.set(focusDot1.position.x,-1.5,0);
        labelF1.lookAt(PIEcamera.position);
    });

    objectTex = THREE.ImageUtils.loadTexture( 'texture/candle.gif' );
    addObject(twoFocusDot1.position.x,length,false);
    //object.position.x=0;
    manageDrag();

    PIEstartButton.onclick=function()
    {
      for(var i=ray.length-1;i>=0;i--)
      {
        PIEremoveElement(ray[i]);
        ray.pop();
      }
      for(var i=animateRays.length-1;i>=0;i--)
      {
        PIEremoveElement(animateRays[i]);
        animateRays.pop();
      }
      lastX=object.position.x;
      PIErender();
      PIEremoveDragElement(object);
    };
    PIEstopButton.onclick=function()
    {
      manageDrag();
    };
    //imageTex = THREE.ImageUtils.loadTexture( 'texture/candle.gif' );
    //addImage(twoFocusDot2.position.x,length,true);
    // setTextO();
    // setTextF1();
    // setTextTwoF1();
    // setTextF2();
    // setTextTwoF2();

    var material=new THREE.LineBasicMaterial( { color: "green",linewidth:2} );
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0,0,0));
    geometry.vertices.push(new THREE.Vector3(0,0,0));
    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    var material=new THREE.LineBasicMaterial( { color: "orange",linewidth:2} );
    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);
    //alert(animateRays.length);
    lastX=object.position.x;

    formRay();
    // document.getElementById("F2").innerHTML="<h2>F2</h2>";
    // document.getElementById("O").innerHTML="<h2>O</h2>";
    // document.getElementById("2F2").innerHTML="<h2>2F2</h2>";
    // document.getElementById("F1").innerHTML="<h2>F1</h2>";
    // document.getElementById("2F1").innerHTML="<h2>2F1</h2>";
    loadTexture();
    PIErender();
}

function loadExperimentElements()
{
    PIEsetExperimentTitle("Tracing rays at a convex lens");
    PIEsetDeveloperName("Rahul Raj");
    PIEsetAreaOfInterest(-60, 20, 60, -20);
    document.title = "Tracing rays at a convex lens";
    //PIEhideControlElement();
    initialiseHelp();
    initialiseInfo();
    initialiseScene();
    initialiseControls();
}

function manageDrag()
{
  PIEdragElement(object);
  PIEsetDragStart(object,function(){
    //PIEremoveElement(image);
    for(var i=animateRays.length-1;i>=0;i--)
    {
      PIEremoveElement(animateRays[i]);
      animateRays.pop();
    }
    PIErender();
   });
  PIEsetDragEnd(object,function(){
    object.position.y=length/2;
    if(object.position.x>=centerDot.position.x-2)
    {
      object.position.x=centerDot.position.x-2;
    }
    object.position.x=Math.round(object.position.x*10)/10;
    PIEchangeInputSlider("Incidence Point",(-1)*object.position.x);
    for(var i=ray.length-1;i>=0;i--)
    {
      PIEremoveElement(ray[i]);
      ray.pop();
    }
    // for(var i=animateRays.length-1;i>=0;i--)
    // {
    //   PIEremoveElement(animateRays[i]);
    //   animateRays.pop();
    // }
    lastX=object.position.x;
    formRay();
    //changeImageCoords();
    PIErender();
  });
}
function loadTexture()
{
  id=requestAnimationFrame(loadTexture);
  if(count1>=25)
  {
    count1=0;
    cancelAnimationFrame(id);
  }
  count1++;
  PIErender();
}

function updateExperimentElements(t,dt)
{
  for(var i=animateRays.length-1;i>=0;i--)
  {
    PIEremoveElement(animateRays[i]);
    animateRays.pop();
  }
  //PIEremoveDragElement(object);
  var x=speed*dt;
  if((lastX+x)<0)
  {
    var material=new THREE.LineBasicMaterial( { color: "green",linewidth:2} );
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(object.position.x,length,0));
    geometry.vertices.push(new THREE.Vector3(lastX+x,length,0));
    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    var geometry = new THREE.Geometry();
    var slope1=length/object.position.x;
    geometry.vertices.push(new THREE.Vector3(object.position.x,length,0));
    geometry.vertices.push(new THREE.Vector3(lastX+x,slope1*(lastX+x),0));
    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    var d=Math.abs(object.position.x);
    var dist=length*Math.abs(focusDot1.position.x)/10;
    if(d>(dist+Math.abs(focusDot1.position.x)))
    {
      var geometry = new THREE.Geometry();
      var slope2=length/(object.position.x-focusDot1.position.x);
      var c2=-focusDot1.position.x*slope2;
      geometry.vertices.push(new THREE.Vector3(object.position.x,length,0));
      geometry.vertices.push(new THREE.Vector3(lastX+x,slope2*(lastX+x)+c2,0));
      animateRays.push(new THREE.Line(geometry,material));
      PIEaddElement(animateRays[animateRays.length-1]);
    }
    else
    {
      var geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(0,0,0));
      geometry.vertices.push(new THREE.Vector3(0,0,0));
      animateRays.push(new THREE.Line(geometry,material));
      PIEaddElement(animateRays[animateRays.length-1]);
    }

    var material=new THREE.LineBasicMaterial( { color: "orange",linewidth:2} );
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0,0,0));
    geometry.vertices.push(new THREE.Vector3(0,0,0));
    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

  }
  else
  {
    var material=new THREE.LineBasicMaterial( { color: "green",linewidth:2} );
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(object.position.x,length,0));
    geometry.vertices.push(new THREE.Vector3(0,length,0));
    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    var geometry = new THREE.Geometry();
    var slope1=length/object.position.x;
    geometry.vertices.push(new THREE.Vector3(object.position.x,length,0));
    geometry.vertices.push(new THREE.Vector3(0,0,0));
    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    var d=Math.abs(object.position.x);
    var dist=length*Math.abs(focusDot1.position.x)/10;
    if(d>(dist+Math.abs(focusDot1.position.x)))
    {
      var geometry = new THREE.Geometry();
      var slope2=length/(object.position.x-focusDot1.position.x);
      var c2=-focusDot1.position.x*slope2;
      geometry.vertices.push(new THREE.Vector3(object.position.x,length,0));
      geometry.vertices.push(new THREE.Vector3(0,c2,0));
      animateRays.push(new THREE.Line(geometry,material));
      PIEaddElement(animateRays[animateRays.length-1]);
    }
    else
    {
      var geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(0,0,0));
      geometry.vertices.push(new THREE.Vector3(0,0,0));
      animateRays.push(new THREE.Line(geometry,material));
      PIEaddElement(animateRays[animateRays.length-1]);
    }

    var material=new THREE.LineBasicMaterial( { color: "orange",linewidth:2} );
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0,length,0));
    var slope3=(-1)*length/focusDot2.position.x;
    var c3=(-1)*slope3*focusDot2.position.x;
    geometry.vertices.push(new THREE.Vector3(lastX+x,slope3*(lastX+x)+c3,0));
    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0,0,0));
    var slope4=length/object.position.x;
    geometry.vertices.push(new THREE.Vector3(lastX+x,slope4*(lastX+x),0));
    animateRays.push(new THREE.Line(geometry,material));
    PIEaddElement(animateRays[animateRays.length-1]);

    var d=Math.abs(object.position.x);
    var dist=length*Math.abs(focusDot1.position.x)/10;
    if(d>(dist+Math.abs(focusDot1.position.x)))
    {
      var geometry = new THREE.Geometry();
      var slope2=length/(object.position.x-focusDot1.position.x);
      var c2=-focusDot1.position.x*slope2;
      geometry.vertices.push(new THREE.Vector3(0,c2,0));
      geometry.vertices.push(new THREE.Vector3((lastX+x),c2,0));
      animateRays.push(new THREE.Line(geometry,material));
      PIEaddElement(animateRays[animateRays.length-1]);
    }
    else
    {
      var geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(0,0,0));
      geometry.vertices.push(new THREE.Vector3(0,0,0));
      animateRays.push(new THREE.Line(geometry,material));
      PIEaddElement(animateRays[animateRays.length-1]);
    }
  }
  lastX=lastX+x;
  if(lastX>=35)
  {
    manageDrag();
    PIEstopAnimation();
  }
}

function setTextF2()
{
  var bb3="font-family:Monospace; color:black; margin:0px; overflow:hidden;font-size:15px;"
  var text=document.createElement("p");
  text.setAttribute("id","F2");
  text.style=bb3;
  document.body.appendChild(text);
  text.style.position="absolute";
  text.style.left=58+'%';
  text.style.top=50+'%';
}

function setTextO()
{
  var bb3="font-family:Monospace; color:black; margin:0px; overflow:hidden;font-size:15px;"
  var text=document.createElement("p");
  text.setAttribute("id","O");
  text.style=bb3;
  document.body.appendChild(text);
  text.style.position="absolute";
  text.style.left=50+'%';
  text.style.top=50+'%';
}

function setTextTwoF2()
{
  var bb3="font-family:Monospace; color:black; margin:0px; overflow:hidden;font-size:15px;"
  var text=document.createElement("p");
  text.setAttribute("id","2F2");
  text.style=bb3;
  document.body.appendChild(text);
  text.style.position="absolute";
  text.style.left=66+'%';
  text.style.top=50+'%';
}

function setTextTwoF1()
{
  var bb3="font-family:Monospace; color:black; margin:0px; overflow:hidden;font-size:15px;"
  var text=document.createElement("p");
  text.setAttribute("id","2F1");
  text.style=bb3;
  document.body.appendChild(text);
  text.style.position="absolute";
  text.style.left=34+'%';
  text.style.top=50+'%';
}

function setTextF1()
{
  var bb3="font-family:Monospace; color:black; margin:0px; overflow:hidden;font-size:15px;"
  var text=document.createElement("p");
  text.setAttribute("id","F1");
  text.style=bb3;
  document.body.appendChild(text);
  text.style.position="absolute";
  text.style.left=42+'%';
  text.style.top=50+'%';
}

function findImageCoord(u,f)
{
  u=(-1)*u;
  var v;
  v=u*f/(u+f);
  return v;
}

function findImageSize(u,length)
{
  var v=findImageCoord(u,focus);
  u=(-1)*u;
  var m=v/u;
  return m*length;
}

function addImage(posX,length,inverted)
{
 // var material=new THREE.LineBasicMaterial( { color: "red",linewidth:2} );
 // var geometry=findGeometry(length,inverted);
 // image=new THREE.Line(geometry,material);
 // image.position.x=posX;
 // PIEaddElement(image);
 var imageMaterial=new THREE.MeshBasicMaterial(
   {
     shading: THREE.SmoothShading,
     map:imageTex,
     side: THREE.FrontSide,
     transparent: true,
     opacity: 1
   }
 );
 var len;
 if(length<0)
 {
   len=(-1)*length;
 }
 else {
   len=length;
 }
 var imageGeometry=new THREE.PlaneGeometry(1.5,len);
 image=new THREE.Mesh(imageGeometry, imageMaterial);
 image.position.x=posX;
 if(inverted==true)
 {
  image.position.y=(-1)*len/2;
  image.rotation.z=180*Math.PI/180;
 }
 else
 {
   image.position.y=len/2;
   image.rotation.z=0*Math.PI/180;
 }
 PIEaddElement(image);
}

function addObject(posX,length,inverted)
{
  // var material=new THREE.LineBasicMaterial( { color: "red",linewidth:2} );
  // var geometry=findGeometry(length,inverted);
  // object=new THREE.Line(geometry,material);
  // object.position.x=posX;
  // PIEaddElement(object);
  var objectMaterial=new THREE.MeshBasicMaterial(
    {
      shading: THREE.SmoothShading,
      map:objectTex,
      side: THREE.FrontSide,
      transparent: true,
      opacity: 1
    }
  );
  var len;
  if(length<0)
  {
    len=(-1)*length;
  }
  else {
    len=length;
  }
  var objectGeometry=new THREE.PlaneGeometry(1.5,len);
  object=new THREE.Mesh(objectGeometry, objectMaterial);
  object.position.x=posX;
  if(inverted==true)
  {
   object.position.y=(-1)*len/2;
   object.rotation.z=180*Math.PI/180;
  }
  else
  {
    object.position.y=len/2;
    object.rotation.z=0*Math.PI/180;
  }
  PIEaddElement(object);
}

//It initialize the controls
function initialiseControls()
{
  PIEaddInputSlider("Radius", 15, function(){
    //PIEremoveElement(image);
    var d=PIEgetInputSlider("Radius");
    focusDot1.position.x=(-1)*d/2;
    focusDot2.position.x=d/2;
    twoFocusDot1.position.x=(-1)*d;
    twoFocusDot2.position.x=d;
    labelF1.position.x=focusDot1.position.x;
    labelF2.position.x=focusDot2.position.x;
    labelTwoF1.position.x=twoFocusDot1.position.x;
    labelTwoF2.position.x=twoFocusDot2.position.x;
    labelF1.lookAt(PIEcamera.position);
    labelF2.lookAt(PIEcamera.position);
    labelTwoF1.lookAt(PIEcamera.position);
    labelTwoF2.lookAt(PIEcamera.position);
    focus=d/2;
    PIEchangeInputSlider("Radius",d);
    scaleLens(d);
    for(var i=ray.length-1;i>=0;i--)
    {
      PIEremoveElement(ray[i]);
      ray.pop();
    }
    for(var i=animateRays.length-1;i>=0;i--)
    {
      PIEremoveElement(animateRays[i]);
      animateRays.pop();
    }
    lastX=object.position.x;
    formRay();
    //changeImageCoords();
    PIErender();
  }, 10,30 , 5);
  PIEaddInputSlider("Incidence Point", 15, function(){
    PIEremoveElement(image);
    object.position.x=(-1)*PIEgetInputSlider("Incidence Point");
    PIEchangeInputSlider("Incidence Point",(-1)*object.position.x);
    for(var i=ray.length-1;i>=0;i--)
    {
      PIEremoveElement(ray[i]);
      ray.pop();
    }
    for(var i=animateRays.length-1;i>=0;i--)
    {
      PIEremoveElement(animateRays[i]);
      animateRays.pop();
    }
    lastX=object.position.x;
    formRay();
    //changeImageCoords();
    PIErender();
  }, 2, 40, 0.1);
}

function changeImageCoords()
{
  var v=findImageCoord(Math.abs(object.position.x-centerDot.position.x),focus);
  var imageHeight=findImageSize(Math.abs(object.position.x-centerDot.position.x),length);
  //console.log(v-twoFocusDot2.position.x);
  // PIEremoveElement(image);
  // PIErender();
  if(imageHeight>0)
  {
    addImage(v,imageHeight,false);
  }
  else
  {
    addImage(v,-imageHeight,true);
  }
  //printText(v);
  PIErender();
}

function scaleLens(d)
{
  switch(d)
  {
    case 10:
    {
      lens.scale.x=1.5;
      break;
    }
    case 15:
    {
      lens.scale.x=1.2;
      break;
    }
    case 20:
    {
      lens.scale.x=1;
      break;
    }
    case 25:
    {
      lens.scale.x=0.7;
      break;
    }
    case 30:
    {
      lens.scale.x=0.5;
      break;
    }
  }
}

function makeRay1()
{
  var material=new THREE.LineBasicMaterial( { color: "green",linewidth:2} );
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3( object.position.x, length, 0));
  geometry.vertices.push(new THREE.Vector3( 0, length, 0));
  ray.push(new THREE.Line(geometry,material));
  PIEaddElement(ray[ray.length-1]);
  var material=new THREE.LineBasicMaterial( { color: "orange",linewidth:2} );
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3( 0, length, 0));
  geometry.vertices.push(new THREE.Vector3( findImageCoord(Math.abs(object.position.x),focus), findImageSize(Math.abs(object.position.x),length), 0));
  ray.push(new THREE.Line(geometry,material));
  PIEaddElement(ray[ray.length-1]);
}

function makeRay2()
{
  var material=new THREE.LineBasicMaterial( { color: "green",linewidth:2} );
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3( object.position.x, length, 0));
  geometry.vertices.push(new THREE.Vector3( 0 , 0 , 0 ));
  ray.push(new THREE.Line(geometry,material));
  PIEaddElement(ray[ray.length-1]);

  var material=new THREE.LineBasicMaterial( { color: "orange",linewidth:2} );
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3( 0, 0 , 0));
  geometry.vertices.push(new THREE.Vector3( findImageCoord(Math.abs(object.position.x),focus), findImageSize(Math.abs(object.position.x),length), 0));
  ray.push(new THREE.Line(geometry,material));
  PIEaddElement(ray[ray.length-1]);
}

function makeRay3()
{
  var material=new THREE.LineBasicMaterial( { color: "green",linewidth:2} );
  var geometry = new THREE.Geometry();
  var m=-length/(focusDot1.position.x-object.position.x);
  var c=-m*focusDot1.position.x;
  geometry.vertices.push(new THREE.Vector3( object.position.x, length, 0));
  geometry.vertices.push(new THREE.Vector3(0, c , 0));
  ray.push(new THREE.Line(geometry,material));
  PIEaddElement(ray[ray.length-1]);
  var material=new THREE.LineBasicMaterial( { color: "orange",linewidth:2} );
  var geometry1 = new THREE.Geometry();
  geometry1.vertices.push(new THREE.Vector3( 0, c , 0));
  geometry1.vertices.push(new THREE.Vector3( findImageCoord(Math.abs(object.position.x),focus), findImageSize(Math.abs(object.position.x),length), 0));
  ray.push(new THREE.Line(geometry1,material));
  PIEaddElement(ray[ray.length-1]);
}

function formRay()
{
  // console.log("o"+object.position.x);
  // console.log("f"+focusDot.position.x);
  var d=Math.abs(object.position.x);
  //console.log("d "+d);
  var dist=length*Math.abs(focusDot1.position.x)/10;
  if(d>(dist+Math.abs(focusDot1.position.x)))
  {
    makeRay1();
    makeRay2();
    makeRay3();
  }
  else
  {
    if(d>Math.abs(focusDot1.position.x))
    {
      makeRay1();
      makeRay2();
    }
    else
    {
      makeDivergentRays();
    }
  }
}

function makeDivergentRays()
{
  var material=new THREE.LineBasicMaterial( { color: "green",linewidth:2} );
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3( object.position.x, length, 0));
  geometry.vertices.push(new THREE.Vector3( 0 , length, 0));
  ray.push(new THREE.Line(geometry,material));
  PIEaddElement(ray[ray.length-1]);
  var material=new THREE.LineBasicMaterial( { color: "orange",linewidth:2} );
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3( 0, length, 0));

  var m=(-1)*length/(focusDot2.position.x);
  var c2=length;
  geometry.vertices.push(new THREE.Vector3(focusDot2.position.x+1 ,m*(focusDot2.position.x+1)+c2 , 0));
  ray.push(new THREE.Line(geometry,material));
  PIEaddElement(ray[ray.length-1]);

  var material=new THREE.LineBasicMaterial( { color: "green",linewidth:2} );
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3( object.position.x, length, 0));
  geometry.vertices.push(new THREE.Vector3( 0, 0, 0));
  ray.push(new THREE.Line(geometry,material));
  PIEaddElement(ray[ray.length-1]);

  var material=new THREE.LineBasicMaterial( { color: "orange",linewidth:2} );
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3( 0, 0, 0));
  var m=length/object.position.x;
  geometry.vertices.push(new THREE.Vector3( focusDot2.position.x+1 ,m*(focusDot2.position.x+1), 0));
  ray.push(new THREE.Line(geometry,material));
  PIEaddElement(ray[ray.length-1]);
}

function resetExperiment()
{

}

var helpContent;
//Help content
function initialiseHelp()
{
    helpContent="";
    helpContent = helpContent + "<h2>Tracing rays at a convex lens</h2>";
    helpContent = helpContent + "<h3>About the experiment</h3>";
    helpContent = helpContent + "<p>The experiment shows the rays tracing at a convex lens.</p>";
    helpContent = helpContent + "<h3>The setup stage</h3>";
    helpContent = helpContent + "<p>The initial state is setup stage. In this stage, you can see a lens,a object and different traced rays.</p>";
    helpContent = helpContent + "<h4>The rules of the experiment are given below.</h4>";
    helpContent = helpContent + "<ul>";
    helpContent = helpContent + "<li>The incident ray is shown in green colour.";
    helpContent = helpContent + "<li>The refracted ray is shown in orange colour.";
    helpContent = helpContent + "<li>The object can be dragged.";
    helpContent = helpContent + "<li>The distance of object(incidence point) from the lens can also be changed from slider.";
    helpContent = helpContent + "<li>The range of position of object slider is from 2 to 100.";
    helpContent = helpContent + "<li>The radius(thickness) of lens can be changed from the radius slider.";
    helpContent = helpContent + "</ul>";
    helpContent = helpContent + "<h3>The animation stage</h3>";
    helpContent = helpContent + "<p>When the start button is clicked,rays tracing start to animate.</p>";
    helpContent = helpContent + "<p>When the stop button is clicked or the animation stopped automatically,object can be dragged to change the position.</p>";
    helpContent = helpContent + "<h2>Happy Experimenting</h2>";
    PIEupdateHelp(helpContent);
}
//Initialise Info
var infoContent;
function initialiseInfo()
{
    infoContent =  "";
    infoContent = infoContent + "<h2>Tracing rays at a convex lens</h2>";
    infoContent = infoContent + "<h3>About the experiment</h3>";
    infoContent = infoContent + "<h4>About Convex Lens</h4>";
    infoContent = infoContent + "<p>A convex lens is a lens that converges rays of light that are traveling parallel to its principal axis.</p>"
    infoContent = infoContent + "<h4>Rules of rays tracing:</h4>";
    infoContent = infoContent + "<p>When the incident ray is parallel to the principal axis,the refracted ray is passed through the focus(F2) on the other side of lens.</p>";
    infoContent = infoContent + "<p>When the incident ray is passed through the focus(F1) then the refracted ray is parallel to the principal axis.</p>";
    infoContent = infoContent + "<p>When the incident ray is passed through the optical center(O) then the refracted ray is passed through optical center(O) with no change in its path.</p>";
    infoContent = infoContent + "<h2>Happy Experimenting</h2>";
    PIEupdateInfo(infoContent);
}
