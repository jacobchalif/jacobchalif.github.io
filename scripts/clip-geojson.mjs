import {readFileSync,writeFileSync} from "node:fs";

const [,,input,output] = process.argv;
const boundsList=[
  {left:-180,right:-106,bottom:35,top:75},
  {left:130,right:180,bottom:35,top:75},
];
const source=JSON.parse(readFileSync(input,"utf8"));

function clipEdge(points,inside,intersect){
  const result=[];
  for(let i=0;i<points.length;i++){
    const current=points[i],previous=points[(i+points.length-1)%points.length];
    const currentInside=inside(current),previousInside=inside(previous);
    if(currentInside){if(!previousInside) result.push(intersect(previous,current));result.push(current)}
    else if(previousInside) result.push(intersect(previous,current));
  }
  return result;
}

function clipRing(ring,bounds){
  let points=ring.slice(0,-1);
  points=clipEdge(points,p=>p[0]>=bounds.left,(a,b)=>[bounds.left,a[1]+(b[1]-a[1])*(bounds.left-a[0])/(b[0]-a[0])]);
  points=clipEdge(points,p=>p[0]<=bounds.right,(a,b)=>[bounds.right,a[1]+(b[1]-a[1])*(bounds.right-a[0])/(b[0]-a[0])]);
  points=clipEdge(points,p=>p[1]>=bounds.bottom,(a,b)=>[a[0]+(b[0]-a[0])*(bounds.bottom-a[1])/(b[1]-a[1]),bounds.bottom]);
  points=clipEdge(points,p=>p[1]<=bounds.top,(a,b)=>[a[0]+(b[0]-a[0])*(bounds.top-a[1])/(b[1]-a[1]),bounds.top]);
  if(points.length<3) return null;
  points.push(points[0]);
  return points;
}

const polygons=[];
for(const feature of source.features){
  const geometry=feature.geometry;
  const candidates=geometry.type==="Polygon"?[geometry.coordinates]:geometry.type==="MultiPolygon"?geometry.coordinates:[];
  for(const polygon of candidates){
    for(const bounds of boundsList){
      const rings=polygon.map(ring=>clipRing(ring,bounds)).filter(Boolean);
      if(rings.length) polygons.push(rings);
    }
  }
}

writeFileSync(output,JSON.stringify({type:"Feature",properties:{},geometry:{type:"MultiPolygon",coordinates:polygons}}));
console.log(`Wrote ${polygons.length} clipped land polygons to ${output}`);
