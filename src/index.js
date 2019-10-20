import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import * as THREE from 'three';
import stations_txt from './stations.txt';
import visual_txt from './visual.txt';
import active_txt from './active.txt';
import analyst_txt from './analyst.txt';
import _2019_006_txt from './2019-006.txt';
import _1999_025_txt from './1999-025.txt';
import iridium_33_debris_txt from './iridium-33-debris.txt';
import cosmos_2251_debris_txt from  './cosmos-2251-debris.txt';
import _2012_044_txt from './2012-044.txt';
var satellite = require('satellite.js');

var set = [
  {
    name: "Space Stations",
    data: stations_txt,
  },
  {
    name: "100 (or so) Brightest",
    data: visual_txt,
  },
  {
    name: "Analyst Satellites",
    data: analyst_txt,
  },
  {
    name: "Indian ASAT Test Debris",
    data: _2019_006_txt,
  },
  {
    name: "FENGYUN 1C Debris",
    data: _1999_025_txt,
  },
  {
    name: "IRIDIUM 33 Debris",
    data: iridium_33_debris_txt,
  },
  {
    name: "COSMOS 2251 Debris",
    data: cosmos_2251_debris_txt,
  },
  {
    name: "BREEZE-M R/B Breakup (2012-044C)",
    data: _2012_044_txt,
  }
]

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};


var seq = getUrlParameter("seq") || Math.floor(Math.random() * 8);
var pick = set[seq];
document.getElementById("info").innerHTML = pick.name;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();

var geometry = new THREE.SphereBufferGeometry( 2.6, 30, 30 );
var ocean_material = new THREE.MeshLambertMaterial({
  color: 0x00ff00,
  emissive: 0x0000ff,
  transparent: true,
  opacity: 0.8,
});

var earth = new THREE.Mesh( geometry, ocean_material );
scene.add( earth );


function parse_lines(txt){
  var lines = txt.split('\n');
  var lines1 = [];
  var lines2 = [];
  var lines3 = [];
  for (var i = 0; i< lines.length; i++){
    if (i % 3 == 0) {
      lines1.push(lines[i]);
    }
    if (i % 3 == 1) {
      lines2.push(lines[i]);
    }
    if (i % 3 == 2) {
      lines3.push(lines[i]);
    }
  }
  let res = [];
  for (var i = 0; i< lines1.length; i++){
    var o = new Orbinator(lines1[i],lines2[i],lines3[i]);
    res.push(o);
  }
  return res;
}

function Orbinator(name, line2, line3){
  this.name = name;
  var satrec = satellite.twoline2satrec(line2, line3);
  this.inclo = satrec.inclo;
  this.nodeo = satrec.nodeo;
  this.ecco = satrec.ecco;
  this.argpo = satrec.argpo;
  this.mo = satrec.mo;
  this.no = satrec.no;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

let obinators = parse_lines(pick.data);

for (var o of obinators) {
  var p = 0.4 / o.no;
  var c = Math.pow(p * p, 1 / 3.0);
  var a = c * (1 + o.ecco);
  var b = c * (1 - o.ecco);
  console.log(a, b);

  var curve = new THREE.EllipseCurve(
    c * o.ecco,  0,            // ax, aY
    a, b,           // xRadius, yRadius
    0,  2 * Math.PI,  // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
  );
  
  var points = curve.getPoints( 50 );
  var geometry = new THREE.BufferGeometry().setFromPoints( points );
  
  var material = new THREE.LineBasicMaterial( { color : (1<<24)*Math.random() } );
  
  // Create the final object to add to the scene
  var ellipse = new THREE.Line( geometry, material );
  ellipse.rotation.z = o.argpo;
  ellipse.rotation.x = o.nodeo;
  ellipse.rotation.y = o.inclo;

  scene.add(ellipse);
}


var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

function animate() {

  var speed = Date.now() * 0.0002;
  camera.position.x = Math.cos(speed) * (15 + 10 * Math.cos(0.5 * speed));
  camera.position.z = Math.sin(speed) * (15 + 10 * Math.cos(0.5 * speed));

  camera.lookAt(scene.position); //0,0,0

  requestAnimationFrame( animate );
	renderer.render( scene, camera );
}


animate();

