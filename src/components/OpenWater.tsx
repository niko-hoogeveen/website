"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Destination = { name: string; subtitle: string; href: string; x: number; z: number; color: [number, number, number] };
const DESTINATIONS: Destination[] = [
  { name: "THE LIGHTHOUSE", subtitle: "About me", href: "/about", x: -82, z: -110, color: [0.68, 0.65, 0.52] },
  { name: "INNOVATION ISLAND", subtitle: "Projects", href: "/projects", x: 95, z: -142, color: [0.38, 0.55, 0.49] },
  { name: "RESCUE HARBOUR", subtitle: "Experience", href: "/resume", x: -116, z: 58, color: [0.5, 0.59, 0.52] },
  { name: "TRADING PORT", subtitle: "Research dashboard", href: "/dashboard", x: 108, z: 85, color: [0.53, 0.56, 0.6] },
  { name: "RADIO POINT", subtitle: "Contact", href: "/contact", x: 0, z: -222, color: [0.58, 0.55, 0.43] },
];

const vertexShader = `
attribute vec3 position;
attribute vec3 color;
uniform mat4 viewProjection;
uniform mat4 model;
uniform float time;
uniform float isWater;
varying vec3 vColor;
varying float vDistance;
varying float vWave;
void main() {
  vec4 p = model * vec4(position, 1.0);
  float w = sin(p.x * .14 + time * .72) * .42 + cos(p.z * .11 - time * .57) * .34;
  p.y += w * isWater;
  vWave = w;
  vColor = color;
  vDistance = length(p.xz);
  gl_Position = viewProjection * p;
}
`;
const fragmentShader = `
precision mediump float;
varying vec3 vColor;
varying float vDistance;
varying float vWave;
uniform float isWater;
void main() {
  vec3 c = vColor;
  if (isWater > .5) c += vec3(.025, .115, .13) * (vWave + 1.0);
  float haze = smoothstep(110.0, 480.0, vDistance) * .6;
  c = mix(c, vec3(.49, .67, .72), haze);
  gl_FragColor = vec4(c, 1.0);
}
`;

type Mesh = { buffer: WebGLBuffer; count: number; mode: number };
type Renderable = { mesh: Mesh; x: number; y: number; z: number; scale: [number, number, number]; yaw?: number; water?: boolean };
const identity = (): number[] => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function multiply(a: number[], b: number[]) {
  const out = new Array<number>(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
    for (let k = 0; k < 4; k++) out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return out;
}
function perspective(fov: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fov / 2), m = identity();
  m[0] = f / aspect; m[5] = f; m[10] = (far + near) / (near - far);
  m[11] = -1; m[14] = (2 * far * near) / (near - far); m[15] = 0;
  return m;
}
function lookAt(eye: number[], target: number[]) {
  const norm = (v: number[]) => { const n = Math.hypot(...v) || 1; return v.map(x => x / n); };
  const cross = (a: number[], b: number[]) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const z = norm(eye.map((v,i) => v-target[i])), x = norm(cross([0,1,0],z)), y = cross(z,x);
  const m = identity();
  m[0]=x[0];m[1]=y[0];m[2]=z[0];
  m[4]=x[1];m[5]=y[1];m[6]=z[1];
  m[8]=x[2];m[9]=y[2];m[10]=z[2];
  m[12]=-x.reduce((s,v,i)=>s+v*eye[i],0);
  m[13]=-y.reduce((s,v,i)=>s+v*eye[i],0);
  m[14]=-z.reduce((s,v,i)=>s+v*eye[i],0);
  return m;
}
function transform(x: number, y: number, z: number, scale: number[], yaw = 0) {
  const m=identity(),c=Math.cos(yaw),s=Math.sin(yaw);
  m[0]=c*scale[0];m[2]=-s*scale[0];m[5]=scale[1];
  m[8]=s*scale[2];m[10]=c*scale[2];m[12]=x;m[13]=y;m[14]=z;
  return m;
}
function geometry(gl: WebGLRenderingContext, positions: number[], rgb: number[]): Mesh {
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("WebGL buffer creation failed");
  const packed: number[]=[];
  for(let i=0;i<positions.length;i+=3) packed.push(...positions.slice(i,i+3),...rgb);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(packed),gl.STATIC_DRAW);
  return {buffer,count:positions.length/3,mode:gl.TRIANGLES};
}
function boxGeometry(gl: WebGLRenderingContext,color:number[]) {
  const p=[-1,-1,1,1,-1,1,1,1,1,-1,-1,1,1,1,1,-1,1,1,
  1,-1,-1,-1,-1,-1,-1,1,-1,1,-1,-1,-1,1,-1,1,1,-1,
  -1,-1,-1,-1,-1,1,-1,1,1,-1,-1,-1,-1,1,1,-1,1,-1,
  1,-1,1,1,-1,-1,1,1,-1,1,-1,1,1,1,-1,1,1,1,
  -1,1,1,1,1,1,1,1,-1,-1,1,1,1,1,-1,-1,1,-1,
  -1,-1,-1,1,-1,-1,1,-1,1,-1,-1,-1,1,-1,1,-1,-1,1];
  return geometry(gl,p,color);
}
function cylinderGeometry(gl:WebGLRenderingContext,rgb:number[],segments=28) {
  const p:number[]=[];
  for(let i=0;i<segments;i++){const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments;
    p.push(0,1,0,Math.cos(a),1,Math.sin(a),Math.cos(b),1,Math.sin(b));
    p.push(Math.cos(a),-1,Math.sin(a),Math.cos(b),-1,Math.sin(b),Math.cos(a),1,Math.sin(a));
    p.push(Math.cos(b),-1,Math.sin(b),Math.cos(b),1,Math.sin(b),Math.cos(a),1,Math.sin(a));
  }
  return geometry(gl,p,rgb);
}
function coneGeometry(gl:WebGLRenderingContext,rgb:number[],segments=12) {
  const p:number[]=[];
  for(let i=0;i<segments;i++){const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments;
    p.push(0,1,0,Math.cos(a),-1,Math.sin(a),Math.cos(b),-1,Math.sin(b));
  }
  return geometry(gl,p,rgb);
}
function useWorld(canvas: HTMLCanvasElement, onTelemetry:(speed:number,heading:number,nearest:number)=>void) {
  const gl=canvas.getContext("webgl",{antialias:true,alpha:false});
  if(!gl) return ()=>{};
  const compile=(type:number,src:string)=>{const sh=gl.createShader(type);if(!sh)throw new Error("Shader unavailable");gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh)||"Shader error");return sh;};
  const program=gl.createProgram();if(!program)return ()=>{};
  gl.attachShader(program,compile(gl.VERTEX_SHADER,vertexShader));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragmentShader));gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error("Unable to link scene shaders");
  gl.useProgram(program);gl.enable(gl.DEPTH_TEST);
  const aPos=gl.getAttribLocation(program,"position"),aColor=gl.getAttribLocation(program,"color");
  const uVP=gl.getUniformLocation(program,"viewProjection"),uModel=gl.getUniformLocation(program,"model"),uTime=gl.getUniformLocation(program,"time"),uWater=gl.getUniformLocation(program,"isWater");
  const water = boxGeometry(gl,[.025,.28,.35]),sand=cylinderGeometry(gl,[.73,.70,.55]),grass=cylinderGeometry(gl,[.27,.47,.37]),rock=boxGeometry(gl,[.38,.42,.42]),white=boxGeometry(gl,[.91,.92,.87]),red=boxGeometry(gl,[.72,.24,.19]),glass=boxGeometry(gl,[.15,.32,.39]),wood=boxGeometry(gl,[.40,.31,.24]),trunk=cylinderGeometry(gl,[.30,.25,.19],8),pine=coneGeometry(gl,[.16,.36,.27]),light=cylinderGeometry(gl,[1,.83,.48],16);
  const staticObjects:Renderable[]=[{mesh:water,x:0,y:-2,z:0,scale:[900,.3,900],water:true}];
  DESTINATIONS.forEach((island,index)=>{
    const {x,z,color}=island,rad= index===1?20:16;
    const ground=cylinderGeometry(gl,color);
    staticObjects.push({mesh:sand,x,y:-1.2,z,scale:[rad+3,1.9,rad+3]},{mesh:ground,x,y:.45,z,scale:[rad,1.5,rad]});
    for(let i=0;i<8;i++){const ang=i*2.399+index,rr=rad*(.28+(i%3)*.18),tx=x+Math.cos(ang)*rr,tz=z+Math.sin(ang)*rr;
      staticObjects.push({mesh:trunk,x:tx,y:3,z:tz,scale:[.45,2.8,.45]},{mesh:pine,x:tx,y:8.3,z:tz,scale:[2.1,5,2.1]});
    }
    if(index===0){staticObjects.push({mesh:white,x,y:8,z,scale:[2.6,7,2.6]},{mesh:red,x,y:15,z,scale:[3.0,1.7,3]},{mesh:light,x,y:18,z,scale:[3,1,3]});}
    else if(index===1){staticObjects.push({mesh:white,x,y:5,z,scale:[7,3.7,6]},{mesh:glass,x,y:9,z,scale:[5,1,5]});}
    else if(index===2){staticObjects.push({mesh:red,x,y:4,z,scale:[7,3,5]},{mesh:white,x,y:8,z,scale:[8,1.3,6]},{mesh:wood,x:x+4,y:0,z:z-17,scale:[3,.7,13]});}
    else if(index===3){for(let j=0;j<4;j++)staticObjects.push({mesh:glass,x:x-9+j*6,y:4+j%3*3,z:z+2,scale:[2.4,4+j%3*3,3]});}
    else {staticObjects.push({mesh:white,x,y:8,z,scale:[1.7,7,1.7]},{mesh:red,x,y:15,z,scale:[2.5,1.4,2.5]});}
  });
  const keys=new Set<string>();let touchTurn=0,touchThrottle=0;
  const keydown=(e:KeyboardEvent)=>{if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase())){keys.add(e.key.toLowerCase());e.preventDefault();}};
  const keyup=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());
  window.addEventListener("keydown",keydown);window.addEventListener("keyup",keyup);
  const press=(e:Event)=>{const el=e.currentTarget as HTMLElement;touchTurn=Number(el.dataset.turn||0);touchThrottle=Number(el.dataset.throttle||0);};
  const release=()=>{touchTurn=0;touchThrottle=0;};
  const buttons=[...document.querySelectorAll<HTMLElement>("[data-boat-control]")];
  buttons.forEach(el=>{el.addEventListener("pointerdown",press);el.addEventListener("pointerup",release);el.addEventListener("pointercancel",release);el.addEventListener("pointerleave",release);});
  let x=0,z=0,yaw=0,speed=0,frameId=0,last=performance.now(),frame=0;
  const draw=(item:Renderable,vp:number[],time:number)=>{
    gl.bindBuffer(gl.ARRAY_BUFFER,item.mesh.buffer);
    gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,24,0);
    gl.enableVertexAttribArray(aColor);gl.vertexAttribPointer(aColor,3,gl.FLOAT,false,24,12);
    gl.uniformMatrix4fv(uVP,false,new Float32Array(vp));
    gl.uniformMatrix4fv(uModel,false,new Float32Array(transform(item.x,item.y,item.z,item.scale,item.yaw)));
    gl.uniform1f(uWater,item.water?1:0);gl.uniform1f(uTime,time);
    gl.drawArrays(item.mesh.mode,0,item.mesh.count);
  };
  function tick(now:number){
    const dt=Math.min(.05,(now-last)/1000);last=now;frame++;
    const gas=Number(keys.has("w")||keys.has("arrowup"))-Number(keys.has("s")||keys.has("arrowdown"))+touchThrottle;
    const steer=Number(keys.has("d")||keys.has("arrowright"))-Number(keys.has("a")||keys.has("arrowleft"))+touchTurn;
    speed=Math.max(-8,Math.min(32,speed+gas*26*dt));speed*=Math.exp(-.75*dt);
    yaw+=steer*dt*1.12*Math.min(1,.25+Math.abs(speed)/12)*(speed>=0?1:-1);
    const nextX=x+Math.sin(yaw)*speed*dt,nextZ=z-Math.cos(yaw)*speed*dt;
    if(DESTINATIONS.some(p=>Math.hypot(nextX-p.x,nextZ-p.z)<17)){speed*= -.18;}else{x=nextX;z=nextZ;}
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.7),cw=Math.max(1,Math.floor(rect.width*dpr)),ch=Math.max(1,Math.floor(rect.height*dpr));
    if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}gl.viewport(0,0,cw,ch);
    gl.clearColor(.47,.67,.72,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const cam=[x-Math.sin(yaw)*23,13,z+Math.cos(yaw)*23];
    const target=[x+Math.sin(yaw)*9,2,z-Math.cos(yaw)*9];
    const vp=multiply(perspective(Math.PI/3,cw/ch,.2,1800),lookAt(cam,target));
    for(const item of staticObjects)draw(item,vp,now/1000);
    const wave=Math.sin(now/650)*.18;
    const ship=(mesh:Mesh,dx:number,dy:number,dz:number,sx:number,sy:number,sz:number)=>{
      const xx=x+dx*Math.cos(yaw)+dz*Math.sin(yaw),zz=z-dx*Math.sin(yaw)+dz*Math.cos(yaw);
      draw({mesh,x:xx,y:dy+wave,z:zz,scale:[sx,sy,sz],yaw},vp,now/1000);
    };
    ship(white,0,1,0,2.1,.55,4.3);ship(red,0,1.5,2.6,1.75,.25,1.15);
    ship(glass,0,2.35,1.4,1.45,.85,1.25);ship(white,0,3.25,1.4,1.65,.18,1.45);
    ship(rock,0,1.8,-3,1.55,.25,.9);
    if(frame%9===0){const nearest=DESTINATIONS.findIndex(p=>Math.hypot(x-p.x,z-p.z)<38);onTelemetry(Math.round(Math.abs(speed)*.8),Math.round(((yaw*180/Math.PI)%360+360)%360),nearest);}
    frameId=requestAnimationFrame(tick);
  }
  frameId=requestAnimationFrame(tick);
  return ()=>{cancelAnimationFrame(frameId);window.removeEventListener("keydown",keydown);window.removeEventListener("keyup",keyup);buttons.forEach(el=>{el.removeEventListener("pointerdown",press);el.removeEventListener("pointerup",release);el.removeEventListener("pointercancel",release);el.removeEventListener("pointerleave",release);});staticObjects.forEach(o=>gl.deleteBuffer(o.mesh.buffer));[white,red,glass,wood,rock,trunk,pine,light].forEach(o=>gl.deleteBuffer(o.buffer));gl.deleteProgram(program);};
}
export default function OpenWater() {
  const canvas=useRef<HTMLCanvasElement>(null);
  const [telemetry,setTelemetry]=useState({speed:0,heading:0,nearest:-1});
  const [error,setError]=useState("");
  const [muted,setMuted]=useState(false);
  useEffect(()=>{if(!canvas.current)return;try{return useWorld(canvas.current,(speed,heading,nearest)=>setTelemetry({speed,heading,nearest}));}catch(e){setError(e instanceof Error?e.message:"Unable to initialize WebGL");}},[]);
  const closest=DESTINATIONS[telemetry.nearest];
  return <main className="relative h-[100svh] min-h-[550px] overflow-hidden bg-[#0b2636] text-white">
    <canvas ref={canvas} aria-label="Interactive 3D coastal world with a steerable boat and five destinations" className="absolute inset-0 h-full w-full"/>
    <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#061927b8] to-transparent"/>
    <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-5 p-5 md:p-9">
      <div><p className="text-[10px] font-bold uppercase tracking-[.36em] text-[#b5d7dd]">Niko Hoogeveen / 001</p><h1 className="mt-3 font-light text-3xl tracking-tight md:text-5xl">The Open Water<span className="text-[#a4d3dc]">.</span></h1><p className="mt-2 max-w-md text-xs leading-relaxed text-[#d3e3e7] md:text-sm">Software engineering, exploration, and a life spent drawn to the water.</p></div>
      <Link href="/projects" className="pointer-events-auto rounded-full border border-white/30 bg-[#0b253c99] px-4 py-2 text-xs font-semibold tracking-wide hover:bg-white/15">Skip exploration ↗</Link>
    </header>
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#071b2bec] to-transparent"/>
    <div className="absolute bottom-6 left-5 right-5 flex items-end justify-between gap-4 md:bottom-9 md:left-9 md:right-9">
      <div className="pointer-events-none max-w-[280px]"><p className="text-[10px] uppercase tracking-[.28em] text-[#90bfc9]">Navigation telemetry</p><p className="mt-2 font-mono text-sm">{String(telemetry.heading).padStart(3,"0")}° HDG <span className="mx-2 text-white/30">/</span> {String(telemetry.speed).padStart(2,"0")} KN</p><p className="mt-2 text-xs text-[#a5bdc6]">WASD / arrows to drive · Discover five destinations</p></div>
      <div className="flex gap-2 md:hidden">
        <button aria-label="Turn left" data-boat-control data-turn="-1" className="rounded-xl border border-white/30 bg-[#0c3149bb] px-4 py-3">↶</button><button aria-label="Accelerate" data-boat-control data-throttle="1" className="rounded-xl border border-white/30 bg-[#0c3149bb] px-4 py-3">↑</button><button aria-label="Turn right" data-boat-control data-turn="1" className="rounded-xl border border-white/30 bg-[#0c3149bb] px-4 py-3">↷</button>
      </div>
    </div>
    <aside className="absolute right-5 top-36 w-[180px] rounded-2xl border border-white/20 bg-[#0c273bbd] p-4 backdrop-blur-md md:right-9 md:top-40 md:w-[230px]">
      <p className="text-[10px] uppercase tracking-[.25em] text-[#9fc2cf]">Chart your course</p>
      <div className="mt-4 space-y-3">{DESTINATIONS.map((p,i)=><Link key={p.href} href={p.href} className={`block border-l-2 pl-3 transition hover:text-[#8ed8e4] ${telemetry.nearest===i?"border-[#9ee3e9] text-white":"border-white/25 text-[#b7cdd5]"}`}><span className="block text-[11px] font-semibold">{p.name}</span><span className="text-[10px] opacity-75">{p.subtitle}</span></Link>)}</div>
      {closest && <Link href={closest.href} className="mt-4 block rounded-lg bg-[#d2eef0] px-3 py-2 text-center text-xs font-bold text-[#102b3b] hover:bg-white">Dock at {closest.name} ↗</Link>}
    </aside>
    {error && <div className="absolute bottom-32 left-5 rounded-lg bg-[#0b243b] p-4 text-sm">3D graphics unavailable: {error}. <Link href="/projects" className="underline">Browse projects</Link></div>}
    <button onClick={()=>setMuted(v=>!v)} aria-label="Audio setting" className="absolute bottom-28 right-5 hidden rounded-full border border-white/25 bg-[#102d43a3] px-4 py-2 text-xs md:block">{muted?"Audio off":"Ambient audio coming soon"}</button>
  </main>;
}
