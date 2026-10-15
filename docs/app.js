"use strict";
let cases = [], active, shown = false;
const $ = id => document.getElementById(id);
const labels = {preserved:"Preserved",dictated:"Dictated change",blurb:"Blurb expanded",added:"Level added"};
function add(parent, tag, text, cls) { const el=document.createElement(tag); el.textContent=text; if(cls)el.className=cls; parent.appendChild(el); return el; }
const logicCases={
 lumbar:[{kind:"dictated",mention:"At L4-5, a 2 mm posterior disc herniation.",where:"Findings · L4-5 and Impression",result:"A 2 mm posterior disc herniation is present.",why:"The dictated finding replaces the conflicting normal statement. No canal stenosis stays."},
 {kind:"blurb",mention:"demo height and signal blurb",where:"Findings · L5-S1",result:"Disc height and signal are decreased.",why:"The named teaching blurb is inserted at the active level. Its rule specifies Findings only."}],
 cervical:[{kind:"dictated",mention:"mild left neural foraminal narrowing",where:"Findings · C5-6 and Impression",result:"Mild left neural foraminal narrowing.",why:"Update the left foramen while preserving unrelated normal findings."},
 {kind:"unresolved",mention:"small protrusion blurb",where:"C5-6 · held",result:"No expansion inserted.",why:"This teaching blurb needs a measurement. The recording does not supply one, so it is flagged instead of guessed."}],
 thoracic:[{kind:"added",mention:"T11-12",where:"New Findings level · T11-12 and Impression",result:"A small posterior disc bulge is present.",why:"The dictated level is absent from this shortened template and must be added."}]
};
function drawDictation(){const root=$("dictation");root.replaceChildren();const matches=[];for(const x of logicCases[active.id]){const start=active.dictation.toLowerCase().indexOf(x.mention.toLowerCase());if(start>=0)matches.push({...x,start,end:start+x.mention.length});}let at=0;for(const m of matches.sort((a,b)=>a.start-b.start)){if(m.start<at)continue;root.append(document.createTextNode(active.dictation.slice(at,m.start)));add(root,"mark",active.dictation.slice(m.start,m.end),"mark-"+m.kind);at=m.end;}root.append(document.createTextNode(active.dictation.slice(at)));}
function drawLogic(){const root=$("logic-ledger");root.replaceChildren();for(const x of logicCases[active.id]){const card=add(root,"article","","logic-item kind-"+x.kind);add(card,"h3",x.kind==="blurb"?"Blurb expansion":x.kind==="unresolved"?"Needs attention":x.kind==="added"?"Level added":"Dictated finding");add(card,"blockquote",x.mention);add(card,"p","Placement: "+x.where,"logic-placement");add(card,"p",shown?x.result:"Show the draft to reveal the result.","logic-result");add(card,"p",x.why,"small");}}

function draw() {
  $("case-title").textContent=active.title; drawDictation(); drawLogic();
  $("report-rows").replaceChildren();
  for(const row of active.rows){const line=add($("report-rows"),"div","","level-row");
    for(const side of ["before","after"]){const cell=add(line,"div","",side==="after"&&shown&&row.kind!=="preserved"?"edited kind-"+row.kind:"");
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
