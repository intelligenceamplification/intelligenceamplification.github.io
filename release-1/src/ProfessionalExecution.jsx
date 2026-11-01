import React from 'react';
import {ArrowRight,Download,ArrowCounterClockwise} from '@phosphor-icons/react';
import {professionalExamples,professionalWorkflows} from './professional-examples';
export function ProfessionalExecution({state,setState,onEvidence,renderEveryday}){
 const update=v=>setState(s=>({...s,...v}));
 const role=professionalWorkflows[state.profession]?state.profession:'everyday';
 const task=professionalWorkflows[role];
 const values=state.artifactValues||task.fields.map(f=>f.value);
 function reset(profession=role){update({profession,artifactValues:null,artifactStage:0,artifactFeedback:null,artifactVerified:false,flawed:false})}
 function prepare(){update({artifactStage:1,artifactValues:task.fields.map(f=>f.value),artifactFeedback:null,artifactVerified:false,flawed:false})}
 function verify(){const errors=task.fields.filter((f,i)=>values[i]!==f.value);update({artifactStage:2,artifactFeedback:errors.length?errors.map(f=>`${f.label}: compare your entry with ${f.source}.`):['Verified against the supplied records: each field preserves the recorded status, conditions, and responsibility.'],artifactVerified:errors.length===0})}
 function save(){const text=`${task.artifact}\n\n${task.fields.map((f,i)=>f.label+': '+values[i]+' ['+f.source+']').join('\n')}\n\nSource records\n${task.records.map(r=>r.id+' · '+r.title+'\n'+r.text).join('\n\n')}\n\n${task.takeaway}\n\nFictional case · prepared workflow · checked against supplied fixture records, not a real-world execution.\n`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=role+'-verified-work-record.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 if(state.executionView==='everyday')return <><button className="text-button library-back" onClick={()=>update({executionView:'professional'})}>Return to capability & professional workflows</button>{renderEveryday()}</>;
 return <><p className="eyebrow">From intention to a result you can verify</p><h2>Delegate the steps. Direct the outcome.</h2>
 <p className="lead">Explore how a vague task becomes a defined piece of work: organize the sources, prepare the deliverable, and check what matters. Begin with everyday earning or a professional setting.</p>
 <p className="control-guide" id="execution-guide">Choose <strong>Your starting point</strong>, then follow the three stages: inspect the sources, prepare a deliverable, and verify the result. Change an entry to see what verification catches.</p>
 <p className="small">Prepared workflow illustration · no live agent · fictional source records.</p>
 <div className="curated-controls"><label>Your starting point<select aria-describedby="execution-guide" value={role} onChange={e=>reset(e.target.value)}>{professionalExamples.map(e=><option key={e.id} value={e.id}>{e.profession}</option>)}</select></label></div>
 <div className="professional-context"><h3>{task.title}</h3><p>{task.instruction}</p></div>
 <div className="workflow-stages" aria-label="Workflow stages"><button aria-pressed={!state.artifactStage} onClick={()=>reset()}>1. Inspect the sources</button><button aria-pressed={state.artifactStage===1} onClick={prepare}>2. Prepare the deliverable</button><button aria-pressed={state.artifactStage===2} disabled={!state.artifactStage} onClick={verify}>3. Verify the result</button></div>
 <div className="record-grid execution-records">{task.records.map(r=><article key={r.id}><p className="eyebrow">{r.id} · {r.title}</p><p>{r.text}</p></article>)}</div>
 {!state.artifactStage?<div className="actions"><button className="primary" onClick={prepare}>Explore the prepared deliverable <ArrowRight size={20}/></button></div>:<section className="professional-artifact" aria-label="Prepared deliverable"><div className="section-line"><h3>{task.artifact}</h3><button className="text-button" onClick={()=>reset()}><ArrowCounterClockwise size={18}/>Start again</button></div>
 <p className="small">Compare each entry with its source. You can change a field, or inspect a deliberately flawed alternative to see what verification catches.</p>
 <div className="artifact-fields">{task.fields.map((f,i)=><label key={f.label}><span>{f.label}<small>Source: {f.source}</small></span><select value={values[i]} onChange={e=>update({artifactValues:values.map((v,j)=>i===j?e.target.value:v),artifactVerified:false,artifactFeedback:null})}>{f.options.map(v=><option key={v} value={v}>{v}</option>)}</select></label>)}</div>
 <div className="actions"><button className="primary" onClick={verify}>Verify against the records <ArrowRight size={18}/></button><button className="secondary" disabled={!state.artifactVerified} onClick={save}><Download size={18}/>Save verified work record</button></div>
 <div className="actions"><button className="text-button" onClick={()=>update({artifactValues:task.fields.map((f,i)=>i===0?f.wrong:f.value),artifactVerified:false,artifactFeedback:null,flawed:true})}>Inspect a flawed alternative</button><button className="text-button" onClick={prepare}>Restore the prepared example</button></div>
 {state.flawed&&<p className="small">Deliberately flawed example: one source fact has been changed. Verification should identify the discrepancy.</p>}
 {state.artifactFeedback&&<div className={'feedback '+(state.artifactVerified?'success':'')} role="status">{state.artifactFeedback.map(t=><p key={t}>{t}</p>)}</div>}
 </section>}
 <p className="professional-takeaway">{task.takeaway}</p>
 <div className="actions"><button className="text-button" onClick={onEvidence}>Computer use & frontier evidence <ArrowRight size={18}/></button><button className="text-button" onClick={()=>update({executionView:'everyday'})}>Explore expenses, scheduling & email</button></div>
 <p className="small example-disclosure">Fictional records · prepared workflow illustration · no live computer agent. Verification checks this bounded example, not professional competence or real-world readiness.</p></>;
}
