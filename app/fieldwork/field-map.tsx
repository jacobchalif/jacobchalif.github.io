"use client";

import {
  geoConicConformal,
  geoPath,
  geoStereographic,
} from "d3-geo";
import land from "../../public/data/ne_110m_land.json";
import eclipseLand from "../../public/data/ne_10m_eclipse_land.json";

type FieldMapProps = {
  latitude: number;
  longitude: number;
  location: string;
  view: "eclipse" | "antarctica";
};

const width = 240;
const height = 156;

function coordinateLabel(latitude: number, longitude: number) {
  const lat = `${Math.abs(latitude).toFixed(4)}°${latitude >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(longitude).toFixed(4)}°${longitude >= 0 ? "E" : "W"}`;
  return `${lat}  ·  ${lon}`;
}

export function FieldMap({ latitude, longitude, location, view }: FieldMapProps) {
  const projection = view === "eclipse"
    ? geoConicConformal()
        .parallels([55, 65])
        .rotate([154, 0])
        .center([0, 62])
        .scale(400)
        .translate([width / 2, height / 2 + 2])
        .clipExtent([[0, 0], [width, height]])
    : geoStereographic()
        .rotate([0, 90])
        .scale(275)
        .translate([width / 2, height / 2 + 2])
        .clipAngle(26)
        .clipExtent([[0, 0], [width, height]]);

  const path = geoPath(projection);
  const marker = projection([longitude, latitude]);
  const label = coordinateLabel(latitude, longitude);

  return (
    <figure className="field-map">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${location} locator map, ${label}`}>
        {view === "eclipse" ? <>
          <defs><clipPath id="eclipse-land-clip"><path d={path(eclipseLand as never) ?? undefined}/></clipPath></defs>
          <path className="field-map-land" d={path(eclipseLand as never) ?? undefined}/>
          <image className="field-map-relief" href="/images/eclipse-relief.png" x="0" y="0" width={width} height={height} preserveAspectRatio="none" clipPath="url(#eclipse-land-clip)"/>
        </> : <path className="field-map-land" d={path(land as never) ?? undefined}/>} 
        {marker && (
          <g className="field-map-marker" transform={`translate(${marker[0]} ${marker[1]})`}>
            <circle className="field-map-marker-ring" r="8" />
            <circle r="3.5" />
          </g>
        )}
      </svg>
    </figure>
  );
}
