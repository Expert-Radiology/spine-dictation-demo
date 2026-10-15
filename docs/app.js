"use strict";
let cases = [], active, shown = false;
const $ = id => document.getElementById(id);
const labels = {preserved:"Preserved",dictated:"Dictated change",blurb:"Blurb expanded",added:"Level added"};
function add(parent, tag, text, cls) { const el=document.createElement(tag); el.textContent=text; if(cls)el.className=cls; parent.appendChild(el); return el; }
function draw() {
  $("case-title").textContent=active.title; $("dictation").textContent=active.dictation;
  $("report-rows").replaceChildren();
  for(const row of active.rows){const line=add($("report-rows"),"div","","level-row");
    for(const side of ["before","after"]){const cell=add(line,"div","",side==="after"&&shown&&row.kind!=="preserved"?"edited":"");
      add(cell,"span",side==="before"?"Template":"Draft","mobile-label");
      add(cell,"span",row.level,"level");
      if(side==="after")add(cell,"span",shown?labels[row.kind]:"Awaiting draft","tag");
      add(cell,"p",side==="before"?row.before:shown?row.after:"Show the draft to see this level.",side==="after"&&!shown?"ghost":"");}}
  $("impression").textContent=shown?active.impression:"Show the draft to see the changes.";
  $("attention").hidden=!(shown&&active.warning); $("attention").textContent="Needs attention: "+active.warning;
  $("blurb-note").textContent=active.id==="lumbar"?"Teaching blurb: “height and signal” adds “Disc height and signal are decreased.” at L5-S1. This teaching rule belongs in Findings only, so it is not copied into Impression.":active.id==="cervical"?"Teaching blurb: “small protrusion” requires a size. The missing measurement is flagged, and no blurb text is invented.":"No blurb is mentioned. T11-12 is missing from this shortened teaching template, so the dictated level is added.";
  $("status").textContent=shown?"Preset draft displayed. Fictional content; review is still required.":"Ready. Compare the template with its scripted draft.";
  $("reveal").textContent=shown?"Reset comparison":"Show how the draft changes";
}
$("example").addEventListener("change",()=>{active=cases.find(x=>x.id===$("example").value);shown=false;$("audio").pause();$("audio").src=active.audio;draw();});
$("reveal").addEventListener("click",()=>{shown=!shown;draw();});
fetch("examples.json").then(r=>{if(!r.ok)throw Error("examples");return r.json()}).then(data=>{cases=data.cases;active=cases[0];$("audio").src=active.audio;$("reveal").disabled=false;draw();}).catch(()=>{$("status").textContent="The examples could not load. Please reload this page.";$("case-title").textContent="Example unavailable";});
