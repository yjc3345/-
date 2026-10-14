
(()=>{"use strict";
const $=id=>document.getElementById(id);
const client=supabase.createClient("https://eovntwuvjzvnztyxzwer.supabase.co","sb_publishable_XMxCvN3wguCsjUY-6GrR2g_HidFJtoc");
let current=null;
function setTeacherTheme(hex){if(!/^#[0-9a-fA-F]{6}$/.test(hex||""))hex="#27538d";const n=parseInt(hex.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;const pale=`rgb(${Math.round(r*.10+255*.90)},${Math.round(g*.10+255*.90)},${Math.round(b*.10+255*.90)})`;document.documentElement.style.setProperty("--teacher-color",hex);document.documentElement.style.setProperty("--teacher-pale",pale);const frame=$("scheduleFrame");if(frame)frame.src="./?theme="+encodeURIComponent(hex)+"&style=v121"}
async function sendScheduleWindows(){
 const frame=$("scheduleFrame");if(!frame||!current)return;
 const {data,error}=await client.from("academy_schedule_windows").select("id,label,start_date,end_date,holidays,holiday_names,special_days").order("start_date",{ascending:false});
 if(!error&&frame.contentWindow)frame.contentWindow.postMessage({type:"academy-windows",windows:data||[]},location.origin);
}
$("scheduleFrame").addEventListener("load",()=>{if(current)sendScheduleWindows()});
function msg(id,text){$(id).textContent=text||""}
function show(id,visible){$(id).classList.toggle("hidden",!visible)}
async function load(){
 const {data:{user}}=await client.auth.getUser();
 if(!user){setTeacherTheme("#27538d");show("teacherLogout",false);show("historyButton",false);show("historyPanel",false);current=null;show("loginPanel",true);show("accountPanel",false);show("adminPanel",false);show("schedulePanel",false);return;}
 const {data,error}=await client.from("staff_profiles").select("*").eq("user_id",user.id).single();
 if(error||!data){await client.auth.signOut();msg("loginMessage","등록되지 않은 계정입니다. 관리자에게 문의하세요.");return load();}
 current=data;setTeacherTheme(data.theme_color);setTimeout(sendScheduleWindows,350);show("teacherLogout",data.role!=="admin"&&!data.must_change_password);show("historyButton",!data.must_change_password);show("historyPanel",false);show("loginPanel",false);show("accountPanel",true);show("adminTab",data.role==="admin"&&!data.must_change_password);
 $("welcome").textContent=data.display_name+" · "+(data.role==="admin"?"관리자":"선생님");
 $("changeNotice").textContent=data.must_change_password?"첫 로그인입니다. 다른 기능을 사용하기 전에 비밀번호를 변경하세요.":"필요할 때 비밀번호를 변경할 수 있어요.";
 show("schedulePanel",!data.must_change_password);show("passwordArea",!!data.must_change_password);show("adminPanel",false);$("adminTab").textContent="관리자";
 if(data.role==="admin"&&!data.must_change_password){await staff();const requested=new URLSearchParams(location.search).get("viewTeacher");if(requested&&Array.from($("viewTeacher").options).some(o=>o.value===requested)){$("adminTab").click();document.querySelector('[data-pane="view"]')?.click();$("viewTeacher").value=requested;$("viewTeacher").dispatchEvent(new Event("change"));}}
}
$("loginForm").onsubmit=async e=>{
 e.preventDefault();msg("loginMessage","로그인 확인 중...");
 const name=$("username").value.trim();
 if(!/^[A-Za-z][A-Za-z0-9_-]{1,30}$/.test(name)){msg("loginMessage","아이디를 확인해 주세요.");return;}
 const {error}=await client.auth.signInWithPassword({email:name.toLowerCase()+"@accounts.evo-ai.invalid",password:$("password").value});
 $("password").value="";
 if(error){msg("loginMessage","아이디 또는 비밀번호가 올바르지 않습니다.");return;}
 msg("loginMessage","");await load();
};
$("changeForm").onsubmit=async e=>{
 e.preventDefault();const p=$("newPassword").value;
 if(p.length<6||p!==$("confirmPassword").value){msg("accountMessage","6자 이상이며 서로 일치하는 비밀번호를 입력해 주세요.");return;}
 const {error}=await client.auth.updateUser({password:p});
 if(error){msg("accountMessage",error.message);return;}
 const {error:flagError}=await client.rpc("confirm_my_password_change");
 $("newPassword").value="";$("confirmPassword").value="";
 msg("accountMessage",flagError?"비밀번호는 변경됐지만 상태 업데이트에 실패했습니다. 관리자에게 문의하세요.":"비밀번호가 변경됐습니다.");
 await load();
};
$("scheduleTab").onclick=()=>{if(current?.must_change_password)return;show("schedulePanel",true);show("historyPanel",false);show("adminPanel",false);show("passwordArea",false)};
$("adminTab").onclick=()=>{if(current?.role!=="admin"||current.must_change_password)return;const opening=$("adminPanel").classList.contains("hidden");show("schedulePanel",!opening);show("historyPanel",false);show("adminPanel",opening);show("passwordArea",false);$("adminTab").textContent=opening?"시간표로 돌아가기":"관리자"};
$("passwordTab").onclick=()=>{show("schedulePanel",false);show("historyPanel",false);show("adminPanel",false);show("passwordArea",true)};
$("logout").onclick=async()=>{await client.auth.signOut();await load()};
let historyPeriods=[];
async function openHistory(){
if(!current||current.must_change_password)return;
show("schedulePanel",false);show("adminPanel",false);show("historyPanel",true);msg("historyMessage","불러오는 중...");
const [windowsResult,periodsResult]=await Promise.all([
 client.from("academy_schedule_windows").select("id,start_date,end_date").order("start_date",{ascending:false}),
 client.from("schedule_periods").select("id,label,start_date,end_date,class_name,teacher_id").order("start_date",{ascending:false})
]);
if(windowsResult.error||periodsResult.error){msg("historyMessage",(windowsResult.error||periodsResult.error).message);return}
const windows=windowsResult.data||[],recent=windows.slice(0,6),old=windows.slice(6);
const oldStarts=new Set(old.map(w=>w.start_date)),recentStarts=new Set(recent.map(w=>w.start_date));
const oldestRecent=recent.length?recent[recent.length-1].start_date:null;
historyPeriods=(periodsResult.data||[]).filter(p=>(current.role==="admin"||p.teacher_id===current.user_id)&&(oldStarts.has(p.start_date)||(!recentStarts.has(p.start_date)&&oldestRecent&&p.start_date<oldestRecent)));
const select=$("historyClass");select.replaceChildren(new Option("전체 반",""));
for(const name of [...new Set(historyPeriods.map(p=>p.class_name||"미지정"))])select.add(new Option(name,name));
renderHistory();
}
async function viewHistory(p){const box=$("historyDetail");box.replaceChildren();const heading=document.createElement("h3");heading.textContent=(p.class_name||"수업")+" · "+p.start_date+" ~ "+p.end_date;box.append(heading);const {data,error}=await client.from("schedule_cells").select("lesson_date,inclass,vocab_base,troom,homework,is_holiday").eq("period_id",p.id).order("lesson_date");if(error){const note=document.createElement("p");note.textContent=error.message;box.append(note);return}const textbookTitle=document.createElement("h3");textbookTitle.className="admin-textbook-title";box.append(textbookTitle);const table=document.createElement("table");table.className="teacher-table";const head=document.createElement("tr");for(const name of ["날짜","Inclass","Vocab.","T-Room"]){const th=document.createElement("th");th.textContent=name;head.append(th)}table.append(head);for(const c of data||[]){const tr=document.createElement("tr");for(const value of [c.lesson_date,c.is_holiday?"휴무":c.inclass,c.is_holiday?"":c.vocab_base,c.is_holiday?"":c.troom]){const td=document.createElement("td");td.textContent=value||"";tr.append(td)}table.append(tr)}box.append(table)}
function renderHistory(){const box=$("historyList");box.replaceChildren();$("historyDetail").replaceChildren();const cls=$("historyClass").value,q=$("historySearch").value.trim().toLowerCase();const items=historyPeriods.filter(p=>(!cls||(p.class_name||"미지정")===cls)&&(!q||[p.label,p.start_date,p.end_date,p.class_name].join(" ").toLowerCase().includes(q)));msg("historyMessage",items.length?"지난 시간표 "+items.length+"개":"조회 가능한 시간표가 없습니다.");for(const p of items){const row=document.createElement("div");row.className="staff";const label=document.createElement("span");label.textContent=(p.class_name||"미지정")+" · "+(p.label||"")+" ("+p.start_date+" ~ "+p.end_date+")";const btn=document.createElement("button");btn.textContent="조회";btn.onclick=()=>viewHistory(p);row.append(label,btn);box.append(row)}}
$("historyClass").onchange=renderHistory;$("historySearch").oninput=renderHistory;
$("historyButton").onclick=openHistory;$("historyBack").onclick=()=>{show("historyPanel",false);show("schedulePanel",true)};
async function adminCall(payload){
 const {data:{session}}=await client.auth.getSession();
 if(!session)throw Error("다시 로그인해 주세요.");
 const response=await fetch("https://eovntwuvjzvnztyxzwer.supabase.co/functions/v1/academy-admin",{method:"POST",headers:{"Content-Type":"application/json","apikey":"sb_publishable_XMxCvN3wguCsjUY-6GrR2g_HidFJtoc","Authorization":"Bearer "+session.access_token},body:JSON.stringify(payload)});
 const result=await response.json();if(!response.ok)throw Error(result.error||"요청 실패");return result;
}
$("createForm").onsubmit=async e=>{
 e.preventDefault();msg("adminMessage","계정 생성 중...");
 try{const name=$("newName").value.trim(),r=await adminCall({action:"create",name});msg("adminMessage",name+" 임시 비밀번호: "+r.temporary_password+"\n이 화면을 닫으면 다시 볼 수 없습니다.");$("newName").value="";await staff()}catch(err){msg("adminMessage",err.message)}
};
async function staff(){
 const {data,error}=await client.from("staff_profiles").select("user_id,display_name,role,theme_color").order("display_name");
 if(error){msg("adminMessage",error.message);return;}
 const colorBox=$("colorList"),resetBox=$("resetList");const picker=$("viewTeacher");picker.replaceChildren(new Option("선생님 선택",""));colorBox.replaceChildren();resetBox.replaceChildren();
 for(const p of data){const option=new Option(p.display_name+(p.role==="admin"?" (내 시간표)":""),p.user_id);option.dataset.color=p.theme_color;picker.add(option);
 const row=document.createElement("div");row.className="staff";
 const label=document.createElement("strong");label.textContent=p.display_name+(p.role==="admin"?" (관리자)":"");
 const color=document.createElement("input");color.type="color";color.value=p.theme_color;color.title=p.display_name+" 테마 색상";
 color.onchange=async()=>{try{await adminCall({action:"color",user_id:p.user_id,color:color.value});msg("adminMessage",p.display_name+" 색상 저장 완료")}catch(e){msg("adminMessage",e.message)}};
 const reset=document.createElement("button");reset.type="button";reset.className="secondary";reset.textContent="비밀번호 초기화";
 reset.onclick=async()=>{if(!confirm(p.display_name+" 비밀번호를 초기화할까요?"))return;try{const r=await adminCall({action:"reset",user_id:p.user_id});msg("adminMessage",p.display_name+" 새 임시 비밀번호: "+r.temporary_password)}catch(e){msg("adminMessage",e.message)}};
 row.append(label,color);colorBox.appendChild(row);const rr=document.createElement("div");rr.className="staff";const name=document.createElement("strong");name.textContent=p.display_name;rr.append(name,reset);resetBox.appendChild(rr);
 }
}
async function loadTeacherClasses(){
 const box=$("classesList");box.textContent="담당 반을 불러오는 중...";
 const [profiles,assignments]=await Promise.all([client.from("staff_profiles").select("user_id,display_name,role").order("display_name"),client.from("teacher_classes").select("teacher_id,class_name")]);
 if(profiles.error||assignments.error){msg("classesMessage",profiles.error?.message||assignments.error?.message);return;}
 box.replaceChildren();msg("classesMessage","");
 for(const p of profiles.data||[]){
  const section=document.createElement("div");section.className="staff";section.style.cssText="display:block;margin:12px 0;padding:14px";
  const heading=document.createElement("strong");heading.textContent=p.display_name+(p.role==="admin"?" (관리자)":"");section.append(heading);
  const chips=document.createElement("div");chips.style.cssText="display:flex;flex-wrap:wrap;gap:7px;margin:10px 0";section.append(chips);
  for(const item of (assignments.data||[]).filter(a=>a.teacher_id===p.user_id)){
   const btn=document.createElement("button");btn.type="button";btn.className="secondary";btn.textContent=item.class_name+" ×";btn.title="담당 반에서 제외";
   btn.onclick=async()=>{if(!confirm(p.display_name+" 선생님의 "+item.class_name+" 반을 담당 목록에서 제외할까요? 저장된 시간표는 유지됩니다."))return;const r=await client.from("teacher_classes").delete().eq("teacher_id",p.user_id).eq("class_name",item.class_name);if(r.error)msg("classesMessage",r.error.message);else{msg("classesMessage",item.class_name+" 담당 반 제외 완료");loadTeacherClasses();}};chips.append(btn);
  }
  if(!chips.children.length)chips.textContent="등록된 담당 반 없음";
  const line=document.createElement("div");line.style.cssText="display:flex;gap:8px;flex-wrap:wrap";
  const input=document.createElement("input");input.placeholder="새 반 이름 (예: M6)";input.maxLength=40;input.style.maxWidth="210px";
  const add=document.createElement("button");add.type="button";add.textContent="반 추가";
  add.onclick=async()=>{const name=input.value.trim();if(!name){msg("classesMessage","반 이름을 입력해 주세요.");return}if((assignments.data||[]).some(a=>a.teacher_id===p.user_id&&a.class_name===name)){msg("classesMessage","이미 등록된 반입니다.");return}const r=await client.from("teacher_classes").insert({teacher_id:p.user_id,class_name:name});if(r.error)msg("classesMessage",r.error.message);else{msg("classesMessage",p.display_name+" · "+name+" 반 추가 완료");loadTeacherClasses();}};
  line.append(input,add);section.append(line);box.append(section);
 }
}
document.getElementById("topAdminSlot").appendChild(document.getElementById("adminTab"));
document.querySelectorAll("[data-pane]").forEach(button=>button.onclick=()=>{const pane=button.dataset.pane;document.querySelectorAll("[data-pane]").forEach(b=>b.classList.toggle("active",b===button));show("addPane",pane==="add");show("viewPane",pane==="view");show("windowsPane",pane==="windows");show("colorPane",pane==="color");show("classesPane",pane==="classes");if(pane==="classes")loadTeacherClasses();show("resetPane",pane==="reset");if(pane==="password"){$("passwordTab").click();}});
$("adminLogout").onclick=()=>{$("logout").click()};
$("teacherLogout").onclick=async()=>{await client.auth.signOut();await load()};
$("viewTeacher").onchange=async()=>{const picker=$("viewTeacher"),opt=picker.selectedOptions[0],box=$("teacherView");if(!picker.value){box.textContent="선생님을 선택해 주세요.";return;}const hex=opt.dataset.color||"#27538d";box.style.setProperty("--viewer-color",hex);box.style.background=hex+"22";box.style.border="2px solid "+hex;box.replaceChildren();const heading=document.createElement("h3");heading.textContent=opt.text+" 선생님 시간표";heading.style.color=hex;box.append(heading);const {data,error}=await client.from("schedule_periods").select("id,label,start_date,end_date,approved_at,class_name,book").eq("teacher_id",picker.value).order("start_date",{ascending:false});const note=document.createElement("p");note.textContent=error?"시간표를 불러오지 못했습니다: "+error.message:data?.length?"저장된 시간표 기간: "+data.map(x=>x.label||x.start_date+" ~ "+x.end_date).join(", "):"아직 서버에 저장된 시간표가 없습니다. 기존 브라우저 시간표는 선생님별 서버 시간표와 연결되지 않았습니다.";box.append(note);if(error||!data?.length)return;
const category=document.createElement("select");category.setAttribute("aria-label","수업 선택");for(const name of [...new Set(data.map(p=>p.class_name||"Inter Bridge 1"))])category.add(new Option(name,name));box.append(category);const periodTabs=document.createElement("nav");periodTabs.className="admin-period-tabs";box.append(periodTabs);const choose=document.createElement("select");choose.setAttribute("aria-label","수업 기간 선택");choose.style.display="none";box.append(choose);function fillPeriods(){choose.replaceChildren();for(const p of data.filter(p=>(p.class_name||"Inter Bridge 1")===category.value).sort((a,b)=>a.start_date.localeCompare(b.start_date))){choose.add(new Option(p.label||p.start_date+" ~ "+p.end_date,p.id))}renderPeriodTabs()}function renderPeriodTabs(){periodTabs.replaceChildren();for(const opt of [...choose.options]){const btn=document.createElement("button");btn.type="button";btn.className="admin-period-tab"+(opt.value===choose.value?" active":"");btn.textContent=opt.textContent;btn.onclick=()=>{choose.value=opt.value;render()};periodTabs.append(btn)}}fillPeriods();
const approval=document.createElement("button");approval.type="button";approval.style.marginLeft="10px";box.append(approval);const textbookTitle=document.createElement("h3");textbookTitle.className="admin-textbook-title";box.append(textbookTitle);const previewActions=document.createElement("div");previewActions.style.cssText="display:flex;justify-content:flex-end;gap:10px;margin:12px 0";const printButton=document.createElement("button");printButton.type="button";printButton.textContent="선택한 시간표 A4 한 페이지 인쇄";previewActions.append(printButton);box.append(previewActions);const preview=document.createElement("iframe");preview.title="선생님 시간표 인쇄 미리보기";preview.style.cssText="width:100%;height:900px;border:1px solid #d5dfeb;border-radius:8px;background:white";preview.src="./?adminPreview=1&theme="+encodeURIComponent(hex)+"&style=v121";box.append(preview);let pendingPreview=null,previewReady=false;const previewStatus=document.createElement("p");previewStatus.className="hint";previewStatus.textContent="시간표를 불러오는 중입니다.";box.insertBefore(previewStatus,preview);const previewListener=event=>{if(event.source!==preview.contentWindow||event.origin!==location.origin)return;if(event.data?.type==="admin-schedule-ready"){previewReady=true;if(pendingPreview)preview.contentWindow.postMessage(pendingPreview,location.origin)}if(event.data?.type==="admin-schedule-rendered"){const count=event.data.rowCount||0;previewStatus.textContent=count?"시간표를 불러왔습니다.":"달력 표를 표시하지 못했습니다. 아래 보조 시간표를 확인해 주세요.";scroll.style.display=count?"none":"block";}if(event.data?.type==="admin-schedule-error"){previewStatus.textContent="달력 표시 오류: "+event.data.message+" · 아래 보조 시간표를 표시합니다.";scroll.style.display="block";}};window.addEventListener("message",previewListener);preview.addEventListener("load",()=>{previewReady=false;previewStatus.textContent="시간표를 불러오는 중입니다."});printButton.onclick=()=>{if(!pendingPreview)return;preview.contentWindow.focus();preview.contentWindow.print()};const table=document.createElement("table");table.className="teacher-table";const scroll=document.createElement("div");scroll.className="admin-calendar-scroll";scroll.append(table);scroll.style.display="none";box.append(scroll);
async function render(){const selected=data.find(p=>p.id===choose.value);approval.textContent=selected?.approved_at?"승인 취소":"시간표 승인";approval.style.background=selected?.approved_at?"#b45309":"#167347";approval.style.color="white";textbookTitle.textContent=selected?.book||"교재명 미등록";renderPeriodTabs();table.replaceChildren();const {data:cells,error:cellError}=await client.from("schedule_cells").select("lesson_date,inclass,vocab_base,troom,homework,is_holiday").eq("period_id",choose.value).order("lesson_date");if(cellError){table.textContent=cellError.message;return}const {data:win}=await client.from("academy_schedule_windows").select("id,label,start_date,end_date,holidays,holiday_names,special_days").eq("start_date",selected.start_date).maybeSingle();pendingPreview={type:"admin-schedule-preview",period:selected,window:win||{},cells:cells||[]};if(previewReady&&preview.contentWindow)preview.contentWindow.postMessage(pendingPreview,location.origin);
const head=document.createElement("tr");for(const name of ["항목","월요일","화요일","수요일","목요일","금요일"]){const th=document.createElement("th");th.textContent=name;head.append(th)}table.append(head);
const byDate=new Map((cells||[]).map(c=>[c.lesson_date,c]));
const dates=[];const first=new Date(selected.start_date+"T12:00:00"),last=new Date(selected.end_date+"T12:00:00");
const monday=new Date(first);monday.setDate(first.getDate()-((first.getDay()+6)%7));
for(let d=new Date(monday);d<=last;d.setDate(d.getDate()+7)){const week=[];for(let k=0;k<5;k++){const x=new Date(d);x.setDate(d.getDate()+k);week.push(x.toISOString().slice(0,10))}dates.push(week)}
for(const week of dates){
 const dateRow=document.createElement("tr");dateRow.className="admin-date-row";const dateLabel=document.createElement("th");dateLabel.textContent="날짜";dateRow.append(dateLabel);
 for(const day of week){const td=document.createElement("td");const c=byDate.get(day);td.textContent=day.slice(5).replace("-","/")+" ("+["일","월","화","수","목","금","토"][new Date(day+"T12:00:00").getDay()]+")";if(day<selected.start_date||day>selected.end_date)td.className="admin-off";else if(c?.is_holiday)td.className="admin-holiday";dateRow.append(td)}table.append(dateRow);
 const showHomework=(cells||[]).some(c=>c.homework);
 const showVocab=(cells||[]).some(c=>c.vocab_base);
 for(const [label,field] of [["Inclass","inclass"],...(showVocab?[["Vocab.","vocab_base"]]:[]),["T-Room","troom"],...(showHomework?[["Homework","homework"]]:[])]){
 const tr=document.createElement("tr");tr.className="admin-lesson-row";const th=document.createElement("th");th.textContent=label;tr.append(th);
 for(const day of week){const td=document.createElement("td");const c=byDate.get(day);if(day<selected.start_date||day>selected.end_date){td.className="admin-off"}else if(c?.is_holiday){td.textContent=field==="inclass"?"휴무일":"";td.className="admin-holiday"}else{td.textContent=c?.[field]||""}tr.append(td)}table.append(tr);
 }
}
}
approval.onclick=async()=>{const selected=data.find(p=>p.id===choose.value);if(!selected)return;const next=selected.approved_at?null:new Date().toISOString();if(!confirm(next?"이 시간표를 승인하고 선생님의 수정·삭제를 잠글까요?":"승인을 취소하고 선생님의 수정·삭제를 허용할까요?"))return;const result=await client.from("schedule_periods").update({approved_at:next}).eq("id",selected.id);if(result.error){alert(result.error.message);return}selected.approved_at=next;await render()};category.onchange=async()=>{fillPeriods();await render()};choose.onchange=render;await render();
};
const chosenHolidays=new Map(),chosenSpecials=new Map();
function renderHolidays(){const box=$("holidayChips");box.replaceChildren();for(const [date,name] of [...chosenHolidays].sort((a,b)=>a[0].localeCompare(b[0]))){const btn=document.createElement("button");btn.type="button";btn.className="secondary";btn.textContent=date+" · "+name+" ×";btn.title="휴무일 삭제";btn.onclick=()=>{chosenHolidays.delete(date);renderHolidays()};box.append(btn)}}
$("addHoliday").onclick=()=>{const date=$("holidayPicker").value,start=$("windowStart").value,end=$("windowEnd").value;if(!date){msg("windowMessage","달력에서 휴무일을 선택해 주세요.");return}if(!start||!end||date<start||date>end){msg("windowMessage","휴무일은 시작일과 마지막 날짜 사이에서 선택해 주세요.");return}chosenHolidays.set(date,$("holidayName").value.trim()||"휴무일");$("holidayPicker").value="";$("holidayName").value="";renderHolidays();msg("windowMessage","")};
let editingWindowId=null;
function resetWindowEditor(){editingWindowId=null;$("windowForm").reset();chosenHolidays.clear();chosenSpecials.clear();renderHolidays();renderSpecials();$("windowSubmit").textContent="기간 등록";$("cancelWindowEdit").hidden=true}
$("cancelWindowEdit").onclick=()=>{resetWindowEditor();msg("windowMessage","수정을 취소했습니다.")};
function renderSpecials(){const box=$("specialChips");box.replaceChildren();for(const [date,name] of chosenSpecials){const b=document.createElement("button");b.type="button";b.className="secondary";b.textContent=date+" · "+name+" ×";b.onclick=()=>{chosenSpecials.delete(date);renderSpecials()};box.append(b)}}
$("addSpecial").onclick=()=>{const d=$("specialPicker").value,n=$("specialName").value.trim();if(!d||!n){msg("windowMessage","기념일 날짜와 이름을 입력해 주세요.");return}chosenSpecials.set(d,n);renderSpecials();$("specialPicker").value="";$("specialName").value=""};
async function loadWindows(){
const {data,error}=await client.from("academy_schedule_windows").select("*").order("start_date",{ascending:false});
const box=$("windowList");box.replaceChildren();if(error){msg("windowMessage",error.message);return}
for(const w of data||[]){const row=document.createElement("div");row.className="staff window-list-row";const label=document.createElement("strong");label.textContent=w.label+" · 시작일 "+(w.start_date||"미지정")+" · 종료일 "+w.end_date+" · 휴무일 "+(w.holidays||[]).length+"일 · 기념일 "+Object.keys(w.special_days||{}).length+"일";const edit=document.createElement("button");edit.type="button";edit.className="secondary";edit.textContent="수정";edit.onclick=()=>{editingWindowId=w.id;$("windowLabel").value=w.label||"";$("windowStart").value=w.start_date||"";$("windowEnd").value=w.end_date||"";chosenHolidays.clear();for(const d of w.holidays||[])chosenHolidays.set(d,w.holiday_names?.[d]||"휴무일");renderHolidays();chosenSpecials.clear();for(const [d,n] of Object.entries(w.special_days||{}))chosenSpecials.set(d,n);renderSpecials();$("windowSubmit").textContent="수정 저장";$("cancelWindowEdit").hidden=false;msg("windowMessage",w.label+" 기간을 수정 중입니다.");$("windowForm").scrollIntoView({behavior:"smooth",block:"start"})};
const del=document.createElement("button");del.type="button";del.className="secondary";del.textContent="삭제";del.onclick=async()=>{if(!confirm(w.label+" 기간을 삭제할까요?"))return;const r=await client.from("academy_schedule_windows").delete().eq("id",w.id);msg("windowMessage",r.error?r.error.message:"기간을 삭제했습니다.");if(!r.error)loadWindows()};const actions=document.createElement("div");actions.className="window-actions";actions.append(edit,del);row.append(label,actions);box.append(row)}
}
$("windowForm").onsubmit=async e=>{e.preventDefault();const label=$("windowLabel").value.trim(),start=$("windowStart").value;const end=$("windowEnd").value;const holidays=[...chosenHolidays.keys()].sort();const holiday_names=Object.fromEntries(chosenHolidays);if(holidays.some(v=>v<start||v>end)){msg("windowMessage","선택한 휴무일이 기간 밖에 있습니다.");return;}if(end<start){msg("windowMessage","마지막 날짜는 시작일보다 빠를 수 없습니다.");return;}const special_days=Object.fromEntries(chosenSpecials);if(Object.keys(special_days).some(d=>d<start||d>end||holidays.includes(d))){msg("windowMessage","기념일이 기간 밖이거나 휴무일과 겹칩니다.");return}const payload={label,start_date:start,end_date:end,holidays,holiday_names,special_days};const wasEditing=!!editingWindowId;const r=wasEditing?await client.from("academy_schedule_windows").update(payload).eq("id",editingWindowId):await client.from("academy_schedule_windows").insert(payload);msg("windowMessage",r.error?r.error.message:wasEditing?"기간 수정이 저장됐습니다.":"기간이 등록됐습니다.");if(!r.error){resetWindowEditor();await loadWindows();await sendScheduleWindows()}};
document.querySelector('[data-pane="windows"]').addEventListener("click",loadWindows);
load();
})();
