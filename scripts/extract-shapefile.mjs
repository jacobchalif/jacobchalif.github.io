import {readFileSync,writeFileSync} from "node:fs";

const [,,input,output] = process.argv;
if (!input || !output) throw new Error("Usage: node extract-shapefile.mjs input.shp output.json");

const data=readFileSync(input);
const features=[];
let offset=100;
while(offset+8<=data.length){
  const words=data.readInt32BE(offset+4);
  const start=offset+8;
  const end=start+words*2;
  if(end>data.length) break;
  const type=data.readInt32LE(start);
  if(type===5){
    const minX=data.readDoubleLE(start+4),minY=data.readDoubleLE(start+12);
    const maxX=data.readDoubleLE(start+20),maxY=data.readDoubleLE(start+28);
    if(maxX>=-148&&minX<=-131.5&&maxY>=55&&minY<=66.5){
      const partCount=data.readInt32LE(start+36);
      const pointCount=data.readInt32LE(start+40);
      const parts=[];
      for(let i=0;i<partCount;i++) parts.push(data.readInt32LE(start+44+i*4));
      const pointsStart=start+44+partCount*4;
      const rings=[];
      for(let p=0;p<partCount;p++){
        const first=parts[p],last=p+1<partCount?parts[p+1]:pointCount;
        const ring=[];
        for(let i=first;i<last;i++) ring.push([data.readDoubleLE(pointsStart+i*16),data.readDoubleLE(pointsStart+i*16+8)]);
        rings.push(ring);
      }
      features.push({type:"Feature",properties:{},geometry:{type:"Polygon",coordinates:rings}});
    }
  }
  offset=end;
}
writeFileSync(output,JSON.stringify({type:"FeatureCollection",features}));
console.log(`Wrote ${features.length} glacier cells to ${output}`);
