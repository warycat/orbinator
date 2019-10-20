import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import Button from '@material-ui/core/Button';
import * as THREE from 'three';
import stations_txt from './stations.txt';

var satellite = require('satellite.js');


var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var stations = [];

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

let obinators = parse_lines(stations_txt);

console.log(obinators);

// Sample TLE
var tleLine1 = '1 25544U 98067A   19156.50900463  .00003075  00000-0  59442-4 0  9992',
    tleLine2 = '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442';    

// Initialize a satellite record
var satrec = satellite.twoline2satrec(tleLine1, tleLine2);

console.log('satrec.inclo', satrec.inclo);
console.log('satrec.nodeo', satrec.nodeo);
console.log('satrec.ecco', satrec.ecco);
console.log('satrec.argpo', satrec.argpo);
console.log('satrec.mo', satrec.mo);
console.log('satrec.no', satrec.no);

// inclo Inclination in radians.
// nodeo Right ascension of ascending node in radians.
// ecco Eccentricity.
// argpo Argument of perigee in radians.
// mo Mean anomaly in radians.
// no Mean motion in radians per minute.


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


var geometry = new THREE.SphereBufferGeometry( 1, 20, 20 );
var ocean_material = new THREE.MeshLambertMaterial({
  color: 0x0000ff,
  emissive: 0x0000ff,
  transparent: true,
  opacity: 0.5,
  wireframe: true
});

var cube = new THREE.Mesh( geometry, ocean_material );
scene.add( cube );

var curve = new THREE.EllipseCurve(
	0,  0,            // ax, aY
	2, 2.5,           // xRadius, yRadius
	0,  2 * Math.PI,  // aStartAngle, aEndAngle
	false,            // aClockwise
	1                 // aRotation
);

var points = curve.getPoints( 50 );
var geometry = new THREE.BufferGeometry().setFromPoints( points );

var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

// Create the final object to add to the scene
var ellipse = new THREE.Line( geometry, material );
ellipse.rotation.x = Math.PI / 2;
ellipse.rotation.y = Math.PI / 4;

scene.add(ellipse);

camera.position.y = 2;

function animate() {
  // cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  var speed = Date.now() * 0.0001;
  camera.position.x = Math.cos(speed) * 5;
  camera.position.z = Math.sin(speed) * 5;

  camera.lookAt(scene.position); //0,0,0

  requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();

// function App() {
//   return (
//     <Button variant="contained" color="primary">
//       Hello World
//     </Button>
//   );
// }

// ReactDOM.render(
//   <App />,
//   document.getElementById('root')
// );