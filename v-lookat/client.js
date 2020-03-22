"use strict";

// ----------------------------------------------------------------------------

setErrorMode(RESOURCEERRORMODE_STRICT);

// ----------------------------------------------------------------------------

// WARNING: This resource is VERY buggy on GTA 3 and Vice City. I haven't had a chance to finish tweaking it.
// You will often find yourself unable to aim or punch. I'll try to fix this soon ;)

// GTA 3 and Vice City do not have "look" functions like SA has, so I made this work by using ped.pointGunAt()
// and since it only accepts an element (not a position), it spawns a client-side invisible object (just placed in another dimension) and
// moves it around to be aligned with the camera to world calculation, and ped.pointGunAt() can be used with that.
// Without a weapon it looks cool and they will turn their upper body and/or head to look at the object's position

// Oh, and it works fine on GTA SA but sometimes the head moves a little fast.

// ----------------------------------------------------------------------------

let aimObjects = new Array(256);
let centerCameraPos = null;
let lookAtPos = null;

// ----------------------------------------------------------------------------

bindEventHandler("OnResourceStart", thisResource, function(event, resource) {
	setInterval(sendHeadLook, 2500);
});

// ----------------------------------------------------------------------------

addEventHandler("OnProcess", function(event, deltaTime) {
	if(localPlayer != null) {
		centerCameraPos = getWorldFromScreenPosition(new Vec3(gta.width/2, gta.height/2, 0));
		lookAtPos = getWorldFromScreenPosition(new Vec3(gta.width/2, gta.height/2, centerCameraPos.distance(localPlayer.position)+20));
		localPlayer.lookAt(lookAtPos, 3000);
	}
});

// ----------------------------------------------------------------------------

addNetworkHandler("v.p.lookat", function(ped, position) {
	if(ped != null) {
		if(ped != localPlayer) {
			ped.lookAt(position, 3000);
		}
	}
});

// ----------------------------------------------------------------------------

function sendHeadLook() {
	triggerNetworkEvent("v.p.lookat", lookAtPos);
}
// ----------------------------------------------------------------------------