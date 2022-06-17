function moveFinger(Finger, posX, posY, posZ) {
  Finger.style.webkitTransform = "translate3d("+posX+"px, "+posY+"px, "+posZ+"px)";
}

function moveSphere(Sphere, posX, posY, posZ, rotX, rotY, rotZ) {
  Sphere.style.webkitTransform = Sphere.style.mozTransform =
  Sphere.style.transform = "translateX("+posX+"px) translateY("+posY+"px) translateZ("+posZ+"px) rotateX("+rotX+"deg) rotateY(0deg) rotateZ(0deg)";
}

let fingers = {};
let spheres = {};
let authCount = 0;

function onGesture(gesture, frame) {
  if (gesture.type === 'circle') authCount++;
  if (authCount > 50) {
    let audio = new Audio('auth.mp3');
    document.getElementById('scene').style.display = "none";
    document.getElementById('loading').style.display="inline";
    setTimeout(() => {
      if (audio) audio.play();
      document.getElementById('loading').style.display="none";
      document.getElementById('app').style.display = 'none';
      document.getElementById('auth').style.display = 'inline';
      authCount = 0;
      //stopSound();
    }, 3000);
  }
}

let controller = Leap.loop({enableGestures: true}, function(frame) {
  let seenFingers = {};
  let handIds = {};
  let handsLength = 0;
  if (frame.hands === undefined ) {
    handsLength = 0;
  } else {
    handsLength = frame.hands.length;
  }

  for (let handId = 0, handCount = handsLength; handId != handCount; handId++) {
    let hand = frame.hands[handId];
    let posX = (hand.palmPosition[0]*3);
    let posY = (hand.palmPosition[2]*3)-200;
    let posZ = (hand.palmPosition[1]*3)-400;
    let rotX = (hand._rotation[2]*90);
    let rotY = (hand._rotation[1]*90);
    let rotZ = (hand._rotation[0]*90);
    let sphere = spheres[hand.id];
    if (!sphere) {
      let sphereDiv = document.getElementById("sphere").cloneNode(true);
      sphereDiv.setAttribute('id',hand.id);
      sphereDiv.style.backgroundColor='#'+Math.floor(Math.random()*16777215).toString(16);
      document.getElementById('scene').appendChild(sphereDiv);
      spheres[hand.id] = hand.id;
    } else {
      let sphereDiv =  document.getElementById(hand.id);
      if (typeof(sphereDiv) != 'undefined' && sphereDiv != null) {
        moveSphere(sphereDiv, posX, posY, posZ, rotX, rotY, rotZ);
      }
    }
    handIds[hand.id] = true;
  }
  for (handId in spheres) {
    if (!handIds[handId]) {
      let sphereDiv =  document.getElementById(spheres[handId]);
      sphereDiv.parentNode.removeChild(sphereDiv);
      delete spheres[handId];
    }
  }

  for (let pointableId = 0, pointableCount = frame.pointables.length; pointableId != pointableCount; pointableId++) {
    let pointable = frame.pointables[pointableId];
    let newFinger = false;
    if (pointable.finger) {
      if (!fingers[pointable.id]) {
        fingers[pointable.id] = [];
        newFinger = true;
      }

      for (let partId = 0, length; partId != 4; partId++) {
        let posX = (pointable.positions[partId][0]*3);
        let posY = (pointable.positions[partId][2]*3)-200;
        let posZ = (pointable.positions[partId][1]*3)-400;

        let id = pointable.id+'_'+partId;

        let finger = fingers[id];
        if (newFinger) {
          let fingerDiv = document.getElementById("finger").cloneNode(true);
          fingerDiv.setAttribute('id', id);
          fingerDiv.style.backgroundColor='#'+Math.floor(pointable.type*500).toString(16);
          document.getElementById('scene').appendChild(fingerDiv);
          fingers[pointable.id].push(id);
        } else  {
          let fingerDiv =  document.getElementById(id);
          if (typeof(fingerDiv) != 'undefined' && fingerDiv != null) {
            moveFinger(fingerDiv, posX, posY, posZ);
          }
        }
        seenFingers[pointable.id] = true;
      }

    }
  }
  for (let fingerId in fingers) {
    if (!seenFingers[fingerId]) {
      let ids = fingers[fingerId];
      for (let index in ids) {
        let fingerDiv =  document.getElementById(ids[index]);
        fingerDiv.parentNode.removeChild(fingerDiv);
      }
      delete fingers[fingerId];
    }
  }
});

controller.connect();
controller.on('gesture', onGesture);
