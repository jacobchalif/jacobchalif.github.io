import {readFileSync,writeFileSync} from "node:fs";
import {geoConicConformal} from "d3-geo";

const [,,input,output] = process.argv;
const sourceWidth=3240,sourceHeight=1620;
const width=720,height=468,ratio=3;
const source=readFileSync(input);
if(source.length!==sourceWidth*sourceHeight*3) throw new Error("Unexpected relief raster size");

const projection=geoConicConformal()
  .parallels([55,65])
  .rotate([154,0])
  .center([0,62])
  .scale(400)
  .translate([120,78]);

const pixels=Buffer.alloc(width*height*3,241);
for(let y=0;y<height;y++) for(let x=0;x<width;x++){
  const point=projection.invert([x/ratio,y/ratio]);
  if(!point) continue;
  const sx=((point[0]+180)/360)*(sourceWidth-1);
  const sy=((90-point[1])/180)*(sourceHeight-1);
  const x0=Math.max(0,Math.min(sourceWidth-1,Math.floor(sx)));
  const y0=Math.max(0,Math.min(sourceHeight-1,Math.floor(sy)));
  const x1=Math.min(sourceWidth-1,x0+1),y1=Math.min(sourceHeight-1,y0+1);
  const fx=sx-x0,fy=sy-y0;
  for(let c=0;c<3;c++){
    const a=source[(y0*sourceWidth+x0)*3+c]*(1-fx)+source[(y0*sourceWidth+x1)*3+c]*fx;
    const b=source[(y1*sourceWidth+x0)*3+c]*(1-fx)+source[(y1*sourceWidth+x1)*3+c]*fx;
    pixels[(y*width+x)*3+c]=Math.round(a*(1-fy)+b*fy);
  }
}
writeFileSync(output,Buffer.concat([Buffer.from(`P6\n${width} ${height}\n255\n`),pixels]));
