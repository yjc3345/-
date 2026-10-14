
(()=>{const hex=new URLSearchParams(location.search).get("theme");if(!/^#[0-9a-fA-F]{6}$/.test(hex||""))return;const n=parseInt(hex.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;const blend=p=>`rgb(${Math.round(r*p+255*(1-p))},${Math.round(g*p+255*(1-p))},${Math.round(b*p+255*(1-p))})`;document.documentElement.style.setProperty("--teacher-color",hex);document.documentElement.style.setProperty("--teacher-pale",blend(.08));document.documentElement.style.setProperty("--teacher-soft",blend(.15));})();

(function(){
"use strict";
const $=id=>document.getElementById(id), pad=n=>String(n).padStart(2,"0");
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const local=s=>{const a=s.split("-").map(Number);return new Date(a[0],a[1]-1,a[2]);};
const fmt=s=>{const a=s.split("-");return Number(a[1])+"/"+Number(a[2]);};
const holidaysByYear={
2026:{"2026-01-01":"신정","2026-02-16":"설날 연휴","2026-02-17":"설날","2026-02-18":"설날 연휴","2026-03-02":"삼일절 대체공휴일","2026-05-01":"노동절","2026-05-05":"어린이날","2026-05-25":"부처님오신날 대체공휴일","2026-06-03":"지방선거일","2026-07-17":"제헌절","2026-08-17":"광복절 대체공휴일","2026-09-24":"추석 연휴","2026-09-25":"추석 연휴","2026-10-05":"개천절 대체공휴일","2026-10-09":"한글날","2026-12-25":"성탄절"},
2027:{"2027-01-01":"신정","2027-02-08":"설날 연휴","2027-02-09":"설날 대체공휴일","2027-03-01":"삼일절","2027-05-03":"노동절 대체공휴일","2027-05-05":"어린이날","2027-05-13":"부처님오신날","2027-07-19":"제헌절 대체공휴일","2027-08-16":"광복절 대체공휴일","2027-09-14":"추석 연휴","2027-09-15":"추석","2027-09-16":"추석 연휴","2027-10-04":"개천절 대체공휴일","2027-10-11":"한글날 대체공휴일","2027-12-27":"성탄절 대체공휴일"}
};
const templates={
"Sound Doctor 1":{noVocab:true,first:["첫수업 OT","Bb","Tt","Pp","Gg","Nn","Review (Game식으로)","Aa","Ee","Reviewing","Blending","Ss","Jj","Kk","Ll","Vv","Dd","Ii","Reviewing","Blending","전체 복습","전체 복습 (촬영 및 시험 설명)","동영상 촬영","Monthly Test","Activity!!"],room:"새김스튜던트, WB"},
"Sound Doctor 2":{noVocab:true,first:["Mm","Hh","Ff","Rr","Oo","Uu","Reviewing","Blending","Cc","Xx","Qq","Ww","Yy","Zz","Soft C","Soft G","Ending Y","Soft C, G 복습","Reviewing","Blending","1권 포함 전체복습","전체복습","동영상촬영","Monthly Test","Activity"],room:"새김스튜던트, WB"},
"Sound Doctor 3~6":{noVocab:true,first:Array.from({length:20},(_,i)=>i%5===4?"Review":"Unit "+(Math.floor(i/5)*2+Math.floor(i%5/2)+1)+" Lesson "+(i%2+1)).concat(["전체복습","전체복습","동영상 촬영","Monthly Test","Activity!!"]),room:"새김스튜던트, WB"},
"Pre A1~A2":{noVocab:true,kind:"day",room:"새김 Day "},
"Pre A3 (단어시작)":{kind:"day",room:"새김 Day "},
"Pre A4~Pre B(문법시작)":{kind:"day",room:"Day "},
"Silver A(수행마스터)":{kind:"silverA",room:"Day "},
"Silver B":{kind:"silverB",room:"Day "},
"Runner":{kind:"runner",room:"Day "},
"Inter B":{kind:"inter",room:"Day "}
};
function textbookTemplate(book){
const n=Number((book.match(/(\d+)$/)||[])[1]||1);
if(book.startsWith("Sound Doctor"))return n===1?templates["Sound Doctor 1"]:n===2?templates["Sound Doctor 2"]:templates["Sound Doctor 3~6"];
if(book.startsWith("Pre Stella A"))return n<=2?templates["Pre A1~A2"]:n===3?templates["Pre A3 (단어시작)"]:templates["Pre A4~Pre B(문법시작)"];
if(book.startsWith("Pre Stella B"))return templates["Pre A4~Pre B(문법시작)"];
if(book.startsWith("Silver Stella A"))return templates["Silver A(수행마스터)"];
if(book.startsWith("Silver Stella B"))return templates["Silver B"];
if(book.startsWith("Runner"))return templates.Runner;
return templates["Inter B"];
}
const homeworkByBook={
"Sound Doctor 1":[...["영어 이름 정하기","WS(Bb) / 음가연습","WS(Tt) / 음가연습","WS(Pp) / 음가연습","WS(Gg) / 음가연습"],...["WB / WS / 음가연습","알파벳 쓰기/음가연습",...Array(13).fill("WB / WS / 음가연습")],...Array(3).fill("알파벳 쓰기/음가연습"),"❤️","❤️"],
"Sound Doctor 2":[...Array.from({length:15},(_,i)=>i%5===4?"WB / WS / 단모음읽기":"WB / WS / 음가연습"),"WB / WS / 음가연습","WB / WS / 음가연습","Hard/soft 첸트읽기","WB / WS / 음가연습","WB / WS / 단모음읽기","이기소 / 단모음 읽기","이기소 /  단모음 읽기","이기소 / 단모음 읽기","❤️","♥"],
"Sound Doctor 3~6":[...Array.from({length:20},(_,i)=>i%5===4?"이기소쓰기 / 첸트읽기":"WB / WS / 첸트읽기"),...Array(4).fill("이기소쓰기 / 첸트읽기"),"♥"],
"Pre A1~A2":[...Array(4).fill("WB / 녹음"),"데일리체크업/녹음",...Array.from({length:15},(_,i)=>i%5===4?"데일리체크업/녹음":"WB / 녹음"),"WB고치기 / 녹음","파닉스 챈트 녹음","영독비 녹음 / WS","교재 고치기","♥"]
};
function textbookHomework(book,index){
const n=Number((book.match(/(\d+)$/)||[])[1]||1);
const k=book.startsWith("Sound Doctor")?(n===1?"Sound Doctor 1":n===2?"Sound Doctor 2":"Sound Doctor 3~6"):book.startsWith("Pre Stella A")&&n<=2?"Pre A1~A2":null;
return k?homeworkByBook[k][index]||"":"";
}
function makeLessons(book){
const t=textbookTemplate(book),out=[];
for(let i=0;i<25;i++){
const w=Math.floor(i/5),day=w*4+i%5+1,review=i%5===4;
let inclass=t.first?.[i];
if(!inclass){if(w===4){const endings=t.kind==="runner"?["전체복습","Monthly Test 및 I-Pattern 촬영","프레젠테이션 쓰기 및 촬영","문법 및 Activity","교재마무리"]:t.kind==="silverB"?["전체복습","Monthly Test 및 촬영","프레젠테이션 쓰기 및 촬영","문법/수행마스터 마무리","교재마무리"]:["전체복습","Monthly Test 및 촬영","프레젠테이션 쓰기 및 촬영","문법 및 Activity","교재마무리"];inclass=endings[i%5]}
else if(review){inclass=t.kind==="runner"?"Review & Weekly Test":t.kind==="silverA"?"Review + 수행마스터 Step "+(w+1):t.kind==="silverB"?"Review + 수행마스터 Step "+(w+1):t.kind==="inter"?"Review + Unit Test":"Review"}
else if(t.kind==="runner")inclass="Unit "+(w+1)+" - "+(i%5+1);
else inclass="Day "+day}
if(i===0&&!t.first)inclass=book+" START!!\n"+inclass;
const vocab=t.noVocab?"":review?"(누적) "+(w*40+1)+"~"+((w+1)*40):(w*40+(i%5)*10+1)+"~"+(w*40+(i%5+1)*10);
out.push({inclass,vocab,troom:review?"영어 도서관":t.room+(t.room.endsWith(" ")?day:""),homework:t.noVocab?textbookHomework(book,i):""});
}
return out;
}
let lessons=makeLessons("Inter Bridge 1");
let cells={}, config=null;
const key="evo-academy-schedule-v2",archiveKey="evo-academy-schedule-archive-v2";
let archive={},activePeriod=null,availableWindows=[],dataWindowArchiveIds=new Set(),scheduleLoadSequence=0,approvedScheduleKey=null;
const archiveId=c=>(c.className||"Inter Bridge 1")+"|"+c.start;
archive={};
const periodLabel=c=>{const a=local(c.start),b=local(c.end);return (a.getFullYear()===b.getFullYear()?"":a.getFullYear()+"년 ")+(a.getMonth()+1)+"월~"+(b.getMonth()+1)+"월";};
function drawTabs(){
 const names=[...new Set(Object.values(archive).map(x=>x.config.className||"Inter Bridge 1"))];
 const picker=$("className");if(!picker.dataset.assigned){for(const name of names.filter(n=>n!=="Inter Bridge 1")){if(!Array.from(picker.options).some(o=>o.value===name))picker.add(new Option(name,name))}}
 const nav=$("periodTabs");nav.replaceChildren();
 const selectedClass=$("className").value.trim();
const items=Object.entries(archive).filter(([id,item])=>(item.config.className||"Inter Bridge 1")===selectedClass).sort((a,b)=>a[1].config.start.localeCompare(b[1].config.start));
 for(const w of [...availableWindows].sort((a,b)=>(a.start_date||"").localeCompare(b.start_date||""))){
 const archived=items.find(([id,item])=>item.config.windowId===w.id||item.config.start===w.start_date);
 const tab=create("button","period-tab"+($("academyWindow").value===w.id?" active":""),w.label);
 tab.type="button";tab.setAttribute("aria-current",$("academyWindow").value===w.id?"page":"false");tab.title=w.start_date+" ~ "+w.end_date;
 tab.onclick=()=>{
 const select=$("academyWindow");select.value=w.id;select.dispatchEvent(new Event("change"));
 if(archived){const [id,item]=archived;activePeriod=id;config=structuredClone(item.config);cells=structuredClone(item.cells);$("book").value=config.book||"Inter Bridge 1";$("vocabStart").value=config.vocabStart||1;$("vocabResetDate").value=config.vocabResetDate||"";draw()}
 else{activePeriod=null;config=null;cells={};$("calendar").replaceChildren();document.querySelector(".sheet-title h2").textContent="";$("sheetClassName").textContent="";$("studentPeriod").textContent="";window.dispatchEvent(new CustomEvent("load-saved-schedule",{detail:{start:w.start_date,end:w.end_date,windowId:w.id,windowLabel:w.label,className:$("className").value}}))}
 drawTabs();
 };nav.append(tab);
 }
 if(!items.length){if(!nav.children.length)nav.appendChild(create("span","period-tab active","현재 스케줄"));return;}
 for(const [id,item] of items){
  if(availableWindows.length&&(!availableWindows.some(w=>w.id===item.config.windowId||w.start_date===item.config.start)))continue;
  if(dataWindowArchiveIds.has(item.config.windowId)||availableWindows.some(w=>w.start_date===item.config.start))continue;
  const btn=create("button","period-tab"+(id===activePeriod?" active":""),periodLabel(item.config));
  btn.type="button";btn.setAttribute("aria-current",id===activePeriod?"page":"false");
  btn.title=item.config.start+" ~ "+item.config.end;
  btn.addEventListener("click",()=>{
   if(id===activePeriod)return;
   activePeriod=id;config=structuredClone(archive[id].config);$("className").value=config.className||"Inter Bridge 1";if(config.book)$("book").value=config.book;cells=structuredClone(archive[id].cells);
   $("start").value=config.start;$("vocabStart").value=config.vocabStart||1;$("vocabResetDate").value=config.vocabResetDate||"";
   $("holidays").value=(config.holidays||[]).join(", ");
   refreshSuggestions();draw();
  });nav.appendChild(btn);
 }
}
window.addEventListener("message",event=>{if(event.origin!==location.origin||event.data?.type!=="academy-windows")return;const list=event.data.windows||[];if(!Array.isArray(list))return;dataWindowArchiveIds=new Set(list.slice(6).map(w=>w.id));availableWindows=list.slice(0,6);const select=document.getElementById("academyWindow");select.replaceChildren(new Option("수업 기간을 선택하세요",""));for(const w of availableWindows){const opt=new Option(w.label+" ("+(w.start_date||"시작일 미지정")+" ~ "+w.end_date+")",w.id);opt.dataset.start=w.start_date||"";opt.dataset.end=w.end_date||"";opt.dataset.holidays=(w.holidays||[]).join(",");opt.dataset.holidayNames=JSON.stringify(w.holiday_names||{});opt.dataset.specialDays=JSON.stringify(w.special_days||{});select.add(opt)}if(availableWindows.length){select.value=availableWindows[0].id;select.dispatchEvent(new Event("change"));}drawTabs();if(select.value&&document.getElementById("className").value){const w=availableWindows.find(x=>x.id===select.value);if(w)window.dispatchEvent(new CustomEvent("load-saved-schedule",{detail:{start:w.start_date,end:w.end_date,windowId:w.id,windowLabel:w.label,className:document.getElementById("className").value}}))}});
function persistArchive(){/* 임시 변경은 저장하지 않습니다. */}
function vocabFor(index,start){const block=Math.floor(index/5),position=index%5,first=start+block*40;return position===4?"(누적) "+first+"~"+(first+39):(first+position*10)+"~"+(first+position*10+9);}
function printFit(){
 const weeks=Math.max($("calendar").querySelectorAll(".date-row").length,1);
 const lessonRows=$("calendar").querySelectorAll(".lesson-row").length;
 const lessonPerWeek=Math.max(1,Math.round(lessonRows/weeks));
 // 날짜, Voca, T-Room, Homework는 동일한 높이; Inclass만 1.8배.
 // A4 인쇄 가능 높이 200mm 중 제목 10mm와 안전 여백 7mm를 제외한 183mm를 사용.
 const body=183;
 const unitsPerWeek=1+Math.max(0,lessonPerWeek-1)+1.8;
 const unit=body/(weeks*unitsPerWeek);
 const inclass=unit*1.8;
 const root=document.documentElement.style;
 root.setProperty("--week-height",(body/weeks).toFixed(4)+"mm");
 root.setProperty("--week-count",String(weeks));
 root.setProperty("--print-body-height",body+"mm");
 root.setProperty("--print-table-height",body+"mm");
 root.setProperty("--print-date-height",unit.toFixed(4)+"mm");
 root.setProperty("--print-lesson-height",unit.toFixed(4)+"mm");
 root.setProperty("--print-inclass-height",inclass.toFixed(4)+"mm");
 root.setProperty("--print-font-size",(unit<4.8?5.5:unit<6?6:7)+"pt");
}
window.getCurrentTeacherSchedule=()=>config?{config:structuredClone(config),cells:structuredClone(cells)}:null;window.clearTeacherSchedule=()=>{config=null;scratchDraw();cells={};activePeriod=null;$("calendar").replaceChildren();document.querySelector(".sheet-title h2").textContent="";$("sheetClassName").textContent="";$("studentPeriod").textContent="";};
// 관리자 읽기 전용 미리보기: 교사용 달력과 동일한 렌더링/인쇄 스타일 사용
window.addEventListener("message",event=>{
 if(event.origin!==location.origin||event.data?.type!=="admin-schedule-preview")return;
 const payload=event.data;window.__adminPreviewPayload=payload;
 const w=payload.window||{};
 availableWindows=[{id:w.id||"admin-preview",start_date:w.start_date||payload.period.start_date,end_date:w.end_date||payload.period.end_date,holidays:w.holidays||[],holiday_names:w.holiday_names||{},special_days:w.special_days||{}}];
 const select=$("academyWindow");select.replaceChildren(new Option(w.label||payload.period.label||"관리자 기간",availableWindows[0].id));select.options[0].dataset.holidayNames=JSON.stringify(w.holiday_names||{});select.options[0].dataset.specialDays=JSON.stringify(w.special_days||{});
 const rows={};for(const r of payload.cells||[])rows[r.lesson_date]={inclass:r.inclass||"",troom:r.troom||"",vocab:r.vocab_base||"",homework:r.homework||"",holiday:!!r.is_holiday,lesson:!r.is_holiday&&!!([r.inclass,r.troom,r.vocab_base,r.homework].some(v=>String(v||"").trim()))};
 try{
 window.applySavedTeacherSchedule({start:payload.period.start_date,end:w.end_date||payload.period.end_date,windowId:availableWindows[0].id,holidays:w.holidays||[],book:payload.period.book||"Inter Bridge 1",className:payload.period.class_name||"",vocabStart:1},rows);
 }catch(err){
  parent.postMessage({type:"admin-schedule-error",message:String(err?.message||err)},location.origin);
  return;
 }
 document.querySelectorAll("textarea").forEach(el=>{el.readOnly=true});
 parent.postMessage({type:"admin-schedule-rendered",periodId:payload.period.id,rowCount:$("calendar").children.length},location.origin);
 document.querySelectorAll(".controls,.schedule-bottom-actions,#scratchTray").forEach(el=>el.style.display="none");
});
window.applySavedTeacherSchedule=(c,rows)=>{c.noVocab=textbookTemplate(c.book||"Inter Bridge 1").noVocab||false;c.hasHomework=!!c.noVocab;config=c;cells=rows;approvedScheduleKey=null;activePeriod=archiveId(c);const savedWindow=availableWindows.find(w=>w.start_date===c.start||w.id===c.windowId);if(savedWindow){if(savedWindow.end_date&&savedWindow.end_date>c.end)c.end=savedWindow.end_date;$("academyWindow").value=savedWindow.id;$("start").value=savedWindow.start_date||"";$("holidays").value=(savedWindow.holidays||[]).join(",");}$("book").value=c.book||"Inter Bridge 1";$("vocabStart").value=c.vocabStart||1;$("vocabResetDate").value=c.vocabResetDate||"";draw();drawTabs()};
function save(){/* 저장 버튼을 누르기 전에는 브라우저에 기록하지 않습니다. */}
function create(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
let dragFrom=null;
const scratchKey=()=>config?"scratch|"+config.className+"|"+config.start:"";
const scratchRead=()=>{try{return JSON.parse(localStorage.getItem(scratchKey())||"[]")}catch{return []}};
function scratchWrite(items){localStorage.setItem(scratchKey(),JSON.stringify(items));scratchDraw()}
function scratchDraw(){const box=$("scratchItems");box.replaceChildren();if(!config)return;const items=scratchRead();if(!items.length)box.textContent="여기에 내용을 놓으세요.";items.forEach((item,i)=>{const el=create("div","scratch-entry");el.draggable=canEditCell();el.textContent=item.field+" · "+item.text;el.addEventListener("dragstart",e=>{if(!canEditCell()){e.preventDefault();return}dragFrom={scratch:i,field:item.field};e.dataTransfer.setData("text/plain","scratch:"+i)});el.addEventListener("dragend",()=>{dragFrom=null});box.append(el)})}
const trash=$("scratchTrash");
trash.addEventListener("dragover",e=>{if(!Number.isInteger(dragFrom?.scratch)||!canEditCell())return;e.preventDefault();e.stopPropagation();e.dataTransfer.dropEffect="move";trash.classList.add("trash-hover")});
trash.addEventListener("dragleave",()=>trash.classList.remove("trash-hover"));
trash.addEventListener("drop",e=>{e.preventDefault();e.stopPropagation();trash.classList.remove("trash-hover");const from=dragFrom;dragFrom=null;if(!Number.isInteger(from?.scratch)||!canEditCell())return;const items=scratchRead();if(!items[from.scratch])return;if(!confirm("임시 보관함의 이 항목을 삭제하시겠습니까?"))return;items.splice(from.scratch,1);scratchWrite(items)});
$("scratchTray").addEventListener("dragover",e=>{if(dragFrom?.date&&canEditCell())e.preventDefault()});
$("scratchTray").addEventListener("drop",e=>{e.preventDefault();const from=dragFrom;dragFrom=null;if(!from?.date||!canEditCell())return;const value=cells[from.date]?.[from.field];if(!value)return;const items=scratchRead();items.push({field:from.field,text:value});cells[from.date][from.field]="";scratchWrite(items);draw()});

function canEditCell(){return !document.getElementById("approvalStatus")?.textContent.includes("승인 완료");}
function installCellDrag(td,area,printed,date,field){
 td.classList.add("draggable-lesson");
 area.readOnly=true;
 td.draggable=true;
 td.addEventListener("dblclick",()=>{if(!canEditCell())return;area.readOnly=false;area.focus();area.select();});td.addEventListener("click",()=>{if(!canEditCell()||String(cells[date]?.[field]||"").trim())return;area.readOnly=false;area.focus();});
 area.addEventListener("blur",()=>{area.readOnly=true;});
 td.addEventListener("dragstart",e=>{
  if(!canEditCell()||!cells[date]?.[field]){e.preventDefault();return;}
  dragFrom={date,field};e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",date+"|"+field);td.classList.add("dragging");
 });
 td.addEventListener("dragend",()=>{dragFrom=null;document.querySelectorAll(".dragging,.drag-over").forEach(el=>el.classList.remove("dragging","drag-over"));});
 td.addEventListener("dragover",e=>{if(!dragFrom||dragFrom.field!==field||!canEditCell())return;e.preventDefault();e.dataTransfer.dropEffect="move";td.classList.add("drag-over");});
 td.addEventListener("dragleave",()=>td.classList.remove("drag-over"));
 td.addEventListener("drop",e=>{
  e.preventDefault();td.classList.remove("drag-over");
  const from=dragFrom;dragFrom=null;
  if(!from||from.field!==field||!canEditCell()||!cells[date]||cells[date].holiday||cells[date].special)return;
  if(Number.isInteger(from.scratch)){const items=scratchRead(),item=items[from.scratch];if(!item)return;const old=cells[date][field]||"";cells[date][field]=item.text;if(old)items[from.scratch]={field,text:old};else items.splice(from.scratch,1);scratchWrite(items);draw();return}
  if(from.date===date||!cells[from.date]||cells[from.date].holiday||cells[from.date].special)return;
  const value=cells[from.date][field]||"",target=cells[date][field]||"";
  if(!value)return;
  if(target&&!confirm("두 날짜의 내용을 서로 교환할까요?"))return;
  cells[date][field]=value;cells[from.date][field]=target;draw();
 });
}
function draw(){
 if(!config)return;
 document.querySelector(".sheet-title h2").textContent=config.book||"Inter Bridge 1";$("sheetClassName").textContent=approvedScheduleKey===(config.className+"|"+config.start)?config.className||"":"";lessons=makeLessons(config.book||"Inter Bridge 1");
 const tbody=$("calendar");tbody.replaceChildren();
 // 기존 저장 진도 중 새 휴무일/기념일에 겹친 항목은 다음 수업일로 이동 (서버 자동 저장 없음).
 const windowInfo=availableWindows.find(w=>w.id===config.windowId||w.start_date===config.start)||availableWindows.find(w=>w.id===$("academyWindow").value);
 const specialDates=windowInfo?.special_days||{};
 const blocked=new Set([...(config.holidays||[]),...(windowInfo?.holidays||[]),...Object.keys(specialDates)]);
 // 관리자 기간의 마지막 날짜까지 빈 날짜도 편집할 수 있도록 보존합니다.
 const occupied=Object.keys(cells).filter(d=>cells[d]?.lesson&&!cells[d]?.holiday).sort();
 if(occupied.some(d=>blocked.has(d))){
  // 기존 진도를 원래 순서대로 보존하고, 행사/휴무일 이후의 정상 수업일로 순연합니다.
  const sequence=occupied.map(d=>({...cells[d]}));
  const dates=[];
  const endDate=windowInfo?.end_date||config.end;
  for(let d=local(config.start);d<=local(endDate);d.setDate(d.getDate()+1)){
   const k=iso(d);if(d.getDay()!==0&&d.getDay()!==6&&!blocked.has(k))dates.push(k);
  }
  if(dates.length>=sequence.length){
   for(const d of occupied)delete cells[d];
   for(let i=0;i<sequence.length;i++)cells[dates[i]]={...sequence[i],lesson:true,special:false,holiday:false};
  }else{
   $("message").textContent="행사일·휴무일을 제외하면 진도를 모두 옮길 수 없습니다. 관리자 기간을 연장해야 합니다.";
  }
 }
 const officialEnd=[config.end,windowInfo?.end_date,$("academyWindow").selectedOptions[0]?.dataset.end].filter(Boolean).sort().at(-1);if(officialEnd&&officialEnd>config.end)config.end=officialEnd;const start=local(config.start),end=local(officialEnd);
 const first=new Date(start);first.setDate(first.getDate()-(first.getDay()+6)%7);
 const last=new Date(end);last.setDate(last.getDate()+(5-last.getDay()+7)%7);
 let cursor=new Date(first),rows=0;
 while(cursor<=last&&rows<60){
  const dates=[];
  for(let i=0;i<5;i++){dates.push(iso(cursor));cursor.setDate(cursor.getDate()+1);}
  const fields=[["date","날짜"],["inclass","Inclass"],...(config.noVocab?[]:[["vocab","Vocab."]]),["troom","T-Room"],...(config.hasHomework?[["homework","Homework"]]:[])];
  for(const [field,labelText] of fields){
   const tr=create("tr",field==="date"?"date-row":"lesson-row "+field+"-row");
   tr.appendChild(create("th","sidehead",labelText));
   for(let i=0;i<5;i++){
    const date=dates[i],outside=local(date)<start||local(date)>end;
    const chosenWindow=availableWindows.find(w=>w.id===config.windowId||w.start_date===config.start);
    const specialNames=chosenWindow?.special_days||JSON.parse($("academyWindow").selectedOptions[0]?.dataset.specialDays||"{}");
    const holidayNames=chosenWindow?.holiday_names||JSON.parse($("academyWindow").selectedOptions[0]?.dataset.holidayNames||"{}");
    const isHoliday=(config.holidays||[]).includes(date)||(chosenWindow?.holidays||[]).includes(date);
    if(!outside&&isHoliday)cells[date]={holiday:true,lesson:false};
    else if(!outside&&Object.hasOwn(specialNames,date)){
      cells[date]={special:true,lesson:false,homework:config.hasHomework?(cells[date]?.homework||""):""};
    }
    if(!outside&&!isHoliday&&!Object.hasOwn(specialNames,date)){
     // 저장된 진도가 끝난 뒤에도 관리자 지정 종료일까지 빈 날짜를 편집/드래그 대상으로 유지.
     if(!cells[date])cells[date]={lesson:true,inclass:"",vocab:"",troom:"",homework:""};
     else if(!cells[date].holiday&&!cells[date].special)cells[date].lesson=true;
    }
    const data=cells[date];
    const cumulative=field==="vocab"&&data&&data.lesson&&String(data.vocab||"").includes("(누적)");
    const td=create("td",(outside?"off ":"")+(data&&data.holiday?"holiday ":"")+(cumulative?"cumulative ":""));
    if(field==="date"){const dateLabel=create("div","celltop",fmt(date)+" ("+["월","화","수","목","금"][i]+")");if(isHoliday||data?.holiday){dateLabel.classList.add("holiday-date-label");dateLabel.style.setProperty("color","#c62828","important");}td.appendChild(dateLabel);}
    else if(data&&data.holiday){if(field==="inclass")td.appendChild(create("div","holidaytext",holidayNames[date]||"휴무일"));}else if(data&&data.special&&field!=="homework"){if(field==="inclass")td.appendChild(create("div","specialtext",specialNames[date]||"기념일"));}
    else if(data&&(data.lesson||(data.special&&field==="homework"))){
     const area=create("textarea"),printed=create("div","print-value");
     area.value=data[field]||"";printed.textContent=area.value;
     area.setAttribute("aria-label",date+" "+labelText);
     area.rows=Math.max(1,area.value.split("\n").length);
     area.addEventListener("input",()=>{cells[date][field]=area.value;printed.textContent=area.value;td.classList.toggle("cumulative",field==="vocab"&&area.value.includes("(누적)"));save();});
     td.append(area,printed);installCellDrag(td,area,printed,date,field);
    }
    tr.appendChild(td);
   }
   tbody.appendChild(tr);
  }
  cursor.setDate(cursor.getDate()+2);rows++;
 }
 $("period").textContent="선생님용 · 수업 기간: "+config.start+" ~ "+config.end+"  |  월~금 수업  |  휴무일 "+config.holidays.length+"일";
 $("studentPeriod").textContent=config.start+" ~ "+config.end;
 printFit();drawTabs();scratchDraw();
}
function readHolidays(){return [...new Set($("holidays").value.split(/[,，\n]+/).map(s=>s.trim()).filter(Boolean))];}
function refreshSuggestions(){
 const start=$("start").value,options=$("holidayOptions");options.replaceChildren();
 if(!start){$("holidayInfo").textContent="시작일을 선택하면 공휴일을 추천합니다.";return;}
 const startDate=local(start),endDate=local(start);endDate.setDate(endDate.getDate()+50);
 const selected=new Set(readHolidays());let count=0;
 for(let d=new Date(startDate);d<=endDate;d.setDate(d.getDate()+1)){
 const date=iso(d),name=(holidaysByYear[d.getFullYear()]||{})[date];
 if(!name||d.getDay()===0||d.getDay()===6)continue;
 const label=create("label","holiday-option"),check=create("input");check.type="checkbox";check.checked=selected.has(date);
 check.addEventListener("change",()=>{const days=new Set(readHolidays());if(check.checked)days.add(date);else days.delete(date);$("holidays").value=[...days].sort().join(", ");refreshSuggestions();});
 label.append(check,document.createTextNode(date+" · "+name));options.appendChild(label);count++;
 }
 const years=[...new Set([startDate.getFullYear(),endDate.getFullYear()])];
 $("holidayInfo").textContent=years.some(y=>!holidaysByYear[y])?"해당 연도의 공휴일 정보가 아직 준비되지 않았습니다. 휴무일을 직접 입력해 주세요.":count?"수업 시작일부터 약 50일 내 평일 공휴일입니다. 학원 운영 여부에 따라 선택하세요.":"이 기간에는 추천할 평일 공휴일이 없습니다.";
}
$("start").addEventListener("change",refreshSuggestions);
$("holidays").addEventListener("input",refreshSuggestions);
function generate(){
 const chosenClass=$("className").value;if(!chosenClass){$("message").textContent="상단의 담당 수업을 먼저 선택해 주세요. 수업 목록이 비어 있다면 페이지를 새로고침해 주세요."; $("className").focus();return;}
 const book=$("book").value;
 lessons=makeLessons(book);
 const selectedWindow=$("academyWindow").selectedOptions[0];if(!$("academyWindow").value){$("message").textContent="관리자가 등록한 수업 기간을 선택해 주세요.";return;}
 const start=$("start").value;
 if(!start){$("message").textContent="관리자가 시작일을 등록한 기간을 선택해 주세요.";return;}
 if(selectedWindow.dataset.end&&start>selectedWindow.dataset.end){$("message").textContent="시작일이 공통 종료일보다 늦을 수 없습니다.";return;}
 const tokens=($("academyWindow").selectedOptions[0]?.dataset.holidays||"").split(",").map(s=>s.trim()).filter(Boolean);
 const valid=/^\d{4}-\d{2}-\d{2}$/;
 if(tokens.some(s=>!valid.test(s)||iso(local(s))!==s)){$("message").textContent="휴무일을 YYYY-MM-DD 형식으로 입력해 주세요.";return;}
 const holidays=[...new Set(tokens)];
 const vocabStart=Number($("vocabStart").value);
 if(!Number.isSafeInteger(vocabStart)||vocabStart<1||vocabStart>99999){$("message").textContent="단어 시작 번호는 1 이상의 정수로 입력해 주세요.";return;}

 const vocabResetDate=$("vocabResetDate").value;
 if(vocabResetDate&&(vocabResetDate<=start||(selectedWindow.dataset.end&&vocabResetDate>selectedWindow.dataset.end))){$("message").textContent="재시작 날짜는 수업 시작일 이후, 기간 종료일 이내로 선택해 주세요.";return;}
 let resetLessonIndex=null;
 activePeriod=null;approvedScheduleKey=null;cells={};let count=0;let end=start;
 for(let d=local(start),steps=0;count<lessons.length&&steps<365;d.setDate(d.getDate()+1),steps++){
  const day=d.getDay(),date=iso(d);if(day===0||day===6)continue;
  if(holidays.includes(date)){cells[date]={holiday:true};continue;}if(Object.hasOwn(JSON.parse(selectedWindow.dataset.specialDays||"{}"),date)){cells[date]={special:true,homework:"",lesson:false};continue;}
  if(count<lessons.length){if(vocabResetDate&&date>=vocabResetDate&&resetLessonIndex===null)resetLessonIndex=count;const vocabIndex=resetLessonIndex===null?count:count-resetLessonIndex;cells[date]={...lessons[count],vocab:textbookTemplate(book).noVocab?"":vocabFor(vocabIndex,resetLessonIndex===null?vocabStart:1),lesson:true};count++;end=date;}
 }
 if(selectedWindow.dataset.end&&end>selectedWindow.dataset.end){$("message").textContent="선택한 기간의 종료일("+selectedWindow.dataset.end+")까지 교재 진도 "+count+"일을 모두 배치할 수 없습니다. 관리자에게 기간 연장을 요청해 주세요.";return;}
 config={start,end:selectedWindow.dataset.end||end,windowId:$("academyWindow").value,windowLabel:selectedWindow.textContent,holidays,vocabStart,vocabResetDate,book,noVocab:textbookTemplate(book).noVocab||false,hasHomework:!!textbookTemplate(book).noVocab,className:$("className").value.trim()||"Inter Bridge 1"};
 $("message").textContent="기본 진도 "+count+"일을 자동 배치했습니다. 마지막 수업일: "+end;
 save();draw();
}
$("generate").onclick=generate;
$("print").onclick=()=>{if(!config){$("message").textContent="먼저 스케줄을 생성해 주세요.";return;}window.print();};
$("reset").onclick=()=>{if(!confirm("직접 수정한 내용을 지우고 기본 진도로 다시 생성할까요?"))return;generate();};
const now=new Date();
$("start").value=iso(now);
try{localStorage.removeItem(key);localStorage.removeItem(archiveKey)}catch(e){}
$("className").addEventListener("change",()=>{scheduleLoadSequence++;config=null;cells={};activePeriod=null;approvedScheduleKey=null;$("calendar").replaceChildren();$("sheetClassName").textContent="";document.querySelector(".sheet-title h2").textContent="";$("studentPeriod").textContent="";$("message").textContent="";drawTabs();const selected=availableWindows.find(w=>w.id===$("academyWindow").value);if(selected&&$("className").value)window.dispatchEvent(new CustomEvent("load-saved-schedule",{detail:{start:selected.start_date,end:selected.end_date,windowId:selected.id,windowLabel:selected.label,className:$("className").value}}));});
refreshSuggestions();drawTabs();
})();
